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

## QA
- [ ] Run GitHub Actions production build and PWA output checks after this phase.
- [ ] Verify customer route / and operations route /operations.
- [ ] Test approval, rejection, assignment, fleet create/status, driver directory and settings interactions.
- [ ] Verify responsive navigation and reduced-motion behavior.
- [ ] Complete visual and functional QA on actual mobile browsers before release.
