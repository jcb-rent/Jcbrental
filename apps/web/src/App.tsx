import { useState } from "react";
import CustomerPortal from "./CustomerPortal";
import OwnerPortal from "./OwnerPortal";
import DriverPortal from "./DriverPortal";
type View = "customer" | "operations";
type Role = "owner" | "driver";
export default function App() {
 const [view,setView]=useState<View>(location.pathname==="/operations"?"operations":"customer");
 const [role,setRole]=useState<Role>("owner");
 function go(next:View){setView(next);history.pushState({},"",next==="customer"?"/":"/operations");}
 return <div className="shell"><header className="top"><a className="brand" href="/" onClick={e=>{e.preventDefault();go("customer");}}><b className="mark">J</b><span><strong>JCB Rental</strong><small>SERVICE PLATFORM</small></span></a><nav><button className={view==="customer"?"active":""} onClick={()=>go("customer")}>Customer</button><button className={view==="operations"?"active":""} onClick={()=>go("operations")}>Operations</button></nav><span className="demo">● DEMO MODE</span></header>
 {view==="customer"?<CustomerPortal/>:<><div className="ops-role-switch"><button className={role==="owner"?"chosen":""} onClick={()=>setRole("owner")}>Owner console</button><button className={role==="driver"?"chosen":""} onClick={()=>setRole("driver")}>Driver workspace</button></div>{role==="owner"?<OwnerPortal/>:<DriverPortal/>}</>}
 <footer><b>JCB Rental Service</b><span>Professional equipment rental management</span><span>© 2026 · Demo</span></footer></div>;
}
