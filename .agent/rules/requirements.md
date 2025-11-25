---
trigger: always_on
---

# Canva → Instagram Scheduler (Expo + Backend)  
Requirements Document (Proof of Concept)

## 1. Overview

This project is a **mobile app built with Expo** plus a minimal backend that helps a **small business owner**:

- Create or reuse **Canva designs** as Instagram post templates.
- Attach **captions and hashtags** to each template.
- **Schedule** a week (or more) of posts in one go.
- Let the app **auto-publish to Instagram** via the official Instagram Graph API for Business/Creator accounts. :contentReference[oaicite:0]{index=0}  

The focus is on a **proof of concept (PoC)** – validate that the flow from Canva → templates → scheduler → Instagram auto-posting works end-to-end with a minimal, clean UI.

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. Allow a small business owner to:
   - Log into the app and connect their **Instagram Business/Creator account**.
   - Connect their **Canva account**.
   - Pick or create **design templates** in Canva and bring them into the app.
   - Define **caption + hashtag presets** for each template.
   - Create a **weekly posting plan** (e.g. 7 posts for the next 7 days).
   - Let the app **publish posts automatically** on schedule.

2. Respect and use:
   - **Instagram Graph API** for official, compliant publishing and scheduling. :contentReference[oaicite:1]{index=1}  
   - **Canva Connect APIs / Apps SDK** to integrate with Canva and fetch/export designs. :contentReference[oaicite:2]{index=2}  

3. Provide a **simple, non-technical mobile UX** (no need for the user to understand APIs, tokens, etc.).

### 2.2 Non-Goals (for PoC)

- No multi-tenant team features (only **one owner** per account).
- No advanced analytics dashboard (basic status is enough).
- No Instagram comment management or DMs.
- No cross-platform posting (Instagram only).
- No complex drag-and-drop Canva editing inside the app beyond what Canva’s own UI supports.

---

## 3. Target Users & Personas

- **Primary persona:** Small business owner (e.g., bakery, barber, coffee shop) with:
  - One Instagram Business/Creator account.
  - Basic familiarity with Canva.
  - Wants to “set and forget” a week of marketing content.

- **Secondary persona (future):**
  - Social media manager handling multiple small business accounts. (Out of scope for PoC but keep in mind in data model.)

---

## 4. High-Level System Architecture

### 4.1 Frontend

- **Framework**: React Native + **Expo** (managed workflow).
- Platforms:
  - iOS
  - Android
- Language: **TypeScript**

### 4.2 Backend

Any modern backend framework is acceptable; for PoC we’ll assume:

- **Fastify** for REST API.
- **PostgreSQL** for persistence (can be Supabase / RDS / Neon, etc.).
- **Redis + job queue** (e.g., BullMQ) for scheduled publishing jobs.
- **Background worker** process that fires jobs at scheduled times and calls the **Instagram Graph API**.

### 4.3 External Services

- **Instagram Graph API**:
  - Used for OAuth-style login (via Facebook/Meta).
  - Used for content publishing (creating media containers + publishing them) for **Business/Creator** accounts only. :contentReference[oaicite:3]{index=3}  

- **Canva APIs** (Connect API + Apps SDK):
  - For authenticating the user’s Canva account (OAuth 2.0 with PKCE). :contentReference[oaicite:4]{index=4}  
  - For listing and/or generating designs and exporting to images (JPEG/PNG) that are then stored or accessed by the backend. :contentReference[oaicite:5]{index=5}  

---

## 5. Core User Flows

### 5.1 Onboarding & Account Connections

1. User downloads the app and signs up:
   - Simple email/password or social login.
2. App prompts:
   - **Connect Instagram** (Business/Creator account via Meta OAuth).
   - **Connect Canva** (via Canva OAuth 2.0 PKCE).
3. On success:
   - Backend stores **long-lived tokens / refresh tokens** for both integrations securely (encrypted at rest).
   - App shows a “You’re connected” state with both integration statuses.

### 5.2 Create a Post Template

