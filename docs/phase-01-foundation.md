# JCB Rental Service — Phase 01 Foundation

## Product shape
- Customer Android app: separate application identity and customer-only experience.
- Owner & Driver Android app: one application with a PIN entry screen and role-specific experiences.
- One GitHub monorepo: both apps and shared packages.
- Initial operating model: one rental business, one Owner/Admin, future-ready branch support; not a public marketplace.

## Phase 01 scope
- Establish the product design system and navigation foundations.
- Prepare the repository structure for two apps and shared packages.
- Define demo-only sample data and interaction boundaries.
- No production customer data, payment processing, real GPS collection, or real notifications in the demo.

## Confirmed experience rules
- Language: English. Currency: INR (₹).
- Visual direction: professional corporate blue, clean modern/premium UI.
- Customer can browse and create a guest booking using name, mobile number, and site address.
- Owner and Driver use one six-digit PIN entry; the role is resolved by the assigned PIN.
- Driver explicitly taps Start to begin the work session and GPS tracking.
- Customer tracking is restricted to the assigned machine for that customer's booking.
- Owner can view the full fleet; Driver sees only own duty/location.
- Demo screens use clearly labelled sample data and simulated actions.

## Proposed monorepo layout
```text
apps/
  customer/          # Customer Android application
  operations/        # Owner + Driver Android application
packages/
  design-system/     # Tokens, typography, reusable UI components
  domain/            # Shared domain types and validation
  demo-data/         # Seed/demo fixtures only
docs/
  phase-01-foundation.md
  design-system.md
  architecture-decisions.md
```

## Safety and implementation boundaries
- PINs must never be stored as plaintext in production.
- Demo GPS is simulated; no device location is collected in Phase 01.
- Booking/payment confirmations remain simulated until production backend phases.
- No secrets, API keys, service-role keys, or personal customer data belong in Git.
- Production database changes require a reviewed migration and explicit phase scope.

## Phase 01 acceptance criteria
- [ ] Product boundaries and role permissions documented.
- [ ] Design tokens and UI standards documented.
- [ ] Monorepo layout agreed.
- [ ] Android implementation framework confirmed.
- [ ] Demo foundation is buildable and testable.
