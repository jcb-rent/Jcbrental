# Phase 04 — Driver Workspace (PWA Demo)

## Implemented on main
- Added an Owner console / Driver workspace switch under the Operations route.
- Driver workspace includes a driver identity header and dedicated navigation for Today, My assignments, Active work and Daily logbook.
- Today view shows assignment, active-work and logbook counts plus an explicit Start duty / End duty attendance control.
- Assignment cards show booking ID, machine, customer, site, address, shift and job notes.
- Active work supports Assigned → In progress → Completed demo transitions.
- GPS location sharing is OFF by default and is requested only after the driver explicitly presses Start GPS sharing. Stop GPS sharing clears the browser geolocation watch.
- Daily logbook supports Diesel, Maintenance and Work note entries, quantity/meter reading, details and optional image file selection.
- Online/offline status is shown; offline log entries are described as local demo-session entries, not a server-backed sync queue.
- Responsive dark navy and amber driver interface for mobile and desktop.

## Demo-only boundaries
- Driver identity and assigned jobs are fixtures, not authenticated accounts or owner-created assignments.
- Attendance, work status and logs are in React memory only; refresh clears them.
- Photo selection records the filename only. The image is not uploaded or persisted.
- GPS uses browser geolocation only after explicit user action. Coordinates remain in local component state; no server transmission, customer tracking link, owner map or durable GPS history exists.
- Offline status is displayed, but durable IndexedDB queueing and background synchronization are not implemented.
- No real payroll, diesel inventory, maintenance approval, notifications or owner/driver data synchronization.
- The Owner/Driver switch is a demo navigation control, not access control. Production PIN authentication and server authorization remain Phase 06 work.

## QA status
- [ ] TypeScript check and production build for Phase 04 commit.
- [ ] Browser interaction and mobile responsive checks require a deployable preview.
- [ ] Production GPS permission, background behavior and offline sync require device testing and backend implementation.
