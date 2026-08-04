# Low-Level Design (LLD)

# PharmEasy Auto-Refill Subscription System

**Version:** 1.0
**Team:** S135 – Stellar
**Sprint:** Sprint 1
**Prepared By:** Team S135 – Stellar
**Related Documents:** [PRD.md](./PRD.md) · [HLD.md](./HLD.md)

---

# 1. Purpose

This document details the database schema, API contracts, and core module/function logic implementing the design described in the HLD. It is the reference for implementation and code review.

---

# 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | JavaScript (ES Modules) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (`jsonwebtoken`) + HTTP-only cookies, `bcryptjs` for password hashing |
| Styling | Plain CSS |
| Email | Brevo transactional email API |
| Testing | Jest |
| Scheduler trigger | GitHub Actions (cron) |
| Deployment | Vercel, Docker (optional) |

---

# 3. Data Model (Prisma Schema)

## 3.1 Entity-Relationship Summary

```
User 1───1 PaymentMethod
User 1───1 Cart 1───* CartItem *───1 Medicine
User 1───* Subscription *───1 Medicine
User 1───* Order 1───* OrderItem *───1 Medicine
User 1───* Notification
Subscription 1───* Order
Order 1───* Payment
```

## 3.2 Enums

| Enum | Values |
|---|---|
| `Frequency` | `DAILY`, `WEEKLY`, `MONTHLY` |
| `SubscriptionStatus` | `ACTIVE`, `PAUSED`, `CANCELLED` |
| `OrderStatus` | `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED` |
| `PaymentStatus` | `SUCCESS`, `FAILED`, `RETRYING` |

## 3.3 Models

**User**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| email | String | unique |
| password | String | bcrypt hash |
| address | String? | optional shipping address |
| resetOtp / resetOtpExpiry | String? / DateTime? | forgot-password flow |
| createdAt / updatedAt | DateTime | |

Relations: `subscriptions[]`, `orders[]`, `notifications[]`, `paymentMethod` (1:1), `cart` (1:1)

**PaymentMethod**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | unique (1 saved method per user) |
| cardHolderName | String | |
| last4 | String | simulated, no real PAN stored |
| expiry | String | |

**Medicine**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | |
| description | String? | |
| price | Float | |
| category | String? | |
| imageUrl | String? | |

**Subscription**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId / medicineId | String | FKs |
| frequency | Frequency | |
| status | SubscriptionStatus | default `ACTIVE` |
| nextRefillDate | DateTime | drives the scheduler |
| lastReminderSentFor | DateTime? | dedupes reminders within a cycle |

Relations: `orders[]`

**Order**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK |
| subscriptionId | String? | null for one-off cart checkouts |
| status | OrderStatus | default `PENDING` |
| totalAmount | Float | |
| nextPaymentAttemptAt | DateTime? | set while retrying |

Relations: `items[]` (OrderItem), `payments[]`

**OrderItem** — `orderId`, `medicineId`, `quantity`, `price` (price snapshot at time of order)

**Payment**
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| orderId | String | FK |
| status | PaymentStatus | |
| retryCount | Int | default 0 |
| attemptedAt | DateTime | default now() |

**Notification** — `userId`, `message`, `type` (String — see §5.5), `read` (Boolean, default false)

**Cart** (1:1 with User) — `userId` unique, `items[]` (CartItem)

**CartItem** — `cartId`, `medicineId`, `quantity`; unique on `[cartId, medicineId]` (upsert target for add-to-cart)

---

# 4. API Contract

