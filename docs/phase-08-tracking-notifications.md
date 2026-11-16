# Phase 08 — Driver Operations, GPS Tracking & Notifications

## Delivered
- Explicit driver-controlled GPS start, resume and stop controls for an active in-progress assignment. Browser geolocation is requested only after the driver presses Start GPS sharing.
- Location points are written through the authenticated `record_driver_location` RPC, not direct client table writes. Coordinates, accuracy, speed, heading and capture time are validated; server rejects updates more frequent than one per 10 seconds.
- Tracking sessions are tied to one active assignment, business, branch, machine, booking and driver. Drivers can only read their own location/session rows; owners/managers can read their business fleet locations.
- Completing a job automatically closes the GPS session, deactivates its assignment and releases the machine to Available.
- Owner Live tracking view subscribes to Supabase Realtime and provides map links for latest reported machine locations, with stale-location indication.
- Guest booking creation now returns a cryptographically random 256-bit tracking token once; only its SHA-256 hash is stored. The public tracking endpoint verifies the token and returns only booking status/schedule, assigned machine identity and latest location. It does not return customer phone, site address, driver identity/contact or internal tenant IDs. Tokens expire after 30 days.
- Persistent notification rows are created for new booking requests, selected booking status changes and new driver assignments. Owner and driver notification centers subscribe to Realtime, allow marking notifications read, and can request browser alerts while the app is open.
- Private `machine-log-evidence` Storage bucket restricts uploads to JPG/PNG/WEBP up to 5 MB, stores them under business/driver folders, and grants read access only to the business management team or the uploading driver.
- Driver logbook now supports optional photo evidence upload and short-lived signed links for viewing.

## Verification completed
- Supabase migrations applied and migration history checked.
- RLS enabled on all three new public tables; no anon/public grants on tracking or notification tables.
- Realtime publication contains `notifications` and `machine_location_updates`.
- Tracking RPCs are SECURITY INVOKER with an empty search_path; browser cannot directly insert location rows or create arbitrary tracking sessions.
- GPS start/location/stop was exercised under a simulated authenticated driver role in a rolled-back test transaction.
- Public customer tracking API: HTTP 200 for a valid test token; returned booking status, machine name/fleet code and latest GPS coordinates/timestamp; privacy checks confirmed customer phone, site address, driver identity/contact and internal business IDs were not returned.
- Unknown token returned the generic `Tracking link is invalid or expired` error and no booking data. Browser rendering did not expose the HTTP status line, so only the generic error response is claimed.
- Booking-created notification trigger produced the expected owner notification in a rolled-back test.
- Booking-status notification trigger produced `booking.approved` after an owner update in a rolled-back test.
- Private Storage bucket and all three evidence access policies were verified in database metadata.
- Temporary QA bookings, machines, assignments, location rows, sessions and notifications were cleaned. Final live business tables are empty.

## Explicit limitations / release gates
- GPS collection runs only while the driver has explicitly started/resumed sharing and the web page remains active. Browser/PWA background execution is not guaranteed; no native background location service is claimed.
- Live fleet and customer location refresh rely on an active Realtime connection / periodic customer tracking refresh. When connectivity is lost, the UI may show stale last-reported data; this phase does not queue GPS points offline.
- Browser alerts are foreground notifications while the web app is open and permission has been granted. True background Web Push delivery is not enabled because VAPID credentials and push delivery configuration have not been provisioned.
- No real driver account was provisioned for physical-device permission testing. GPS RPC and RLS were tested using a temporary authenticated-role simulation; the owner profile was restored.
- Customer tracking URL is a bearer link. Anyone holding it can view the limited booking status/location until the 30-day expiry; share it only with the intended customer.
- Supabase Security Advisor still reports leaked-password protection disabled; enable it before production sign-off: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Vercel production deployment/browser QA remains blocked by the selected `jcbrental-ykel` project's team deployment-rate limit. No alternate project was used and no live app deployment is claimed.

## Data privacy
- GPS is not started automatically on login or page load.
- The driver can stop sharing at any time; completing work also ends the tracking session.
- Customer tracking is booking-token scoped and returns no contact or site-address fields.
- Location history is retained in the database for business operations; a retention/automatic purge policy should be agreed with the client before broad rollout.
