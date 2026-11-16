# Phase 01 Implementation Status

## Delivery decision
PWA-first confirmed. Native Android APK builds are deferred to a later phase.

## Implemented foundation
- Single React + TypeScript + Vite PWA in apps/web.
- Customer route /; Owner & Driver route /operations.
- Responsive corporate-blue design, desktop/mobile layouts and shared navigation.
- Customer catalogue with local demo fixtures and search.
- Guest booking request form with name, mobile, site address and duration; local simulation only.
- Owner/Driver PIN-entry shell with role preview; no authentication performed.
- PWA manifest, install metadata, auto-updating service worker and Workbox app-shell caching.
- pnpm workspace and Vercel build configuration.
- Legacy Expo scaffolds retained but excluded from active workspace for later conversion reference.
- No secrets/customer data committed; Supabase database intentionally untouched.

## Validation results
- [x] Dependency installation on GitHub Actions.
- [x] TypeScript check.
- [x] Production Vite build.
- [x] PWA manifest, service worker and index output checks.
- [x] CI green on main (run 31).
- [x] Vercel project configured for Vite, apps/web root, pnpm build and dist output.
- [ ] Production deployment: currently blocked by Vercel API rate limit (HTTP 402, deployment quota retry-after 24 hours). No new PWA production URL is claimed yet.

Static build success is not proof of backend/auth/payment/GPS features.


## Phase 02 progress
- Customer portal implementation committed on main: dashboard, machine catalogue/search/filter, booking wizard, estimate breakdown, request timeline, history, sample receipt and support form.
- Demo-only boundaries are explicit: no backend writes, owner notifications, payment or authoritative availability.
- See [Phase 02 Customer Demo](phase-02-customer-demo.md).
- Phase 02 CI and responsive QA are pending; production deployment remains deferred until the combined release.