All endpoints are under `/api`. Authenticated endpoints read the JWT from the `token` HTTP-only cookie; unauthenticated requests receive `401`.

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Issue JWT cookie |
| POST | `/auth/logout` | Yes | Clear session cookie |
| GET/PUT | `/auth/profile` | Yes | View/update profile (incl. address) |
| POST | `/auth/forgot-password` | No | Issue OTP |
| POST | `/auth/reset-password` | No | Reset password via OTP |
| GET | `/medicines` | No | List/search/filter catalogue |
| GET | `/medicines/[id]` | No | Medicine detail |
| GET | `/cart` | Yes | Get current user's cart |
| POST | `/cart` | Yes | Add item to cart |
| PATCH/DELETE | `/cart/[itemId]` | Yes | Update quantity / remove item |
| GET | `/subscriptions` | Yes | List user's subscriptions |
| POST | `/subscriptions` | Yes | Create subscription |
| PATCH | `/subscriptions/[id]` | Yes | Update status/frequency, skip-next-refill |
| GET | `/orders` | Yes | Order history |
| POST | `/orders/[id]/pay` | Yes | Manually trigger payment attempt |
| POST | `/orders/[id]/attempt-payment` | Yes | Retry payment attempt |
| POST | `/orders/[id]/cancel` | Yes | Cancel a pending order |
| GET/POST/DELETE | `/payment-methods` | Yes | Manage saved payment method |
| GET/PATCH/DELETE | `/notifications` | Yes | List, mark-read, delete notifications |
| POST | `/scheduler/run` | Shared secret | Triggered by GitHub Actions cron |

---

# 5. Core Module Logic (`src/lib/services.js`)

## 5.1 Auth
- `registerUser({name, email, password})` — normalizes email, hashes password (bcrypt), creates `User`.
- `loginUser({email, password})` — verifies password, issues signed JWT (`jsonwebtoken`, secret from `JWT_SECRET`).
- `requestPasswordReset` / `resetPassword` — generates a time-limited OTP (`resetOtp`, `resetOtpExpiry`) and validates it on reset.

## 5.2 Cart
- `getOrCreateCart(userId)` — lazily creates a `Cart` row on first use (1 cart per user, enforced by unique `userId`).
- `addToCart({userId, medicineId, quantity})` — `prisma.cartItem.upsert` on the `[cartId, medicineId]` unique key: increments quantity if the item already exists, else creates it.
- `updateCartItem` / `removeCartItem` — always scoped through `cartId` derived from `userId`, so one user can never touch another's cart item by guessing an `itemId`.
- `clearCart(userId)` — `deleteMany` scoped to the user's `cartId`.

## 5.3 Subscriptions
- `createSubscription({userId, medicineId, frequency})` — validates the medicine exists, computes `nextRefillDate` via `calculateNextRefillDate(frequency)` (+1/+7/+30 days from now), creates as `ACTIVE`.
- `updateSubscriptionStatus(id, userId, status)` — ownership-checked via `findFirst({id, userId})`; resuming a `PAUSED` subscription whose `nextRefillDate` has already elapsed recalculates it forward so it doesn't fire an immediate backlog of orders.
- `updateSubscriptionFrequency(id, userId, frequency)` — blocked on `CANCELLED` subscriptions; recalculates `nextRefillDate`.
- `skipNextRefill(id, userId)` — blocked if status isn't `ACTIVE`, and blocked if a `PENDING` order already exists for the current cycle (prevents skipping mid-payment-attempt); otherwise advances `nextRefillDate` by one interval, clears `lastReminderSentFor`, and creates a `REFILL_SKIPPED` notification.

## 5.4 Payments (Simulated Engine)
- `attemptPayment(orderId, {forceOutcome} = {})`:
  1. Loads the order with `payments`, `subscription.medicine`, and `user`.
  2. Rejects if the order isn't `PENDING`, or if `attemptsMade > MAX_PAYMENT_RETRIES`.
  3. Determines outcome: `forceOutcome` if provided (used by manual retry endpoints / tests), else `simulateOutcome()` — `Math.random() < PAYMENT_SUCCESS_PROBABILITY`.
  4. **On SUCCESS:** creates a `Payment(SUCCESS)`, updates `Order → SUCCESS`, sends a `PAYMENT_SUCCESS` notification, and best-effort sends a receipt email via `sendMail` (failure is caught/logged, not thrown).
  5. **On FAILURE, retries remaining:** creates `Payment(RETRYING)`, sets `nextPaymentAttemptAt = now + backoffDelayFor(attemptsMade)` (exponential backoff table `PAYMENT_RETRY_BACKOFF_MS`), sends `PAYMENT_FAILED` notification.
  6. **On FAILURE, retries exhausted:** creates `Payment(FAILED)`, updates `Order → FAILED`, sends `ORDER_FAILED` notification.

