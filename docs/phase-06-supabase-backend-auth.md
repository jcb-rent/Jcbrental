# Phase 06 — Supabase production foundation

## Supabase project
- Project: Jcb ya
- Project ref: wvtjuhxcjwvfnqvcjnmc
- Region: ap-south-1 (Mumbai)
- Database: PostgreSQL 17
- Supabase API URL: https://wvtjuhxcjwvfnqvcjnmc.supabase.co
- Vercel target: jcbrental-ykel
- Vercel public environment variables configured for Production, Preview and Development: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
- No service-role or secret key is present in browser code or Vercel VITE variables.

## Database objects created
- businesses, branches, profiles
- machines, bookings, booking_assignments
- driver_attendance, machine_logs
- app_role, machine_status, booking_status, rental_unit and payment_status enums
- Tenant and branch references, composite business-scoped foreign keys, indexes and updated_at triggers
- RLS enabled on all eight public application tables
- Internal authorization helper functions are in the non-exposed private schema. Public execute rights were revoked from the pre-existing public.rls_auto_enable() event-trigger function.

## Access model
- Customer records are scoped to auth.uid().
- Staff access is scoped to the business_id assigned to the authenticated profile.
- Owner/Manager manage business operations; Driver can read own assignments, check in/out and append their own machine logs.
- Profiles can only update full_name and phone through the client.
- Anonymous users have no table privileges. Guest booking submission/tracking will be implemented via a server-side endpoint in Phase 07.
- Staff status, business membership and roles cannot be changed by the user through their own profile update.
- No sample customer, booking or business records were inserted into production.

## Authentication currently implemented
- Supabase Auth email + password sign-in with persistent browser session and automatic token refresh.
- Operations route is gated by a live authenticated profile and role check; only owner, manager and driver roles can enter.
- New Auth users receive a customer profile from an Auth trigger. There is no public self-sign-up in the Operations UI.
- Initial Owner and Driver accounts must be provisioned through Supabase Auth and linked to a business/profile by an administrator.
- The previously agreed six-digit PIN flow is NOT implemented. A secure PIN flow needs server-side verification and managed Edge Function secrets; do not replace it with client-side PIN checking or store raw PINs in Postgres. Current email/password is an interim Supabase Auth implementation, not final PIN acceptance.

## Owner bootstrap (manual, pending client email)
1. In Supabase Dashboard → Authentication → Users, create the owner's Auth user with the intended email and a strong temporary password.
2. Copy the user's UUID. In SQL Editor, run the following once, replacing the placeholders:
```sql
with business as (
  insert into public.businesses (name, phone, service_area)
  values ('JCB Rental Service', 'OWNER_PHONE', 'Firozabad and nearby areas')
  returning id
), branch as (
  insert into public.branches (business_id, name, is_primary)
  select id, 'Main Branch', true from business
  returning id, business_id
)
update public.profiles p
set business_id = branch.business_id,
    branch_id = branch.id,
    role = 'owner',
    full_name = 'Business Owner'
from branch
where p.id = 'OWNER_AUTH_USER_UUID'::uuid;
```
3. Confirm exactly one profile row was updated. Never promote a user by editing user_metadata; role is stored in the protected profiles table.
4. Driver Auth users can be created in Authentication → Users. Their profile is created with customer role by trigger; promote/link them to driver only through an administrator-controlled workflow. The Owner's in-app driver provisioning UI is not yet implemented.

## Remaining work / limitations
- No actual Owner email/account has been provisioned yet; the client's email is required.
- No PIN auth, account invitation workflow, owner-managed driver creation, password reset UX or MFA rollout yet.
- Customer portal, booking requests, Owner dashboard and Driver workspace are not yet wired to these tables. Phase 07 will implement business setup, machine and booking CRUD, assignment workflows and guest booking API.
- Driver GPS ingestion, notifications, file evidence storage, billing and offline sync are later phases.
- Vercel deployment/browser testing is pending due to the previously reported Vercel build/deployment quota. The Vercel project environment variables are configured, but no new deployment is claimed.

## Verification
- Supabase project reports ACTIVE_HEALTHY.
- Eight public tables verified and RLS enabled on all eight.
- Five database migrations recorded in Supabase migration history.
- Supabase security advisor returned zero lints after revoking public execution from the existing event-trigger function.
- Performance advisor still reports some unindexed foreign keys and multiple permissive policy warnings; these are tracked for further tuning. Unused-index notices are expected before real query traffic exists.
- CI build and live browser authentication tests are pending.
