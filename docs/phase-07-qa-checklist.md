# Phase 07 QA checklist

- [x] Supabase public fleet endpoint returns only available machine fields.
- [x] Owner profile is active and linked to the intended business and branch.
- [x] Owner RLS simulation can read own tenant rows and cannot read a foreign tenant.
- [x] Owner RLS simulation can insert a machine (transaction rolled back).
- [x] Client roles cannot read the private booking rate-limit table.
- [x] Atomic booking assignment function is SECURITY INVOKER and only executable by authenticated users.
- [x] Public guest booking endpoint validates inputs, machine tenancy/status, and applies per-phone/IP rate limiting.
- [x] Driver portal reads active assignments and persists attendance and machine logs.
- [ ] End-to-end guest POST request: not yet exercised by an HTTP client in this environment.
- [ ] Production browser QA: blocked until the selected Vercel project can build/deploy again.
- [ ] Driver workflow live test: pending a provisioned driver account.
- [ ] Supabase Auth leaked-password protection: owner setting remains disabled and must be enabled before production sign-off.
