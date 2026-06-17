# 🏋️ Practice Exercise — Product Inventory API (Zod + MongoDB)

> **You write 100% of the code.** This file is the *spec only* — no solutions.
> The README at the repo root is your reference manual. **Rule: don't copy the README's `user`
> code. Read the *concept*, then derive the Product version yourself.** Peek only when truly stuck.

**Goal:** build a fully-validated **Product inventory API** backed by MongoDB. Every request is
validated at the edge with a reusable `validateRequest` middleware before it reaches a controller.

**Definition of done:** all 4 CRUD endpoints work against a real MongoDB, every endpoint rejects
bad input with a `400` *before* the controller runs, unknown ids return `404`, and `npx tsc
--noEmit` is clean.

---

## 0. Prerequisites (do this first)

1. **A reachable MongoDB.** Either a local `mongod` running on `mongodb://127.0.0.1:27017`, or a
   MongoDB Atlas connection string. You'll put it in `.env.development` as `MONGO_URI`.
2. Confirm `mongoose` is installed (it is — `mongoose@8` in `package.json`).
3. You're on branch `feature/validation-zod-datastructure`.

---

## 1. The Product model — field spec

Translate this table into **two** things: a **Mongoose schema/model** (`product.model.ts`) *and* a
**Zod schema** (`product.schema.ts`). They overlap but serve different jobs — Mongoose shapes the
DB document, Zod validates the incoming request.

| Field | Type | Validation rules |
|-------|------|------------------|
| `title` | string | **required**, trimmed, 2–100 chars |
| `sku` | string | **required**, **unique**, must match regex `^[A-Z0-9]+(-[A-Z0-9]+)*$` — uppercase letters/digits, hyphen-separated groups (e.g. `KB-100`, `MOUSE`, `USB-C-2`) |
| `price` | number | **required**, greater than `0`, at most `1_000_000` |
| `category` | enum | **required**, one of: `electronics` · `books` · `clothing` · `food` · `toys` |
| `quantity` | integer | **required**, `>= 0` |
| `inStock` | boolean | optional, **default `true`** |
| `tags` | string[] | optional, at most `10` items, each tag 1–20 chars |
| `description` | string | optional, at most `500` chars |

> 💡 Decide deliberately where each rule lives. The **Zod** schema is the request gatekeeper (runs
> first, returns clean 400s). The **Mongoose** schema is the last line of defense at the DB layer
> (`unique`, `required`, types). It's normal — and good — for some rules to appear in both.

---

## 2. The Zod schemas to write (`product.schema.ts`)

Build four schemas + their inferred DTOs (`z.infer`), exactly like the README's `user` pattern:

1. **`productCreateSchema`** — the POST body. All rules from the table above.
2. **`productUpdateSchema`** — the PATCH body. Derive it from create with `.partial()` (don't
   re-type the fields). *Think:* should `sku` be updatable? Your call — document your decision.
3. **`productQuerySchema`** — the GET-list query string. Remember **query values arrive as
   strings**, so coerce the numbers:
   - `page` — coerced int, `>= 1`, default `1`
   - `limit` — coerced int, `1`–`100`, default `10`
   - `sort` — enum `asc` | `desc`, default `desc`
   - `sortBy` — enum `title` | `price` | `createdAt`, default `createdAt`
   - `category` — optional, same enum as the model (filter)
   - `minPrice` / `maxPrice` — optional, coerced numbers
   - `search` — optional string (matches against `title`)
4. **`productParamsSchema`** — the `:id` route param. A Mongo ObjectId: `^[a-f\d]{24}$` (case-insensitive).

Export the schemas **and** the DTO types: `ProductCreateDto`, `ProductUpdateDto`, `ProductQueryDto`,
`ProductParamsDto`.

---

## 3. The endpoints to build

Five routes (the **4 core CRUD** + 1 bonus). Validation happens **at the route**, before the
controller. Mounted under `/api/v1`.

| # | Method & path | Validate | Controller responsibility | Success |
|---|---------------|----------|---------------------------|---------|
| 1 | `POST /api/v1/products` | body → `productCreateSchema` | create the product | `201` + the created doc |
| 2 | `GET /api/v1/products` | query → `productQuerySchema` | filter + sort + paginate the list | `200` + array (+ optional meta) |
| 3 | `PATCH /api/v1/products/:id` | **params + body** → `productParamsSchema` *then* `productUpdateSchema` | update by id | `200` + updated doc · `404` if not found |
| 4 | `DELETE /api/v1/products/:id` | params → `productParamsSchema` | delete by id | `204` (no body) · `404` if not found |
| ⭐ 5 (bonus) | `GET /api/v1/products/:id` | params → `productParamsSchema` | fetch one by id | `200` + doc · `404` if not found |

> Endpoint 3 needs **two** `validateRequest` calls chained in the route — first params, then body.

---

## 4. Files to create

Mirror the repo's module convention, all inside **`src/practise/`**:

| File | What goes in it |
|------|-----------------|
| `product.model.ts` | Mongoose schema + model (`mongoose.model("Product", ...)`), with `timestamps: true` |
| `product.schema.ts` | The 4 Zod schemas + inferred DTOs (Section 2) |
| `product.service.ts` | The DB logic — create / find+filter / findById / update / delete. Controllers call these |
| `product.controller.ts` | 5 handlers, each typed via `TypedRequest*` from `@types/express` and wrapped in `catchAsync`. Throw `new AppError("...", 404)` when a doc is missing |
| `product.route.ts` | The router: each route wired with `validateRequest(schema, source)` before its handler |

