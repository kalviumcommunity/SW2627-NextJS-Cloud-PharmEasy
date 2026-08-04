# High-Level Design (HLD)

# PharmEasy Auto-Refill Subscription System

**Version:** 1.0
**Team:** S135 – Stellar
**Sprint:** Sprint 1
**Prepared By:** Team S135 – Stellar
**Related Document:** [PRD.md](./PRD.md)

---

# 1. Purpose

This document describes the overall system architecture, major components, data flow, and key design decisions for the PharmEasy Auto-Refill Subscription System. It translates the requirements in the PRD into a technical blueprint that guides implementation, without going into class-level or function-level detail (covered separately in the LLD).

---

# 2. Architecture Overview

PharmEasy is a monolithic full-stack web application built on **Next.js (App Router)**, deployed as a single unit on **Vercel**. There is no separate backend service — API routes live inside the same Next.js project as the frontend, and a **PostgreSQL** database (via **Prisma ORM**) is the single source of truth.

```
                          ┌─────────────────────────────┐
                          │        Browser (User)       │
                          │  React UI (Next.js client)  │
                          └───────────────┬─────────────┘
                                          │ HTTPS
                                          ▼
                          ┌─────────────────────────────┐
                          │     Next.js App Router      │
                          │  ┌───────────────────────┐  │
                          │  │  Pages (Server Comp.) │  │
                          │  ├───────────────────────┤  │
                          │  │  API Routes (/api/*)  │  │
                          │  ├───────────────────────┤  │
                          │  │  Middleware (JWT auth)│  │
                          │  └───────────┬───────────┘  │
                          └──────────────┼──────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   Service Layer (services.js)│
                          │  auth · medicines · cart     │
                          │  subscriptions · orders      │
                          │  payments · notification     │
                          │  scheduler                   │
                          └───────────────┬──────────────┘
                                         │ Prisma Client
                                         ▼
                          ┌─────────────────────────────┐
                          │   PostgreSQL Database       │
                          └─────────────────────────────┘

  External integrations:
  ┌────────────────────────┐    ┌─────────────────────────────┐
  │  GitHub Actions (cron) │──▶ │ POST /api/scheduler/run    │
  └────────────────────────┘    └─────────────────────────────┘
  ┌───────────────────────┐
  │  Brevo (email API)    │◀── triggered on payment events
  └───────────────────────┘
```

---

# 3. Major Components

## 3.1 Presentation Layer
- Next.js App Router pages (`src/app/**`), split into logged-out marketing/auth routes and an authenticated app shell (`(app)` route group).
- Client components (`src/components/**`) handle interactivity — cart, subscription controls, checkout, dashboard.

## 3.2 API Layer
- REST-style route handlers under `src/app/api/**`, one folder per resource: `auth`, `medicines`, `cart`, `subscriptions`, `orders`, `payment-methods`, `notifications`, `scheduler`.
- Each route is a thin controller: validate input → call a service function → return a JSON response.

## 3.3 Service Layer (`src/lib/services.js`)
- Contains all business logic, grouped by domain: Auth, Cart, Medicines, Subscriptions, Orders/Payments, Notifications, Scheduler.
- Owns every read/write to the database via Prisma — API routes never call Prisma directly.

## 3.4 Data Layer
- **PostgreSQL** database, schema managed by **Prisma migrations** (`prisma/migrations/`).
- Single Prisma Client instance (`src/lib/prisma.js`) shared across the app.

## 3.5 Auth & Session
- JWT-based authentication. Token is issued on login/register and stored in an **HTTP-only cookie**.
- `middleware.js` guards authenticated routes at the edge; API routes independently verify the JWT before touching user-scoped data.

## 3.6 Scheduler (Background Job)
- No always-on server process. Instead, a **GitHub Actions workflow** runs on a cron schedule and calls `POST /api/scheduler/run` (protected by a shared secret), which invokes the scheduler service function.
- The scheduler is idempotent per run: it processes newly-due subscriptions, retries payments due for retry, and sends refill reminders — all in one pass.

## 3.7 Payment Engine (Simulated)
- No real payment gateway integration (out of scope per PRD). `attemptPayment()` simulates an outcome probabilistically, and on failure schedules a retry with exponential backoff, up to a configured max retry count, before marking the order permanently `FAILED`.

## 3.8 Notifications
- In-app notifications only (persisted `Notification` records), created as a side effect of payment success/failure, refill reminders, and skipped refills.

