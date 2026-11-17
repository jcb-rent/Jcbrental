# Phase 10 — Analytics & administration

## Delivered
- Added an owner-only Analytics section to the operations console.
- Date-window selector for 30 days, 90 days and 12 months.
- Business-scoped reporting for recorded collections, invoiced value, booking conversion, booking status pipeline, expense categories and current fleet status.
- Six-month invoiced-value trend using invoice issue dates.
- Responsive layouts for desktop and mobile.
- Business settings page now explains where finance controls and branch/staff/fleet management live; it displays the active business and branch identifiers for operational support.

## Data access and definitions
- All report queries are filtered by the authenticated owner's business ID. Existing RLS remains the authorization boundary.
- Report requests are capped at the latest 1,000 records per source to avoid unbounded client reads.
- Payments collected = sum of amount_paid on non-void invoices issued in the selected period. This is an invoice-period collection proxy, not a cash-receipt-date ledger.
- Invoiced value = total_amount on non-void invoices issued in the selected period.
- Booking conversion = approved, assigned, in-progress and completed bookings divided by all bookings created in the selected period.
- Expense totals use expense_date in the selected period.
- Fleet status is a current snapshot, not historical machine utilization.
- Monthly trend is based on invoice issue month and includes the latest six calendar months.

## Verification / limitations
- Source wiring and responsive styles are committed to main.
- GitHub Actions and Vercel checks are triggered by the commits; their completion must be checked before calling this phase fully QA-passed.
- No production browser test is claimed; the selected Vercel project has previously been blocked by team deployment-rate limits and is still protected by SSO.
- Reports are limited to 1,000 latest records per source; a later server-side aggregation/reporting layer is needed for high-volume data and fully accurate cash-flow by payment receipt date.
- Business profile editing, branch CRUD and staff provisioning are not added in this phase. Existing finance settings, fleet and driver screens remain the respective control surfaces.
- Supabase Auth leaked-password protection remains a production release gate.
