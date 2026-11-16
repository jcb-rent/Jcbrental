create table public.staff_login_attempts (
 id uuid primary key default gen_random_uuid(),
 identifier_hash text not null,
 ip_hash text not null,
 attempts integer not null default 0 check(attempts>=0),
 window_started_at timestamptz not null default now(),
 blocked_until timestamptz,
 updated_at timestamptz not null default now(),
 unique(identifier_hash,ip_hash)
);
alter table public.staff_login_attempts enable row level security;
revoke all privileges on public.staff_login_attempts from public,anon,authenticated;
create index staff_login_attempts_blocked_idx on public.staff_login_attempts(blocked_until) where blocked_until is not null;
create unique index profiles_staff_phone_unique on public.profiles(business_id,phone)
where business_id is not null and phone is not null and role in ('owner','manager','driver');
