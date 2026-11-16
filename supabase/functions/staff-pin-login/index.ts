import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const allowedOrigins = new Set([
  "https://jcbrental-ykel.vercel.app",
  "https://jcbrental-ykel-jcb-rent-9171.vercel.app",
  "https://jcbrental-ykel-git-main-jcb-rent-9171.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function json(body: unknown, status: number, origin: string | null) {
  const headers = new Headers({ "Content-Type": "application/json", ...corsHeaders });
  if (origin && allowedOrigins.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}
async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function getKeys(name: string): Record<string,string> {
  try { return JSON.parse(Deno.env.get(name) ?? "{}"); } catch { return {}; }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return new Response("Origin not allowed", { status: 403 });
    return new Response("ok", { headers: { ...corsHeaders, ...(origin ? { "Access-Control-Allow-Origin": origin } : {}) } });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = getKeys("SUPABASE_SECRET_KEYS").default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publishableKey = getKeys("SUPABASE_PUBLISHABLE_KEYS").default || Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceKey || !publishableKey) {
    return json({ error: "Authentication service is not configured" }, 503, origin);
  }

  let payload: { phone?: unknown; pin?: unknown };
  try { payload = await req.json(); } catch { return json({ error: "Invalid request" }, 400, origin); }
  const phone = typeof payload.phone === "string" ? payload.phone.replace(/\D/g, "").slice(-10) : "";
  const pin = typeof payload.pin === "string" ? payload.pin : "";
  if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(pin)) {
    return json({ error: "Enter your registered 10-digit mobile number and 6-digit PIN" }, 400, origin);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const authClient = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const [identifierHash, ipHash] = await Promise.all([sha256(phone), sha256(forwarded)]);
  const now = new Date();
  const { data: attempt } = await admin.from("staff_login_attempts")
    .select("attempts,window_started_at,blocked_until")
    .eq("identifier_hash", identifierHash).eq("ip_hash", ipHash).maybeSingle();

  if (attempt?.blocked_until && new Date(attempt.blocked_until).getTime() > now.getTime()) {
    return json({ error: "Unable to sign in. Try again later." }, 429, origin);
  }

  const windowExpired = !attempt || now.getTime() - new Date(attempt.window_started_at).getTime() > 15 * 60 * 1000;
  const currentAttempts = windowExpired ? 0 : Number(attempt.attempts || 0);
  if (currentAttempts >= 5) return json({ error: "Unable to sign in. Try again later." }, 429, origin);

  const { data: profile } = await admin.from("profiles")
    .select("id,role,business_id,is_active")
    .eq("phone", phone)
    .in("role", ["owner", "manager", "driver"])
    .eq("is_active", true)
    .not("business_id", "is", null)
    .maybeSingle();

  let authError = !profile;
  let session = null;
  if (profile) {
    const { data: userResult } = await admin.auth.admin.getUserById(profile.id);
    const email = userResult.user?.email;
    if (email) {
      const result = await authClient.auth.signInWithPassword({ email, password: pin });
      authError = Boolean(result.error || !result.data.session);
      session = result.data.session;
    } else authError = true;
  }

  if (authError || !session) {
    const attempts = currentAttempts + 1;
    await admin.from("staff_login_attempts").upsert({
      identifier_hash: identifierHash,
      ip_hash: ipHash,
      attempts,
      window_started_at: windowExpired ? now.toISOString() : attempt!.window_started_at,
      blocked_until: attempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : null,
      updated_at: now.toISOString(),
    }, { onConflict: "identifier_hash,ip_hash" });
    return json({ error: "Invalid mobile number or PIN" }, 401, origin);
  }

  await admin.from("staff_login_attempts").upsert({
    identifier_hash: identifierHash, ip_hash: ipHash, attempts: 0,
    window_started_at: now.toISOString(), blocked_until: null, updated_at: now.toISOString(),
  }, { onConflict: "identifier_hash,ip_hash" });

  return json({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    token_type: session.token_type,
  }, 200, origin);
});
