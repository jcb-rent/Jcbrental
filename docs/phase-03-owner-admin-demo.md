# Phase 03 — Owner / Admin Console (PWA Demo)

## Implemented on main
- Dedicated operations route at /operations, replacing the PIN placeholder with the owner management demo.
- Owner dashboard with fleet, availability, on-rent and pending-approval KPIs.
- Booking pipeline with pending/approved/rejected status, approve/reject actions and driver assignment.
- Fleet register with search, machine creation, hourly-rate entry and availability / on-rent / maintenance status controls.
- Driver directory preview with sample duty status.
- Business profile controls for business name, contact mobile, service area, GST profile and advance percentage.
- Responsive owner navigation and mobile/tablet layouts.
- Orange-accented customer PWA theme with motion, card transitions, modal transitions, hover/tap feedback and reduced-motion support.

## Demo-only boundaries
- Owner actions update local React state only; refresh clears changes.
- PIN authentication is not implemented or bypassed; the previous PIN screen was a non-functional preview. This phase route is an explicitly labelled demo workspace, not protected production access.
- No Supabase tables, RLS policies, server-side role checks, real booking persistence, driver accounts/PIN provisioning, WhatsApp/push notifications, GPS tracking, payroll, GST invoice engine or payment collection are enabled.
- Sample customers, machines, rates, drivers and booking values are illustrative. Confirm with the business before production use.

## Production requirements before enabling owner access
- Server-side Owner/Driver authentication with hashed PIN credentials, rate limiting and persistent secure sessions.
- Tenant/branch scoping, RLS, audit events and server-authoritative booking approval/assignment.
- Verified machine inventory, driver records, rental rates, business contact details, tax settings and advance/deposit policy.
- Automated tests for authorization, booking state transitions, fleet status and assignment constraints.

## QA status
- [x] GitHub Actions dependency installation completed.
- [x] TypeScript check completed successfully.
- [x] Vite production build completed successfully.
- [x] PWA output verified: `manifest.webmanifest`, `sw.js` and `index.html` generated.
- [x] CI passed for the Phase 03 UI commit (run 43) and the Phase 03 documentation commit (run 44).
- [ ] Browser-level route and interaction checks for `/` and `/operations` remain pending a deployable preview.
- [ ] Responsive and reduced-motion visual QA on real mobile browsers remains pending a deployable preview.

The browser-level checks are intentionally not marked complete: the agreed release sequence is to deploy the phases together, and the current Vercel deployment quota previously returned HTTP 402. Do not treat the demo as production-ready until these checks and the production backend/security requirements above are completed.
