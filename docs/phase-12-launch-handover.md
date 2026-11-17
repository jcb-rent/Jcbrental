# Phase 12 — Launch & Handover

**Project:** JCB Rental Service  
**Repository:** `jcb-rent/Jcbrental`  
**Production target:** Vercel project `jcbrental-ykel`  
**Supabase project:** `Jcb ya` (`wvtjuhxcjwvfnqvcjnmc`, Mumbai)

## Release decision

**Release status: BLOCKED — do not announce this application as production-ready.**

Phase 12 handover preparation is documented, but production launch is not signed off. The latest deployment for commit `4e09379bc270e2140fe09cdbbc2269bcf7c09f60` failed during dependency installation with `ERR_PNPM_META_FETCH_FAIL`. The build did not reach TypeScript compilation or Vite bundling, so this failure does not establish whether application compilation passes.

The Vercel team also returned a build-rate-limit failure for the project's deployment status checks. Do not bypass the limit by deploying to a different Vercel project. Resume on the selected `jcbrental-ykel` project when the team's deployment quota permits.

## Phase 12 launch gates

| Gate | Required evidence | Current state |
|---|---|---|
| Phase 11 CI | Successful workflow run including typecheck/build, PWA smoke test and security regression test | Pending verification |
| Production build | Vercel READY deployment for the latest `main` commit | Blocked: dependency fetch failure / deployment quota |
| Production browser smoke test | Browser checks against the READY deployment | Not run; no current READY deployment |
| Customer flow | Machine list, valid booking, validation errors, tracking link and privacy boundary | Backend/API tests only; production UI unverified |
| Owner flow | PIN/login, business dashboard, machine CRUD, booking review/assignment, finance and analytics | Production UI unverified |
| Driver flow | Driver authentication, own-job visibility, start/complete work, GPS consent and location boundary | Simulated DB policy tests only; no separate real driver account |
| PWA | Installability, manifest, service worker, offline shell and update behavior on Android Chrome | Build artifact not verified on current commit |
| Supabase security | RLS/tenant isolation, no anonymous private data, leaked-password protection | RLS checks recorded; leaked-password protection warning remains |
| Business configuration | Correct machines, rates, rental rules, GST treatment, UPI details, contact and branch settings | Business exists; inventory and payment settings require owner confirmation |
| Operational readiness | Owner and driver onboarding, support/escalation contact, backup/recovery and incident process | Handover checklist prepared; client acceptance pending |

## Required browser test plan

Run only after a deployment reaches Vercel **READY** and the exact deployment URL is confirmed.

1. Open customer home page on desktop and Android viewport; verify no console/runtime errors and correct machine availability.
2. Submit a valid guest booking; verify pending status and that customer receives only the intended tracking information.
3. Submit invalid/oversized inputs and repeated requests; verify validation and rate limiting.
4. Open `/operations`; verify unauthenticated users cannot see owner or driver data.
5. Sign in with the provisioned owner account; verify business-scoped machines, bookings, drivers, finance and analytics.
6. Approve a booking and assign an available machine and active driver; verify invalid machine/driver/booking combinations are rejected.
7. Sign in using a separate provisioned driver account; verify the driver sees only assigned work, and location collection starts only after explicit consent/start action.
8. Verify driver start/completion transitions and machine availability updates.
9. Verify invoice creation, partial/full cash or UPI payment recording, overpayment rejection and customer tracking privacy.
10. Verify analytics date filters, empty states, loading/error states and mobile responsiveness.
11. Verify manifest, service-worker registration, install prompt, offline shell, queued safe actions and reconnect behavior.
12. Re-run browser tests after a hard refresh and after a new service-worker update.

Record each result as PASS/FAIL with timestamp, browser/device, deployment commit, and evidence. Do not use real customer personal data for test bookings; remove test records after tests.

## Client handover checklist

- [ ] Client confirms legal business name, address, contact and GST registration/treatment with their accountant.
- [ ] Owner confirms machine inventory, fleet codes, rates, rental units, minimum duration, diesel/operator/transport charges, deposits and cancellation rules.
- [ ] Owner uploads and verifies the correct UPI QR and UPI ID; reconcile payments manually against bank/UPI records.
- [ ] Owner confirms the production account credentials privately and provisions each driver through a separate active staff account/PIN.
- [ ] Owner and each driver complete role-specific onboarding.
- [ ] Client accepts customer booking, assignment, tracking, invoice and payment workflows.
- [ ] Client receives support/escalation contact, incident reporting steps and data export/backup procedure.
- [ ] Client signs off the production browser test record.

## Security and operational notes

- Never put Supabase service-role or secret keys in browser variables or source control.
- Keep staff authentication, rate limits and privileged database operations server-side.
- All public-table RLS policies and tenant boundaries must be rechecked after schema or policy changes.
- Supabase Security Advisor currently reports **Leaked Password Protection Disabled**. Enable it in Supabase Auth password/security settings before production acceptance.
- Supabase Performance Advisor reports 42 unused-index notices. These are not release failures by themselves on an empty/new workload; do not drop indexes without query-plan and workload evidence.
- GST behavior must be approved by the client's accountant. The current invoice tax model is not a substitute for jurisdiction-specific CGST/SGST/IGST and place-of-supply validation.
- UPI/Cash payments are manually confirmed and recorded; there is no automatic payment-gateway verification or bank reconciliation.
- No real driver account is provisioned yet; driver policy testing used simulated authenticated contexts. Provision and test a separate driver before launch.
- Do not share preview URLs as production links. Vercel SSO protection and custom-domain access must be verified before client handover.

## Known scope limitations at handover

- Refunds, credit notes, automated payroll, accounting exports and automated bank reconciliation are not implemented.
- Business profile/branch CRUD and complete staff provisioning workflows are not yet evidenced as production-ready.
- Analytics uses capped recent records and some metrics are based on invoice issue date/current fleet snapshot rather than a complete accounting ledger or historical utilization.
- Offline booking/payment confirmation is not supported; these operations require connectivity.

## Handover sign-off

**Engineering:** Pending successful CI, READY deployment, browser test evidence and security remediation.  
**Business owner:** Pending configuration verification and acceptance.  
**Production launch:** Not approved until all mandatory launch gates above are closed.
