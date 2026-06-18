# Node.js TypeScript Backend — Boilerplate Setup Guide

This branch is the **base boilerplate** for all skill branches in this repo. Every new `feature/*` branch forks from here so you never write this setup from scratch again.

Stack: **Node.js + TypeScript + Express 5 + esbuild + Zod + ESM**

---

## Folder Structure

```
project-root/
├── src/
│   ├── server.ts              # Entry point — starts HTTP server, handles process errors
│   ├── app.ts                 # Express app — middleware, routes
│   ├── config/
│   │   ├── env.ts             # All env vars in one place (source of truth)
│   │   ├── mongoose.ts        # MongoDB connection (stub)
│   │   ├── redis.ts           # Redis client (stub)
│   │   ├── socket.ts          # Socket.IO setup (stub)
│   │   └── dynamodb.ts        # DynamoDB client (stub)
│   ├── middlewares/
│   │   ├── globalErrorHandler.ts   # Centralized Express error handler
│   │   ├── requireSignIn.ts        # JWT auth middleware (stub)
│   │   └── validateRequest.ts      # Zod validation middleware (stub)
│   ├── modules/
│   │   └── <feature>/         # One folder per domain
│   │       ├── <feature>.route.ts
│   │       ├── <feature>.controller.ts
│   │       ├── <feature>.service.ts
│   │       ├── <feature>.model.ts
│   │       ├── <feature>.schema.ts
│   │       └── <feature>.test.ts
│   ├── utils/
│   │   ├── AppError.ts        # Custom error class
│   │   └── catchAsync.ts      # Async controller wrapper
│   └── lib/                   # Third-party wrappers / shared logic
├── dist/                      # Build output (gitignored)
├── .env.example           # Committed — template with all keys, fake values
├── .env.development       # Gitignored — your local dev values
├── package.json
└── tsconfig.json
```

---

## Step-by-Step Setup from Scratch

### Step 1 — Init project

```bash
mkdir my-project && cd my-project
npm init -y
npm pkg set type=module
```

### Step 2 — Install production dependencies

```bash
npm install express mongoose cors helmet morgan xss-clean jsonwebtoken zod dotenv winston
```

### Step 3 — Install dev dependencies

```bash
npm install -D typescript @types/node @types/express @types/cors @types/morgan @types/jsonwebtoken esbuild rimraf nodemon ts-node concurrently
```

