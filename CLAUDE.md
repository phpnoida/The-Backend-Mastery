# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Mission

**The Backend Mastery** is a personal upskilling repo by Amit Kumar Singh — a Node.js developer targeting senior/pro-level backend engineering over 9–12 months (5 hrs/day, 5 days/week, starting April 2026).

**Dual purpose:**
1. Recruiter-facing portfolio — each branch is a self-contained, production-quality demonstration of a skill
2. Personal quick reference — can come back to any branch to recall patterns, commands, or system design decisions

**Philosophy:** Every topic is coded with system design in mind — scalable patterns, not just "it works" demos.

---

## Branching Strategy

| Branch | Topic |
|--------|-------|
| `feature/node-ts-setup` | Base boilerplate (Express 5 + TypeScript + esbuild) |
| `feature/redis` | Redis — commands, patterns, production project |
| `feature/socket` | Socket.IO — real-time patterns |
| `feature/mongodb` | MongoDB — deep dive, aggregation, indexing, schema design |
| `feature/dynamodb` | DynamoDB — AWS, single-table design |
| `feature/mysql` | MySQL — relational patterns, transactions, indexing |
| `feature/rabbitmq` | RabbitMQ — message queues, patterns (pub/sub, work queues, RPC) |
| `feature/rag` | RAG — retrieval-augmented generation with Node.js |
| `feature/logging` | Logging — Winston + CloudWatch, structured logging, alerting |
| `feature/auth-rbac` | Auth & RBAC — JWT, refresh tokens, roles, permissions |

**Rules:**
- Each branch forks from `feature/node-ts-setup` (the base boilerplate)
- Each branch has its own `README.md` documenting the topic: concepts, commands, architecture decisions, how to run
- Root `README.md` is updated as branches are added (acts as the index)
- Branches are kept as references — not merged into main

---

## Branch Working Log

> **Maintenance rule (for Claude):** Keep this log current. When work starts or finishes on a
> branch — a README is written, an exercise is issued, a solution is reviewed — update that
> branch's entry here. This is the context to load **before reviewing Amit's solution code** so
> you already know the branch's intent, deliverables, and what "correct" looks like. One entry per
> branch; newest active branch first. Carry this section forward when forking a new branch from base.

### `feature/data-structure` — **active**

- **Topic:** JavaScript fundamentals / data-structure drills — the language logic that goes *into*
  service files (objects, arrays, strings, functions, operators, conditionals, typecasting, loops,
  maths). Goal: fluency in the moves used constantly while writing API logic. No APIs, no server.
- **Deliverables created (by Claude):** ~100 spec-only practice questions under
  [`src/practise/ds/`](src/practise/ds/) — one `.js` file per topic (`01-objects.js` …
  `09-maths.js`) plus [`README.md`](src/practise/ds/README.md). Each question gives a task, an
  API-flavored dataset `const`, and an **Expected** output (the self-check). **No solution code.**
- **How Amit practices:** writes answers inline and runs them live with the **Quokka.js** VSCode
  extension (`console.log` → inline output), comparing to `Expected`. Plain `.js` so `tsc --noEmit`
  ignores them (tsconfig only includes `src/**/*.ts`).
- **When reviewing his answers:** check (1) output matches `Expected`, and (2) the approach is
  idiomatic/clean (prefer `map/filter/reduce`, `Object.entries`, `??`/`?.`, guard clauses, etc.).
  Give hints, not full solutions, unless he asks. A separate answer key can be added on request.
- **Status:** Question set issued — awaiting Amit's attempts, then review.

### `feature/validation-zod-datastructure`

- **Topic:** Request validation with Zod (schema → inferred DTO → `validateRequest` middleware →
  typed controller → route), on Express 5 + MongoDB.
- **Deliverables created (by Claude):**
  - Root [`README.md`](README.md) — the teaching reference for the Zod validation pattern, using a
    `user` resource. Includes the corrected best-practice code (string+regex phone, Express 5
    `req.query` getter gotcha, Zod v4 `z.email()`/`z.coerce`/`z.flattenError`).
  - [`src/practise/EXERCISE.md`](src/practise/EXERCISE.md) — a **spec-only** practice brief
    (no solution code) for Amit to implement himself.
- **What Amit is implementing himself** (Product inventory API, all under `src/practise/`):
  `product.model.ts`, `product.schema.ts`, `product.service.ts`, `product.controller.ts`,
  `product.route.ts` — plus infra: implement `src/middlewares/validateRequest.ts`, add `MONGO_URI`
  to `src/config/env.ts`, wire `src/config/mongoose.ts`, connect DB in `src/server.ts`, mount the
  router in `src/app.ts`.
