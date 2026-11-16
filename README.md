# JCB Rental Service

India-first rental booking and fleet operations platform for one JCB rental business.

## Delivery direction
Start with one installable responsive Progressive Web App (PWA) on the main branch. Native Android APKs are deferred until a later conversion phase.

## Routes
- / — Customer experience: browse equipment and simulated guest booking request.
- /operations — Owner & Driver workspace demo with role preview and PIN-entry shell.

Both experiences share one PWA build. Demo only: no real authentication, booking submission, payment, GPS, notifications or customer data storage.

## Stack
React, TypeScript, Vite, pnpm workspaces, Vite PWA / Workbox and Vercel. Supabase project Jcb ya is selected for later production phases; database remains untouched.

## Local setup
Node.js 22.13+ and pnpm 10.12.1:

    pnpm install
    pnpm dev
    pnpm build

## Demo safety
Catalogue entries are fixtures. Guest request form only demonstrates the flow and confirms locally. PIN form does not verify or store PINs. Offline mode caches the app shell only; no booking is confirmed offline.
