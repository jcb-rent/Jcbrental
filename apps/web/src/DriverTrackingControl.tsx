import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

type Session={id:string;started_at:string;last_location_at:string|null;ended_at:string|null};
export default function DriverTrackingControl({assignmentId}:{assignmentId:string}){
 const [session,setSession]=useState<Session|null>(null),[watching,setWatching]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const watchRef=useRef<number|null>(null),lastSentRef=useRef(0),sessionRef=useRef<string|null>(null);
 const load=useCallback(async()=>{if(!supabase)return;const {data,error:e}=await supabase.from("driver_tracking_sessions").select("id,started_at,last_location_at,ended_at").eq("assignment_id",assignmentId).is("ended_at",null).maybeSingle();if(e){setError(e.message);return;}setSession(data as Session|null);sessionRef.current=data?.id||null;},[assignmentId]);
 useEffect(()=>{void load();return()=>{if(watchRef.current!==null)navigator.geolocation?.clearWatch(watchRef.current);};},[load]);
 const stopWatch=()=>{if(watchRef.current!==null){navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;}setWatching(false);};
 function beginWatch(sessionId:string){
  if(!("geolocation" in navigator)){setError("This device/browser does not support GPS location.");return;}
  setError("");lastSentRef.current=0;
  watchRef.current=navigator.geolocation.watchPosition(async pos=>{
   if(Date.now()-lastSentRef.current<12000)return;
   lastSentRef.current=Date.now();
   if(!supabase)return;
   const {error:e}=await supabase.rpc("record_driver_location",{p_session_id:sessionId,p_latitude:pos.coords.latitude,p_longitude:pos.coords.longitude,p_accuracy_m:pos.coords.accuracy,p_speed_mps:pos.coords.speed??undefined,p_heading_deg:pos.coords.heading??undefined,p_captured_at:new Date(pos.timestamp).toISOString()});
   if(e)setError(e.message.includes("10 seconds")?"GPS is updating…":e.message);else{setError("");setMessage("Location shared at "+new Date(pos.timestamp).toLocaleTimeString("en-IN"));}
  },err=>{setError(err.code===1?"Location permission denied. Enable location permission to share your machine position.":err.message);stopWatch();},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
  setWatching(true);setMessage("GPS sharing is active. Keep this page open for continuous updates.");
 }
 async function start(){if(!supabase)return;setBusy(true);setError("");const {data,error:e}=await supabase.rpc("start_driver_tracking",{p_assignment_id:assignmentId});setBusy(false);if(e){setError(e.message);return;}const id=data as string;sessionRef.current=id;await load();beginWatch(id);}
 function resume(){if(sessionRef.current)beginWatch(sessionRef.current);}
 async function stop(){if(!supabase||!sessionRef.current)return;setBusy(true);setError("");stopWatch();const {error:e}=await supabase.rpc("stop_driver_tracking",{p_session_id:sessionRef.current});setBusy(false);if(e){setError(e.message);return;}sessionRef.current=null;setSession(null);setMessage("GPS sharing stopped. No further location updates will be sent.");}
 return <section className="phase8-tracking"><div><span className="phase8-kicker">PRIVACY-CONTROLLED GPS</span><h3>Machine location sharing</h3><p>GPS starts only after you choose to share it for this assigned job. Location is sent approximately every 12 seconds while this page is active.</p></div><div className="phase8-tracking-actions">{!session?<button type="button" disabled={busy} onClick={()=>void start()}>{busy?"Starting…":"Start GPS sharing"}</button>:!watching?<button type="button" disabled={busy} onClick={resume}>Resume GPS sharing</button>:<button type="button" disabled={busy} onClick={()=>void stop()}>Stop GPS sharing</button>}{session?<button type="button" className="phase8-stop" disabled={busy} onClick={()=>void stop()}>End session</button>:null}</div>{session?<small>Session started {new Date(session.started_at).toLocaleString("en-IN")}{session.last_location_at?" · Last server update "+new Date(session.last_location_at).toLocaleTimeString("en-IN"):" · Waiting for first GPS fix"}</small>:<small>GPS is off. Your device location is not being collected.</small>}{message?<p role="status">{message}</p>:null}{error?<p role="alert" className="phase8-error">{error}</p>:null}</section>;
}