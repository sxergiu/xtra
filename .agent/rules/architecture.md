---
trigger: always_on
---

# Basic Architecture

## Overview

- **Mobile app (Expo + React Native)**
  - Small business owner UI.
  - Create templates from Canva designs.
  - Schedule Instagram posts for the week.
  - Talks to backend via REST API (JSON).

- **Backend (Fastify + Node.js)**
  - Exposes HTTP API for auth, templates, schedule, integrations.
  - Encapsulates domain logic (templates, scheduling, publishing).
  - Integrates with:
    - Instagram Graph API (publish posts).
    - Canva APIs (get/export designs).
  - Uses a job queue + worker for scheduled publishing.

## Architectural Style

- **Clean / Hexagonal Architecture**
  - **Domain layer**: entities, value objects, business rules (no framework code).
  - **Application layer**: use cases coordinating domain logic.
  - **Infrastructure layer**: DB, HTTP clients, job queue, external APIs.
  - **Interface layer**: Fastify controllers, background workers.

## Key Concepts

- Separation of concerns:
  - UI ↔ API ↔ Use Cases ↔ Domain ↔ Infrastructure.
- Dependency inversion:
  - Domain & application depend on interfaces (ports).
  - Infrastructure implements those interfaces (adapters).
- Background jobs:
  - Scheduler enqueues “publish post” jobs.
  - Worker executes jobs and updates status.