1. User taps **“New Template”**.
2. Options:
   - **Start from Canva design**:
     - App opens Canva (via deep link or embedded experience, depending on integration).
     - User selects or edits a design and saves it.
     - Backend gets a reference (design ID) and/or exported image URL from Canva.
   - For PoC: only **single image posts** are necessary.
3. User configures template metadata:
   - Template name (e.g., “Monday Promo”, “Daily Tip”).
   - Caption text with placeholders (optional), e.g. `Buy 1 Get 1 Free today!`
   - Default hashtag set, e.g. `#bakery #freshbread #localbusiness`.
4. User saves template:
   - Backend stores `Template` with reference to the Canva asset and defaults.

### 5.3 Create a Weekly Schedule

1. User taps **“Plan My Week”**.
2. User sees 7 slots (or a calendar grid) representing the upcoming days.
3. For each day, user can:
   - Pick a **template**.
   - Optionally override:
     - Caption
     - Hashtags
     - Posting time (default time can be set in Settings).
4. After configuring the week:
   - User confirms “Schedule posts”.
   - Backend:
     - Creates `ScheduledPost` records for each selected slot.
     - Enqueues jobs in the job queue for each scheduled datetime.

### 5.4 Automated Publishing Flow

For each `ScheduledPost`:

1. At scheduled time, the **worker**:
   - Validates that access tokens are still valid; refresh if needed.
   - Uses Canva design reference to ensure the image is accessible or already cached/exported.
   - Uses **Instagram Graph API**:
     - **Step 1:** Create a media container with the image URL and caption. :contentReference[oaicite:6]{index=6}  
     - **Step 2:** Publish the media container to the connected Business/Creator account.
2. On success:
   - Mark `ScheduledPost.status = "posted"` with `posted_at`.
   - Store the resulting Instagram media ID.
3. On error:
   - Mark `ScheduledPost.status = "failed"`, log error.
   - Optionally send a mobile push or in-app alert: “Post failed: token expired / rate limit / etc.”

### 5.5 Monitoring & Status

- Home screen:
  - **Today’s scheduled post** (preview, time, template name).
  - **This week’s posts** list with statuses:
    - Scheduled
    - Posted
    - Failed (with reason snippet).
- Detail screen:
  - Shows individual post details (image thumbnail, caption, hashtags, time, status, error logs).

---

## 6. Functional Requirements

### 6.1 Authentication & Accounts

- **FR-1**: Users can sign up / log in via email+password.
- **FR-2**: Users can connect exactly one **Instagram Business/Creator** account.
- **FR-3**: Users can connect exactly one **Canva** account.

### 6.2 Canva Integration

- **FR-4**: App must support OAuth 2.0 PKCE auth with Canva. :contentReference[oaicite:7]{index=7}  
- **FR-5**: User can open a Canva design experience from the mobile app to:
  - Create a new design **or**
  - Choose an existing design.
- **FR-6**: Backend must be able to:
  - Retrieve/export the design as an image asset (JPEG/PNG).
  - Store either:
    - A URL pointing to the Canva-generated asset, or
    - A copy in app storage (for PoC, remote URL is enough if whitelisted by IG).
- **FR-7**: Users can view a **thumbnail preview** of the Canva design inside the app.

### 6.3 Template Management

- **FR-8**: Users can create, edit, duplicate, and delete **templates**.
- **FR-9**: Template includes:
  - `title`
  - Canva design reference
  - Default caption
  - Default hashtags
- **FR-10**: Templates can be easily reused when scheduling multiple posts.

### 6.4 Scheduling

- **FR-11**: Users can create a **weekly schedule** (7 days ahead).
- **FR-12**: Each scheduled item must have:
  - Date and time (in user’s local timezone).
  - Reference to a template.
  - Optional overrides for caption and hashtags.
- **FR-13**: Users can:
  - Edit a scheduled post before it runs.
  - Cancel/delete a scheduled post.
- **FR-14**: The system should prevent scheduling more posts than allowed by the **Instagram Graph API rate limits** (e.g., 25 posts per 24h). :contentReference[oaicite:8]{index=8}  

