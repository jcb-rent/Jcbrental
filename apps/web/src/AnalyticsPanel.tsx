import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

type Booking={id:string;customer_name:string;status:string;quoted_amount:number|null;created_at:string};
type Invoice={id:string;invoice_number:string;status:string;total_amount:number;amount_paid:number;issued_at:string};
type Expense={id:string;category:string;amount:number;expense_date:string};
type Machine={id:string;name:string;status:string};
const money=(n:number)=>"₹"+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});
export default function AnalyticsPanel({businessId}:{businessId:string}){
 const [range,setRange]=useState(90),[bookings,setBookings]=useState<Booking[]>([]),[invoices,setInvoices]=useState<Invoice[]>([]),[expenses,setExpenses]=useState<Expense[]>([]),[machines,setMachines]=useState<Machine[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{
  if(!supabase||!businessId)return;setLoading(true);setError("");
  const [b,i,e,m]=await Promise.all([
   (supabase as any).from("bookings").select("id,customer_name,status,quoted_amount,created_at").eq("business_id",businessId).order("created_at",{ascending:false}).limit(1000),
   (supabase as any).from("rental_invoices").select("id,invoice_number,status,total_amount,amount_paid,issued_at").eq("business_id",businessId).order("issued_at",{ascending:false}).limit(1000),
   (supabase as any).from("business_expenses").select("id,category,amount,expense_date").eq("business_id",businessId).order("expense_date",{ascending:false}).limit(1000),
   (supabase as any).from("machines").select("id,name,status").eq("business_id",businessId)
  ]);
  const failure=b.error||i.error||e.error||m.error;if(failure){setError(failure.message);setLoading(false);return;}
  setBookings(b.data||[]);setInvoices(i.data||[]);setExpenses(e.data||[]);setMachines(m.data||[]);setLoading(false);
 },[businessId]);
 useEffect(()=>{void load();},[load]);
 const cutoff=useMemo(()=>Date.now()-range*86400000,[range]);
 const periodBookings=bookings.filter(x=>new Date(x.created_at).getTime()>=cutoff);
 const periodInvoices=invoices.filter(x=>new Date(x.issued_at).getTime()>=cutoff&&x.status!=="void");
 const periodExpenses=expenses.filter(x=>new Date(x.expense_date+"T23:59:59").getTime()>=cutoff);
 const revenue=periodInvoices.reduce((s,x)=>s+Number(x.amount_paid||0),0);
 const billed=periodInvoices.reduce((s,x)=>s+Number(x.total_amount||0),0);
 const cost=periodExpenses.reduce((s,x)=>s+Number(x.amount||0),0);
 const accepted=periodBookings.filter(x=>["approved","assigned","in_progress","completed"].includes(x.status)).length;
 const months=useMemo(()=>Array.from({length:6},(_,idx)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-(5-idx));const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");const label=d.toLocaleDateString("en-IN",{month:"short"});const amount=invoices.filter(x=>x.status!=="void"&&x.issued_at.slice(0,7)===key).reduce((s,x)=>s+Number(x.total_amount||0),0);return {key,label,amount};}),[invoices]);
 const maxMonth=Math.max(1,...months.map(x=>x.amount));
 const statuses=[["Pending",periodBookings.filter(x=>x.status==="pending").length],["Approved",periodBookings.filter(x=>x.status==="approved").length],["Assigned",periodBookings.filter(x=>x.status==="assigned").length],["In progress",periodBookings.filter(x=>x.status==="in_progress").length],["Completed",periodBookings.filter(x=>x.status==="completed").length],["Rejected / cancelled",periodBookings.filter(x=>["rejected","cancelled"].includes(x.status)).length]] as [string,number][];
 const topExpenses=Object.entries(periodExpenses.reduce<Record<string,number>>((a,x)=>{a[x.category]=(a[x.category]||0)+Number(x.amount||0);return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5);
 return <section className="analytics-shell">
  <div className="analytics-head"><div><span className="eyebrow dark">BUSINESS INTELLIGENCE</span><h2>Performance analytics</h2><p>Live figures from your bookings, invoices, fleet and expense ledger.</p></div><select value={range} onChange={e=>setRange(Number(e.target.value))}><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 12 months</option></select></div>
  {loading?<div className="owner-panel">Loading analytics…</div>:error?<div className="owner-panel" role="alert">{error}<button onClick={()=>void load()}>Retry</button></div>:<>
  <div className="analytics-kpis"><article><small>PAID VALUE ON PERIOD INVOICES</small><b>{money(revenue)}</b><span>Paid amounts on invoices issued in period</span></article><article><small>INVOICED VALUE</small><b>{money(billed)}</b><span>Excludes void invoices</span></article><article><small>EXPENSES RECORDED</small><b>{money(cost)}</b><span>{periodExpenses.length} expense entries</span></article><article><small>BOOKING CONVERSION</small><b>{periodBookings.length?Math.round(accepted/periodBookings.length*100):0}%</b><span>{accepted} accepted of {periodBookings.length}</span></article></div>
  <div className="analytics-grid"><article className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">REVENUE TREND</span><h2>Monthly invoiced value</h2></div></div><div className="analytics-bars">{months.map(x=><div className="analytics-bar-col" key={x.key}><b>{x.amount?money(x.amount):"—"}</b><div className="analytics-bar-track"><i style={{height:Math.max(3,x.amount/maxMonth*100)+"%"}}/></div><small>{x.label}</small></div>)}</div></article>
  <article className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">BOOKING PIPELINE</span><h2>Request status</h2></div></div>{statuses.map(([name,count])=><div className="analytics-status" key={name}><span>{name}</span><b>{count}</b></div>)}</article></div>
  <div className="analytics-grid"><article className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">FLEET UTILISATION</span><h2>Machine status today</h2></div></div><div className="analytics-fleet"><div><b>{machines.length}</b><span>Total machines</span></div><div><b>{machines.filter(x=>x.status==="on_rent").length}</b><span>On rent</span></div><div><b>{machines.filter(x=>x.status==="available").length}</b><span>Available</span></div><div><b>{machines.filter(x=>x.status==="maintenance").length}</b><span>Maintenance</span></div></div>{machines.length===0?<p className="owner-empty">Add machines to begin tracking utilisation.</p>:null}</article>
  <article className="owner-panel"><div className="owner-panel-head"><div><span className="eyebrow dark">COST BREAKDOWN</span><h2>Top expense categories</h2></div></div>{topExpenses.map(([name,value])=><div className="analytics-status" key={name}><span>{name.replaceAll("_"," ")}</span><b>{money(value)}</b></div>)}{topExpenses.length===0?<p className="owner-empty">No expenses recorded in this period.</p>:null}</article></div>
  <p className="analytics-footnote">Reports use up to 1,000 latest records per data source. Revenue means payments recorded in the selected period; invoiced value is based on invoice issue date. Fleet status is the current snapshot, not historical utilisation.</p>
  </>}
 </section>;
}
