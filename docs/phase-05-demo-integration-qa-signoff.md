# Phase 05 — Demo Integration, QA & Sign-off

## Scope delivered
- The customer, owner and driver experiences are available in one PWA shell.
- Customer is the public-facing route; Operations contains the Owner console and Driver workspace switch.
- Added a CI integration smoke test at `scripts/verify-pwa.mjs`.
- Updated GitHub Actions to run the PWA integration smoke test after dependency installation and production build.
- The smoke test checks that all three portal source files exist, the built app shell contains the React root and manifest link, the PWA manifest has the expected name/start URL/standalone mode/icons, and a service worker with precache support is emitted.

## Current demo behavior
- The portals are separate demo experiences with illustrative sample data.
- Customer booking requests, Owner booking/fleet/settings actions and Driver attendance/work/logbook state are not shared across roles or persisted to a backend.
- Owner assignments do not populate Driver jobs; Customer bookings do not appear in Owner bookings.
- Refreshing the browser resets demo changes.
- No real authentication, tenant authorization, Supabase persistence, payments, invoices, notifications, GPS server sync, payroll or durable offline queue is enabled.
- The Operations role switch is navigation only, not a security boundary.

## QA status
- [x] Customer, Owner and Driver portals are imported and reachable through the common PWA application shell.
- [x] CI now runs TypeScript checking and a production build.
- [x] CI now verifies the PWA app shell, manifest, service worker and portal source presence.
- [ ] Phase 04/05 CI run for the latest commit must finish successfully before sign-off.
- [ ] Live browser tests for customer route, operations route, role switching and booking interactions remain pending. The selected Vercel project `jcbrental-ykel` previously hit the Vercel deployment/build quota; do not mark browser QA complete without a fresh deploy.
- [ ] Mobile viewport, installed-PWA behavior, offline behavior and real-device GPS permission tests remain pending.
- [ ] Production readiness is explicitly not approved; production implementation and security work are planned for Phases 06–11.

## Release decision
**Demo frontend integration: implemented. QA sign-off: pending. Production release: not approved.**

The project may proceed to production architecture work only with the demo limitations understood. Do not represent the current PWA as a live rental operations system.
