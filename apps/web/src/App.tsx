import { useEffect, useState } from "react";
import CustomerPortal from "./CustomerPortal";
import OwnerPortal from "./OwnerPortal";
import DriverPortal from "./DriverPortal";
import OperationsLogin, { useOperationsAuth } from "./OperationsAuth";
type View = "customer" | "operations";
export default function App() {
 const [view,setView]=useState<View>(location.pathname==="/operations"?"operations":"customer");
 const auth=useOperationsAuth();
 useEffect(()=>{const onPop=()=>setView(location.pathname==="/operations"?"operations":"customer");window.addEventListener("popstate",onPop);return()=>window.removeEventListener("popstate",onPop);},[]);
 function go(next:View){setView(next);history.pushState({},"",next==="customer"?"/":"/operations");}
 const isStaff=Boolean(auth.profile&&["owner","manager","driver"].includes(auth.profile.role));
 return <div className="shell"><header className="top"><a className="brand" href="/" onClick={e=>{e.preventDefault();go("customer");}}><b className="mark">J</b><span><strong>JCB Rental</strong><small>SERVICE PLATFORM</small></span></a><nav><button className={view==="customer"?"active":""} onClick={()=>go("customer")}>Customer</button><button className={view==="operations"?"active":""} onClick={()=>go("operations")}>Operations</button></nav><span className="demo">{view==="operations"&&isStaff?"● SECURE SESSION":"● CUSTOMER PORTAL"}</span></header>
 {view==="customer"?<CustomerPortal/>:auth.loading?<main className="auth-loading">Checking secure session…</main>:!isStaff?<><OperationsLogin/>{auth.error&&<div className="auth-error auth-global" role="alert">{auth.error}</div>}</>:<><div className="secure-toolbar"><span>Signed in as <b>{auth.profile?.full_name||auth.session?.user.email}</b> · {auth.profile?.role}</span><button onClick={()=>void auth.signOut()}>Sign out</button></div>{auth.profile?.role==="driver"?<DriverPortal/>:<OwnerPortal/>}</>}
 <footer><b>JCB Rental Service</b><span>Professional equipment rental management</span><span>© 2026</span></footer></div>;
}
