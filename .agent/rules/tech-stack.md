---
trigger: always_on
---

# Tech Stack

## Mobile (Frontend)

- **Framework**: Expo (React Native, managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**:
  - Global UI state: Zustand or Redux Toolkit
  - Server state: React Query (TanStack Query)
- **HTTP**: `fetch` or `axios` wrapped in typed API client
- **Auth**: JWT/session token, stored with `expo-secure-store`
- **UI**: Custom components + basic design system (colors, spacing, typography)

## Backend

- **Runtime**: Node.js
- **Framework**: Fastify (TypeScript)
- **Architecture**: Clean / Hexagonal
- **Database**: PostgreSQL
- **ORM**: Prisma or TypeORM
- **Queue / Jobs**: Redis + BullMQ (or similar)
- **HTTP Clients**: `undici` or `axios`
- **Config / DI**:
  - Env-config loader (e.g. `dotenv` + validation)
  - Simple DI container (factories or library like Awilix)

## Integrations

- **Instagram Graph API**
  - For publishing image posts.
- **Canva APIs**
  - For authenticating Canva user.
  - For fetching/exporting designs as images.

## Tooling & Quality

- **Linting/Formatting**: ESLint, Prettier
- **Testing**:
  - Backend: Jest / Vitest (unit + integration)
  - Frontend: React Native Testing Library
- **Type Safety**: Shared DTO types between frontend and backend where possible.
