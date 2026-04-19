# HR Management System — Server

REST API for HR operations: users, departments, attendance, leave, dashboards, calendar, and **queued payroll** (BullMQ). Built with **TypeScript**, **Express**, **Drizzle ORM**, **Zod**, and **OpenAPI** docs served at **`/docs`**.

---

## Table of contents

1. [What you can do with this API](#what-you-can-do-with-this-api)
2. [Tech stack](#tech-stack)
3. [How the repo is organized](#how-the-repo-is-organized)
4. [Prerequisites](#prerequisites)
5. [Environment variables](#environment-variables)
6. [Quick start](#quick-start)
7. [Database (Drizzle + Neon)](#database-drizzle--neon)
8. [Authentication and roles](#authentication-and-roles)
9. [API surface](#api-surface)
10. [Payroll and Redis (background jobs)](#payroll-and-redis-background-jobs)
11. [OpenAPI / Swagger documentation](#openapi--swagger-documentation)
12. [npm scripts](#npm-scripts)
13. [Engineering notes](#engineering-notes)
14. [Author and license](#author-and-license)

---

## What you can do with this API

| Area | Capabilities |
|------|----------------|
| **Auth** | Login (JWT + optional cookie), admin user creation, forgot-password email flow |
| **Users** | Current user profile, lookup one user by filters, paginated user list |
| **Departments** | Create department, assign manager, assign employee to department |
| **Attendance** | Check-in / check-out, queries by date / department / month, personal history, absent reports, admin and dashboard-oriented reports |
| **Leave** | Apply, list with filters, update, manager **process** (approve/reject), delete, “on leave today” |
| **Dashboard** | Admin-wide counters; manager stats scoped to a department |
| **Calendar** | Generate a year of calendar rows (weekends, etc.) for payroll/attendance logic |
| **Payroll** | **Enqueue** a monthly payroll run (Redis + BullMQ worker processes employees and upserts payroll rows) |

All HTTP routes are mounted under **`/api`**.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js |
| Language | TypeScript |
| HTTP | Express |
| Database access | Drizzle ORM |
| Database driver | Neon serverless (`@neondatabase/serverless`) — expects a Neon-compatible `DB_URL` |
| Validation | Zod |
| Auth | JSON Web Tokens (`jsonwebtoken`), `Authorization: Bearer` middleware |
| Background jobs | BullMQ + Redis (`ioredis`) |
| API docs | `@asteasolutions/zod-to-openapi` + `swagger-ui-express` |
| Email | Nodemailer (password reset / verification) |

---

## How the repo is organized

```
src/
├── index.ts                 # Express app, middleware, /api routers, Swagger
├── config/                  # env, JWT, Redis connection options
├── controllers/             # Handlers grouped by domain (auth, user, attendance, leave, payroll, …)
├── routes/                  # Routers wired to controllers + middleware
├── db/
│   ├── schema.ts            # Drizzle table definitions
│   ├── setup.ts             # DB client (Neon)
│   └── migrations/          # Generated SQL / snapshots (Drizzle Kit)
├── docs/
│   ├── registry.ts          # OpenAPI registry + Zod OpenAPI extension
│   ├── registerRoute.ts     # Helper to register paths on the registry
│   ├── openapiPaths.ts      # All documented routes (tags, security, schemas)
│   └── swagger.ts           # Builds OpenAPI 3 document and serves /docs
├── middlewares/             # verifySession, checkPermission, error handler
├── services/                # e.g. mail
├── utils/                   # validate(), filters, helpers
└── validators/              # Zod schemas shared by controllers and OpenAPI
```

Root **`docker-compose.yml`** defines a **Redis** service (port `6379`) for local BullMQ usage.

---

## Prerequisites

- **Node.js** (v18+ recommended; project uses modern TypeScript)
- **Neon** (or another Postgres) — set `DB_URL`
- **Redis** — required for **payroll** (and any future queues). For local dev: `docker compose up -d` from this repo
- **SMTP** credentials if you use forgot-password email (`EMAIL`, `PASSWORD`)

---

## Environment variables

Create a **`.env`** file in the project root.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DB_URL` | Yes | Neon / Postgres connection string for Drizzle |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs (`src/config/env.ts`) |
| `PORT` | No | HTTP port (default **5000**) |
| `EMAIL` | For mail | SMTP username / from address |
| `PASSWORD` | For mail | SMTP password |
| `CLIENT_URL` | Loaded in env | Reserved / future use (set to your front-end origin if you extend CORS or links) |
| `REDIS_HOST` | No | Redis host (default **127.0.0.1**) |
| `REDIS_PORT` | No | Redis port (default **6379**) |

---

## Quick start

```bash
npm install
```

**1. Configure `.env`**  
At minimum: `DB_URL`, `JWT_SECRET`. Add mail and Redis-related vars as needed.

**2. (Recommended for payroll) Start Redis**

```bash
docker compose up -d
```

**3. Run the API (development)**

```bash
npm run dev
```

- API: `http://localhost:5000` (or your `PORT`)
- **Swagger UI:** `http://localhost:5000/docs`

**4. Production build**

```bash
npm run build
```

The compiled output follows your `tsconfig` (typically `dist/`). Run with Node against the built entry (adjust to your deployment layout).

---

## Database (Drizzle + Neon)

- Schema lives in **`src/db/schema.ts`**.
- The app uses **`drizzle-orm/neon-http`** with `DB_URL`.

| Command | Use |
|---------|-----|
| `npm run db:generate` | Generate migrations from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (use with care; dev/sandbox only) |

---

## Authentication and roles

- After **login**, the API returns a **JWT** in JSON and may also set a **`token`** cookie (see `loginController`).
- Protected routes use **`verifySession`**: send  
  `Authorization: Bearer <jwt>`  
  (this is what OpenAPI documents as **BearerAuth**).
- **`checkPermission`** restricts routes to **`admin`**, **`manager`**, and/or **`employee`** as defined on each route.

---

## API surface

Routers are mounted with `app.use("/api", …)` in **`src/index.ts`**. Examples:

| Prefix / pattern | Router file |
|------------------|-------------|
| `/api/login`, `/api/createUser` | `routes/auth/loginRoute.ts`, `routes/createUserRoute.ts` |
| `/api/currentUser`, `/api/user`, `/api/users` | `routes/user/user.ts` |
| `/api/createDepartment`, `/api/assignManager/:id`, … | `routes/department/department.ts` |
| `/api/attendance/…` | `routes/attendanceRoutes/attendanceRoutes.ts` |
| `/api/applyLeave`, `/api/leave`, … | `routes/leaveManRoutes.ts` |
| `/api/adminDashboardInfo`, … | `routes/DashBoardAPIRoutes.ts` |
| `/api/forgot-password`, … | `routes/forgotPasswordRoutes.ts` |
| `/api/generateCalenderYear` | `routes/calenderRoute.ts` |
| `/api/payroll/start` | `routes/payrollRoute.ts` |

Exact paths, query/body shapes, and response outlines are listed in **`src/docs/openapiPaths.ts`** and visible in **Swagger UI**.

---

## Payroll and Redis (background jobs)

- **POST `/api/payroll/start`** (admin): validates `payDate`, enqueues a BullMQ job (`src/controllers/payroll.controllers/`).
- **Redis** must be reachable or enqueue fails (controller returns **503** with a clear message when Redis is down).
- The **worker** (`payroll.worker.ts`) consumes the `payroll` queue, aggregates attendance, writes payroll rows, and uses Redis locking.  
  **Important:** the worker only runs if you **import/start that module** in a separate process or alongside the API (your deployment choice). The API process alone enqueues jobs; it does not have to run the worker.

---

## OpenAPI / Swagger documentation

- **`src/docs/swagger.ts`** — builds the OpenAPI **3.0** document and serves **`/docs`** (not `/api-docs`).
- **`src/docs/openapiPaths.ts`** — registers every documented route with tags, JWT security, and Zod-based request/response schemas.
- **`src/docs/registerRoute.ts`** — thin wrapper over `registry.registerPath`.
- Validators under **`src/validators/`** are the source of truth for many request bodies and query objects, aligned with controllers.

Use **Authorize** in Swagger UI and paste the JWT from **`POST /api/login`**.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | `nodemon` + `ts-node` on `src/index.ts` |
| `npm run build` | TypeScript compile (`tsc`) |
| `npm run db:generate` | Drizzle Kit: generate migrations |
| `npm run db:migrate` | Drizzle Kit: run migrations |
| `npm run db:push` | Drizzle Kit: push schema |

---

## Engineering notes

- **CORS** is configured for `http://localhost:5173` with credentials; change in **`src/index.ts`** for other front-end origins.
- **Errors:** validation throws are shaped by **`error.middleware.ts`** (e.g. `VALIDATION_ERROR` → 400 with issues).
- **Security:** prefer strong `JWT_SECRET`, HTTPS and `secure` cookies in production, and hashing passwords at rest; align implementation with your security policy before production use.
- **Payroll / Redis:** use `docker-compose.yml` or your own Redis URL for reliable queue behavior.

---

## Author and license

**Md. Salauddin** — Full-stack engineer (backend-focused).

This project is licensed under the **MIT License**.
