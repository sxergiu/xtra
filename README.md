# Xtra - built by teknights

## Overview
Image generation based social application for mobile.

---

# Architecture

## 1. Tech Stack

- **Mobile App**
  - React Native with **Expo** (TypeScript)
  - React Navigation (stack/tab navigation)
  - React Query for data fetching & caching
  - React Hook Form + Zod for forms & validation

- **Backend**
  - **Supabase**
    - Postgres
    - Auth
    - Storage
    - Edge Functions (TypeScript/Deno)
    - Cron for scheduled jobs

## 2. Packages & Versions (Starting Point)

- Core:
  - `"expo": "^54.0.0"` (Expo SDK 54, React Native 0.81)
  - `"react-native"` (version pinned by Expo)
  - `"typescript"` (latest stable)

- Navigation:
  - `@react-navigation/native`
  - `@react-navigation/native-stack`

- Data & forms:
  - `@tanstack/react-query@^5`
  - `react-hook-form@^7`
  - `zod@^3`
  - `@hookform/resolvers`

- Backend client:
  - `@supabase/supabase-js@^2`

- UI layer:
  - `nativewind@^4` + `tailwindcss`

## 3. Design Patterns

- **MVVM-style structure**
  - View (V) – React Native screens/components (UI only).
  - ViewModel (VM) – custom hooks (e.g. useAuthScreen, useScheduledPostsScreen) that:
    - call React Query hooks and service methods
    - contain all the screen logic (loading states, errors, derived state)
  - Model (M) – TypeScript types & repository layer (below).

- **Feature-based folder structure**
  - Group code by feature instead of by type
  

- **Repository pattern (data access)**
  - Centralize all server/database calls in repositories

- **Hexagonal-lite backend (Ports & Adapters)**
  - **Ports (handlers):** Edge Function entrypoints that:
    - parse input
    - call domain services
    - return HTTP responses
  - **Adapters:**
    - Supabase repositories (DB access)
    - Instagram adapter (Graph API)
    - Canva adapter (Connect API)

- **Command-style jobs**
  - Model scheduled jobs as commands/tasks:
    - `PublishDuePostsCommand`
    - `SyncInstagramTokensCommand`
  - Trigger commands via Supabase Cron for clear, testable background jobs.

## 4. Hosting & Deployment

- **Mobile app**
  - Expo **EAS Build** for iOS & Android binaries
  - Expo **EAS Submit** to upload to App Store / Play Store
  - Expo **EAS Update** for OTA JavaScript updates (small fixes & tweaks without full releases)

- **Backend**
  - Supabase managed project for:
    - database
    - auth
    - storage
    - Edge Functions deployed via Supabase CLI
  - Supabase **Cron** to:
    - trigger publishing jobs (e.g. `publish-due-posts`)
    - run maintenance tasks on schedule

## 5. Optimizations

- **Frontend**
  - Use React Query caching and stale-while-revalidate patterns for lists and detail views.
  - Keep all network calls in repositories to simplify refactors and testing.
  - Avoid unnecessary re-renders by splitting large screens into smaller components.

- **Database**
  - Add indexes on frequently queried columns:
    - `user_id`
    - `publish_at`
    - `status`
  - Keep write operations in tight, well-defined Edge Functions.

- **Background work**
  - Run slow or external operations in Edge Functions:
    - Instagram posting
    - token refresh
    - syncing external data
  - Trigger these via Cron instead of from the mobile app.

- **Release process**
  - Use OTA updates (EAS Update) for small UI and logic fixes.
  - Reserve full store releases for major version changes or new native capabilities.

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.
