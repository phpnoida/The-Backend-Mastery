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
│   ├── types/
│   │   └── express.ts         # Typed request helpers (TypedRequestBody etc.)
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
      "@modules/*": ["src/modules/*"],
      "@config/*":  ["src/config/*"],
      "@middlewares/*": ["src/middlewares/*"],
      "@utils/*":   ["src/utils/*"],
      // Don't name this "@types/*" — it collides with the reserved @types npm scope (TS6137). Use "@app-types/*".
      "@app-types/*": ["src/types/*"],
      "@lib/*":     ["src/lib/*"]
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
    "build": "rimraf dist && esbuild src/server.ts --bundle --platform=node --format=esm --packages=external --alias:@modules=./src/modules --alias:@config=./src/config --alias:@middlewares=./src/middlewares --alias:@utils=./src/utils --alias:@app-types=./src/types --alias:@lib=./src/lib --outdir=dist",
    "start": "node dist/server.js",
    "prestart": "npm run build",
    "dev": "nodemon --watch src --ext ts --exec \"npm run build && node dist/server.js\"",
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

**`NODE_ENV` is never set inside a `.env` file.** It must be set before the process starts — otherwise dotenv can't know which file to load (chicken-and-egg). Set it in the npm script for dev; let the deployment platform (Heroku, Railway, AWS, Render) set it for production.

```json
"scripts": {
  "dev":   "NODE_ENV=development nodemon ...",
  "start": "node dist/server.js"
}
```

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

Responsibilities:
- Create the Express app
- Apply global middleware (`express.json`, `cors`, `helmet`, `morgan`)
- Mount module routers under `/api/v1`
- Mount `globalErrorHandler` **last** (Express requires 4-arg error handlers to be at the end)

### Step 10 — Create utilities

**`src/utils/AppError.ts`** — extend `Error` with `statusCode`, `status`, and `isOperational: true`. Only operational errors are exposed to the client in production.

**`src/utils/catchAsync.ts`** — wraps async route handlers. Without this, any `async` controller that throws will hang the request. All controllers must use it.

### Step 11 — Create `src/middlewares/globalErrorHandler.ts`

- In `development`: send full error + stack to client
- In `production`: only send message if `err.isOperational === true`, otherwise send generic "Something went wrong"

### Step 12 — Create `src/types/express.ts`

Typed request helpers to avoid writing `Request<{}, {}, Body>` generics manually every time:
- `TypedRequestBody<T>`
- `TypedRequestParams<T>`
- `TypedRequestQuery<T>`
- `TypedRequest<TParams, TBody, TQuery>`

---

## Key Concepts

### Why esbuild instead of tsc?

`tsc` compiles TypeScript but is slow and requires extra config for path aliases. `esbuild` is 10–100x faster and handles path alias rewriting natively via `--alias` flags. `tsc` is only used for type checking (`npm run typecheck`), not for producing output files.

### Why `--packages=external`?

Without this flag, esbuild bundles all `node_modules` into one file. This causes issues because:
- Many npm packages (like Express) use CommonJS `require()` internally
- Bundling them into ESM format breaks dynamic requires
- Bundle size balloons to 1MB+

With `--packages=external`, Node.js loads packages normally at runtime and only your source code is compiled.

### Why path aliases need two places?

| Where | Tool | Why |
|-------|------|-----|
| `tsconfig.json` → `paths` | TypeScript | IDE autocomplete, go-to-definition, type checking |
| `package.json` → `--alias` | esbuild | Rewrites aliases in the compiled output at build time |

They must be kept in sync. If you add a new alias in `tsconfig`, add the matching `--alias` flag to the build script.

> **Never name an alias `@types/*`.** That prefix is the reserved npm scope for DefinitelyTyped packages (`@types/node`, `@types/express`). TypeScript hard-rejects any import string starting with `@types/` (error **TS6137**: *"Cannot import type declaration files"*) — even when your `paths` correctly map it to your own `src/types`. The check is on the *literal import string*, not where it resolves, so the alias looks right but still red-lines. Use a distinct name like `@app-types/*` for your own typed-request helpers.

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
- **Path alias `@types/*` is forbidden**: collides with the reserved npm scope → TS6137. Use `@app-types/*` (see *Why path aliases need two places?*)
- **`catchAsync` must be generic**: type it `<P, ResBody, ReqBody, ReqQuery>` over `Request<...>`, not a fixed `Request` — otherwise `TypedRequestParams`/`TypedRequestQuery` controllers fail with *"not assignable"* (TS2345)
- **Never spread an `Error`**: `{ ...err }`, `Object.assign`, and `JSON.stringify` drop the **non-enumerable** `message` and `stack`. Read those fields explicitly; in `globalErrorHandler` pass the real instance, don't clone it
- **`baseUrl` deprecated in TS 6**: suppress with `"ignoreDeprecations": "6.0"` — still required for `paths` to work until TS 7 ships a replacement
- **`noUnusedLocals` / `noUnusedParameters`**: these are on — prefix with `_` to suppress (e.g. `_req`, `_next`)
- **`verbatimModuleSyntax`**: forces you to use `import type` for type-only imports — the compiler will error if you don't
