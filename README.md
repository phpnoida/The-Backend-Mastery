# Request Validation with Zod — Type-Safe API Boundaries

This branch (`feature/validation-zod-datastructure`) demonstrates the **production pattern for
validating incoming HTTP requests** with [Zod](https://zod.dev) on top of the Express 5 + TypeScript
boilerplate.

The core idea: **one Zod schema per resource is the single source of truth** — it validates data at
runtime *and* generates the TypeScript types (DTOs) your controllers and services consume. No
duplicate `interface` definitions, no untyped `req.body`, no validation logic scattered across
controllers.

Stack: `zod@4` · `express@5` · `typescript@6` (strict)

---

## The Validation Flow

```
            ┌─────────────────────────── route layer ───────────────────────────┐
HTTP request ──▶ validateRequest(schema, "body" | "query" | "params")
                        │
                        ├─ schema.safeParse(req[source])
                        │
              fail ◀────┤────▶ ok
                │              │
   next(new AppError(400)) │  req[source] = parsed (coerced + defaults applied)
                │              │
                ▼              ▼
        globalErrorHandler   typed controller (req.body/params/query fully typed)
```

Validation happens **at the edge** — before any controller or service runs. By the time your
business logic executes, the data is already shape-checked, coerced, and typed.

---

## Step 1 — Write the schema (`user.schema.ts`)

Define one schema per request shape: **create**, **update**, **query**, **params**.

```ts
import { z } from "zod";

// POST body — creating a user
const userCreateSchema = z.object({
  fName: z.string().min(2).max(50),
  lName: z.string().min(2).max(50).optional(),
  email: z.email(),                                    // ① v4 top-level validator
  phone: z.string().regex(/^\d{10}$/, "phone must be exactly 10 digits"), // ② string, not number
});

// PATCH body — every field optional, derived from create (DRY)
const userUpdateSchema = userCreateSchema.partial();

// GET ?page=&limit=&sort=&sortBy= — query values always arrive as strings
const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),     // ③ coerce "2" → 2
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("asc"),
  sortBy: z.enum(["fName", "lName", "email", "phone"]).default("fName"),
});

// :_id route param — Mongo ObjectId (24 hex chars)
const userParamsSchema = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i, "invalid id"), // ④ stricter than .length(24)
});
```

### Why these differ from the "first draft"

| # | Common mistake | Why it's wrong | Fix |
|---|----------------|----------------|-----|
| ① | `z.string().email()` | Deprecated in Zod **v4** | `z.email()` (top-level) |
| ② | `z.coerce.number().min(10).max(10)` for phone | On a *number*, `.min/.max` bound the **value**, not the digit count — this only accepts the number `10` | `z.string().regex(/^\d{10}$/)` |
| ③ | `z.number()` for `page`/`limit` | Query params are **strings** (`?page=2` → `"2"`), so a plain number schema always fails | `z.coerce.number()` |
| ④ | `z.string().min(24).max(24)` | Accepts any 24-char string, including non-hex | `.regex(/^[a-f\d]{24}$/i)` |

> `.min(24).max(24)` on a **string** *does* check length (string `.min/.max` = length), so it wasn't
> broken — but a regex actually validates the ObjectId format. On a **number** the same methods mean
> something completely different. Know which type you're constraining.

---

## Step 2 — Infer the DTOs

Don't hand-write interfaces. Derive the types straight from the schemas with `z.infer` so they can
**never drift** out of sync with validation.

```ts
type UserCreateDto = z.infer<typeof userCreateSchema>;
type UserUpdateDto = z.infer<typeof userUpdateSchema>;
type UserQueryDto = z.infer<typeof userQuerySchema>;
type UserParamsDto = z.infer<typeof userParamsSchema>;

export {
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
  userParamsSchema,
  type UserCreateDto,
  type UserUpdateDto,
  type UserQueryDto,
  type UserParamsDto,
};
```

`UserQueryDto.page` is typed as `number` (the **output** type, after coercion + defaults), even
though the wire value was a string. `z.infer` always gives you the parsed shape — exactly what your
controller receives.

---

## Step 3 — The `validateRequest` middleware

A single reusable middleware factory: pass it a schema and which part of the request to validate.

```ts
// src/middlewares/validateRequest.ts
import { type ZodType } from "zod";
import { type Request, type Response, type NextFunction } from "express";
import AppError from "@/utils/AppError";

type RequestSource = "body" | "query" | "params";

const validateRequest =
  (schema: ZodType, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      return next(new AppError(message, 400));
    }

    // Express 5: req.query / req.params are GETTER-ONLY — `req.query = ...` throws.
    // defineProperty shadows the getter with the parsed (coerced + defaulted) value
    // so downstream controllers see the clean data, not the raw strings.
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });

    next();
  };

export default validateRequest;
```

### Why it's written this way

- **`safeParse`, not `parse`** — `parse` *throws* a `ZodError`. `safeParse` returns a discriminated
  `{ success, data | error }` result, so we control how the error becomes an `AppError`. No `try/catch`.
- **Re-assigning `req[source]`** — this is the step most tutorials forget. After coercion (`"2"` → `2`)
  and defaults (`limit` → `10`), the **parsed** data only exists in `result.data`. If you don't write
  it back, the controller still reads the raw, uncoerced request.
- **`Object.defineProperty` instead of `req.query = result.data`** — ⚠️ **Express 5 changed `req.query`
  and `req.params` into read-only getters.** Direct assignment throws `Cannot set property query of
  #<IncomingMessage> which has only a getter`. `defineProperty` installs an own property on the
  request that shadows the prototype getter. This is the #1 Express-4-to-5 validation bug — most
  blog posts predate Express 5 and use the broken assignment.
- **`_res`** — unused, prefixed with `_` to satisfy `noUnusedParameters` (on in this repo's tsconfig).

> **Level-up (production APIs):** clients usually want a structured `errors[]`, not one joined string.
> Extend `AppError` to carry a `details` field and pass `z.flattenError(result.error).fieldErrors`
> into it, then surface that in `globalErrorHandler`. Kept simple here so the flow stays readable.

---

## Step 4 — Typed controllers (`user.controller.ts`)

Use plain `Request`/`Response` from Express. Zod already validated the request at the route (Step 5),
so inside the controller you read the data and bind the **inferred DTO** with an `as` cast. Every
handler stays wrapped in `catchAsync` so thrown/rejected errors reach the global handler.

```ts
import { type Request, type Response } from "express";
import catchAsync from "@/utils/catchAsync";
import {
  type UserCreateDto,
  type UserUpdateDto,
  type UserQueryDto,
  type UserParamsDto,
} from "./user.schema";

// body validated upstream → bind the DTO
export const createUser = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as UserCreateDto;
  res.status(201).json({ status: "success", data: body });
});

// query values are coerced (page/limit are numbers here) — see the ParsedQs note below
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as UserQueryDto;
  res.status(200).json({ status: "success", query });
});

// update reads BOTH the param and the body — one cast per source
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.params as UserParamsDto;
  const body = req.body as UserUpdateDto;
  res.status(200).json({ status: "success", id: _id, data: body });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.params as UserParamsDto;
  res.status(204).json({ status: "success", id: _id });
});
```

### The `as` is honest — because validation already ran

Express types `req.body` as `any` (middleware runs at **runtime**; types are **compile-time**, so TS
can't see that `validateRequest` cleaned the data). The cast is how you carry Zod's runtime guarantee
into the type system — safe **only because the middleware ran first**:

| Situation | Write | Why it's safe |
|-----------|-------|---------------|
| `validateRequest` ran on the route | `const body = req.body as Dto` | cast states a guarantee that already holds |
| No middleware on that route | `const body = schema.parse(req.body)` | validates itself; type comes from the return |
| never | `as` with **no** validation anywhere | an unchecked lie — runtime bug waiting to happen |

> **Why `req.query` needs `as unknown as Dto`** (the double cast): Express 5 types `req.query` as
> `ParsedQs` (everything string-ish). Your schema **coerces** `page`/`limit` to numbers, so the DTO
> and `ParsedQs` don't overlap and TS needs the `unknown` hop. `req.body` (typed `any`) and
> `req.params` (a string index signature) don't need it.

> **Don't build custom `Request<...>` typing helpers.** It's tempting to wrap these casts in generic
> request types so `req.body` is "auto-typed" — but that adds autocomplete and **zero** runtime safety
> (Zod owns safety), hides the exact same assertion, and breaks on coerced query types. Plain
> `Request` + an explicit `as` is what most Express + TS codebases use. Keep it visible.

> **At scale:** when `as Dto` in every file gets repetitive (~100 controllers), centralize it once — a
> typed **route factory** (`route({ body: schema }, handler)` that parses + types in one place), or a
> framework that owns validation→typing end-to-end (**Fastify** zod type-provider, **NestJS** pipes,
> **tRPC**). Learn the explicit pattern now so you recognize what those tools automate later.

---

## Step 5 — Wire validation into routes (`user.route.ts`)

`validateRequest` runs **before** the controller. Validate multiple sources by chaining it — e.g.
an update needs both the `:_id` param *and* the body checked:

```ts
import { Router } from "express";
import validateRequest from "@/middlewares/validateRequest";
import {
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
  userParamsSchema,
} from "./user.schema";
import { createUser, listUsers, updateUser, deleteUser } from "./user.controller";

const router = Router();

router
  .route("/users")
  .post(validateRequest(userCreateSchema), createUser)          // defaults to "body"
  .get(validateRequest(userQuerySchema, "query"), listUsers);

router
  .route("/users/:_id")
  .patch(
    validateRequest(userParamsSchema, "params"),                // ① check the id
    validateRequest(userUpdateSchema),                          // ② then the body
    updateUser
  )
  .delete(validateRequest(userParamsSchema, "params"), deleteUser);

export default router;
```

The router is mounted under `/api/v1` in [`src/app.ts`](src/app.ts), so the full paths are
`/api/v1/users` and `/api/v1/users/:_id`.

---

## Module Skeleton — Reference Template

A complete `user` module with the **logic stubbed out** — copy this shape for any new resource.
Five files, each with one job: **model → schema → service → controller → route**.

### Naming: controller vs service

The two layers use **different verbs on purpose** so they never read as duplicates:

| Endpoint | Controller (HTTP action) | Service (data operation) |
|----------|--------------------------|--------------------------|
| `POST /users` | `createUser` | `userService.create` |
| `GET /users` | `getUsers` | `userService.findAll` |
| `GET /users/:_id` | `getUser` | `userService.findById` |
| `PATCH /users/:_id` | `updateUser` | `userService.update` |
| `DELETE /users/:_id` | `deleteUser` | `userService.remove` |

- **Controller** names describe the **HTTP intent** ("handle the create-user request").
- **Service** names describe the **persistence intent** ("find the user in Mongo"). Group them under
  one `userService` object so call sites read `userService.findById(id)` — the resource lives in the
  object name, not repeated in every method.

### `user.model.ts` — Mongoose model (types inferred, never hand-written)

```ts
import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const userSchema = new Schema(
  {
    fName: { type: String, required: true, trim: true },
    lName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
  },
  { timestamps: true } // adds createdAt / updatedAt
);

export type UserType = InferSchemaType<typeof userSchema>; // plain object shape
export type UserDoc = HydratedDocument<UserType>;          // a live document (_id, .save(), ...)

export const User = model("User", userSchema);
```

### `user.schema.ts` — Zod (request validation + DTOs)

Exactly **Step 1 + Step 2** above: the Zod schemas and their `z.infer` DTOs
(`UserCreateDto`, `UserUpdateDto`, `UserQueryDto`, `UserParamsDto`).

### `user.service.ts` — the data layer (this is where autocomplete lives)

```ts
import { User, type UserDoc } from "./user.model";
import type { UserCreateDto, UserUpdateDto, UserQueryDto } from "./user.schema";

// Methods named after the DATA operation, grouped under one object.
// The explicit return types (UserDoc / UserDoc | null) are what give CALLERS autocomplete.
export const userService = {
  create(data: UserCreateDto): Promise<UserDoc> {
    // your logic goes here →  return User.create(data);
  },

  findAll(query: UserQueryDto): Promise<UserDoc[]> {
    // your logic goes here →  build filter from query, then User.find(filter).sort(...).skip(...).limit(...)
  },

  findById(id: string): Promise<UserDoc | null> {
    // your logic goes here →  return User.findById(id);   // null when missing → controller makes it a 404
  },

  update(id: string, data: UserUpdateDto): Promise<UserDoc | null> {
    // your logic goes here →  return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  remove(id: string): Promise<UserDoc | null> {
    // your logic goes here →  return User.findByIdAndDelete(id);
  },
};
```

**How autocomplete works here** (the part tutorials skip):

1. `User` is a **typed model** — `InferSchemaType` read your schema, so `User.findById(...)` already
   resolves to `UserDoc | null`. Type `User.` and the editor lists every model method.
2. Inside a method, the awaited doc is a `UserDoc`, so `user.email`, `user.fName`, `user._id` all
   autocomplete from the schema — no hand-written `interface`.
3. The **explicit return type** on each method is what makes the *controller* autocomplete: when it
   writes `const user = await userService.findById(id)`, `user` is known to be `UserDoc | null`
   without the controller importing anything Mongoose-specific.

> Two sources of truth, cleanly split: the **Mongoose schema** generates the document type
> (`UserDoc`); the **Zod schema** generates the request DTOs. The service is the *only* layer that
> touches the database.

### `user.controller.ts` — the HTTP layer (thin: validation done, call service, respond)

```ts
import { type Request, type Response } from "express";
import catchAsync from "@/utils/catchAsync";
import AppError from "@/utils/AppError";
import { userService } from "./user.service";
import type { UserCreateDto, UserParamsDto } from "./user.schema";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as UserCreateDto;        // validated upstream by validateRequest
  const user = await userService.create(body);   // `user` is UserDoc — full autocomplete
  // your logic goes here (anything extra before responding)
  res.status(201).json({ status: "success", data: user });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.params as UserParamsDto;
  const user = await userService.findById(_id);
  if (!user) throw new AppError("User not found", 404); // unknown id → 404, not 500
  res.status(200).json({ status: "success", data: user });
});
```

### `user.route.ts` — validate, then hand off to the controller

```ts
import { Router } from "express";
import validateRequest from "@/middlewares/validateRequest";
import { userCreateSchema, userParamsSchema } from "./user.schema";
import { createUser, getUser } from "./user.controller";

const router = Router();
router.post("/users", validateRequest(userCreateSchema), createUser);
router.get("/users/:_id", validateRequest(userParamsSchema, "params"), getUser);

export default router;
```

**The request's life:** `route` (validate) → `controller` (HTTP) → `service` (DB) → `model` (Mongoose).
Each layer only knows the one directly below it.

---

## Error Handling — how a bad request becomes a clean 400

The pieces already in the boilerplate connect into one pipeline:

```
schema.safeParse fails
  → validateRequest calls next(new AppError(message, 400))   // isOperational: true
    → globalErrorHandler (src/middlewares/globalErrorHandler.ts)
        ├─ development : full message + stack + error object
        └─ production  : { status: "fail", message }   (operational errors only)
```

Because `AppError` sets `isOperational: true`, the validation message **is** exposed to the client in
production (it's a 4xx the caller can act on). Unexpected 5xx errors stay hidden behind a generic
"Something went wrong!" — see [`globalErrorHandler.ts`](src/middlewares/globalErrorHandler.ts).

---

## API Response Standard

Every route returns the **same envelope** so the frontend writes its response-handling logic once and
trusts it everywhere. This project uses the **JSend** convention (`status: "success" | "fail" | "error"`).

### The envelope

```jsonc
// success — single resource
{ "status": "success", "data": { "fName": "Amit", "email": "amit@example.com" } }

// success — list, with response metadata as TOP-LEVEL siblings of `data`
{
  "status": "success",
  "results": 20,                              // metadata about the response
  "meta": { "page": 2, "limit": 10, "total": 57 },
  "data": { "users": [ /* ... */ ] }          // the actual payload
}

// fail — client's fault (validation, bad id) → 4xx
{ "status": "fail", "message": "phone must be exactly 10 digits" }

// error — server's fault (unexpected exception) → 5xx
{ "status": "error", "message": "Something went wrong!" }
```

### The three rules

| Rule | Why |
|------|-----|
| **HTTP status code is the source of truth** | The transport-level signal. HTTP clients (`axios`/`fetch`) branch on it automatically — `2xx` resolves, `4xx`/`5xx` rejects. **Always set the real code** (`AppError(msg, 404)`). Never return `200` with `{ status: "fail" }` — that breaks every client's error handling. |
| **The body field is secondary** | `status` + `message` confirm the outcome and carry the human-readable text. Control flow keys off the HTTP code; *what you show the user* comes from the body. |
| **Payload → inside `data`; metadata → top-level** | Resource fields nest inside `data`. Info *about the response* (pagination, counts, request id) sit beside `data`, or grouped under `meta` — they describe the response, not the resource. |

> **`success`/`fail`/`error` maps onto `AppError`:** `fail` = operational 4xx the caller can act on
> (exposed in production), `error` = unexpected 5xx hidden behind a generic message. This is exactly
> what [`globalErrorHandler.ts`](src/middlewares/globalErrorHandler.ts) already does.

**The deciding question for any key:** *is this part of the thing the client asked for (→ `data`),
or info about the response itself (→ top-level / `meta`)?* Above all — **pick one shape and use it on
every route.** A consistent, boring envelope is worth more than a clever one.

---

## Best-Practice Checklist

- ✅ **Validate at the edge** — in middleware, before controllers. Controllers assume valid input.
- ✅ **One schema = source of truth** — runtime validation *and* the TS type (`z.infer`). Never both.
- ✅ **Coerce query & params** — they're always strings on the wire; use `z.coerce.*` + `.default()`.
- ✅ **Write the parsed data back** to `req[source]`, or coercion/defaults are silently lost.
- ⚠️ **Express 5: `req.query`/`req.params` are getter-only** — use `Object.defineProperty`, never `=`.
- ✅ **`safeParse` over `parse`** in middleware — turn the result into an `AppError`, skip `try/catch`.
- ✅ **`.partial()` for updates** — derive the update schema from create; don't duplicate fields.
- ✅ **Plain `Request`/`Response` in controllers** — bind validated data with `as Dto` (or `schema.parse`); no custom typed-request helpers.
- ✅ **`import type` for type-only imports** — required by `verbatimModuleSyntax` in this tsconfig.
- ✅ **Prefix unused params with `_`** — `noUnusedParameters` is on (e.g. `_res`).

---

## Try It

```bash
npm run dev
```

```bash
# ✅ valid create
curl -X POST http://localhost:6001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"fName":"Amit","email":"amit@example.com","phone":"9876543210"}'

# ❌ bad email + 3-digit phone → 400 with field-level message
curl -X POST http://localhost:6001/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"fName":"A","email":"not-an-email","phone":"123"}'
# → { "status": "fail", "message": "fName: ...; email: ...; phone: phone must be exactly 10 digits" }

# ✅ query coercion + defaults — omit params and watch them fill in
curl "http://localhost:6001/api/v1/users?page=2"
# → query: { page: 2, limit: 10, sort: "asc", sortBy: "fName" }

# ❌ invalid ObjectId → 400
curl -X DELETE http://localhost:6001/api/v1/users/123
```

---

## File Map

| File | Role |
|------|------|
| [`src/modules/users/user.model.ts`](src/modules/users/user.model.ts) | Mongoose schema + model; `UserDoc` type via `InferSchemaType` |
| [`src/modules/users/user.schema.ts`](src/modules/users/user.schema.ts) | Zod schemas + inferred DTOs (request source of truth) |
| [`src/modules/users/user.service.ts`](src/modules/users/user.service.ts) | Data layer — `create`/`findAll`/`findById`/`update`/`remove`; only layer touching the DB |
| [`src/middlewares/validateRequest.ts`](src/middlewares/validateRequest.ts) | Reusable `validateRequest(schema, source)` factory |
| [`src/modules/users/user.controller.ts`](src/modules/users/user.controller.ts) | HTTP layer — bind DTOs with `as`, call the service, respond |
| [`src/modules/users/user.route.ts`](src/modules/users/user.route.ts) | Routes with validation chained before each controller |
| [`src/utils/AppError.ts`](src/utils/AppError.ts) | Operational error class (`isOperational: true`) |
| [`src/utils/catchAsync.ts`](src/utils/catchAsync.ts) | Async wrapper — forwards errors to `next()` |
| [`src/middlewares/globalErrorHandler.ts`](src/middlewares/globalErrorHandler.ts) | Dev/prod error formatting |
