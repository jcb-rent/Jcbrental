# Phase 11 — Security, testing and performance

## Implemented
- Added `scripts/verify-security.mjs` as a CI regression check.
- CI now runs the security regression script after the TypeScript/production build and PWA integration smoke test.
- Regression checks verify browser Supabase config uses only the publishable key, staff role gating and inactive-account rejection remain present, driver/owner portals remain role-separated, owner and analytics reads remain business-scoped, and server-side PIN/public-booking throttling controls remain in source.
- Clarified the Phase 10 analytics KPI label so it does not imply receipt-date cash accounting: the displayed paid amount is the paid value on invoices issued in the selected period.
- Re-audited live database RLS: all 17 public tables currently have RLS enabled.
- Re-audited anonymous table grants: no direct `anon` table grants were found in `public`.
- Confirmed the `private` schema is not usable by `anon`; authenticated staff can use it for policy helper functions.
- Supabase Health Advisor returned no notices.

## Outstanding security gate
- Supabase Security Advisor continues to report **Leaked Password Protection Disabled**.
- Current Supabase documentation says this control is configured in Project Auth settings and is available on Pro plan and above. It was not silently changed from this workflow; project plan/owner action must be confirmed.
- Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Performance observations
- Performance Advisor reports 42 unused indexes. This is expected for a newly provisioned system with no operational workload; do not drop these indexes without query-volume evidence.
- No health advisor notices were returned.
- Analytics currently reads at most 1,000 recent records per source from the browser. High-volume reporting should move to tenant-scoped server-side aggregate RPCs before the dataset grows beyond this cap.

## Verification limits
- Static security regression checks are wired into GitHub Actions but require a successful workflow run to be marked passed.
- No production browser test or Android device test is claimed.
- The chosen Vercel project may still be queued/blocked; deployment must be checked independently.
- No destructive test data was inserted into the live tenant during this audit.
