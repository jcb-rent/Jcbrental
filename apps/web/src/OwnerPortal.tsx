import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import NotificationCenter from "./NotificationCenter";
import LiveFleetTracking from "./LiveFleetTracking";
import FinancePanel from "./FinancePanel";
import AnalyticsPanel from "./AnalyticsPanel";

type MachineRow = { id:string; fleet_code:string; name:string; category:string; hourly_rate:number; daily_rate:number|null; status:"available"|"on_rent"|"maintenance"|"inactive"; current_location:string|null };
type BookingRow = { id:string; customer_name:string; customer_mobile:string; site_address:string; starts_at:string; ends_at:string|null; rental_unit:"hour"|"shift"|"day"|"month"|"project"; quantity:number; status:"pending"|"approved"|"rejected"|"assigned"|"in_progress"|"completed"|"cancelled"; quoted_amount:number|null; machine_id:string|null; work_type:string|null };
type DriverRow = { id:string; full_name:string|null; phone:string|null };
type BranchRow = { id:string; name:string; address:string|null; phone:string|null; is_primary:boolean };
const rupee=(n:number)=>"₹"+Number(n||0).toLocaleString("en-IN");
const title=(s:string)=>s.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
export default function OwnerPortal(){
 const [section,setSection]=useState("Overview");
 const [businessId,setBusinessId]=useState("");
 const [branchId,setBranchId]=useState("");
 const [machines,setMachines]=useState<MachineRow[]>([]);
 const [bookings,setBookings]=useState<BookingRow[]>([]);
 const [drivers,setDrivers]=useState<DriverRow[]>([]);
 const [branches,setBranches]=useState<BranchRow[]>([]);
 const [business,setBusiness]=useState({name:"",phone:"",service_area:""});
 const [businessRole,setBusinessRole]=useState("manager");
 const [branchForm,setBranchForm]=useState({name:"",address:"",phone:""});
 const [showDriverForm,setShowDriverForm]=useState(false);
 const [driverForm,setDriverForm]=useState({full_name:"",phone:"",branch_id:""});
 const [newDriver,setNewDriver]=useState<{full_name:string;phone:string;pin:string}|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [query,setQuery]=useState("");
 const [showMachine,setShowMachine]=useState(false);
 const [showAssign,setShowAssign]=useState<BookingRow|null>(null);
 const [driverId,setDriverId]=useState("");
 const [machineId,setMachineId]=useState("");
 const [machineForm,setMachineForm]=useState({name:"",category:"Backhoe loader",hourly_rate:"1200",daily_rate:"9500",location:""});
 const refresh=useCallback(async()=>{
  if(!supabase){setError("Supabase is not configured.");setLoading(false);return;}
  setLoading(true);setError("");
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user){setError("Your secure session has expired. Sign in again.");setLoading(false);return;}
  const {data:profile,error:profileError}=await supabase.from("profiles").select("business_id,branch_id,role,is_active").eq("id",user.id).single();
  if(profileError||!profile?.business_id||!profile.is_active||!["owner","manager"].includes(profile.role)){setError("Your account is not authorised to manage this business.");setLoading(false);return;}
  setBusinessId(profile.business_id);setBranchId(profile.branch_id||"");setBusinessRole(profile.role);
  const [m,b,d,br,biz]=await Promise.all([
   supabase.from("machines").select("id,fleet_code,name,category,hourly_rate,daily_rate,status,current_location").eq("business_id",profile.business_id).order("created_at",{ascending:false}),
   supabase.from("bookings").select("id,customer_name,customer_mobile,site_address,starts_at,ends_at,rental_unit,quantity,status,quoted_amount,machine_id,work_type").eq("business_id",profile.business_id).order("created_at",{ascending:false}),
   supabase.from("profiles").select("id,full_name,phone").eq("business_id",profile.business_id).eq("role","driver").eq("is_active",true).order("full_name"),
   supabase.from("branches").select("id,name,address,phone,is_primary").eq("business_id",profile.business_id).order("is_primary",{ascending:false}).order("name"),
   supabase.from("businesses").select("name,phone,service_area").eq("id",profile.business_id).single()
  ]);
  if(m.error||b.error||d.error||br.error||biz.error){setError(m.error?.message||b.error?.message||d.error?.message||br.error?.message||biz.error?.message||"Unable to load business data.");}
  setMachines((m.data||[]) as MachineRow[]);setBookings((b.data||[]) as BookingRow[]);setDrivers((d.data||[]) as DriverRow[]);setBranches((br.data||[]) as BranchRow[]);setBusiness({name:biz.data?.name||"",phone:biz.data?.phone||"",service_area:biz.data?.service_area||""});
  setLoading(false);
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 const pending=bookings.filter(b=>b.status==="pending");
 const filtered=useMemo(()=>machines.filter(m=>(m.name+m.fleet_code+m.category).toLowerCase().includes(query.toLowerCase())),[machines,query]);
 async function setBookingStatus(id:string,status:"approved"|"rejected"){
  if(!supabase)return;setBusy(true);setError("");
  const {error:e}=await supabase.from("bookings").update({status}).eq("id",id).eq("business_id",businessId);
  setBusy(false);if(e){setError(e.message);return;}setNotice("Booking status updated in Supabase.");await refresh();
 }
 async function addMachine(e:React.FormEvent){
  e.preventDefault();if(!supabase)return;setBusy(true);setError("");
  const {error:e1}=await supabase.from("machines").insert({business_id:businessId,branch_id:branchId||null,fleet_code:"JCB-"+Date.now().toString().slice(-7),name:machineForm.name.trim(),category:machineForm.category,hourly_rate:Number(machineForm.hourly_rate),daily_rate:machineForm.daily_rate?Number(machineForm.daily_rate):null,current_location:machineForm.location.trim()||null,status:"available"});
  setBusy(false);if(e1){setError(e1.message);return;}setShowMachine(false);setMachineForm({name:"",category:"Backhoe loader",hourly_rate:"1200",daily_rate:"9500",location:""});setNotice("Machine saved to the live fleet.");await refresh();
 }
 async function updateMachineStatus(id:string,status:MachineRow["status"]){
  if(!supabase)return;const {error:e}=await supabase.from("machines").update({status}).eq("id",id).eq("business_id",businessId);
  if(e){setError(e.message);return;}setNotice("Fleet status saved.");await refresh();
 }
 async function saveBusiness(e:React.FormEvent){
  e.preventDefault();if(!supabase||businessRole!=="owner")return;setBusy(true);setError("");
  const {error:e1}=await supabase.from("businesses").update({name:business.name.trim(),phone:business.phone.trim()||null,service_area:business.service_area.trim()||null}).eq("id",businessId);
  setBusy(false);if(e1){setError(e1.message);return;}setNotice("Business profile updated.");await refresh();
 }
 async function addBranch(e:React.FormEvent){
  e.preventDefault();if(!supabase||!businessId)return;setBusy(true);setError("");
  const {error:e1}=await supabase.from("branches").insert({business_id:businessId,name:branchForm.name.trim(),address:branchForm.address.trim()||null,phone:branchForm.phone.trim()||null,is_primary:branches.length===0});
  setBusy(false);if(e1){setError(e1.message);return;}setBranchForm({name:"",address:"",phone:""});setNotice("Branch created.");await refresh();
 }
 async function updateBranch(id:string,patch:Partial<BranchRow>){
  if(!supabase)return;setBusy(true);setError("");
  const {error:e1}=await supabase.from("branches").update(patch).eq("id",id).eq("business_id",businessId);
  setBusy(false);if(e1){setError(e1.message);return;}setNotice("Branch updated.");await refresh();
 }
 async function deleteBranch(id:string){
  if(!supabase||branches.find(b=>b.id===id)?.is_primary)return;
  if(!window.confirm("Delete this branch? Existing bookings and machine records may prevent deletion."))return;
  setBusy(true);setError("");const {error:e1}=await supabase.from("branches").delete().eq("id",id).eq("business_id",businessId);
  setBusy(false);if(e1){setError(e1.message);return;}setNotice("Branch deleted.");await refresh();
 }
 async function createDriver(e:React.FormEvent){
  e.preventDefault();if(!supabase||businessRole!=="owner")return;setBusy(true);setError("");setNotice("");
  const {data,error:e1}=await supabase.functions.invoke("staff-provision",{body:{full_name:driverForm.full_name.trim(),phone:driverForm.phone.replace(/\D/g,"").slice(-10),branch_id:driverForm.branch_id||null}});
  setBusy(false);
  if(e1||!data?.driver||!data?.pin){setError(data?.error||e1?.message||"Driver account could not be created.");return;}
  setNewDriver({full_name:data.driver.full_name,phone:data.driver.phone,pin:data.pin});
  setDriverForm({full_name:"",phone:"",branch_id:""});setShowDriverForm(false);setNotice("Driver account created. Copy the PIN and share it privately with the driver.");await refresh();
 }
 async function deactivateDriver(id:string){
  if(!supabase||businessRole!=="owner")return;
  if(!window.confirm("Deactivate this driver? They will no longer be able to sign in or access assigned work."))return;
  setBusy(true);setError("");const {data,error:e1}=await supabase.functions.invoke("staff-provision",{body:{action:"deactivate",driver_user_id:id}});
  setBusy(false);if(e1||!data?.success){setError(data?.error||e1?.message||"Driver access could not be deactivated.");return;}setNotice("Driver access deactivated.");await refresh();
 }
 async function assignBooking(e:React.FormEvent){
  e.preventDefault();if(!supabase||!showAssign||!driverId||!machineId)return;setBusy(true);setError("");
  const {error:e1}=await supabase.rpc("assign_booking",{p_booking_id:showAssign.id,p_machine_id:machineId,p_driver_user_id:driverId});
  setBusy(false);if(e1){setError(e1.message);return;}setShowAssign(null);setDriverId("");setMachineId("");setNotice("Machine and driver assignment saved atomically.");await refresh();
 }
 return <div className="owner-shell"><aside className="owner-sidebar"><div className="owner-brand"><b>J</b><span>JCB RENTAL<small>OWNER CONSOLE</small></span></div><span className="owner-caption">MANAGEMENT</span>{["Overview","Bookings","Fleet","Drivers","Live tracking","Finance","Analytics","Business settings"].map((s,i)=><button key={s} className={section===s?"owner-active":""} onClick={()=>setSection(s)}><span>{["▦","▤","▰","♙","⌖","₹","↗","⚙"][i]}</span>{s}{s==="Bookings"&&pending.length>0?<i>{pending.length}</i>:null}</button>)}<div className="owner-profile"><div className="owner-avatar">O</div><span><b>Business Owner</b><small>Secure account · Live data</small></span></div></aside>
 <main className="owner-main"><header className="owner-head"><div><span className="eyebrow dark">JCB RENTAL SERVICE / MANAGEMENT</span><h1>{section}</h1><p>Live business data from the secured rental database.</p></div><span className="owner-demo">● LIVE DATABASE</span></header>
 <NotificationCenter businessId={businessId}/>
 {loading?<section className="owner-panel"><p>Loading your business data…</p></section>:null}
 {!loading&&error?<section className="owner-panel"><p role="alert">{error}</p><button className="owner-primary" onClick={()=>void refresh()}>Retry</button></section>:null}
 {!loading&&!error&&section==="Overview"&&<><div className="owner-welcome"><div><span className="eyebrow">BUSINESS OVERVIEW</span><h2>Your operations,<br/><em>all in one place.</em></h2><p>Live inventory and booking activity for your business.</p></div><div className="welcome-stamp">JCB<br/><b>RENTAL</b></div></div><div className="owner-kpis"><article><small>TOTAL MACHINES</small><b>{machines.length}</b><span>Registered fleet</span></article><article><small>AVAILABLE</small><b>{machines.filter(m=>m.status==="available").length}</b><span>Ready for assignment</span></article><article><small>ON RENT</small><b>{machines.filter(m=>m.status==="on_rent").length}</b><span>Currently deployed</span></article><article><small>PENDING REQUESTS</small><b>{pending.length}</b><span>Needs owner review</span></article></div><section className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">ACTION REQUIRED</span><h2>Booking approvals</h2></div><button className="owner-link" onClick={()=>setSection("Bookings")}>View all →</button></div><BookingTable rows={pending} approve={setBookingStatus} assign={setShowAssign}/></section><div className="owner-two"><section className="owner-panel"><div className="owner-panel-head"><h2>Fleet status</h2><button className="owner-link" onClick={()=>setSection("Fleet")}>Manage →</button></div>{machines.slice(0,4).map(m=><div className="fleet-line" key={m.id}><span className="fleet-icon">J</span><span><b>{m.name}</b><small>{m.fleet_code} · {m.current_location||"Location not set"}</small></span><em className={"state "+m.status}>{title(m.status)}</em></div>)}</section><section className="owner-panel"><div className="owner-panel-head"><h2>Quick actions</h2></div><div className="owner-quick"><button onClick={()=>{setSection("Fleet");setShowMachine(true);}}>＋ Add machine</button><button onClick={()=>setSection("Drivers")}>＋ Manage drivers</button><button onClick={()=>setSection("Business settings")}>⚙ Business profile</button></div></section></div></>}
 {!loading&&!error&&section==="Bookings"&&<section className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">RENTAL PIPELINE</span><h2>All booking requests</h2></div><span className="owner-count">{bookings.length} records</span></div><BookingTable rows={bookings} approve={setBookingStatus} assign={setShowAssign}/></section>}
 {!loading&&!error&&section==="Fleet"&&<section className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">EQUIPMENT REGISTER</span><h2>Manage your machines</h2></div><button className="owner-primary" onClick={()=>setShowMachine(true)}>＋ Add machine</button></div><input className="owner-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search machine or fleet ID"/><div className="owner-fleet-grid">{filtered.map(m=><article key={m.id}><div className="fleet-card-top"><span className="fleet-icon large">J</span><em className={"state "+m.status}>{title(m.status)}</em></div><h3>{m.name}</h3><small>{m.fleet_code} · {m.category}</small><div className="fleet-meta"><span>Hourly rate</span><b>{rupee(m.hourly_rate)}</b></div><div className="fleet-meta"><span>Daily rate</span><b>{m.daily_rate===null?"—":rupee(m.daily_rate)}</b></div><div className="fleet-meta"><span>Last location</span><b>{m.current_location||"Not set"}</b></div><select value={m.status} onChange={e=>void updateMachineStatus(m.id,e.target.value as MachineRow["status"])}><option value="available">Available</option><option value="on_rent">On rent</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></article>)}</div>{filtered.length===0?<p className="owner-empty">No machines found. Add the first machine to your live fleet.</p>:null}</section>}
 {!loading&&!error&&section==="Drivers"&&<><section className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">TEAM DIRECTORY</span><h2>Driver accounts</h2><p className="owner-subtitle">Create a driver login and generate a private six-digit PIN.</p></div><span className="owner-count">{drivers.length} active</span></div>{businessRole==="owner"?<button className="owner-primary" onClick={()=>setShowDriverForm(true)}>＋ Create driver account</button>:<p className="owner-note">Only the business owner can provision or deactivate staff accounts.</p>}{drivers.map(d=><div className="driver-row" key={d.id}><div className="driver-avatar">{(d.full_name||"DR").split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><b>{d.full_name||"Driver"}</b><small>{d.phone||"Mobile not set"}</small></div><span className="driver-duty">Active</span>{businessRole==="owner"?<button className="owner-link danger-link" disabled={busy} onClick={()=>void deactivateDriver(d.id)}>Deactivate</button>:null}</div>)}{drivers.length===0?<p className="owner-empty">No active driver accounts yet. Create the first driver login.</p>:null}</section>{newDriver?<div className="owner-overlay" onClick={()=>setNewDriver(null)}><section className="owner-modal driver-credentials" onClick={e=>e.stopPropagation()}><button className="owner-close" onClick={()=>setNewDriver(null)}>×</button><span className="eyebrow dark">DRIVER ACCOUNT CREATED</span><h2>Share login details securely</h2><p>This PIN is shown once here. Copy it and send it privately to the driver.</p><div className="driver-credential-line"><small>DRIVER</small><b>{newDriver.full_name}</b></div><div className="driver-credential-line"><small>REGISTERED MOBILE</small><b>{newDriver.phone}</b></div><div className="driver-pin-display"><small>SIX-DIGIT LOGIN PIN</small><strong>{newDriver.pin}</strong></div><button className="owner-primary" onClick={()=>void navigator.clipboard?.writeText("JCB Rental Driver Login\\nMobile: "+newDriver.phone+"\\nPIN: "+newDriver.pin)}>Copy login details</button><button className="owner-secondary" onClick={()=>setNewDriver(null)}>Close</button></section></div>:null}{showDriverForm?<div className="owner-overlay" onClick={()=>setShowDriverForm(false)}><form className="owner-modal" onClick={e=>e.stopPropagation()} onSubmit={createDriver}><button type="button" className="owner-close" onClick={()=>setShowDriverForm(false)}>×</button><span className="eyebrow dark">TEAM MANAGEMENT</span><h2>Create driver account</h2><p>A unique six-digit PIN will be generated. Driver access remains active until you deactivate the account.</p><label>Driver full name<input required minLength={2} maxLength={100} value={driverForm.full_name} onChange={e=>setDriverForm(p=>({...p,full_name:e.target.value}))}/></label><label>Mobile number<input required inputMode="numeric" pattern="[0-9 +()-]{10,16}" value={driverForm.phone} onChange={e=>setDriverForm(p=>({...p,phone:e.target.value}))}/></label><label>Branch<select value={driverForm.branch_id} onChange={e=>setDriverForm(p=>({...p,branch_id:e.target.value}))}><option value="">Use my assigned branch</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><button className="owner-primary" disabled={busy}>{busy?"Creating secure account…":"Create driver & generate PIN"}</button></form></div>:null}</>}
 {!loading&&!error&&section==="Live tracking"&&<LiveFleetTracking businessId={businessId}/>}
 {!loading&&!error&&section==="Finance"&&<FinancePanel businessId={businessId} branchId={branchId}/>}
 {!loading&&!error&&section==="Analytics"&&<AnalyticsPanel businessId={businessId}/>}
 {!loading&&!error&&section==="Business settings"&&<><section className="owner-panel settings-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">BUSINESS CONFIGURATION</span><h2>Business profile</h2></div></div><form className="finance-form" onSubmit={saveBusiness}><label>Business name<input required maxLength={120} value={business.name} disabled={businessRole!=="owner"} onChange={e=>setBusiness(p=>({...p,name:e.target.value}))}/></label><label>Business phone<input maxLength={20} value={business.phone} disabled={businessRole!=="owner"} onChange={e=>setBusiness(p=>({...p,phone:e.target.value}))}/></label><label>Service area<input maxLength={160} value={business.service_area} disabled={businessRole!=="owner"} onChange={e=>setBusiness(p=>({...p,service_area:e.target.value}))}/></label>{businessRole==="owner"?<button className="owner-primary" disabled={busy}>Save business profile</button>:<p>Only the business owner can edit core business details.</p>}</form><div className="settings-summary"><div><small>BUSINESS ID</small><b>{businessId}</b></div><div><small>ACTIVE BRANCH</small><b>{branches.find(b=>b.id===branchId)?.name||"Not assigned"}</b></div><div><small>STAFF ACCESS</small><b>Owner / Manager / Driver</b></div></div></section><section className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">LOCATIONS</span><h2>Branch management</h2></div><span className="owner-count">{branches.length} branches</span></div><form className="finance-form" onSubmit={addBranch}><label>Branch name<input required maxLength={100} value={branchForm.name} onChange={e=>setBranchForm(p=>({...p,name:e.target.value}))} placeholder="e.g. North Yard"/></label><label>Address<input maxLength={240} value={branchForm.address} onChange={e=>setBranchForm(p=>({...p,address:e.target.value}))}/></label><label>Phone<input maxLength={20} value={branchForm.phone} onChange={e=>setBranchForm(p=>({...p,phone:e.target.value}))}/></label><button className="owner-primary" disabled={busy}>Add branch</button></form>{branches.map(b=><article className="driver-row" key={b.id}><div><b>{b.name} {b.is_primary?"· Primary":""}</b><small>{b.address||"Address not set"} · {b.phone||"Phone not set"}</small><div className="finance-form"><label>Branch name<input value={b.name} maxLength={100} onChange={e=>setBranches(rows=>rows.map(x=>x.id===b.id?{...x,name:e.target.value}:x))}/></label><label>Address<input value={b.address||""} maxLength={240} onChange={e=>setBranches(rows=>rows.map(x=>x.id===b.id?{...x,address:e.target.value}:x))}/></label><label>Phone<input value={b.phone||""} maxLength={20} onChange={e=>setBranches(rows=>rows.map(x=>x.id===b.id?{...x,phone:e.target.value}:x))}/></label><button type="button" className="owner-primary" onClick={()=>void updateBranch(b.id,{name:b.name.trim(),address:b.address,phone:b.phone})} disabled={busy||!b.name.trim()}>Save changes</button></div></div><div className="owner-actions">{!b.is_primary?<button type="button" onClick={()=>void deleteBranch(b.id)} disabled={busy}>Delete</button>:null}</div></article>)}</section></>}
 {notice?<p className="owner-note" role="status">{notice}</p>:null}{busy?<p className="owner-note">Saving…</p>:null}
 </main>
 {showMachine&&<div className="owner-overlay" onClick={()=>setShowMachine(false)}><form className="owner-modal" onClick={e=>e.stopPropagation()} onSubmit={addMachine}><button type="button" className="owner-close" onClick={()=>setShowMachine(false)}>×</button><span className="eyebrow dark">FLEET MANAGEMENT</span><h2>Add a machine</h2><label>Machine name<input required value={machineForm.name} onChange={e=>setMachineForm(p=>({...p,name:e.target.value}))} placeholder="e.g. JCB 3DX"/></label><label>Machine category<select value={machineForm.category} onChange={e=>setMachineForm(p=>({...p,category:e.target.value}))}><option>Backhoe loader</option><option>Breaker</option><option>Loader</option><option>Excavator</option></select></label><label>Hourly rate (₹)<input required type="number" min="0" value={machineForm.hourly_rate} onChange={e=>setMachineForm(p=>({...p,hourly_rate:e.target.value}))}/></label><label>Daily rate (₹)<input type="number" min="0" value={machineForm.daily_rate} onChange={e=>setMachineForm(p=>({...p,daily_rate:e.target.value}))}/></label><label>Current location<input value={machineForm.location} onChange={e=>setMachineForm(p=>({...p,location:e.target.value}))}/></label><button className="owner-primary" disabled={busy}>{busy?"Saving…":"Save machine"}</button></form></div>}
 {showAssign&&<div className="owner-overlay" onClick={()=>setShowAssign(null)}><form className="owner-modal" onClick={e=>e.stopPropagation()} onSubmit={assignBooking}><button type="button" className="owner-close" onClick={()=>setShowAssign(null)}>×</button><span className="eyebrow dark">DRIVER ASSIGNMENT</span><h2>Assign operator</h2><label>Choose machine<select required value={machineId} onChange={e=>setMachineId(e.target.value)}><option value="">Select machine</option>{machines.filter(m=>m.status==="available"||m.id===showAssign.machine_id).map(m=><option key={m.id} value={m.id}>{m.fleet_code} · {m.name}</option>)}</select></label><label>Choose driver<select required value={driverId} onChange={e=>setDriverId(e.target.value)}><option value="">Select driver</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.full_name||d.phone||d.id}</option>)}</select></label><button className="owner-primary" disabled={busy||!drivers.length||!machines.length}>{busy?"Saving…":"Save assignment"}</button>{!drivers.length?<p className="owner-note">Create a driver account before assigning this booking.</p>:null}</form></div>}
 {error&&!loading?<div className="owner-toast" role="alert">{error}<button onClick={()=>setError("")}>×</button></div>:null}
 </div>;
}
function BookingTable({rows,approve,assign}:{rows:BookingRow[];approve:(id:string,status:"approved"|"rejected")=>void;assign:(row:BookingRow)=>void}){
 return <div className="owner-bookings">{rows.map(b=><article key={b.id}><div className="owner-booking-main"><b>{b.customer_name} <small>{b.id.slice(0,8)}</small></b><span>{b.work_type||"Rental"} · {b.site_address}</span><small>{new Date(b.starts_at).toLocaleString("en-IN")} · {b.quantity} {b.rental_unit} · {b.customer_mobile}</small></div><strong>{b.quoted_amount===null?"Quote pending":rupee(b.quoted_amount)}</strong><em className={"state "+b.status}>{title(b.status)}</em><div className="owner-actions">{b.status==="pending"?<><button onClick={()=>void approve(b.id,"approved")}>Approve</button><button className="reject" onClick={()=>void approve(b.id,"rejected")}>Reject</button></>:null}{b.status==="approved"?<button onClick={()=>assign(b)}>Assign driver</button>:null}</div></article>)}{rows.length===0?<p className="owner-empty">No booking requests in this view.</p>:null}</div>;
}