## 3.9 Email (Transactional)
- Payment receipt emails sent via **Brevo's transactional email API** on successful payment. Failure to send email does not fail the payment flow (best-effort, caught and logged).

## 3.10 Deployment
- Application: **Vercel** (production URL: `sw-2627-next-js-cloud-pharm-easy.vercel.app`).
- Database: managed PostgreSQL instance, connected via `DATABASE_URL` / `DIRECT_URL`.
- Containerization: a `Dockerfile` + `docker-compose.yml` are provided for local/alternate deployment (see `docs/DOCKER_GUIDE.md`).
- CI: GitHub Actions runs the test suite on push/PR (`.github/workflows/ci.yml`) in addition to the scheduler cron workflow.

---

# 4. Key Data Flows

## 4.1 Subscription Creation → Auto-Refill (core flow)
1. User browses `/medicines`, selects a medicine, chooses a frequency, and creates a subscription.
2. `nextRefillDate` is calculated and stored (`ACTIVE` status).
3. On each scheduler run, subscriptions with `nextRefillDate <= now` are picked up.
4. An `Order` (status `PENDING`) is created for the subscription.
5. `attemptPayment()` runs immediately: on success, order → `SUCCESS`, subscription's `nextRefillDate` advances by one interval, and a success notification + receipt email are sent. On failure, the order stays `PENDING` with a `nextPaymentAttemptAt` set for the next retry.
6. Retries continue on subsequent scheduler runs until success or the retry cap is hit (order → `FAILED`).

## 4.2 Refill Reminder Flow
1. On each scheduler run, subscriptions due within the next 24 hours (and not already reminded for this cycle) are identified.
2. An in-app notification is created, and `lastReminderSentFor` is set to the current `nextRefillDate` to prevent duplicate reminders within the same cycle.

## 4.3 Manual Cart/Checkout Flow (non-subscription purchase)
1. User adds medicines to a persistent cart (`Cart`/`CartItem`, one cart per user).
2. At checkout, an `Order` is created directly from cart contents (not tied to a subscription), and payment is attempted the same way as the subscription flow.

## 4.4 Skip-Next-Refill Flow
1. From an active subscription, a user can skip the upcoming refill without cancelling.
2. The system verifies no order is already in flight for the current cycle, then advances `nextRefillDate` by one interval and clears `lastReminderSentFor`, and notifies the user.

---

# 5. Non-Functional Considerations

| Concern | Approach |
|---|---|
| **Scalability** | Stateless API routes (serverless on Vercel); scheduler processes subscriptions in a single batched pass rather than per-user cron jobs. |
| **Reliability** | Payment retries with exponential backoff; scheduler continues processing remaining subscriptions if one throws (isolated per-item error handling). |
| **Security** | JWT in HTTP-only cookies; scheduler endpoint protected by a shared secret (`SCHEDULER_SECRET`); passwords hashed with bcrypt. |
| **Data Integrity** | All state transitions (subscription status, order status, payment status) are enum-constrained at the database level via Prisma. |
| **Observability** | Scheduler run returns a structured summary (counts + per-item results) for logging/debugging. |
| **SEO/Discoverability** | Implemented: dynamic per-page metadata (`generateMetadata` on medicine/catalogue pages), auto-generated `sitemap.xml` and `robots.txt` (`src/app/sitemap.js`, `src/app/robots.js`), and JSON-LD `Product` structured data on medicine detail pages. |

---

# 6. Out of Scope (per PRD)

- Real payment gateway integration (Razorpay, Stripe, etc.) — payments are simulated.
- SMS/WhatsApp notifications — in-app + email only.
- Live medicine inventory/stock tracking.
- Multiple saved addresses / family accounts.
- Subscription analytics dashboards.

---

# 7. Component-to-Requirement Traceability (summary)

| PRD Requirement | Component |
|---|---|
| User registration/login | Auth service + `/api/auth/*` |
| Medicine browsing/search | Medicine service + `/medicines` |
| Create/edit/pause/resume/cancel subscription | Subscription service + `/api/subscriptions/*` |
| Automatic order generation | Scheduler service + GitHub Actions cron |
| Simulated payment + retries | Payment engine (`attemptPayment`) |
| Notifications | Notification service |
| Dashboard / order history | Order service + dashboard pages |

Detailed module/function-level design for each of these is covered in the [LLD](./LLD.md).
