# Architecture Decisions — JCB Rental Service

| Decision | Status | Notes |
|---|---|---|
| Product model | Confirmed | Single rental company; not a marketplace |
| Initial platform | Confirmed | One responsive installable PWA from main |
| PWA experiences | Confirmed | Customer /; Owner & Driver /operations |
| Future native apps | Deferred | Convert PWA/workflows to Android APKs later |
| Owner/Driver access | Confirmed | Shared PIN shell; server-verified role in production |
| Repository | Confirmed | jcb-rent/Jcbrental |
| GPS start | Confirmed | Driver explicitly taps Start |
| Backend | Selected | Supabase project Jcb ya, Mumbai; schema untouched |
| Hosting | Selected | Vercel free domain preferred |
| Canonical Vercel project | Selected | jcbrental; duplicates remain untouched |
| UI | Confirmed | Corporate blue, modern, English |
| Currency | Confirmed | INR |
| PWA stack | Confirmed | React + TypeScript + Vite + Vite PWA |

## Security boundary
Owner/Driver PIN validation must be server-side. Store only salted hashes, rate-limit failures, issue revocable sessions and enforce backend role permissions. Never trust a client-side role flag.

## Demo vs production
Demo uses fixtures and simulated actions. Production authentication, database writes, live GPS, push notifications, UPI/invoice workflows and robust offline synchronization belong to later production phases.