## 5.5 Notifications
- `createNotification({userId, message, type})` — always created as `read: false`.
- `type` values: `REFILL_REMINDER`, `REFILL_SKIPPED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`, `ORDER_FAILED`.
- `getNotifications`, `markAllAsRead`, `deleteNotification`, `deleteAllNotifications` — all scoped by `userId`.

## 5.6 Scheduler — `runScheduler()`
Single entry point invoked by `POST /api/scheduler/run`. Runs three passes per invocation:

1. **Newly-due subscriptions** — `subscription.findMany({status: ACTIVE, nextRefillDate <= now})`. For each: create an `Order(PENDING)` with a snapshot `OrderItem`, then immediately call `attemptPayment(order.id)`. If the resulting order status is terminal (`SUCCESS`/`FAILED`), advance the subscription's `nextRefillDate`; if still `PENDING` (retry scheduled), leave it — the retry pass below will pick it up on a future run.
2. **Retries due** — `order.findMany({status: PENDING, nextPaymentAttemptAt <= now})`, calls `attemptPayment(order.id)` again for each (no new order created).
3. **Reminders** — `subscription.findMany({status: ACTIVE, nextRefillDate within next 24h})`, filtered in-memory to exclude subscriptions where `lastReminderSentFor === nextRefillDate` (already reminded this cycle). Creates a `REFILL_REMINDER` notification and stamps `lastReminderSentFor`.

**Error isolation:** each subscription/order is processed inside its own try/catch; one failure is recorded in the per-item result set and does not stop the rest of the batch. Returns a structured summary: `{ newlyDueCount, retriesDueCount, remindersSentCount, processed, results[] }`.

---

# 6. Authentication & Authorization Design

- **Token:** signed JWT containing `{ userId }`, secret from `JWT_SECRET` env var, stored as an HTTP-only, `SameSite`-protected cookie named `token`.
- **Edge guard:** `src/middleware.js` redirects unauthenticated requests away from protected page routes.
- **API-level guard:** every authenticated API route independently re-verifies the JWT and derives `userId` server-side (`getUserIdFromRequest`) — the client never sends `userId` directly, preventing IDOR-style access to another user's data.
- **Scheduler guard:** `/api/scheduler/run` is not user-authenticated; it checks a shared `SCHEDULER_SECRET` header/query param set as a GitHub Actions secret.

---

# 7. Error Handling Convention

- Service functions throw plain `Error` objects with human-readable messages (e.g. `"Medicine not found"`, `"Subscription not found"`, `"Cannot edit a cancelled subscription"`).
- API route handlers catch these and map them to appropriate HTTP status codes (400/404) with `{ error: message }` JSON bodies.
- The scheduler additionally catches per-item errors internally so one bad record doesn't abort the whole run (see §5.6).

---

# 8. Testing Strategy

- **Unit tests** (Jest) mock `@/lib/prisma` and `@/lib/mailer` directly rather than mocking sibling functions within `services.js` — Jest cannot intercept a module's calls to its own internal functions, so cross-function mocking (e.g. mocking `attemptPayment` to test `runScheduler`) is avoided in favor of controlling the underlying random outcome (`Math.random`) and DB return values.
- Current suite (`src/__tests__/`) covers: `auth.service`, `medicine.service` + `medicines.route`, `order.service` + `orders.route`, `payment.service`, `login`, `register`, `middleware`, `date`, `subscriptions.service`, `scheduler.service`, `cart.service`, `notifications.service` — 14 test files in total, closing the gap that previously existed around subscriptions, the scheduler, cart, and notifications.
- Out of scope for unit tests: end-to-end/integration tests against a real database (manual QA + Docker Compose environment used instead).

---

# 9. Deployment Notes

- Environment variables required: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `SCHEDULER_SECRET`, `BREVO_API_KEY`, `MAIL`, `NEXT_PUBLIC_SITE_URL`.
- `NEXT_PUBLIC_SITE_URL` must be set both locally (`.env`) and in Vercel's project environment variables (redeploy required after setting) — it drives canonical URLs, Open Graph tags, `sitemap.xml`, and `robots.txt`.
- Scheduler cadence is controlled by the GitHub Actions cron expression in `.github/workflows/` (separate from the CI test workflow).
