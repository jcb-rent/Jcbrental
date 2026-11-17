import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://jcbrental-ykel.vercel.app",
  "https://jcbrental-ykel-jcb-rent-9171.vercel.app",
  "https://jcbrental-ykel-git-main-jcb-rent-9171.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
function respond(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({ ...corsHeaders, "Content-Type": "application/json" });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}
function readSecret(name: string) {
  try { return JSON.parse(Deno.env.get(name) ?? "{}").default ?? ""; } catch { return ""; }
}
function makePin() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
    return new Response("ok", { headers: { ...corsHeaders, ...(origin ? { "Access-Control-Allow-Origin": origin } : {}) } });
  }
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return respond({ error: "Origin not allowed" }, 403, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = readSecret("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publishableKey = readSecret("SUPABASE_PUBLISHABLE_KEYS") || Deno.env.get("SUPABASE_ANON_KEY");
  const bearer = req.headers.get("authorization") || "";
  if (!url || !serviceKey || !publishableKey || !bearer.startsWith("Bearer ")) {
    return respond({ error: "Secure staff provisioning is not configured" }, 503, origin);
  }
  const token = bearer.slice(7);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const caller = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: bearer } } });
  const { data: callerData, error: callerError } = await caller.auth.getUser(token);
  if (callerError || !callerData.user) return respond({ error: "Sign in again to continue" }, 401, origin);

  let payload: { action?: unknown; driver_user_id?: unknown; full_name?: unknown; phone?: unknown; branch_id?: unknown };
  try { payload = await req.json(); } catch { return respond({ error: "Invalid request" }, 400, origin); }
  const fullName = typeof payload.full_name === "string" ? payload.full_name.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "").slice(-10) : "";
  const branchId = typeof payload.branch_id === "string" && payload.branch_id ? payload.branch_id : null;
  if (fullName.length < 2 || fullName.length > 100 || !/^\d{10}$/.test(phone)) {
    return respond({ error: "Enter a valid driver name and 10-digit mobile number" }, 400, origin);
  }

  const { data: owner, error: ownerError } = await admin.from("profiles")
    .select("id,business_id,branch_id,role,is_active")
    .eq("id", callerData.user.id).single();
  if (ownerError || !owner?.is_active || owner.role !== "owner" || !owner.business_id) {
    return respond({ error: "Only the active business owner can create driver accounts" }, 403, origin);
  }
  if (payload.action === "deactivate") {
    const driverId = typeof payload.driver_user_id === "string" ? payload.driver_user_id : "";
    if (!/^[0-9a-f-]{36}$/i.test(driverId)) return respond({ error: "Invalid driver account" }, 400, origin);
    const { data: driver } = await admin.from("profiles").select("id").eq("id", driverId)
      .eq("business_id", owner.business_id).eq("role", "driver").maybeSingle();
    if (!driver) return respond({ error: "Driver account was not found in your business" }, 404, origin);
    const { error: deactivateError } = await admin.from("profiles").update({ is_active: false })
      .eq("id", driverId).eq("business_id", owner.business_id);
    if (deactivateError) return respond({ error: "Driver access could not be deactivated" }, 500, origin);
    return respond({ success: true, driver_id: driverId, is_active: false }, 200, origin);
  }

  if (payload.action && payload.action !== "create") return respond({ error: "Unsupported action" }, 400, origin);
  if (branchId) {
    const { data: branch } = await admin.from("branches").select("id").eq("id", branchId).eq("business_id", owner.business_id).maybeSingle();
    if (!branch) return respond({ error: "Selected branch does not belong to your business" }, 400, origin);
  }
  const { data: duplicate } = await admin.from("profiles").select("id").eq("phone", phone).maybeSingle();
  if (duplicate) return respond({ error: "This mobile number is already registered. Use a different number." }, 409, origin);

  const pin = makePin();
  const email = "driver-" + phone + "@staff.jcbrental.local";
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, email_confirm: true, password: pin, user_metadata: { full_name: fullName, staff_kind: "driver" },
  });
  if (createError || !created.user) return respond({ error: createError?.message || "Driver account could not be created" }, 400, origin);

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id, business_id: owner.business_id, branch_id: branchId || owner.branch_id || null,
    role: "driver", full_name: fullName, phone, is_active: true,
  }, { onConflict: "id" });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return respond({ error: "Driver profile could not be saved. No account was retained." }, 500, origin);
  }
  return respond({ driver: { id: created.user.id, full_name: fullName, phone, branch_id: branchId || owner.branch_id || null }, pin }, 201, origin);
});
