# JCB Rental Service — Phase 01 Foundation

## Product shape
- One installable responsive PWA on main for the initial demo.
- Customer experience at /; Owner & Driver experience at /operations.
- One rental business, one Owner/Admin; future-ready branch support; not a marketplace.
- Native Android APK conversion is deferred to a later phase.

## Phase 01 scope
Establish responsive PWA shell, brand system, navigation, sample data and demo interactions. Configure PWA manifest, service worker, app-shell caching and Vercel deployment. No production customer data, real authentication, payment processing, GPS collection or push notifications.

## Confirmed experience rules
- English; INR (₹); professional corporate-blue UI.
- Customer can browse and submit a simulated guest booking request using name, mobile and site address.
- Owner and Driver use a shared PIN entry shell; role is preview-selected in demo, not authenticated.
- Driver explicitly taps Start to begin work and GPS tracking in the future production workflow.
- Customer tracking is restricted to their own assigned machine; Owner sees fleet; Driver sees own duty/location.
- Demo screens use clearly labelled sample data and simulated actions.

## Repository layout
- apps/web: single Customer + Operations PWA.
- apps/customer and apps/operations: legacy Expo scaffolds, inactive during PWA-first delivery.
- packages/demo-data: sample-only fixtures.
- docs: product and architecture decisions.

## Safety boundaries
PINs must never be stored as plaintext in production. No device location is collected in Phase 01. Booking/payment confirmations remain simulated. No secrets or personal customer data belong in Git. Offline support caches app shell only; authoritative bookings and payments require online verification.
