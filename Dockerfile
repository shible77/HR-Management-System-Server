# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile
#
# Stages
# ──────
#  deps    — install ALL npm dependencies (including devDeps for tsc)
#  builder — compile TypeScript → dist/
#  runner  — production image, only runtime deps + compiled JS
#
# Both `api` and `worker` services in docker-compose.yml use the `runner`
# stage and differ only in their `command`.
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Install everything (dev deps needed to compile TypeScript)
RUN npm ci

# ── Stage 2: compile TypeScript ───────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY . .
# tsc outputs to ./dist as configured in tsconfig.json
RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only runtime (non-dev) dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Argon2 requires the native addon — make sure it was compiled in deps stage
# and is present in node_modules after npm ci --omit=dev above.
# (argon2 is a production dependency so --omit=dev keeps it.)

# Run as a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Default: start the API server.
# docker-compose.yml overrides `command` for the worker service.
CMD ["node", "dist/index.js"]