- **When reviewing his solution, check against:** the field spec + the 4 (+1 bonus) endpoint
  contracts + the self-check rubric in [`EXERCISE.md`](src/practise/EXERCISE.md) §1–§6. Key points:
  validation runs at the edge (bad input → 400 *before* controller), unknown id → 404 (not 500),
  query numbers coerced + defaulted, `validateRequest` uses `Object.defineProperty` (Express 5),
  controllers use `TypedRequest*` + `catchAsync`, `npx tsc --noEmit` clean.
- **Status:** Exercise issued — awaiting Amit's implementation, then review.

---

## Commands

```bash
# Development (watch mode: rebuilds and restarts on src changes)
npm run dev

# Build (bundles TypeScript via esbuild into dist/)
npm run build

# Production start (runs build first, then node dist/server.js)
npm start
```

No test runner is configured yet (`npm test` exits with an error).

---

## Build System

TypeScript is **not transpiled by tsc** — it is bundled by **esbuild** directly from `src/server.ts` as the entry point, with `--packages=external` (so `node_modules` are not bundled). Output goes to `dist/server.js`. The `tsconfig.json` is used only for type checking, not for emitting files.

```bash
# Type-check without building
npx tsc --noEmit
```

**esbuild flags explained:**
- `--bundle` — resolves and inlines local imports
- `--platform=node` — Node.js built-ins treated correctly
- `--format=esm` — ESM output (required because `"type": "module"` in package.json)
- `--packages=external` — node_modules not bundled (loaded by Node at runtime)
- `--outdir=dist` — output directory

---

## Environment Variables (Professional Pattern)

### Files

| File | Committed? | Purpose |
|------|-----------|---------|
| `.env.example` | **Yes** | Template with all keys, fake/placeholder values. Tells new devs what vars are needed. |
| `.env.development` | No | Local dev values |
| `.env.staging` | No | Staging server values |
| `.env.production` | No | Production values (set by deployment platform, rarely a file) |
| `.env` | No | Legacy fallback — avoid using in new projects |

**Rule:** Only `.env.example` is ever committed. All real env files are in `.gitignore`.

### How it works

`NODE_ENV` is **never** read from a `.env` file — it is injected by the npm script or the deployment platform (Heroku, Railway, AWS, etc.):

```json
"dev": "NODE_ENV=development nodemon ..."
```

`src/config/env.ts` then loads the matching file:

```ts
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
// → loads .env.development in dev, .env.production in prod
```

### Cross-platform note
`NODE_ENV=development` in `package.json` scripts works on Linux/Mac but **not Windows** natively. The professional fix is `cross-env`:

```bash
npm install --save-dev cross-env
# then in scripts:
"dev": "cross-env NODE_ENV=development nodemon ..."
```

This repo targets Linux/production, so `cross-env` is omitted — but add it if working on Windows.

### Onboarding a new developer
```bash
cp .env.example .env.development
# fill in real values, then:
npm run dev
```

---

## Architecture

### Entry Points
- `src/server.ts` — creates the HTTP server, starts listening, registers process-level error handlers (`uncaughtException`, `unhandledRejection`)
- `src/app.ts` — creates and configures the Express app, mounts routes under `/api/v1`

### Module Structure
Each domain feature lives under `src/modules/<feature>/` with the files:
- `<feature>.route.ts` — Express Router, wired into `app.ts`
- `<feature>.controller.ts` — route handlers, always wrapped in `catchAsync`
- `<feature>.service.ts` — business logic
- `<feature>.model.ts` — Mongoose model
- `<feature>.schema.ts` — Zod validation schema
- `<feature>.test.ts` — tests

### Key Utilities & Conventions
- **`src/utils/AppError.ts`** — custom error class; sets `isOperational: true` for expected errors. Throw `new AppError(message, statusCode)` for all handled errors.
- **`src/utils/catchAsync.ts`** — wraps async controller functions to forward errors to Express's error handler automatically. All controllers must use it.
- **`src/middlewares/globalErrorHandler.ts`** — Express 4-arg error handler. In `development`, sends full error + stack; in `production`, only exposes `isOperational` errors to the client.
- **`src/middlewares/validateRequest.ts`** — Zod request validation middleware (stub, to be implemented).
- **`src/middlewares/requireSignIn.ts`** — JWT auth middleware.
- **`src/config/env.ts`** — single source of truth for env vars (loaded via `dotenv/config`). Add new env vars here.

### Infrastructure Configs (stubs)
- `src/config/mongoose.ts` — MongoDB/Mongoose connection
- `src/config/redis.ts` — Redis client
- `src/config/socket.ts` — Socket.IO setup
- `src/config/dynamodb.ts` — AWS DynamoDB client

### TypeScript Strictness
The `tsconfig.json` enables very strict checks: `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. These will cause build errors if violated.

### Express 5 Notes
- Bare `*` wildcard routes are not valid — use named wildcards like `*splat`
- `path-to-regexp` v8 is strict about parameter naming