### Step 4 — Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "es2022",
    "target": "es2022",
    "lib": ["es2022"],
    "types": ["node"],
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "sourceMap": true,
    "declaration": false,
    "declarationMap": false,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "strict": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "ignoreDeprecations": "6.0",
    "baseUrl": ".",
    "paths": {
      // One catch-all alias for everything under src/ — import as "@/config/env", "@/utils/catchAsync", etc.
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5 — Configure `package.json` scripts

```json
{
  "main": "dist/server.js",
  "type": "module",
  "scripts": {
    "build": "rimraf dist && esbuild src/server.ts --bundle --platform=node --format=esm --packages=external --outdir=dist",
    "start": "NODE_ENV=production node dist/server.js",
    "prestart": "npm run build",
    "dev": "NODE_ENV=development nodemon --watch src --ext ts --exec \"npm run build && node dist/server.js\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### Step 6 — Set up environment files

**Professional pattern — never commit real env values:**

| File | Committed? | Purpose |
|------|-----------|---------|
| `.env.example` | **Yes** | Template with all keys, fake values — tells new devs what vars are needed |
| `.env.development` | No | Local dev values |
| `.env.staging` | No | Staging server values |
| `.env.production` | No | Production values (usually set by platform dashboard, not a file) |

`.gitignore` pattern:
```
.env
.env.*
!.env.example
```
The `!` un-ignores `.env.example` so it **is** committed despite the `.*` rule.

**`NODE_ENV` is never set inside a `.env` file.** It must be set before the process starts —
otherwise `env.ts` can't know which file to load (chicken-and-egg). Set it explicitly in **both**
scripts so the matching `.env.*` loads: `development` for `dev`, `production` for `start`.

```json
"scripts": {
  "dev":   "NODE_ENV=development nodemon ...",
  "start": "NODE_ENV=production node dist/server.js"
}
```

> On a real host (Heroku, Railway, AWS, Render) the platform usually sets `NODE_ENV=production` in
> the environment itself — that's fine, it just matches what the script sets. Keeping it in the
> script means `npm start` also loads `.env.production` correctly when you run a prod build locally.

> **Cross-platform note:** `NODE_ENV=x` in scripts works on Linux/Mac but fails on Windows. The fix is `npm install -D cross-env` and prefix scripts with `cross-env NODE_ENV=development`.

**Onboarding a new developer:**
```bash
cp .env.example .env.development
# fill in real values
npm run dev
```

### Step 7 — Create `src/config/env.ts`

Single source of truth for all environment variables. Add every new env var here — never read `process.env` directly anywhere else in the codebase.

Loads the right file based on `NODE_ENV`:

```ts
import dotenv from "dotenv";

const nodeEnv = process.env["NODE_ENV"] ?? "development";
dotenv.config({ path: `.env.${nodeEnv}` });

const ENV = {
  NODE_ENV: nodeEnv,
  PORT: process.env["PORT"] ?? 6001,
} as const;

export default ENV;
```

### Step 8 — Create `src/server.ts`

Responsibilities:
- Create the HTTP server (`createServer(app)`)
- Start listening on the port from `env.ts`
- Register `uncaughtException` handler **before** anything else (sync errors)
- Register `unhandledRejection` handler **after** `startServer()` (async errors — graceful shutdown)

### Step 9 — Create `src/app.ts`

Build the Express app in this exact order (order matters):

1. `helmet()` — secure HTTP headers
2. `cors()` + `app.options("*splat", cors())` — CORS (Express 5: wildcards **must** be named)
3. `express.json()` — parse JSON bodies
4. `morgan(...)` — request logging (`"dev"` in development, `"combined"` in production)
5. Mount module routers under `/api/v1` (e.g. `app.use("/api/v1", userRoute)`)
6. **404 catch-all** — a path-less `app.use((_req, _res, next) => next(new AppError("Invalid url", 404)))`
7. `globalErrorHandler` **last** — Express only treats a 4-arg function as an error handler, and it must come after everything so thrown `AppError`s reach it

### Step 10 — Create utilities

**`src/utils/AppError.ts`** — extend `Error` with `statusCode`, `status`, and `isOperational: true`. Only operational errors are exposed to the client in production.

**`src/utils/catchAsync.ts`** — wraps async route handlers. Without this, any `async` controller that throws will hang the request. All controllers must use it.

### Step 11 — Create `src/middlewares/globalErrorHandler.ts`

- In `development`: send full error + stack to client
- In `production`: only send message if `err.isOperational === true`, otherwise send generic "Something went wrong"

### Step 12 — Create your first feature module

Each domain lives under `src/modules/<feature>/`. A minimal module is a **controller** + a **route**;
add `schema` / `service` / `model` as the feature needs them.

```ts
// src/modules/users/user.controller.ts
import catchAsync from "@/utils/catchAsync";
import type { Request, Response } from "express";

// Plain Request/Response. Once you add Zod validation, bind the DTO with `as`:
//   const body = req.body as CreateUserDto;
export const addUser = catchAsync(async (req: Request, res: Response) => {
  const newUser = req.body;
  res.status(201).json({ status: "success", data: newUser });
});
```

```ts
// src/modules/users/user.route.ts
import { Router } from "express";
import { addUser } from "./user.controller"; // relative import for same-folder siblings

const router = Router();
router.post("/users", addUser);

export default router;
```

Then mount it in `app.ts` (Step 9): `import userRoute from "@/modules/users/user.route"` and
`app.use("/api/v1", userRoute)` — giving `POST /api/v1/users`.

> **Conventions:** controllers are always wrapped in `catchAsync`; throw `new AppError(msg, status)`
> for handled errors (it reaches `globalErrorHandler`); controllers use plain `Request`/`Response`
> and bind validated data with `as Dto` — no custom request-type helpers.

---

## Key Concepts

### Why esbuild instead of tsc?

`tsc` compiles TypeScript but is slow. `esbuild` is 10–100x faster and resolves path aliases natively by **reading them straight from `tsconfig.json`**. `tsc` is only used for type checking (`npm run typecheck`), not for producing output files.

### Why `--packages=external`?

Without this flag, esbuild bundles all `node_modules` into one file. This causes issues because:
- Many npm packages (like Express) use CommonJS `require()` internally
- Bundling them into ESM format breaks dynamic requires
- Bundle size balloons to 1MB+

With `--packages=external`, Node.js loads packages normally at runtime and only your source code is compiled.

### Path aliases — one place, `@/*`

Define the alias **once** in `tsconfig.json` → `paths`. Both consumers read it from there:

| Tool | How it learns the alias |
|------|-------------------------|
| TypeScript (editor + `npm run typecheck`) | reads `tsconfig.json` → `paths` |
| esbuild (the build) | also reads `tsconfig.json` → `paths` automatically |

A single catch-all `"@/*": ["src/*"]` covers the whole tree — import as `@/config/env`,
`@/utils/catchAsync`, `@/modules/...`. No per-folder aliases, and **no duplicate `--alias` flags in
the build script** to keep in sync.

> **Never name an alias `@types/*`.** That prefix is the reserved npm scope for DefinitelyTyped
> packages (`@types/node`, `@types/express`); TypeScript hard-rejects any import string starting with
> `@types/` (**TS6137**), even when `paths` maps it to your own folder. `@/*` sidesteps the issue
> entirely — one more reason to prefer it.

### Why `"type": "module"` in package.json?

This makes Node.js treat all `.js` files as ESM. It requires esbuild to output `--format=esm`. The tradeoff is that CommonJS patterns (`require`, `__dirname`, `__filename`) don't work — use `import.meta.url` instead if needed.

### Error Handling Flow

```
Async controller throws
  → catchAsync forwards to next(err)
    → globalErrorHandler receives it
      → development: full error + stack
      → production: operational errors only, generic message otherwise
```

---

## Commands

```bash
npm run dev        # Watch mode — rebuilds and restarts on every src change
npm run build      # One-time production build → dist/server.js
npm start          # Builds then runs (for deployment)
npm run typecheck  # Type check without building
```

---

## Gotchas

- **Express 5**: wildcard routes must be named — use `*splat` not `*`
- **Path aliases live in one place** (`tsconfig.json` → `paths`): use a single `@/*` → `src/*`; esbuild reads it too, so no `--alias` flags. Never name an alias `@types/*` (reserved scope → TS6137)
- **Never spread an `Error`**: `{ ...err }`, `Object.assign`, and `JSON.stringify` drop the **non-enumerable** `message` and `stack`. Read those fields explicitly; in `globalErrorHandler` pass the real instance, don't clone it
- **`baseUrl` deprecated in TS 6**: suppress with `"ignoreDeprecations": "6.0"` — still required for `paths` to work until TS 7 ships a replacement
- **`noUnusedLocals` / `noUnusedParameters`**: these are on — prefix with `_` to suppress (e.g. `_req`, `_next`)
- **`verbatimModuleSyntax`**: forces you to use `import type` for type-only imports — the compiler will error if you don't
