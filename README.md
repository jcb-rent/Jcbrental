# JCB Rental Service

India-first JCB rental management platform for one rental business.

## Apps
- `apps/customer`: separate Customer Android app.
- `apps/operations`: Owner and Driver experiences in one Android app, with role-specific access.

## Shared packages
- `packages/design-system`: shared corporate-blue UI tokens and components.
- `packages/demo-data`: sample-only fixtures.

## Tech stack
- React Native + Expo (two separate Android application identities)
- TypeScript + pnpm workspaces
- Supabase is the selected backend platform for later production phases.
- Vercel is the selected hosting platform for supporting web services.

## Local setup
Requires Node.js 22.13+ and pnpm.

```bash
pnpm install
pnpm start:customer
# In another terminal:
pnpm start:operations
```

## Phase 01 status
The repository currently contains the demo foundation and UI shells. Demo data is local and illustrative. PIN authentication, GPS, bookings, payments, push notifications and production database integration are not active in this phase.

See `docs/phase-01-foundation.md`, `docs/design-system.md`, and `docs/phase-01-implementation.md`.
