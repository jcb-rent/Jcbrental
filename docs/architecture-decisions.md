# Architecture Decisions — JCB Rental Service

| Decision | Status | Notes |
|---|---|---|
| Product model | Confirmed | Single rental company; not a marketplace |
| Android apps | Confirmed | Separate Customer app and Owner/Driver app |
| Owner/Driver access | Confirmed | One app; six-digit PIN determines role |
| Repository | Confirmed | One public GitHub repository: jcb-rent/Jcbrental |
| GPS start | Confirmed | Driver explicitly taps Start |
| Backend project | Selected | Supabase project Jcb ya, Mumbai region |
| Hosting | Selected | Vercel Hobby/free domain preferred |
| UI direction | Confirmed | Corporate blue, modern, English |
| Currency | Confirmed | INR |
| Android framework | Pending | Confirm whether “native Android” means Kotlin or installable React Native/Expo APKs |
| Vercel canonical project | Pending verification | Three Vercel projects point to the same GitHub repository; use the intended project only after confirmation |

## Security boundary
Owner/Driver PIN validation must be server-side. Store only salted password hashes, rate-limit failed attempts, issue revocable sessions, and enforce role permissions in the backend. Never trust a client-side role flag.

## Demo vs production
The demo uses fixtures and simulated actions. Production authentication, database writes, live GPS, push notifications, UPI/invoice workflows, and offline synchronization belong to their designated production phases.
