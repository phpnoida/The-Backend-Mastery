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
import AppError from "@utils/AppError";

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

The repo already ships request-type helpers in [`src/types/express.ts`](src/types/express.ts) —
reuse them instead of writing `Request<{}, {}, Body>` generics by hand:

```ts
export type TypedRequestBody<T>   = Request<{}, {}, T>;
export type TypedRequestParams<T> = Request<T>;
export type TypedRequestQuery<T>  = Request<{}, {}, {}, T>;
export type TypedRequest<TParams, TBody, TQuery> = Request<TParams, {}, TBody, TQuery>;
```

Wire the DTOs in. Every handler stays wrapped in `catchAsync` so thrown/rejected errors reach the
global handler automatically:

```ts
import { type Response } from "express";
import catchAsync from "@utils/catchAsync";
import {
  type TypedRequestBody,
  type TypedRequestParams,
  type TypedRequestQuery,
  type TypedRequest,
} from "@types/express";
import {
  type UserCreateDto,
  type UserUpdateDto,
  type UserQueryDto,
  type UserParamsDto,
} from "./user.schema";

// req.body : UserCreateDto
export const createUser = catchAsync(
  async (req: TypedRequestBody<UserCreateDto>, res: Response) => {
    res.status(201).json({ status: "success", data: req.body });
  }
);

// req.query : UserQueryDto  (page/limit are already numbers here)
export const listUsers = catchAsync(
  async (req: TypedRequestQuery<UserQueryDto>, res: Response) => {
    res.status(200).json({ status: "success", query: req.query });
  }
);

// req.params : UserParamsDto, req.body : UserUpdateDto
export const updateUser = catchAsync(
  async (req: TypedRequest<UserParamsDto, UserUpdateDto, {}>, res: Response) => {
    res.status(200).json({ status: "success", id: req.params._id, data: req.body });
  }
);

// req.params : UserParamsDto
export const deleteUser = catchAsync(
  async (req: TypedRequestParams<UserParamsDto>, res: Response) => {
    res.status(204).json({ status: "success", id: req.params._id });
  }
);
```

Inside each handler, `req.body`, `req.params`, and `req.query` are fully typed and autocompleted —
no casts, no `as`. The validation at the route guarantees the runtime shape matches the type.

---

## Step 5 — Wire validation into routes (`user.route.ts`)

`validateRequest` runs **before** the controller. Validate multiple sources by chaining it — e.g.
an update needs both the `:_id` param *and* the body checked:

```ts
import { Router } from "express";
import validateRequest from "@middlewares/validateRequest";
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

## Best-Practice Checklist

- ✅ **Validate at the edge** — in middleware, before controllers. Controllers assume valid input.
- ✅ **One schema = source of truth** — runtime validation *and* the TS type (`z.infer`). Never both.
- ✅ **Coerce query & params** — they're always strings on the wire; use `z.coerce.*` + `.default()`.
- ✅ **Write the parsed data back** to `req[source]`, or coercion/defaults are silently lost.
- ⚠️ **Express 5: `req.query`/`req.params` are getter-only** — use `Object.defineProperty`, never `=`.
- ✅ **`safeParse` over `parse`** in middleware — turn the result into an `AppError`, skip `try/catch`.
- ✅ **`.partial()` for updates** — derive the update schema from create; don't duplicate fields.
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
| [`src/modules/users/user.schema.ts`](src/modules/users/user.schema.ts) | Zod schemas + inferred DTOs (source of truth) |
| [`src/middlewares/validateRequest.ts`](src/middlewares/validateRequest.ts) | Reusable `validateRequest(schema, source)` factory |
| [`src/modules/users/user.controller.ts`](src/modules/users/user.controller.ts) | Typed handlers via `TypedRequest*` |
| [`src/modules/users/user.route.ts`](src/modules/users/user.route.ts) | Routes with validation chained in |
| [`src/types/express.ts`](src/types/express.ts) | `TypedRequestBody` / `TypedRequestParams` / `TypedRequestQuery` / `TypedRequest` |
| [`src/utils/AppError.ts`](src/utils/AppError.ts) | Operational error class (`isOperational: true`) |
| [`src/utils/catchAsync.ts`](src/utils/catchAsync.ts) | Async wrapper — forwards errors to `next()` |
| [`src/middlewares/globalErrorHandler.ts`](src/middlewares/globalErrorHandler.ts) | Dev/prod error formatting |
