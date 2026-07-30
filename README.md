# PharmEasy — Auto-Refill Subscription System

A Next.js pharmacy application that lets users subscribe to recurring medicines, automatically generates refill orders on schedule, simulates payment with retry-on-failure logic, and keeps users notified at every step.

Built by team **S135-Stellar** for Sprint 1. Full requirements in [`docs/PRD.md`](docs/PRD.md).

---

## ✨ Features

- **Auth** — register, login, logout, forgot/reset password, JWT-protected routes
- **Medicine catalogue** — browse, search, view details
- **Cart & Orders** — add to cart, checkout (with custom shipping address), order history, cancel order
- **Subscriptions** — subscribe to a medicine on a Daily/Weekly/Monthly schedule; edit frequency, pause, resume, or cancel anytime
- **Auto-refill scheduler** — runs hourly via GitHub Actions, generates orders for due subscriptions and sends 24-hour reminders
- **Simulated payments** — auto-retries failed payments up to 3 times with backoff before marking an order failed
- **Notifications** — in-app alerts for reminders, payment success/failure, and exhausted retries
- **Email receipts** — real transactional emails via Brevo for payment confirmations
- **Dashboard** — active subscriptions, upcoming refills, recent orders, notifications at a glance

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Email | Brevo (Sendinblue) transactional API |
| Testing | Jest |
| CI/CD | GitHub Actions |
| Deployment | Docker, Google Cloud Platform |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local or hosted)

### 1. Clone & install
```bash
git clone https://github.com/kalviumcommunity/SW2627-NextJS-Cloud-PharmEasy.git
cd SW2627-NextJS-Cloud-PharmEasy
npm install
```

### 2. Configure environment
Copy the example file and fill in your own values:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (can be a connection pooler URL) |
| `DIRECT_URL` | Direct Postgres connection string (required by Prisma for migrations/schema-push) |
| `JWT_SECRET` | Any long random string, used to sign auth tokens |
| `SCHEDULER_SECRET` | Bearer token required to call `/api/scheduler/run` |
| `BREVO_API_KEY` | API key from [Brevo](https://app.brevo.com/settings/keys/api), used to send receipts, password reset links, and reminder emails |
| `MAIL` | A sender email address verified in your Brevo account |

### 3. Set up the database
```bash
npm run prisma:migrate   # applies all migrations
npm run prisma:seed      # (optional) seeds sample data
```

### 4. Run the dev server
```bash
npm run dev
```
App runs at [http://localhost:3000](http://localhost:3000).

### 🐳 Running with Docker
You can also run the entire stack (Next.js web app + PostgreSQL database) containerized:
```bash
# Using helper scripts
./run-docker.sh up     # macOS/Linux/Git Bash/WSL
run-docker.bat up      # Windows Command Prompt
```
Refer to the detailed [`docs/DOCKER_GUIDE.md`](docs/DOCKER_GUIDE.md) for further configurations and commands.

---

## 📜 Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm test` | Run the Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply Prisma migrations |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run prisma:seed` | Seed the database |

---

## 🧪 Testing

Tests live in `src/__tests__` and run against `.env.test`. `sendMail` is mocked in tests, so no real emails go out during `npm test`.

Current coverage: auth, medicines, orders, payments, login/register, middleware.
**Not yet covered:** subscriptions service, scheduler, cart, notifications — next up on the roadmap.

---

## ⏱ The Scheduler

`src/app/api/scheduler/run` is the endpoint that drives the whole auto-refill flow. In production, `.github/workflows/scheduler-cron.yml` calls it every hour with a `Bearer ${SCHEDULER_SECRET}` header. Each run:
1. Finds subscriptions due for refill and generates their orders
2. Retries any orders with a pending payment retry
3. Sends 24-hour reminders for upcoming refills

You can also trigger it manually via the "Run workflow" button on the Actions tab, or by calling the endpoint directly with the scheduler secret.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # login, register, forgot/reset password
│   ├── (app)/           # home, cart, checkout, orders, profile, subscriptions, notifications
│   ├── medicines/       # public catalogue + detail pages
│   └── api/             # backend routes, mirrors the resources above
├── components/          # UI components (*Client.js = stateful page logic)
├── hooks/                # useCart, useOrders, useSubscriptions
├── lib/                  # auth, mailer, prisma client, schemas, services, utils
└── __tests__/            # Jest test suite
prisma/                    # schema + migrations
docs/PRD.md                 # full product requirements
```
---



## 🎨 Design

Figma: [PharmEasy — UI Designs](https://www.figma.com/design/hBY7Ns7OR3xrpdktr61HNe/PharmEasy?node-id=0-1&t=O0hN1tK6XLeD86HQ-1)

## 🤝 Team Working Agreement

**Team Name:** S135-Stellar

| Member | Name | Technical Strength |
|---|---|---|
| Member 1 (Project Admin) | Kavya Kakkar | React, Node.js |
| Member 2 | Gracy Singh | Prisma, Next.js |
| Member 3 | Somya | Front-end, Next.js |

| Topic | Agreement |
|---|---|
| PR Review Turnaround | Within the same day |
| Handling Blockers | Raise blockers immediately during the standup |
| Standup Format | Yesterday / Today / Blockers (each person) |
| Primary Team Channel | WhatsApp Group |

> **Sprint Commitment:** We will each submit our own pull request every day. We will not let a blocker go unraised for more than one standup.
