# HR Management System — Server

> A production-ready REST API server for HR workflows, implemented with TypeScript, Express and Drizzle ORM. This project demonstrates API design, DB schema migrations, authentication/session handling, input validation, Swagger documentation, and automated tasks.

## Key Highlights
- Clean TypeScript codebase with typed request handling and modular routes.
- Database-first schema using `drizzle-orm` and tracked migrations via `drizzle-kit`.
- Session token storage and verification (secure session lifecycle management).
- Input validation with `zod` and centralized error handling middleware.
- Comprehensive API documentation via Swagger available at `/api-docs`.
- Email workflows implemented with `nodemailer` (verification and password reset).

## Tech Stack
- Runtime: Node.js
- Language: TypeScript
- Server: Express
- ORM / Migrations: Drizzle ORM & Drizzle Kit
- Validation: Zod
- Auth: DB-backed session tokens, secure hashing with `argon2`
- Docs: Swagger (OpenAPI)
- Email: Nodemailer

## Repository Structure (selected)
- `src/` — application source
  - `controllers/` — request handlers per domain
  - `routes/` — route definitions and middleware wiring
  - `db/` — `drizzle` schema, setup, and migrations
  - `middlewares/` — permission, session verification, error handling
  - `services/` — auxiliary services (mail, etc.)
  - `validators/` — request schemas using `zod`

## Prerequisites
- Node.js (v16+ recommended)
- A PostgreSQL-compatible database (connection URL in env)

## Environment Variables
| Name | Purpose |
|------|---------|
| `PORT` | Server port (default 5000) |
| `DB_URL` | Database connection URL used by Drizzle |
| `EMAIL` | SMTP user / from address for outbound email |
| `PASSWORD` | SMTP password for `EMAIL` |

Create a `.env` file in the project root with the values above before running.

## Install & Run
1. Install dependencies

```bash
npm install
```

2. Run in development (auto-restarts)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

## Database Migrations (Drizzle Kit)
- Generate migrations from schema changes:

```bash
npm run db:generate
```

- Apply pending migrations:

```bash
npm run db:migrate
```

- Push the schema (careful; use only when appropriate):

```bash
npm run db:push
```

## API Docs
After starting the server, visit `http://localhost:<PORT>/api-docs` to explore the OpenAPI/Swagger UI for available endpoints, request/response schemas, and example payloads.

## Design & Engineering Notes
- Authentication: session tokens persisted in `userTokens` table and validated by `verifySession` middleware; tokens expire and are cleaned up to reduce risk.
- Security: passwords hashed with `argon2`; validation centralized with `zod`; errors normalized via an error middleware.
- Observability: structured logging can be added (recommended) and Swagger provides immediate contract documentation for frontend/backends.

## Author

**Md. Salauddin**
Full‑Stack Engineer | Backend‑focused | Real‑time Systems Enthusiast

* Strong experience with Node.js, React, Redux, MySQL, PostgreSQL, Firebase, and system design
* Passionate about building scalable and production‑grade applications

---

## License

This project is licensed under the MIT License.
