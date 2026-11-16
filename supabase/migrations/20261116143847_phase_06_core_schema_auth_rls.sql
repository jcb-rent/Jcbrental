-- Phase 06 core schema, roles, and row-level security.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.app_role as enum ('owner','manager','driver','customer');
create type public.machine_status as enum ('available','on_rent','maintenance','inactive');
create type public.booking_status as enum ('pending','approved','rejected','assigned','in_progress','completed','cancelled');
create type public.rental_unit as enum ('hour','shift','day','month','project');
create type public.payment_status as enum ('unpaid','advance_paid','partially_paid','paid','refunded');

create table public.businesses (
 id uuid primary key default gen_random_uuid(), name text not null, phone text, service_area text,
 gstin text, gst_enabled boolean not null default false,
 default_currency text not null default 'INR' check(default_currency='INR'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.branches (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 name text not null, address text, phone text, is_primary boolean not null default false, created_at timestamptz not null default now(),
 unique(business_id,name), unique(id,business_id)
);
create unique index branches_one_primary_per_business on public.branches(business_id) where is_primary;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade, business_id uuid references public.businesses(id) on delete restrict,
 branch_id uuid, role public.app_role not null default 'customer', full_name text, phone text,
 is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint profiles_branch_business_fk foreign key(branch_id,business_id) references public.branches(id,business_id)
);
create table public.machines (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 branch_id uuid, fleet_code text not null, name text not null, category text not null, description text,
 hourly_rate numeric(12,2) not null default 0 check(hourly_rate>=0),
 shift_rate numeric(12,2) check(shift_rate is null or shift_rate>=0),
 daily_rate numeric(12,2) check(daily_rate is null or daily_rate>=0),
 monthly_rate numeric(12,2) check(monthly_rate is null or monthly_rate>=0),
 status public.machine_status not null default 'available', current_location text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(business_id,fleet_code), constraint machines_branch_business_fk foreign key(branch_id,business_id) references public.branches(id,business_id)
);
create table public.bookings (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete restrict,
 branch_id uuid, machine_id uuid references public.machines(id) on delete set null, customer_user_id uuid references auth.users(id) on delete set null,
 customer_name text not null, customer_mobile text not null, site_address text not null, site_landmark text, work_type text,
 rental_unit public.rental_unit not null, quantity numeric(10,2) not null check(quantity>0),
 starts_at timestamptz not null, ends_at timestamptz, diesel_included boolean not null default false,
 operator_included boolean not null default true, transport_required boolean not null default false, notes text,
 status public.booking_status not null default 'pending', quoted_amount numeric(12,2) check(quoted_amount is null or quoted_amount>=0),
 payment_status public.payment_status not null default 'unpaid', tracking_token_hash text unique,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint bookings_branch_business_fk foreign key(branch_id,business_id) references public.branches(id,business_id),
 constraint bookings_time_check check(ends_at is null or ends_at>starts_at)
);
create table public.booking_assignments (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 booking_id uuid not null references public.bookings(id) on delete cascade, machine_id uuid not null references public.machines(id) on delete restrict,
 driver_user_id uuid not null references public.profiles(id) on delete restrict, assigned_by uuid not null references public.profiles(id) on delete restrict,
 assigned_at timestamptz not null default now(), active boolean not null default true
);
create table public.driver_attendance (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 driver_user_id uuid not null references public.profiles(id) on delete restrict, branch_id uuid,
 check_in_at timestamptz not null default now(), check_out_at timestamptz, check_in_note text, check_out_note text,
 created_at timestamptz not null default now(),
 constraint attendance_branch_business_fk foreign key(branch_id,business_id) references public.branches(id,business_id),
 constraint attendance_checkout_check check(check_out_at is null or check_out_at>check_in_at)
);
create unique index one_open_attendance_per_driver on public.driver_attendance(driver_user_id) where check_out_at is null;
create table public.machine_logs (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade,
 booking_id uuid references public.bookings(id) on delete set null, machine_id uuid not null references public.machines(id) on delete restrict,
 driver_user_id uuid not null references public.profiles(id) on delete restrict,
 log_type text not null check(log_type in ('diesel','maintenance','work_note','meter_reading','breakdown')),
 quantity numeric(12,2), unit text, meter_reading numeric(12,2), details text not null, evidence_path text,
 occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create or replace function private.current_business_id() returns uuid language sql stable security definer set search_path=''
as $$ select p.business_id from public.profiles p where p.id=(select auth.uid()) and p.is_active=true $$;
create or replace function private.current_app_role() returns public.app_role language sql stable security definer set search_path=''
as $$ select p.role from public.profiles p where p.id=(select auth.uid()) and p.is_active=true $$;
create or replace function private.is_staff() returns boolean language sql stable security definer set search_path=''
as $$ select coalesce(private.current_app_role() in ('owner','manager','driver'),false) $$;
create or replace function private.can_manage_business() returns boolean language sql stable security definer set search_path=''
as $$ select coalesce(private.current_app_role() in ('owner','manager'),false) $$;
create or replace function private.is_assigned_driver(target_booking uuid) returns boolean language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.booking_assignments a where a.booking_id=target_booking and a.driver_user_id=(select auth.uid()) and a.active) $$;

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path=''
as $$ begin
 insert into public.profiles(id,full_name,phone,role) values(new.id,nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.phone,''),'customer')
 on conflict(id) do nothing; return new;