### Shared / infrastructure tasks (outside `practise/`)

These make the app actually boot and persist. **You implement these too:**

1. **`src/middlewares/validateRequest.ts`** — implement it (README Step 3). This is the reusable
   gatekeeper every route depends on.
2. **`src/config/env.ts`** — add `MONGO_URI: process.env["MONGO_URI"]` to the `ENV` object.
3. **`.env.development`** and **`.env.example`** — add the `MONGO_URI` key (real value in
   `.development`, a placeholder in `.example`).
4. **`src/config/mongoose.ts`** — export an async `connectDB()` that calls
   `mongoose.connect(ENV.MONGO_URI)` and logs success/failure.
5. **`src/server.ts`** — `await connectDB()` **before** `startServer()` (connect first, *then*
   listen). Hint: wrap the startup in an `async` IIFE or `.then()` chain.
6. **`src/app.ts`** — import your `product.route` and mount it: `app.use("/api/v1", productRoute)`.

---

## 5. Self-check rubric

You're done when **all** of these hold:

- [ ] `npm run dev` boots, logs a DB-connected message, and listens on port `6001` with no crash.
- [ ] `npx tsc --noEmit` reports **zero** errors (strict mode: `import type`, `_`-prefixed unused params).
- [ ] `POST` with a valid body → `201` and the saved document (with `_id`, `createdAt`).
- [ ] `POST` with a bad body (e.g. lowercase `sku`, `price: -5`, missing `title`) → `400`, and the
      message names the offending field(s). **The controller never runs.**
- [ ] `GET /products?page=2&limit=5` → `page`/`limit` are **numbers** in your handler, and omitted
      params fall back to defaults.
- [ ] `GET`/`PATCH`/`DELETE` with a malformed `:id` (not 24 hex) → `400` from the params schema.
- [ ] `PATCH`/`DELETE`/`GET-one` with a valid-but-nonexistent id → `404`, not `500`.
- [ ] `PATCH` with a partial body (one field) succeeds and leaves other fields untouched.

---

## 6. Test plan (curl)

Run these after `npm run dev`. Expected status/shape is the **spec** — match it.

```bash
# 1. ✅ create — expect 201 + created doc
curl -i -X POST http://localhost:6001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Mechanical Keyboard","sku":"KB-100","price":4999,"category":"electronics","quantity":25,"tags":["rgb","usb"]}'

# 2. ❌ invalid create — expect 400, message names sku/price/title
curl -i -X POST http://localhost:6001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"title":"x","sku":"kb_100","price":-5,"category":"gadgets","quantity":-1}'

# 3. ✅ list with coercion + defaults — expect 200; page=2 is a number, limit defaults to 10
curl -i "http://localhost:6001/api/v1/products?page=2&category=electronics&sort=asc&sortBy=price"

# 4. ✅ read one — replace <id> with a real _id from step 1 → expect 200
curl -i http://localhost:6001/api/v1/products/<id>

# 5. ❌ malformed id — expect 400 from params schema (controller never runs)
curl -i http://localhost:6001/api/v1/products/123

# 6. ✅ partial update — expect 200 + updated doc
curl -i -X PATCH http://localhost:6001/api/v1/products/<id> \
  -H "Content-Type: application/json" -d '{"price":3999}'

# 7. ❌ update a valid-but-missing id — expect 404 (well-formed ObjectId that doesn't exist)
curl -i -X PATCH http://localhost:6001/api/v1/products/000000000000000000000000 \
  -H "Content-Type: application/json" -d '{"price":10}'

# 8. ✅ delete — expect 204 no body
curl -i -X DELETE http://localhost:6001/api/v1/products/<id>
```

---

## 7. Hints (nudges, not answers)

- **Wiring order matters:** route → `validateRequest(schema, source)` → controller → service → model.
- The typed-request helpers already exist in [`@types/express`](../types/express.ts) — reuse
  `TypedRequestBody`, `TypedRequestParams`, `TypedRequest`. Don't hand-write `Request<...>` generics.
- Every controller goes through [`@utils/catchAsync`](../utils/catchAsync.ts) so a thrown
  `AppError` reaches the global handler. For "not found", just `throw new AppError("Product not found", 404)`.
- **Express 5 gotcha** (README Step 3): `req.query`/`req.params` are getter-only — your
  `validateRequest` must use `Object.defineProperty`, not `req.query = ...`.
- For update, Mongoose's `findByIdAndUpdate(id, body, { new: true, runValidators: true })` returns
  the updated doc and re-runs schema validators. `findByIdAndDelete` / `findById` return `null` when
  the id doesn't exist — that's your `404` signal.
- For the list query: build a filter object conditionally (only add `category`/price-range/`search`
  when present), then `.sort()`, `.skip((page-1)*limit)`, `.limit(limit)`.

---

## 8. Stretch goals (optional)

- **Duplicate SKU → `409`, not `500`.** A unique-index violation throws a Mongo error with
  `code === 11000`. Catch it and turn it into a clean `AppError("SKU already exists", 409)`.
- **Pagination metadata** in the list response: `{ data, page, limit, total, totalPages }`.
- **Structured errors:** make `validateRequest` return an `errors[]` array (field → message) using
  `z.flattenError(result.error)`, instead of one joined string. (Requires extending `AppError` to
  carry a `details` payload and surfacing it in `globalErrorHandler`.)

---

**When you're stuck for more than ~15 min on one thing, *then* open the README and compare. Struggle
first — that's where the learning is.** Good luck. 🚀
