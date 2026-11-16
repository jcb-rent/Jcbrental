# Phase 07 — Booking & Fleet Backend

## Implemented
- Connected the Owner Portal to the authenticated Supabase session and the signed-in owner's business profile.
- Owner overview, booking list, machine inventory, and active driver directory now read from the tenant-scoped Supabase tables.
- Machine creation writes to `public.machines`; fleet status changes persist to Supabase.
- Booking approval/rejection writes to `public.bookings`.
- Booking assignment creates a `public.booking_assignments` record and updates the booking's machine and status.
- All these operations rely on the existing authenticated RLS policies and business-scoped foreign keys. The service-role key is not used in the browser.
- Profile read policies were inspected. The existing `users or managers read profiles` policy already provides manager access to business profiles; a redundant policy was removed.

## Current production data
- Business: JCB Rental Service
- Main Branch: provisioned
- Owner profile: active and linked to the business
- Machines: 0
- Bookings: 0
- Active drivers: 0

## Not yet implemented in Phase 07
- Customer Portal still uses illustrative fixture data and local-state booking submission. It does not yet create Supabase booking records.
- Guest booking intake needs a rate-limited server-side endpoint; anonymous clients must not receive direct write access to business bookings.
- Public fleet catalogue needs a limited, safe read endpoint; the private machines table is not directly exposed to anonymous users.
- Driver Portal still uses demo assignments and is not yet reading the live assignment table.
- Driver account provisioning and PIN reset are not yet implemented.

## Verification and release
- Owner profile link and database records were verified directly in Supabase.
- RLS is enabled on the business tables; owner-side writes use the authenticated client and existing policies.
- Supabase Security Advisor currently reports leaked-password protection disabled. Enable it in Supabase Auth password security before production sign-off.
- Deployment/browser QA is pending. Vercel has been rejecting builds for the team-wide 24-hour deployment-rate limit; do not route around this by deploying to another Vercel project.
