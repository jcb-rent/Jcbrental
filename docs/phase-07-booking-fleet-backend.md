# Phase 07 — Booking & Fleet Backend

## Delivered
- Owner Portal reads the authenticated owner's business profile and loads tenant-scoped machines, bookings, and active drivers from Supabase.
- Owner machine creation and fleet status changes persist to Supabase.
- Booking approval/rejection persists using restricted booking-column grants and tenant RLS.
- Booking assignment is atomic through `public.assign_booking`: validates owner/manager role, booking status, available machine, active same-business driver, prevents duplicate active assignment, writes assignment, marks booking assigned, and marks the machine on rent.
- Customer Portal loads the public catalogue from the deployed `public-rentals` Edge Function and submits guest booking requests through the same endpoint.
- The public Edge Function only exposes safe available-machine catalogue fields, validates booking input and machine/business ownership, applies per-phone/IP rate limiting, and inserts pending/unpaid bookings using server-side credentials.
- Driver Portal loads its active assignments, persists work status, attendance and machine logs.
- Driver status changes use `public.driver_set_booking_status`; completing a job atomically completes the booking and releases the assigned machine back to available.
- Driver attendance and machine-log writes use narrow column grants and tenant/driver RLS.
- Public booking rate-limit records are inaccessible to anon/authenticated clients; only the Edge Function service role can manage them.
- Supabase-generated TypeScript database types are refreshed and used by the frontend.

## QA completed
- GitHub Actions TypeScript check and production Vite/PWA build: **passed**.
- PWA integration smoke test (manifest, service worker, app shell and portal sources): **passed**.
- Live public fleet catalogue endpoint: **HTTP 200**; returned only safe machine metadata. Temporary fixture was removed and the endpoint then returned an empty catalogue.
- Live guest booking POST: **HTTP 201**; verified a pending/unpaid booking was inserted into Supabase. Temporary booking, machine and rate-limit test record were removed.
- Owner RLS simulation: owner can read own tenant machines/profiles, cannot read a foreign tenant, and can perform allowed machine insert and booking-status update operations.
- Driver RLS simulation: active assigned driver can transition assigned booking to in-progress/completed; completion changes the linked machine to available.
- Driver attendance check-in, check-out and machine-log insert were exercised under a simulated authenticated driver role.
- Invalid driver assignment is rejected by the atomic assignment function.
- All temporary QA records were rolled back or deleted. Live tables are clean.

## Current business records
- Business: JCB Rental Service
- Main Branch: provisioned
- Owner profile: active and linked
- Machines: 0 (client must add actual fleet inventory)
- Bookings: 0
- Active drivers: 0 (client must provision driver accounts)

## Explicit remaining gates (not Phase 07 code failures)
- No real driver account exists yet, so login with a separate driver identity and the actual UI-to-driver workflow has not been tested with a provisioned driver. Database/RLS driver behavior was tested using a temporary transaction that was rolled back.
- Driver account provisioning and PIN reset UI are not included in Phase 07.
- Supabase Auth leaked-password protection remains disabled. Enable it in Auth password security before production sign-off: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Production deployment and browser QA remain blocked by Vercel's team-wide 24-hour deployment-rate limit on the selected `jcbrental-ykel` project. No alternate Vercel project was used and no live deployment is claimed.
- GPS tracking, push notifications, invoice/tax flows, payment processing and offline durable queues belong to later phases.

## Migration source-of-truth
Phase 07 migrations in `supabase/migrations` use the exact version prefixes reported by Supabase migration history.
