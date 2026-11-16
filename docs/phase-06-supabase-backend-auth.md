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
- Staff access is scoped to the business_id assigned to the authenticated profile. Drivers can read only their own assignments, bookings and machine logs; managers can read business-wide records.
- Owner/Manager manage business operations; Driver can read own assignments, check in/out and append their own machine logs.
- Profiles can only update full_name and phone through the client.
- Anonymous users have no table privileges. Guest booking submission/tracking will be implemented via a server-side endpoint in Phase 07.
- Staff status, business membership and roles cannot be changed by the user through their own profile update.
- No sample customer, booking or business records were inserted into production.

## Authentication currently implemented
- Supabase Auth session-based staff authentication using the agreed 10-digit mobile number + six-digit PIN UX. A deployed server-side Edge Function resolves the staff phone to its Auth account, verifies the PIN through Supabase Auth, and returns a short-lived Auth session; the PIN is never stored in application tables.
- Operations route is gated by a live authenticated profile and role check; only owner, manager and driver roles can enter.
- New Auth users receive a customer profile from an Auth trigger. There is no public self-sign-up in the Operations UI.
- Initial Owner and Driver accounts must be provisioned through Supabase Auth and linked to a business/profile by an administrator.
- Edge Function `staff-pin-login` is deployed with JWT verification disabled only for the login endpoint. It uses Supabase's server-side secret/service key, generic invalid-credential responses, hashed phone/IP identifiers, and a five-failure / 15-minute lockout. The client never receives the server key. The PIN is checked by Supabase Auth as the account password; it is not stored in `profiles` or `staff_login_attempts.

## Owner bootstrap (manual, pending client email)
1. In Supabase Dashboard → Authentication → Users, create the owner's Auth user with the intended email and the agreed six-digit PIN as its Auth password. Keep the Auth email private; staff sign in with the registered mobile number.
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
4. Driver Auth users can be created in Authentication → Users with their own six-digit PIN. Their profile is created with customer role by trigger; set the normalized 10-digit phone, business_id, branch_id and role='driver' using an administrator-controlled workflow. The Owner's in-app driver provisioning UI is not yet implemented.

## Remaining work / limitations
- No actual Owner email/account has been provisioned yet; the client's email and normalized mobile number are required. The first Owner must be created in Supabase Auth with a six-digit PIN and linked to the business using the documented bootstrap SQL.
- No owner-managed driver creation, account invitation workflow, PIN reset/change UX or MFA rollout yet.
- Customer portal, booking requests, Owner dashboard and Driver workspace are not yet wired to these tables. Phase 07 will implement business setup, machine and booking CRUD, assignment workflows and guest booking API.
- Driver GPS ingestion, notifications, file evidence storage, billing and offline sync are later phases.
- Vercel deployment/browser testing is pending due to the previously reported Vercel build/deployment quota. The Vercel project environment variables are configured, but no new deployment is claimed.

## Verification
- Supabase project reports ACTIVE_HEALTHY.
- Eight public tables verified and RLS enabled on all eight.
- Eleven database migrations recorded in Supabase migration history.
- `staff-pin-login` Edge Function is ACTIVE (version 1) and deployed to the selected Supabase project.
- The staff PIN attempt table is RLS-protected, has no anon/authenticated table privileges, and is writable only by the server-side service role.
- Supabase security advisor returned zero lints after revoking public execution from the existing event-trigger function. Performance advisor no longer reports multiple-permissive-policy or unindexed-foreign-key warnings; unused-index notices remain because no production query traffic exists yet.
- Performance advisor currently reports only unused-index notices, which are expected before real query traffic exists.
- CI build and live browser authentication tests are pending.
