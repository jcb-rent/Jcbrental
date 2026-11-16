import { createClient } from "npm:@supabase/supabase-js@2";

const BUSINESS_ID = "63da8c23-9e2f-4380-a82b-0c224557e3ab";
const BRANCH_ID = "484d6ba3-0c3c-40d3-a452-45e649994ded";
const allowedOrigins = new Set([
  "https://jcbrental-ykel.vercel.app",
  "https://jcbrental-ykel-jcb-rent-9171.vercel.app",
  "https://jcbrental-ykel-git-main-jcb-rent-9171.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
const baseHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};
function response(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({ ...baseHeaders, "Content-Type": "application/json" });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}
async function digest(value: string) {
  const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(data)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function readSecret(name: string) {
  try { return JSON.parse(Deno.env.get(name) ?? "{}").default ?? ""; } catch { return ""; }
}
const rentalUnits = new Set(["hour", "shift", "day", "month", "project"]);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
    return new Response("ok", { headers: { ...baseHeaders, ...(origin ? { "Access-Control-Allow-Origin": origin } : {}) } });
  }
  if (origin && !allowedOrigins.has(origin)) return response({ error: "Origin not allowed" }, 403, origin);
  if (!["GET", "POST"].includes(req.method)) return response({ error: "Method not allowed" }, 405, origin);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = readSecret("SUPABASE_SECRET_KEYS") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return response({ error: "Booking service is not configured" }, 503, origin);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  if (req.method === "GET") {
    const { data, error } = await admin.from("machines")
      .select("id,fleet_code,name,category,description,hourly_rate,shift_rate,daily_rate,monthly_rate,status")
      .eq("business_id", BUSINESS_ID).eq("status", "available").order("created_at");
    if (error) return response({ error: "Unable to load equipment catalogue" }, 500, origin);
    return response({ machines: data ?? [] }, 200, origin);
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return response({ error: "Invalid JSON body" }, 400, origin); }
  const name = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body.customer_mobile === "string" ? body.customer_mobile.replace(/\D/g, "").slice(-10) : "";
  const site = typeof body.site_address === "string" ? body.site_address.trim() : "";
  const machineId = typeof body.machine_id === "string" ? body.machine_id : "";
  const unit = typeof body.rental_unit === "string" ? body.rental_unit : "";
  const quantity = Number(body.quantity);
  const startsAt = typeof body.starts_at === "string" ? new Date(body.starts_at) : new Date(NaN);
  const endsAt = typeof body.ends_at === "string" && body.ends_at ? new Date(body.ends_at) : null;
  if (name.length < 2 || name.length > 100 || !/^\d{10}$/.test(phone) || site.length < 5 || site.length > 500 ||
      !machineId || !rentalUnits.has(unit) || !Number.isInteger(quantity) || quantity < 1 || quantity > 365 ||
      !Number.isFinite(startsAt.getTime()) || startsAt.getTime() < Date.now() - 5 * 60 * 1000 ||
      (endsAt && (!Number.isFinite(endsAt.getTime()) || endsAt <= startsAt))) {
    return response({ error: "Please check the booking details and try again" }, 400, origin);
  }
  const { data: machine, error: machineError } = await admin.from("machines")
    .select("id").eq("id", machineId).eq("business_id", BUSINESS_ID).eq("status", "available").maybeSingle();
  if (machineError || !machine) return response({ error: "This machine is no longer available. Refresh the fleet and choose another." }, 409, origin);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const [phoneHash, ipHash] = await Promise.all([digest(phone), digest(ip)]);
  const now = new Date();
  const { data: rate } = await admin.from("public_booking_rate_limits").select("*")
    .eq("phone_hash", phoneHash).eq("ip_hash", ipHash).maybeSingle();
  if (rate?.blocked_until && new Date(rate.blocked_until).getTime() > now.getTime()) {
    return response({ error: "Too many booking attempts. Please try again later." }, 429, origin);
  }
  const expired = !rate || now.getTime() - new Date(rate.window_started_at).getTime() > 60 * 60 * 1000;
  const attempts = expired ? 0 : Number(rate.attempts || 0);
  if (attempts >= 3) {
    await admin.from("public_booking_rate_limits").upsert({
      phone_hash: phoneHash, ip_hash: ipHash, attempts,
      window_started_at: expired ? now.toISOString() : rate!.window_started_at,
      blocked_until: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), updated_at: now.toISOString(),
    }, { onConflict: "phone_hash,ip_hash" });
    return response({ error: "Too many booking attempts. Please try again later." }, 429, origin);
  }

  const { data: booking, error: insertError } = await admin.from("bookings").insert({
    business_id: BUSINESS_ID, branch_id: BRANCH_ID, machine_id: machineId,
    customer_name: name, customer_mobile: phone, site_address: site,
    site_landmark: typeof body.site_landmark === "string" ? body.site_landmark.slice(0, 200) : null,
    work_type: typeof body.work_type === "string" ? body.work_type.slice(0, 80) : null,
    notes: typeof body.notes === "string" ? body.notes.slice(0, 1000) : null,
    rental_unit: unit, quantity, starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    diesel_included: body.diesel_included === true,
    operator_included: body.operator_included !== false,
    transport_required: body.transport_required === true,
    status: "pending", payment_status: "unpaid",
  }).select("id,status,created_at").single();
  if (insertError || !booking) {
    await admin.from("public_booking_rate_limits").upsert({
      phone_hash: phoneHash, ip_hash: ipHash, attempts: attempts + 1,
      window_started_at: expired ? now.toISOString() : rate!.window_started_at,
      blocked_until: null, updated_at: now.toISOString(),
    }, { onConflict: "phone_hash,ip_hash" });
    return response({ error: "Unable to submit booking. Please try again." }, 500, origin);
  }
  await admin.from("public_booking_rate_limits").upsert({
    phone_hash: phoneHash, ip_hash: ipHash, attempts: attempts + 1,
    window_started_at: expired ? now.toISOString() : rate!.window_started_at,
    blocked_until: null, updated_at: now.toISOString(),
  }, { onConflict: "phone_hash,ip_hash" });
  return response({ booking: { id: booking.id, status: booking.status, created_at: booking.created_at } }, 201, origin);
});
