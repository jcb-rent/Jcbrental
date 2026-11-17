import { lazy, Suspense, useEffect, useState } from "react";
const CustomerPortal = lazy(() => import("./CustomerPortal"));
const OwnerPortal = lazy(() => import("./OwnerPortal"));
const DriverPortal = lazy(() => import("./DriverPortal"));
import OperationsLogin, { useOperationsAuth } from "./OperationsAuth";

type View = "customer" | "operations";
const viewFromPath = (): View => location.pathname.startsWith("/operations") ? "operations" : "customer";

export default function App() {
 const [view,setView]=useState<View>(viewFromPath);
 const [brandOpen,setBrandOpen]=useState(false);
 const auth=useOperationsAuth();
 useEffect(()=>{
  const onPop=()=>{setView(viewFromPath());setBrandOpen(false);};
  window.addEventListener("popstate",onPop);
  return()=>window.removeEventListener("popstate",onPop);
 },[]);
 function go(next:View){
  setView(next);setBrandOpen(false);
  const path=next==="customer"?"/customer":"/operations";
  if(location.pathname!==path)history.pushState({}, "", path);
  window.scrollTo({top:0,behavior:"smooth"});
 }
 const isStaff=Boolean(auth.profile&&["owner","manager","driver"].includes(auth.profile.role));
 const staffName=auth.profile?.full_name||auth.session?.user.email||"Team member";
 return <div className={`shell app-shell ${view==="customer"?"customer-app":"operations-app"}`}>
  <header className="app-topbar">
   <div className="app-brand-wrap">
    <button className={`app-brand ${brandOpen?"brand-open":""}`} aria-expanded={brandOpen} aria-label="Open JCB Rental app switcher" onClick={()=>setBrandOpen(v=>!v)}>
     <span className="app-brand-mark">J</span><span className="app-brand-copy"><strong>JCB RENTAL</strong><small>{view==="customer"?"CUSTOMER EXPERIENCE":"OPERATIONS SUITE"}</small></span><span className="brand-chevron">⌄</span>
    </button>
    {brandOpen&&<><button className="brand-dismiss" aria-label="Close app menu" onClick={()=>setBrandOpen(false)}/><div className="brand-switcher"><span className="switcher-label">YOUR WORKSPACES</span><button className={view==="operations"?"switcher-active":""} onClick={()=>go("operations")}><span className="switcher-icon">▦</span><span><b>Owner & Driver App</b><small>Fleet, bookings and operations</small></span><span>↗</span></button><button className={view==="customer"?"switcher-active":""} onClick={()=>go("customer")}><span className="switcher-icon">⌂</span><span><b>Customer App</b><small>Browse, book and track a machine</small></span><span>↗</span></button></div></>}
   </div>
   <nav className="app-desktop-nav" aria-label="App navigation">
    <button className={view==="operations"?"app-nav-active":""} onClick={()=>go("operations")}><span>▦</span>Owner & Driver</button>
    <button className={view==="customer"?"app-nav-active":""} onClick={()=>go("customer")}><span>⌂</span>Customer</button>
   </nav>
   <div className="app-top-actions">
    {view==="operations"&&isStaff?<><span className="session-chip"><i/> {auth.profile?.role==="driver"?"DRIVER":"OWNER"} SESSION</span><span className="session-name">{staffName}</span><button className="signout-button" onClick={()=>void auth.signOut()}>Sign out</button></>:<a className="help-chip" href="tel:8859985492"><span>↗</span> Help</a>}
   </div>
  </header>
  <main className="app-content">
   <Suspense fallback={<section className="auth-loading glass-loading"><span className="loading-orbit"/>Loading your workspace…</section>}>
    {view==="customer"?<CustomerPortal/>:auth.loading?<section className="auth-loading glass-loading"><span className="loading-orbit"/>Checking secure session…</section>:!isStaff?<><OperationsLogin/>{auth.error&&<div className="auth-error auth-global" role="alert">{auth.error}</div>}</>:auth.profile?.role==="driver"?<DriverPortal/>:<OwnerPortal/>}
   </Suspense>
  </main>
  <nav className="mobile-app-dock" aria-label="Switch apps">
   <button className={view==="operations"?"dock-active":""} onClick={()=>go("operations")}><span>▦</span><small>Owner & Driver</small></button>
   <button className="dock-brand" onClick={()=>setBrandOpen(v=>!v)} aria-label="Open app switcher"><b>J</b><small>Apps</small></button>
   <button className={view==="customer"?"dock-active":""} onClick={()=>go("customer")}><span>⌂</span><small>Customer</small></button>
  </nav>
  <footer className="app-footer"><b>JCB Rental Service</b><span>One connected rental platform · Secure role-based access</span><span>© 2026</span></footer>
 </div>;
}
