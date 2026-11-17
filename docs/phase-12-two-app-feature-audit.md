# Phase 12 — Non-deployment engineering audit and two-app workflow

**Repository:** `jcb-rent/Jcbrental`  
**Production Vercel project:** `jcbrental-ykel` (deployment intentionally excluded from this work)  
**Supabase:** `Jcb ya` / Mumbai

## Two separate app experiences

The PWA now exposes two direct app routes on the same origin and shared Supabase backend:

- `/operations` — Owner + Driver app. Role detection after staff PIN login routes owners/managers to the Owner Console and drivers to the Driver Workspace.
- `/customer` — Customer app. Public machine catalogue, guest booking, booking tracking and invoice/payment information.

Vercel SPA rewrites are configured for both paths. The apps share the backend, but staff data remains behind authenticated role checks and RLS; customer access uses the public-rentals Edge Function.

## UI/UX work added

- Expandable JCB brand/app switcher with links between the two experiences.
- Desktop glass navigation and a mobile glass bottom app/task dock.
- Sticky translucent topbar, responsive spacing, focus-visible controls and reduced-motion support.
- Customer-facing amber/orange landing hero with construction-equipment illustration, direct fleet CTA and rental support shortcut.
- Owner/Driver console keeps the dark navy + amber business interface, role-specific side navigation, dashboards and responsive cards.
- Interactive hover/press states and polished driver credential reveal after account creation.

## Feature coverage

| Area | Current implementation |
|---|---|
| Customer catalogue | Live available-machine catalogue, search and empty/error/loading states |
| Guest booking | Name, mobile, site address, work type, rental unit/quantity, schedule and operating preferences |
| Customer tracking | Secure token link, booking status, assigned machine, latest shared location, invoice balance and UPI details |
| Owner overview | Fleet KPIs, pending approvals, quick actions and live business data |
| Booking workflow | Approve/reject, assign available machine + active driver through atomic RPC |
| Fleet | Add machine, update availability/maintenance/inactive status, rate and location display |
| Driver account management | Owner-only Edge Function provisions a driver and generates a six-digit PIN; owner can deactivate an account |
| Driver workflow | Assigned jobs, start/complete work, attendance check-in/out, GPS start control, machine logbook and photo evidence |
| Driver attendance | Owner can inspect recent tenant-scoped attendance and recorded shift durations |
| Salary record | Owner can record a manual driver salary payout as a business expense with date, amount, method and reference |
| Tracking | Driver-initiated GPS sessions; customer receives only assigned machine's latest shared location |
| Finance | GST/non-GST invoice creation, invoice items, partial/full cash/UPI entries, expenses and printable invoice |
| Analytics | 30/90/365-day business-scoped KPIs, booking pipeline, expenses, fleet snapshot and trend |
| Business settings | Owner-editable business profile and branch create/edit/delete (primary branch protected) |
| PWA | Manifest, service worker, offline app shell and auto-update configuration |

## Engineering verification

- GitHub Actions run [#212](https://github.com/jcb-rent/Jcbrental/actions/runs/44059482909) passed dependency installation, TypeScript + Vite production build, PWA artifact smoke checks and the security regression script for the route/navigation baseline.
- pnpm 12.21.0 is used consistently in GitHub Actions and the root package manager declaration.
- `pnpm-workspace.yaml` explicitly allows the esbuild build script required by the Vite toolchain.
- Both direct routes are covered by Vercel rewrite configuration.
- All 17 public tables were previously re-audited with RLS enabled; no anonymous direct table grants were found.
- `staff-provision` is deployed as an ACTIVE Edge Function (version 3) with JWT verification enabled. It checks the authenticated caller's active owner role and business scope before creating/deactivating driver profiles. Deactivated profiles are excluded by the shared active-profile authorization helpers.
- Latest source commit `6a66a4085b810b8b47c07645b2c2f3a7ddc2df23` passed GitHub Actions run [#230](https://github.com/jcb-rent/Jcbrental/actions/runs/44060412751): dependency installation, TypeScript + Vite production build, PWA smoke checks and expanded security regression checks all succeeded.

## Remaining work and honest limitations

These are not marked complete:

1. Run the latest CI against the final source commit and resolve every failure.
2. Run production browser/device testing after a deployment is permitted. The deployment was intentionally excluded here, so no current production UI/browser test is claimed.
3. Provision a separate real driver account and verify the full driver PIN login, assignment, attendance, GPS and deactivation lifecycle. The new account provisioning flow is implemented, but no real driver account has been created for testing.
4. Recheck owner branch/profile CRUD and driver salary insertion against live RLS through authenticated UI tests.
5. Enable Supabase Auth leaked-password protection; Security Advisor still reports it disabled. See [Supabase remediation guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
6. Client must confirm fleet inventory, rates, rental rules, deposit/advance, GST treatment, UPI ID/QR, business contact and branch data.
7. Automated payroll is not implemented. Attendance and manual salary expense recording are implemented; there is no salary policy engine, automatic wage calculation or scheduled payroll.
8. Refunds, credit notes, accounting exports and bank reconciliation are not implemented. Cash/UPI payment entries are manually verified by the owner; no payment gateway is integrated.
9. Offline booking/payment confirmation is not supported. Customer booking and financial confirmations require connectivity; driver GPS requires connectivity and device permission.
10. Analytics reads a capped recent dataset and some measures are invoice-date/current-snapshot metrics, not a full accounting ledger or historical utilization system.
11. GST tax calculation is a configurable single rate; accountant must validate CGST/SGST/IGST and place-of-supply treatment.
12. Final Android installability, background location behavior and service-worker update behavior require real-device testing.

## Two app route references

When the selected Vercel project is deployed, the intended app URLs are:

- Owner + Driver: `https://jcbrental-ykel.vercel.app/operations`
- Customer: `https://jcbrental-ykel.vercel.app/customer`

These are route targets, not verified live links while deployment is excluded.

## Release decision

**Engineering status: in progress until the latest CI is green and live account workflows are tested.**  
**Production launch: not approved until the outstanding security, real-driver, client-configuration and browser/device gates are closed.**