end $$;
revoke all on function private.current_business_id() from public,anon;
revoke all on function private.current_app_role() from public,anon;
revoke all on function private.is_staff() from public,anon;
revoke all on function private.can_manage_business() from public,anon;
revoke all on function private.is_assigned_driver(uuid) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.current_business_id(),private.current_app_role(),private.is_staff(),private.can_manage_business(),private.is_assigned_driver(uuid) to authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users for each row execute function private.handle_new_user();

alter table public.businesses enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.machines enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_assignments enable row level security;
alter table public.driver_attendance enable row level security;
alter table public.machine_logs enable row level security;

create policy "staff read own business" on public.businesses for select to authenticated using(id=(select private.current_business_id()));
create policy "owners update own business" on public.businesses for update to authenticated using(id=(select private.current_business_id()) and (select private.current_app_role())='owner') with check(id=(select private.current_business_id()) and (select private.current_app_role())='owner');
create policy "staff read business branches" on public.branches for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "managers manage branches" on public.branches for all to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "users read own profile" on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy "users update own safe profile fields" on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()) and role=(select private.current_app_role()) and business_id is not distinct from (select private.current_business_id()));
create policy "staff read own business machines" on public.machines for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "managers insert machines" on public.machines for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers update machines" on public.machines for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers delete machines" on public.machines for delete to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "staff read own business bookings" on public.bookings for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "customers read own bookings" on public.bookings for select to authenticated using(customer_user_id=(select auth.uid()));
create policy "customers create own bookings" on public.bookings for insert to authenticated with check(customer_user_id=(select auth.uid()) and status='pending' and payment_status='unpaid');
create policy "managers create bookings" on public.bookings for insert to authenticated with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "managers update bookings" on public.bookings for update to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "drivers update assigned booking status" on public.bookings for update to authenticated using((select private.is_assigned_driver(id)) and status in ('approved','assigned','in_progress','completed')) with check((select private.is_assigned_driver(id)) and status in ('in_progress','completed'));
create policy "staff read assignments" on public.booking_assignments for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "managers manage assignments" on public.booking_assignments for all to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "drivers read own assignments" on public.booking_assignments for select to authenticated using(driver_user_id=(select auth.uid()) and active);
create policy "staff read attendance" on public.driver_attendance for select to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business()));
create policy "drivers read own attendance" on public.driver_attendance for select to authenticated using(driver_user_id=(select auth.uid()));
create policy "drivers create own attendance" on public.driver_attendance for insert to authenticated with check(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()) and (select private.current_app_role())='driver');
create policy "drivers close own attendance" on public.driver_attendance for update to authenticated using(driver_user_id=(select auth.uid()) and check_out_at is null) with check(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()));
create policy "staff read machine logs" on public.machine_logs for select to authenticated using(business_id=(select private.current_business_id()) and (select private.is_staff()));
create policy "drivers add own machine logs" on public.machine_logs for insert to authenticated with check(driver_user_id=(select auth.uid()) and business_id=(select private.current_business_id()) and (select private.current_app_role())='driver');
create policy "managers manage machine logs" on public.machine_logs for all to authenticated using(business_id=(select private.current_business_id()) and (select private.can_manage_business())) with check(business_id=(select private.current_business_id()) and (select private.can_manage_business()));

grant usage on schema public to authenticated;
grant select,update on public.businesses to authenticated;
grant select,insert,update,delete on public.branches to authenticated;
grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.machines to authenticated;
grant select,insert on public.bookings to authenticated;
grant select on public.booking_assignments to authenticated;
grant select on public.driver_attendance to authenticated;
grant select on public.machine_logs to authenticated;
