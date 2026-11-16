# Phase 09 QA checklist

## Passed
- [x] Finance tables created with RLS enabled.
- [x] Business-scoped owner/manager policies and least-privilege grants verified.
- [x] Invoice creation validates booking state, tenant, non-negative amounts, discount cap and tax rate.
- [x] GST invoice calculation verified: ₹1,200 subtotal + 18% = ₹1,416 total.
- [x] Unique invoice number generated for the business.
- [x] Partial UPI payment updates invoice paid/balance/status and booking payment_status atomically.
- [x] Overpayment rejected.
- [x] Expense insert tested under authenticated owner context.
- [x] Customer tracking API returns invoice/payment fields and UPI ID (HTTP 200).
- [x] Customer phone, site address and internal business identifiers absent from public tracking response.
- [x] Public UPI QR bucket and business-scoped write policies verified.
- [x] Temporary QA records removed and business financial settings restored.
- [x] Supabase Security Advisor checked; only existing leaked-password protection warning remains.
- [x] Foreign-key performance advisor warning for Phase 09 tables resolved.

## Pending
- [ ] GitHub Actions TypeScript/build/PWA check for Phase 09 UI changes.
- [ ] Physical Android print/share and customer UPI QR scan test.
- [ ] Owner real-account end-to-end invoice/payment/expense UI test (latest UI cannot be deployed until Vercel quota clears).
- [ ] Production deployment/browser QA blocked by selected Vercel deployment quota.
- [ ] Enable Supabase leaked-password protection before launch.
- [ ] Confirm GST rate, invoice text and place-of-supply tax treatment with the client's accountant.
- [ ] Agree on invoice PDF delivery, refund/credit-note policy and financial retention with the client.
