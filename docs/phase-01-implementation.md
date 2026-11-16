# Phase 01 Implementation Status

## Framework decision
React Native + Expo confirmed for two separate Android apps. The monorepo follows Expo's workspace model.

## Repository foundation added
- Root pnpm workspace and TypeScript configuration.
- Separate Expo app packages and Android application IDs:
  - Customer: in.jcbrental.customer
  - Operations: in.jcbrental.operations
- Shared design-system package.
- Demo fixture package.
- Customer landing screen with sample machine cards.
- Operations PIN entry shell and Owner/Driver preview paths.
- Explicit demo-only labels; no real PIN verification, GPS, payments, notifications, or backend integration.

## SDK baseline
Expo SDK 58 stable line, React Native 0.88, React 19.3. Confirm dependency alignment with `npx expo install --check` during dependency installation.

## Not yet verified
- Package installation / lockfile generation.
- TypeScript checks and Metro bundling.
- Android APK builds on EAS.
- Vercel canonical project selection and Git integration cleanup.
- Supabase schema remains intentionally untouched.

## Phase 01 exit criteria still open
- Run package install, dependency validation, type checks, and Android builds.
- Verify both app identities and navigation on Android.
- Decide which of the three Vercel projects is canonical; do not delete the others without explicit direction.
