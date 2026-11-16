# Phase 07 QA checklist

## Passed
- [x] Owner profile active and linked to intended business and branch.
- [x] Owner RLS simulation reads own tenant records and cannot read a foreign tenant.
- [x] Owner RLS simulation can insert machine and update booking status within a rolled-back transaction.
- [x] Atomic owner assignment RPC is SECURITY INVOKER and rejects an inactive/foreign driver.
- [x] Public fleet Edge Function returns HTTP 200 and only safe machine fields.
- [x] Guest booking POST returned HTTP 201 and inserted a pending/unpaid booking visible in Supabase.
- [x] Guest booking API validates inputs and machine business/status, and rate-limits by hashed phone/IP.
- [x] Driver RLS simulation transitioned assigned work to in-progress and completed; machine was released to available.
- [x] Driver attendance check-in/check-out and machine-log insertion passed under a simulated driver role.
- [x] RLS is enabled on all business and rate-limit tables; client access to rate-limit data is denied.
- [x] GitHub Actions TypeScript check and production build passed.
- [x] PWA integration smoke test passed.
- [x] Temporary QA booking, machine, and rate-limit rows were cleaned; live tables returned to zero rows.

## Remaining release gates
- [ ] Provision a real driver Auth account and run a full separate-device driver UI test.
- [ ] Enable Supabase Auth leaked-password protection before production sign-off.
- [ ] Deploy and browser-test the latest app on the selected Vercel project after its team deployment-rate limit resets.

GPS, durable offline sync, push notifications, billing, GST invoices and payments are later-phase scope.
