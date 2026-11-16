# Phase 09 — Billing, Payments & Financial Management

## Delivered
- Business financial configuration: GST enabled toggle, GSTIN, configurable default tax rate, invoice prefix, invoice terms, UPI ID and public static UPI QR upload.
- Booking-linked rental invoices with a unique business invoice number and immutable customer/billing/GST snapshots.
- Invoice line items for rental, transportation, operator, diesel and other charges; discount and configurable tax calculation.
- Cash and UPI payment receipts with optional UPI transaction reference.
- Atomic payment posting: an inserted confirmed receipt updates invoice amount paid, balance and status, and the related booking payment status in the same database transaction.
- Partial payments supported. Overpayment and payments against void/missing invoices are rejected.
- Owner finance dashboard: invoiced, collected, outstanding and recent expenses summaries.
- Invoice list with detail view and browser print layout.
- Expense ledger with diesel, maintenance, driver salary, transport, repair, parts and other categories, with optional machine association.
- Customer tracking link now includes only safe invoice/payment details and the business UPI ID/QR path. Customers can view balance and pay directly through their UPI app; the owner must manually record/confirm the payment.

## Database and security
- Added `rental_invoices`, `rental_invoice_items`, `rental_payments`, and `business_expenses`.
- All four tables have RLS enabled and business-scoped owner/manager policies.
- No anonymous table access. Authenticated privileges are least-privilege; payment rows are immutable through client updates/deletes.
- Invoice creation and payment recording use SECURITY INVOKER RPCs with tenant checks and row locks.
- Internal payment trigger runs in the private schema, is not executable by API roles, and synchronizes invoice/booking totals.
- Public UPI QR bucket accepts JPG/PNG/WEBP up to 2 MB. Upload/update/delete is limited to the current business owner/manager folder. QR images are intentionally public so a customer can scan them.
- Customer tracking endpoint exposes invoice number, status, total, paid, balance, currency, UPI ID and QR path only; it does not expose customer phone, site address or business IDs.

## Verification completed
- Supabase migrations applied and migration history verified.
- GST arithmetic tested: ₹1,200 taxable subtotal at 18% produces ₹216 tax and ₹1,416 total.
- Partial UPI payment of ₹500 updates invoice to partially paid with ₹916 outstanding and synchronizes booking payment status.
- Overpayment attempt is rejected.
- Expense insertion verified under simulated authenticated owner context.
- Public customer tracking API returned HTTP 200 with invoice number, invoice status, total, paid amount, balance, currency and UPI ID. Customer phone, site address and internal business identifiers were absent.
- Security Advisor shows only the existing leaked-password protection warning.
- Foreign-key performance advisor warning for Phase 09 tables resolved with covering indexes; unused-index notices are expected before production traffic.
- All QA invoices, payments, expenses, bookings and notifications were deleted; business GST/UPI settings restored to their previous defaults.

## Limitations and release gates
- UPI/Cash are manually recorded. No payment gateway, automatic UPI verification, bank reconciliation or webhook integration is configured.
- Customer QR/UPI details are display-only. The customer must pay through their UPI app and the owner must verify receipt before recording it.
- Invoice print uses the browser print dialog; this phase does not generate a stored PDF or email invoices.
- GST rate is configurable and GST treatment must be confirmed by the business accountant. The current invoice layout displays one GST line; it does not automatically split CGST/SGST/IGST based on place of supply.
- Refunds, credit notes, invoice cancellation workflows, payroll automation and full accounting exports are not implemented.
- Expense KPI reflects the latest 50 expense records currently loaded; full date-filtered reporting is a later analytics task.
- No production deployment or browser QA is claimed because the selected Vercel project remains blocked by the team deployment-rate limit.
- Supabase leaked-password protection remains disabled and must be enabled before production sign-off.
