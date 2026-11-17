import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("apps/web");
const failures = [];
function read(path) {
  const full = resolve(path);
  if (!existsSync(full)) { failures.push(`Missing security-critical source: ${path}`); return ""; }
  return readFileSync(full, "utf8");
}
const supabase = read("apps/web/src/supabase.ts");
const auth = read("apps/web/src/OperationsAuth.tsx");
const app = read("apps/web/src/App.tsx");
const owner = read("apps/web/src/OwnerPortal.tsx");
const analytics = read("apps/web/src/AnalyticsPanel.tsx");
const pin = read("supabase/functions/staff-pin-login/index.ts");
const publicApi = read("supabase/functions/public-rentals/index.ts");
const provision = read("supabase/functions/staff-provision/index.ts");
const customer = read("apps/web/src/CustomerPortal.tsx");

if (!supabase.includes("VITE_SUPABASE_PUBLISHABLE_KEY")) failures.push("Browser client must use the Supabase publishable key.");
if (/service_role|sb_secret_/i.test(supabase)) failures.push("Privileged Supabase secret detected in browser client source.");
if (!/\[\s*"owner"\s*,\s*"manager"\s*,\s*"driver"\s*\]/.test(auth)) failures.push("Operations auth must explicitly allow only staff roles.");
if (!auth.includes("is_active")) failures.push("Operations auth must reject inactive staff profiles.");
if (!app.includes('auth.profile?.role==="driver"?<DriverPortal/>:<OwnerPortal/>')) failures.push("Driver and owner experiences must remain role-separated.");
if (!owner.includes('.eq("business_id",profile.business_id)')) failures.push("Owner data loading must be business scoped.");
if (!analytics.includes('.eq("business_id",businessId)')) failures.push("Analytics data queries must be business scoped.");
if (!pin.includes("staff_login_attempts") || !pin.includes("attempts >= 5") || !pin.includes("sha256(phone)")) failures.push("Staff PIN login must retain hashed identifiers and server-side attempt throttling.");
if (!publicApi.includes("public_booking_rate_limits")) failures.push("Public booking endpoint must retain server-side rate limiting.");
if (!provision.includes('owner.role !== "owner"') || !provision.includes("crypto.getRandomValues") || !provision.includes("admin.auth.admin.createUser")) failures.push("Driver provisioning must require an active owner and generate a secure PIN server-side.");
if (!provision.includes('eq("business_id", owner.business_id)') || !provision.includes('role: "driver"')) failures.push("Driver provisioning must validate tenant branch ownership and assign the driver role.");
if (!owner.includes('functions.invoke("staff-provision"') || !owner.includes("deactivateDriver")) failures.push("Owner portal must expose secure driver creation and deactivation workflows.");
if (!provision.includes('payload.action === "deactivate"') || !provision.includes('role", "driver"')) failures.push("Driver deactivation must be owner-only and restricted to the same tenant.");
if (!owner.includes('category:"driver_salary"') || !owner.includes('from("driver_attendance")')) failures.push("Owner portal must retain driver attendance and salary-expense workflows.");
if (!app.includes('"/customer"') || !app.includes('"/operations"')) failures.push("Customer and operations apps must have separate direct routes.");
if (!read("apps/web/vercel.json").includes('"/customer"')) failures.push("Customer route must be rewritten to the SPA entry point.");
if (!customer.includes('signInWithOAuth({provider:"google"') || !customer.includes("Guest booking")) failures.push("Customer portal must retain optional Google sign-in and guest booking.");
if (/VITE_.*(SERVICE_ROLE|SECRET_KEY)/i.test(read("apps/web/.env.example"))) failures.push("Privileged environment variables must not be exposed as VITE_ variables.");

if (failures.length) {
  console.error("Security regression checks failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("Security regression checks passed: publishable-only browser config, staff role gates, tenant-scoped queries and server-side rate-limit controls verified.");
