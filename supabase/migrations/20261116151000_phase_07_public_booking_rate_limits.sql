create table if not exists public.public_booking_rate_limits (
  id uuid primary key default gen_random_uuid(),
  phone_hash text not null,
  ip_hash text not null,
  attempts integer not null default 0 check (attempts >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now(),
  unique(phone_hash, ip_hash)
);
alter table public.public_booking_rate_limits enable row level security;
revoke all on public.public_booking_rate_limits from public, anon, authenticated;
grant all on public.public_booking_rate_limits to service_role;
