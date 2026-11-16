import { FormEvent, useEffect, useState } from "react";
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
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 return {session,profile,loading,error,setError,signOut:async()=>{if(supabase)await supabase.auth.signOut();}};
}
export default function OperationsLogin({onSuccess}:{onSuccess:()=>void}){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function submit(e:FormEvent){e.preventDefault();if(!supabase)return;setBusy(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setBusy(false);if(error)setMessage(error.message);else onSuccess();}
 return <main className="auth-screen"><section className="auth-card"><div className="auth-symbol">J</div><span className="auth-eyebrow">JCB RENTAL SERVICE · SECURE ACCESS</span><h1>Operations login</h1><p>Sign in with the staff account created for you by the business owner.</p>{!isSupabaseConfigured?<div className="auth-error">Supabase is not configured in this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to the environment.</div>:null}<form onSubmit={submit}><label>Email address<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="staff@business.com"/></label><label>Password<input type="password" autoComplete="current-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label><button className="auth-submit" disabled={!isSupabaseConfigured||busy}>{busy?"Signing in…":"Sign in securely"}</button></form>{message&&<div className="auth-error" role="alert">{message}</div>}<small>Staff accounts are provisioned by the owner. Public self-registration is disabled.</small></section></main>;
}
