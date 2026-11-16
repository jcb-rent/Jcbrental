# Phase 02 — Customer App Demo

## Scope
Customer-facing PWA journey using sample data only. This is a demo milestone, not production booking or payment processing.

## Implemented
- Customer dashboard with quick booking, booking summary, active-rental and pending-review KPIs, recent activity and shortcuts.
- Searchable machine catalogue with category filters, capability descriptions, indicative sample rates and service-area notes.
- Booking wizard: machine, hourly/shift/daily/monthly/project plan, duration, site address, landmark, work type, start date/time and site notes.
- Rental terms: diesel included/excluded, operator included/excluded and transport/mobilization estimate.
- Indicative estimate breakdown and review step; no tax calculation or payment collection.
- Guest contact details (name and mobile), request submission, demo confirmation and booking status timeline.
- Booking history, sample receipt view, reschedule/cancellation request placeholders and support request form.
- Responsive customer navigation for mobile, tablet and desktop.

## Demo boundaries
- Requests exist only in in-memory browser session state; they are not persisted or sent to the owner.
- Machine availability, rates, diesel/operator/transport figures and invoice are illustrative fixtures, not a live quote.
- No map pin/geocoding, backend, notifications, Google sign-in, GPS, payment processing or real invoice.
- Owner approval, final working-hour caps, overtime, weekly-off/holiday rules, deposits and tax treatment remain authoritative business decisions for production configuration.

## QA checklist
- [x] TypeScript check and production build pass in GitHub Actions (run 39).
- [ ] Customer route and operations route render.
- [ ] Catalogue search and category filter work.
- [ ] Hourly, shift, daily, monthly and project booking plans work.
- [ ] Required site/contact fields validate.
- [ ] Estimate recalculates for diesel/operator/transport choices.
- [ ] Request appears in booking history and opens status timeline.
- [ ] Receipt and support demo states render.
- [ ] Mobile and desktop layouts verified.