### 6.5 Instagram Publishing

- **FR-15**: Instagram integration must use **Instagram Graph API** (not scraping, private APIs, or automation hacks).
- **FR-16**: Only **image feed posts** are required in the PoC.
- **FR-17**: At posting time, worker must:
  - Create a media container (image + caption).
  - Publish the container to the account.
- **FR-18**: The app must handle token refresh and errors:
  - Expired token → ask user to reconnect.
  - Permission issues → show a clear message.
  - Rate limit → requeue or mark as failed with explanation.

### 6.6 Notifications & UX

- **FR-19**: In-app notifications (PoC) for:
  - Failed posts.
  - Account connection issues.
- **FR-20** (optional PoC): Push notifications via Expo for failures.

---

## 7. Non-Functional Requirements

### 7.1 Security & Compliance

- **NFR-1**: All network calls use **HTTPS**.
- **NFR-2**: Access tokens for Canva and Instagram must be:
  - Encrypted at rest in the database.
  - Never exposed directly to frontend JS; backend proxies calls where possible.
- **NFR-3**: Follow **Instagram and Canva developer policies** — especially around:
  - Allowed automation.
  - Rate limits and data usage.
  - No storing or using data beyond what is needed for the app’s function. :contentReference[oaicite:9]{index=9}  

### 7.2 Performance & Reliability

- **NFR-4**: Posting jobs must be **idempotent** (avoid duplicate posts if a job is retried).
- **NFR-5**: System should be able to schedule at least **a few hundred posts per day** in total (well within Instagram rate limits for one account).
- **NFR-6**: Background worker must have observability (basic logging).

### 7.3 Maintainability

- **NFR-7**: Use TypeScript on both frontend and backend to reduce runtime errors.
- **NFR-8**: Clearly separate:
  - Auth module
  - Scheduling module
  - Integration module (Canva + Instagram)

---

## 8. Data Model (Simplified)

**User**

- `id`
- `email`
- `password_hash`
- `created_at`

**BusinessProfile**

- `id`
- `user_id`
- `display_name`
- `timezone`

**IntegrationInstagram**

- `id`
- `business_profile_id`
- `instagram_user_id`
- `page_id` (Facebook Page)
- `access_token_encrypted`
- `refresh_token_encrypted` (if applicable)
- `token_expires_at`

**IntegrationCanva**

- `id`
- `business_profile_id`
- `canva_user_id`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `token_expires_at`

**Template**

- `id`
- `business_profile_id`
- `title`
- `canva_design_id`
- `image_url` (optional cached export)
- `default_caption`
- `default_hashtags` (string or array)
- `created_at`

**ScheduledPost**

- `id`
- `business_profile_id`
- `template_id`
- `scheduled_at` (timestamp with timezone)
- `custom_caption` (nullable)
- `custom_hashtags` (nullable)
- `status` (enum: `scheduled`, `posted`, `failed`, `cancelled`)
- `posted_at` (nullable)
- `instagram_media_id` (nullable)
- `error_message` (nullable)

**PostRunLog** (optional)

- `id`
- `scheduled_post_id`
- `run_at`
- `status`
- `raw_response` (JSON, nullable)

---

## 9. PoC Scope vs. Future Enhancements

### 9.1 Must-Have for PoC

- Single user → single business profile → single Instagram account.
- Canva connect + import of at least one design.
- Templates with caption and hashtags.
- Weekly schedule UI.
- Backend scheduling and automatic posting of **image feed posts**.
- Basic error handling + status view.


## 10. Developer Notes

- Start by implementing:
  1. **Backend skeleton** (auth, DB, job queue).
  2. **Instagram Graph API integration** with a simple “Post image now” test endpoint.
  3. **Canva integration** to fetch/export a design and store its image URL.
  4. **Expo app** with:
     - Basic auth.
     - “Connect Instagram” and “Connect Canva”.
     - A minimal template list and weekly schedule screen.

Once these pieces talk to each other end-to-end for **one scheduled post**, the PoC is successful; you can then polish the UX.