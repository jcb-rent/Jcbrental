import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";

type Profile = { id:string; role:"owner"|"manager"|"driver"|"customer"; full_name:string|null; business_id:string|null; is_active:boolean };
export function useOperationsAuth(){
 const [session,setSession]=useState<Session|null>(null);
 const [profile,setProfile]=useState<Profile|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  if(!supabase){setLoading(false);return;}
  let alive=true;
  async function loadProfile(id:string){
   const {data,error:profileError}=await supabase!.from("profiles").select("id,role,full_name,business_id,is_active").eq("id",id).single();
   if(!alive)return;
   if(profileError){setError("Signed in, but your staff profile is not provisioned. Ask the business owner to finish account setup.");setProfile(null);}
   else if(!data.is_active){setError("This account is disabled. Contact the business owner.");setProfile(null);}
   else if(!["owner","manager","driver"].includes(data.role)){setError("This account does not have operations access.");setProfile(null);}
   else if(!data.business_id){setError("Your staff account is not linked to a business yet. Contact the business owner.");setProfile(null);}
   else {setProfile(data as Profile);setError("");}
   setLoading(false);
  }
  supabase.auth.getSession().then(async({data})=>{
   if(!alive)return;
   setSession(data.session);
   if(data.session) await loadProfile(data.session.user.id);
   else setLoading(false);
  });
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
   setSession(next);
   if(!next){setProfile(null);setLoading(false);setError("");}
   else {setLoading(true);window.setTimeout(()=>{if(alive)void loadProfile(next.user.id);},0);}
  });
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 return {session,profile,loading,error,signOut:async()=>{if(supabase)await supabase.auth.signOut();}};
}
export default function OperationsLogin(){
 const [phone,setPhone]=useState(""),[pin,setPin]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:FormEvent){
  e.preventDefault();if(!supabase)return;
  setBusy(true);setMessage("");
  const {data,error}=await supabase.functions.invoke("staff-pin-login",{body:{phone:phone.replace(/\D/g,"").slice(-10),pin}});
  if(error||!data?.access_token||!data?.refresh_token){setBusy(false);setMessage(data?.error||error?.message||"Unable to sign in. Check your details and try again.");return;}
  const {error:sessionError}=await supabase.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
  setBusy(false);
  if(sessionError)setMessage(sessionError.message);
 }
 return <main className="auth-screen"><section className="auth-card"><div className="auth-symbol">J</div><span className="auth-eyebrow">JCB RENTAL SERVICE · SECURE ACCESS</span><h1>Operations login</h1><p>Enter the registered mobile number and your six-digit staff PIN.</p>{!isSupabaseConfigured?<div className="auth-error">Supabase is not configured in this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the environment.</div>:null}<form onSubmit={submit}><label>Registered mobile number<input type="tel" inputMode="numeric" autoComplete="username" required minLength={10} maxLength={14} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile number"/></label><label>Six-digit PIN<input type="password" inputMode="numeric" autoComplete="current-password" required minLength={6} maxLength={6} pattern="[0-9]{6}" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="••••••"/></label><button className="auth-submit" disabled={!isSupabaseConfigured||busy||pin.length!==6}>{busy?"Verifying securely…":"Sign in securely"}</button></form>{message&&<div className="auth-error" role="alert">{message}</div>}<small>Staff accounts and PINs are created by the business owner. Five failed attempts trigger a temporary lockout. Customer bookings do not require staff login.</small></section></main>;
}
