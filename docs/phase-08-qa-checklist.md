# Phase 08 QA checklist

## Passed
- [x] GPS tracking schema and RLS migrations applied.
- [x] Tracking sessions tied to assigned driver, machine, booking, business and branch.
- [x] Location RPC rejects missing/closed sessions and enforces coordinate/time bounds and 10-second minimum interval.
- [x] GPS start/location/stop exercised with a simulated authenticated driver in a rolled-back transaction.
- [x] Realtime publication includes notification and location tables.
- [x] Owner/driver read policies consolidated and tenant-scoped.
- [x] Booking-created and booking-approved notification triggers tested in rolled-back transactions.
- [x] Public tracking token returns HTTP 200 for valid token and limited safe fields only.
- [x] Customer tracking API valid-token response tested with latest GPS location; no customer/site/driver contact data exposed.
- [x] Unknown token returns a generic invalid-or-expired message with no data.
- [x] Tracking token expiry stored and checked (30 days).
- [x] Private photo-evidence bucket, 5 MB MIME limits and three storage RLS policies verified.
- [x] Generated Supabase database types refreshed.
- [x] QA data removed; business tables have zero test rows.

## Not yet passed / release gates
- [ ] Final GitHub Actions TypeScript/build/PWA run for Phase 08 changes.
- [ ] Physical Android browser GPS permission and real driver-account end-to-end test.
- [ ] True background Web Push delivery (VAPID secrets/service configuration not provisioned).
- [ ] Offline GPS queue and background geolocation (not implemented).
- [ ] Production deployment and browser QA blocked by selected Vercel deployment quota.
- [ ] Enable Supabase leaked-password protection before launch.
