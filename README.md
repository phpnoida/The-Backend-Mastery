# 🧠 Zod + Express CRUD — One Full Picture (Reference)

> Read top → bottom once. Every block has a **one-line plain-English** summary, then the code.
> This is the **final, coherent design** we landed on:
> *validate at the edge → write the clean data back to its native slot → type the handler with
> `TypedRequest*` → read it with **zero `as` casts**.*

---

## 1. The 30-second mental model

A request is a parcel on an assembly line. Each station does **one** job, then hands it on:

```
HTTP request
   │
   ▼
[ ROUTE ]            "which URL + method? send it down the right line"
   │
   ▼
[ validateRequest ] "bouncer: clean? bad → 400 STOP.  good → write clean data back to req.body/params/query"
   │
   ▼
[ catchAsync ]      "safety wrapper: if the async handler throws, forward to the error handler"
   │
   ▼
[ CONTROLLER ]      "translator: read typed req → call ONE service fn → shape the HTTP reply"
   │
   ▼
[ SERVICE ]         "worker: pure DB logic, knows nothing about req/res"
   │
   ▼
[ MODEL ]           "blueprint: the MongoDB shape + DB guarantees (unique, required)"
   │
   ▼
MongoDB
```

**Golden rule:** bad data dies at the bouncer (step 2). By the time the controller runs, the data
is **clean *and* correctly typed** — so no validation and no `as` casts live in the controller.

| Layer | One line |
|-------|----------|
| **schema** (Zod) | The rulebook for incoming data — and the source of every TS type via `z.infer`. |
| **types** (`TypedRequest*`) | Tiny aliases that tell TS the shape of `req.body`/`params`/`query`. |
| **validateRequest** | Bouncer — checks the rulebook, 400s bad input, writes clean data back to its native slot. |
| **catchAsync** | Try/catch you don't have to write — forwards async errors to the global handler. |
| **route** | Switchboard — maps URL+method to `[validator(s) → controller]`. |
| **controller** | Translator — typed HTTP in, one service call, HTTP out. No DB, no rules. |
| **service** | Worker — pure DB logic. No `req`, no `res`, no status codes. |
| **model** | Blueprint — Mongoose shape + last-line DB defense (`unique`, `required`). |

---

## 2. `product.schema.ts` — the rulebook (types are born here)

**One line:** *Zod schemas validate data at runtime; `z.infer` turns each schema into a TS type for free — write the rule once, the type follows automatically.*

```ts
import { z } from "zod";

export const productCreateSchema = z.object({
  title:    z.string().trim().min(2).max(100),
  sku:      z.string().regex(/^[A-Z0-9]+(-[A-Z0-9]+)*$/),
  price:    z.number().gt(0).max(1_000_000),
  category: z.enum(["electronics", "books", "clothing", "food", "toys"]),
  quantity: z.number().int().min(0),
  inStock:  z.boolean().default(true),
  tags:     z.array(z.string().min(1).max(20)).max(10).default([]),
  description: z.string().max(500).optional(),
});

export const productUpdateSchema = productCreateSchema.partial(); // PATCH: all optional (DRY)

export const productQuerySchema = z.object({   // query values arrive as STRINGS → coerce
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort:   z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["title", "price", "createdAt"]).default("createdAt"),
  category: z.enum(["electronics","books","clothing","food","toys"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search:   z.string().trim().optional(),
});

export const productParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),       // 24-char Mongo ObjectId
});

// 🔑 types DERIVED from schemas — one source of truth, no drift
export type ProductCreateDto = z.infer<typeof productCreateSchema>;
export type ProductUpdateDto = z.infer<typeof productUpdateSchema>;
export type ProductQueryDto  = z.infer<typeof productQuerySchema>;
export type ProductParamDto  = z.infer<typeof productParamsSchema>;
```

---

## 3. `src/types/express.ts` — typed-request aliases (restore this file)

**One line:** *Thin shortcuts over Express's built-in `Request<Params, ResBody, ReqBody, Query>` generics so a handler can say "my body is `ProductCreateDto`" without writing the ugly 4-slot generic by hand.*

```ts
import { type Request } from "express";

export type TypedRequestBody<T>   = Request<{}, {}, T>;          // typed req.body
export type TypedRequestParams<T> = Request<T>;                 // typed req.params
export type TypedRequestQuery<T>  = Request<{}, {}, {}, T>;     // typed req.query
export type TypedRequest<P, B, Q> = Request<P, {}, B, Q>;       // typed params + body + query
```

**Why these exist:** Express's generic order is `Request<Params, ResBody, ReqBody, Query>` —
unintuitive and noisy. These aliases name the common cases so the controllers stay readable.
Because `validateRequest` writes the *clean* data back to `req.body`/`params`/`query` (next step),
these types describe data that is **guaranteed valid** — no `as`, no lying to the compiler.

---

## 3b. `src/types/api.ts` — typed **responses** (the other half)

**One line:** *`TypedRequest*` types what comes IN; `ApiResponse<T>` types what goes OUT — so
`res.json(...)` is compiler-checked and the envelope can't drift (`msg` vs `message`) across endpoints.*

```ts
// src/types/api.ts
export type ApiResponse<T> = {
  status: "success";
  message: string;
  data: T;
};

export type ApiError = {
  status: "fail" | "error";
  message: string;
};

// Reusable shape for ANY list endpoint — define the pagination envelope ONCE,
// not re-typed per resource. `T` is the element type (ProductDoc, OrderDoc, …).
export type Paginated<T> = {
  data: T[];
  totalRec: number;
  page: number;
  limit: number;
  totalPage: number;
};
```

**How to use it** — Express's `Response` is generic too; that second slot is the *same* `ResBody`
from `Request<Params, ResBody, ReqBody, Query>`. Typing it turns `res.json()` into a contract:

```ts
import type { Response } from "express";
import type { ApiResponse } from "@/types/api";

async (req: TypedRequestBody<ProductCreateDto>, res: Response<ApiResponse<ProductDoc>>) => {
  const data = await productService.create(req.body);
  res.status(201).json({ status: "success", message: "Product created", data }); // ✅ shape enforced
  // res.json({ msg: "..." });   // ❌ compile error — typo + missing fields caught
}
```

**Composing the two for a list endpoint** — `Paginated<T>` is the *payload* shape; `ApiResponse<T>`
is the *envelope*. The list endpoint nests one inside the other — `T` becomes `Paginated<ProductDoc>`:

```ts
// service returns  → Promise<Paginated<ProductDoc>>
// controller types → Response<ApiResponse<Paginated<ProductDoc>>>
async (req: TypedRequestQuery<ProductQueryDto>, res: Response<ApiResponse<Paginated<ProductDoc>>>) => {
  const data = await productService.findAll(req.query); // data: Paginated<ProductDoc>
  res.status(200).json({ status: "success", message: "Products fetched", data });
}
```

…which serializes to a **`data.data` double-nesting** — the pagination meta sits *beside* the rows
inside the envelope's `data`:

```jsonc
{
  "status": "success",
  "message": "Products fetched",
  "data": {                 // ← ApiResponse.data  (this is the Paginated<T>)
    "data": [ /* products */ ],   // ← Paginated.data (the rows) → client reads body.data.data
    "totalRec": 42, "page": 1, "limit": 10, "totalPage": 5
  }
}
```

> 🧠 **Nested vs flat — a one-time design call.** The `data.data` nesting above is normal and fine.
> Some teams instead **flatten** pagination meta beside the rows so clients read `body.data` directly:
> `{ status, message, data: ProductDoc[], meta: { totalRec, page, limit, totalPage } }`.
> Both are production-grade — pick one and apply it to *every* list endpoint. Consistency > preference.

**Naming convention (what pros use):** name type files by **concern**, not by HTTP class.
- `express.ts` → request-side helpers (`TypedRequest*`) — wraps Express's `Request`. *(keep this name)*
- `api.ts` → response-side envelope (`ApiResponse<T>`, `ApiError`) — the wire contract. *(most common)*
- ❌ `request.ts` + `response.ts` (split by HTTP side) is rare and over-granular — avoid.
- `*.d.ts` (e.g. `express.d.ts`) is the convention only when a file **augments** Express
  (e.g. `declare global { namespace Express { interface Request { validated?: unknown } } }`).

> **Mental model:** typed `Request` + typed `Response` = the whole HTTP contract is compiler-enforced,
> edge to edge. That is the senior-standard for an Express + TS service.

---

## 4. `validateRequest.ts` — the bouncer (write-back, Express-5-safe)

**One line:** *Runs a Zod schema against one part of the request; bad → stop with a clean 400; good → overwrite that native slot (`req.body`/`params`/`query`) with the clean, coerced value and continue.*

```ts
import { z } from "zod";
import { type Request, type Response, type NextFunction } from "express";
import AppError from "@/utils/AppError";

type RequestSource = "body" | "query" | "params";

const validateRequest =
  <T extends z.ZodType>(schema: T, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".") || source}: ${i.message}`)
        .join("; ");
      return next(new AppError(message, 400));   // ⛔ controller never runs
    }

    // Write the CLEAN value back to its native slot.
    // ⚠️ Express 5: req.query / req.params are GETTER-ONLY — `req.query = ...` THROWS.
    // Object.defineProperty shadows the getter, so this is safe for all three sources.
    Object.defineProperty(req, source, {
      value: result.data,        // coerced numbers + applied defaults
      writable: true,
      configurable: true,
    });
    next();                       // ✅ pass the clean parcel on
  };

export default validateRequest;
```

**Two jobs:** (1) **reject** bad input → 400 *before* the controller; (2) **transform** good input
(coerce strings→numbers, fill defaults) and hand it on. Because it writes back to the *native*
slot, you can stack multiple validators on one route and none clobbers another.

> 💡 This is why we DON'T use a single `req.validated` bucket: on PATCH (params + body) the second
> validator would overwrite the first. Writing back to `req.params` *and* `req.body` keeps both.

---

## 5. `catchAsync.ts` — the try/catch you don't write

**One line:** *Wraps an async handler so any thrown error (or rejected promise) is auto-forwarded to Express's global error handler — and its generics preserve your `TypedRequest` types.*

```ts
import { type Request, type Response, type NextFunction } from "express";

// Generic <P, ResBody, ReqBody, ReqQuery> matches Express's Request generics,
// so the typed request you pass in stays typed inside the handler.
const catchAsync =
  <P = any, ResBody = any, ReqBody = any, ReqQuery = any>(
    fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);   // any throw/reject → next(err) → globalErrorHandler
  };

export default catchAsync;
```

**Why:** without it, every async handler needs its own `try { } catch (e) { next(e) }`. This
removes that boilerplate from all five controllers — throw an `AppError` and forget it.

---

## 6. `product.controller.ts` — the translator (zero `as`)

**One line:** *Each handler is typed with a `TypedRequest*`, reads the already-clean `req.body`/`params`/`query` directly, calls ONE service fn, and shapes the response — no DB code, no validation, no casts.*

```ts
import catchAsync from "@/utils/catchAsync";
import AppError from "@/utils/AppError";
import { productService } from "./product.service";
import type {
  TypedRequestBody, TypedRequestParams, TypedRequestQuery, TypedRequest,
} from "@/types/express";
import type {
  ProductCreateDto, ProductUpdateDto, ProductQueryDto, ProductParamDto,
} from "./product.schema";
import type { Response } from "express";

// CREATE — body is typed, already validated
export const createProduct = catchAsync(
  async (req: TypedRequestBody<ProductCreateDto>, res: Response) => {
    const product = await productService.create(req.body);   // req.body: ProductCreateDto ✅
    res.status(201).json({ status: "success", data: product });
  }
);

// LIST — query is coerced + defaulted by the schema
export const getAllProducts = catchAsync(
  async (req: TypedRequestQuery<ProductQueryDto>, res: Response) => {
    const result = await productService.findAll(req.query); // req.query.page is a number ✅
    res.status(200).json({ status: "success", ...result });
  }
);

// READ ONE — missing → 404 (not 500)
export const getOneProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    const product = await productService.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    res.status(200).json({ status: "success", data: product });
  }
);

// UPDATE — params AND body both typed (both were validated in the route)
export const updateProduct = catchAsync(
  async (req: TypedRequest<ProductParamDto, ProductUpdateDto, never>, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    if (!product) throw new AppError("Product not found", 404);
    res.status(200).json({ status: "success", data: product });
  }
);

// DELETE — 204 = success, NO body
export const deleteProduct = catchAsync(
  async (req: TypedRequestParams<ProductParamDto>, res: Response) => {
    const product = await productService.delete(req.params.id);
    if (!product) throw new AppError("Product not found", 404);
    res.status(204).send();
  }
);
```

**Three rules a controller obeys:** (1) never touch the DB directly — call a service; (2) never
re-validate — that happened at the edge; (3) a missing record → `throw new AppError(msg, 404)`,
which `catchAsync` forwards to the global handler.

> 🧠 **`never` one-liner:** in `TypedRequest<Params, Body, Query>`, a slot set to `never` means
> *"this endpoint accepts nothing here."* PATCH has no query string → query is `never`. It's a
> deliberate "nothing belongs here" — stronger and clearer than a neutral empty `{}`.

---

## 7. `product.route.ts` — the switchboard

**One line:** *Maps each URL+method to a chain `[validator(s) → controller]` — read a route line left-to-right and you see the whole pipeline for that request.*

```ts
import { Router } from "express";
import validateRequest from "@/middlewares/validateRequest";
import * as ctrl from "./product.controller";
import {
  productCreateSchema, productUpdateSchema,
  productQuerySchema, productParamsSchema,
} from "./product.schema";

const router = Router();

router.route("/products")
  .post(validateRequest(productCreateSchema, "body"),  ctrl.createProduct)
  .get (validateRequest(productQuerySchema,  "query"), ctrl.getAllProducts);

router.route("/products/:id")
  .get   (validateRequest(productParamsSchema, "params"), ctrl.getOneProduct)
  .patch (
    validateRequest(productParamsSchema, "params"),   // ① validate the id  → writes req.params
    validateRequest(productUpdateSchema, "body"),     // ② validate the body → writes req.body
    ctrl.updateProduct)                               // both survive (native-slot write-back)
  .delete(validateRequest(productParamsSchema, "params"), ctrl.deleteProduct);

export default router;
```

**Read it like a sentence:** "POST /products → validate body → run createProduct." PATCH chains
**two** validators; thanks to native-slot write-back, both `req.params` and `req.body` arrive clean.

---

## 8. `product.service.ts` — the worker

**One line:** *Pure database logic — takes plain typed data, returns documents/null, and knows nothing about HTTP (so it's reusable from a CLI, a cron job, or a test).*

```ts
import { Product, type ProductDoc } from "./product.model";
import type { ProductCreateDto, ProductUpdateDto, ProductQueryDto } from "./product.schema";

export const productService = {
  create:   (data: ProductCreateDto): Promise<ProductDoc> => Product.create(data),
  findById: (id: string) => Product.findById(id),

  // runValidators re-checks Mongoose rules on update — keep it ON
  update: (id: string, data: ProductUpdateDto) =>
    Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  delete: (id: string) => Product.findByIdAndDelete(id),

  // real list query: build filter conditionally → sort → paginate
  async findAll(q: ProductQueryDto) {
    const filter: Record<string, unknown> = {};
    if (q.category) filter["category"] = q.category;
    if (q.search)   filter["title"]    = { $regex: q.search, $options: "i" };
    if (q.minPrice != null || q.maxPrice != null) {
      filter["price"] = {
        ...(q.minPrice != null && { $gte: q.minPrice }),
        ...(q.maxPrice != null && { $lte: q.maxPrice }),
      };
    }
    const [data, total] = await Promise.all([
      Product.find(filter)
        .sort({ [q.sortBy]: q.sort === "asc" ? 1 : -1 })
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      Product.countDocuments(filter),
    ]);
    return { data, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) };
  },
};
```

**Why HTTP-free?** `findById` should be callable by a test or a script that has no `req`. Keeping
HTTP out is what makes the service reusable.

> 🧠 **`Record` one-liner:** `Record<K, V>` = *"an object whose keys are `K` and values are `V`"*
> (built into TS, just sugar for `{ [key: K]: V }`). Here `Record<string, unknown>` lets us start
> from `{}` and add arbitrary string keys to build the Mongo `filter` — a bare `{}` would reject
> `filter["category"] = ...`. Use `unknown` over `any`: assign freely, but TS still guards reads.

---

## 9. `product.model.ts` — the blueprint

**One line:** *The Mongoose schema is the DB's own shape + last line of defense — Zod guards the door, this guards the database.*

```ts
import { model, Schema, type HydratedDocument, type InferSchemaType } from "mongoose";

const productSchema = new Schema({
  title:    { type: String, required: true, trim: true },
  sku:      { type: String, required: true, unique: true },
  price:    { type: Number, required: true, min: 0, max: 1_000_000 },
  category: { type: String, required: true,
              enum: ["electronics","books","clothing","food","toys"] },
  quantity: { type: Number, required: true, min: 0 },
  inStock:  { type: Boolean, default: true },
  tags:     [{ type: String }],
  description: { type: String },
}, { timestamps: true });

export type ProductType = InferSchemaType<typeof productSchema>;
export type ProductDoc  = HydratedDocument<ProductType>;
export const Product    = model("Product", productSchema);
```

**Zod vs Mongoose:** Zod runs *first* at the HTTP edge (clean 400s, coercion, defaults);
Mongoose runs *last* at the DB (enforces `unique`, which Zod can't know). Overlap = defense in depth.

---

## 10. 🎬 ONE FULL CRUD TRACE — `PATCH /api/v1/products/:id`

`PATCH /api/v1/products/665f8a.../` with body `{ "price": 3999 }`

| # | Where | What happens |
|---|-------|--------------|
| 1 | **app.ts** | `app.use("/api/v1", productRoute)` matches the prefix → into the product router. |
| 2 | **route** | matches `PATCH /products/:id` → runs the chain below. |
| 3 | **validateRequest(params)** | `665f8a...` passes the ObjectId regex ✅ → writes clean value to `req.params`. |
| 4 | **validateRequest(body)** | `{ price: 3999 }` passes `productUpdateSchema.partial()` ✅ → writes clean value to `req.body`. |
| 5 | **catchAsync** | wraps `updateProduct`; if it throws, the error skips to the global handler. |
| 6 | **updateProduct** | typed `req.params.id` + `req.body` (no casts) → `productService.update(id, body)`. |
| 7 | **service.update** | `findByIdAndUpdate(id, { price: 3999 }, { new, runValidators })`. |
| 8 | **result** | found → returns updated doc → controller sends `200 + data`. <br> not found → service returns `null` → controller `throw AppError(404)` → `catchAsync` → global handler → clean `404` JSON. |

**The whole thing in one sentence:**
*Route picks the line → bouncer cleans & writes the typed data back to its native slot → catchAsync guards the handler → controller translates → service does the DB work → model is the shape — and bad data dies at the bouncer.*

---

## 11. Your checklist to make it real

- [ ] Restore `src/types/express.ts` (§3).
- [ ] `validateRequest` uses `Object.defineProperty` write-back (§4) — not `req.x = ...`.
- [ ] Controllers typed with `TypedRequest*`, **zero `as` casts** (§6).
- [ ] Route: PATCH chains **params + body** validators (§7).
- [ ] Service: `update` has `runValidators: true`; `findAll` actually filters/sorts/paginates (§8).
- [ ] DELETE returns `204` no body (§6).
- [ ] `npx tsc --noEmit` clean.

---

## 12. 🧠 TS keywords cheat-card (don't forget)

| Keyword | One line | Where I used it |
|---------|----------|-----------------|
| **`Record<K, V>`** | Object with `K`-typed keys + `V`-typed values; sugar for `{ [key: K]: V }`. Use `Record<string, unknown>` to build an object from `{}` and add arbitrary keys (e.g. a Mongo `filter`). | `findAll` filter (§8) |
| **`never`** | "Nothing valid belongs here." In `TypedRequest<P, B, Q>`, mark an unused slot `never` — e.g. query on a PATCH. More deliberate than empty `{}`. | `updateProduct` (§6) |
| **`unknown` vs `any`** | Both let you *assign* anything; `unknown` still forces a check before you *read/use* the value, `any` switches checking off. Prefer `unknown`. | filter values (§8) |
| **`z.infer<typeof schema>`** | Generate the TS type *from* the Zod schema — write the rule once, the type follows (no drift). | every DTO (§2) |
| **`async` rule of thumb** | Only need `async`/`await` when you use a resolved value *inside* the fn; one-liners that just pass the promise through don't. | `findAll` vs `findById` (§8) |

---

## 13. `server.ts` — graceful shutdown (the production exit)

**One line:** *When the platform says "stop" (a deploy, a Ctrl+C), don't drop the process dead —
stop taking new requests, let in-flight ones finish, close the DB pool, then exit `0`.*

Why this matters: in production your app is restarted **constantly** — every deploy, every
autoscale event, every `docker stop` sends a **SIGTERM**. If you just `process.exit()` on that
signal, any request being served right then is cut off mid-response and the Mongo connection pool
is abandoned. Graceful shutdown is the difference between "zero-downtime deploy" and "every deploy
500s a few unlucky users."

```ts
import { connectDB, disconnectDB } from "./config/mongoose";

// EXPECTED shutdowns (deploy / Ctrl+C), not crashes → exit 0, and tear down IN ORDER:
// stop taking new work → drain in-flight requests → close the DB pool.
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received — shutting down gracefully...`);  // shows up in container logs

  // 1. Stop accepting NEW connections. Callback fires only AFTER in-flight
  //    requests finish — this "drain" is what avoids cutting clients off mid-deploy.
  server.close(async () => {
    // 2. HTTP drained → now safe to close the Mongo pool. (Closing it BEFORE the
    //    drain could kill a query a still-running request needs.)
    await disconnectDB();
    console.log("Process terminated cleanly ✅");

    // 3. exit 0 = "I meant to stop." A crash exits 1. Orchestrators read this code.
    process.exit(0);
  });

  // 4. Safety valve: if draining hangs (stuck keep-alive socket, slow query), don't
  //    wait forever — force-exit after 10s. .unref() lets us exit earlier if done first.
  setTimeout(() => {
    console.error("Forced shutdown — drain timed out 💥");
    process.exit(1);
  }, 10_000).unref();
};

// SIGTERM: Docker / Kubernetes / PM2 on deploy, scale-down, or `docker stop`.
// SIGINT:  Ctrl+C in the terminal during local dev.
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT",  () => gracefulShutdown("SIGINT"));
```

**The order is the whole point** — `server.close()` first (stop + drain), `disconnectDB()` second
(only once nothing needs the DB), `exit(0)` last. Flip any two and you reintroduce the bug you were
trying to fix.

> 🧠 **Signals cheat:** `SIGTERM` = "please stop" (polite, what platforms send — you get to clean
> up). `SIGKILL` = "stop NOW" (can't be caught — never run cleanup, so never rely on it). `SIGINT`
> = Ctrl+C. We handle the two we *can* catch; nothing can be done about SIGKILL by design.

> ⚠️ **Don't confuse the four handlers in `server.ts`:**
> `uncaughtException` / `unhandledRejection` are **crash** nets → exit **1** (state is polluted,
> bail fast). `SIGTERM` / `SIGINT` are **intentional** shutdowns → drain, then exit **0**.

---

## 14. `app.ts` — the security & hardening layer (helmet · CORS · body cap · sanitize)

**One line:** *Before any request reaches a route, it passes through a fixed stack — set security
headers → check the browser origin → cap the body size → strip NoSQL-injection keys — and **order
matters**, each layer assumes the one before it already ran.*

```ts
const app = express();

app.use(helmet());                       // 1. security headers FIRST (cover every response)
app.use(cors(corsOptions));              // 2. browser origin policy
app.options("*splat", cors(corsOptions));// 2b. answer the OPTIONS preflight for every route
app.use(express.json({ limit: "10kb" }));// 3. parse JSON body, but cap its size
app.use(mongoSanitize);                  // 4. strip `$`/`.` keys (needs body parsed → after #3)

app.use("/api/v1", productRoute);        // routes
app.use((_req,_res,next) => next(new AppError("Invalid url", 404))); // 404
app.use(globalErrorHandler);             // error handler LAST
```

> 🧠 **Why this order?** helmet first so even an error response is protected; `express.json` before
> `mongoSanitize` because you can't sanitize a body that hasn't been parsed yet; error handler last
> because Express only routes to a 4-arg handler *after* everything else has had its turn.

### 14.1 `helmet()` — secure response headers

**One line:** *One line that sets ~15 hardening headers and removes the `X-Powered-By: Express`
giveaway — pure upside, no config needed for a JSON API.*

It adds `Strict-Transport-Security` (force HTTPS), `X-Content-Type-Options: nosniff` (stop MIME
sniffing), frame protection (clickjacking), and more. We set it **first** so every response —
including errors — carries them.

### 14.2 CORS — the one everybody gets asked about

**One line:** *CORS is a **browser** rule that decides which web origins may *read* your API's
responses; it is configured on the server but enforced by the browser — so it is NOT a security
wall around your data.*

```ts
const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // !origin → no Origin header → Postman / curl / server-to-server / health check → allow.
    // whitelisted browser origin → allow. anything else → 403.
    if (!origin || ENV.CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new AppError(`CORS: origin '${origin}' is not allowed`, 403));
  },
  credentials: true,                                   // allow cookies / Authorization cross-origin
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*splat", cors(corsOptions));              // Express 5: named wildcard, bare "*" is invalid
```

**Whitelist, never `*`** — origins live in `CORS_ORIGINS` (comma-separated env var, parsed to an
array in `env.ts`). Add real domains in staging/prod; localhost in dev.

#### ⭐ The famous CORS interview questions (know these cold)

| Question | Answer |
|----------|--------|
| **Does CORS protect my server?** | **No.** It's enforced by the *browser*, not the server. It only controls which web pages can *read* your response via JS. curl/Postman/another backend ignore it entirely. CORS ≠ auth — never treat it as a security boundary for your data. |
| **Why does Postman work but my React app gets a CORS error?** | Postman/curl aren't browsers (don't enforce CORS) **and** send no `Origin` header. Our `!origin` branch allows no-Origin requests, so tools pass. A browser on a non-whitelisted origin *does* send Origin → rejected. |
| **What is a preflight request?** | For "non-simple" requests (PATCH/DELETE/PUT, JSON content-type, or custom headers like `Authorization`), the browser auto-sends an `OPTIONS` "am I allowed?" first. `cors()` answers it with the `Access-Control-Allow-*` headers — that's what `app.options(...)` covers. |
| **Why can't `origin: '*'` be used with `credentials: true`?** | The spec forbids `Allow-Origin: *` together with `Allow-Credentials: true`. With cookies/auth you must echo back a *specific* origin — which is exactly why we whitelist. |
| **Simple vs non-simple request?** | "Simple" = GET/HEAD/POST with only safe headers + a basic content-type → no preflight. Anything else triggers the OPTIONS preflight. |

### 14.3 `express.json({ limit: "10kb" })` — body-size cap

**One line:** *Parsing JSON is free for an attacker to abuse — a 50 MB body can exhaust memory/CPU,
so cap it to the largest body you actually expect.* Oversized bodies are rejected before your code
runs. Tune `10kb` to your real payloads (file uploads use a different pipeline entirely).

### 14.4 `mongoSanitize` — NoSQL-injection defense (Express-5-safe)

**One line:** *Mongo queries are plain objects, so unsanitized input lets an attacker inject
operators (`$gt`, `$ne`) to bypass logic — we strip any key starting with `$` or containing `.`.*

```ts
// THE ATTACK: login with  { "email": { "$gt": "" }, "password": { "$gt": "" } }
// `$gt: ""` matches ANY value → findOne returns the first user → auth bypass.
const sanitizeInPlace = (value: unknown): void => {
  if (value === null || typeof value !== "object") return;
  for (const key of Object.keys(value as Record<string, unknown>)) {   // keys = snapshot → safe to delete
    if (key.startsWith("$") || key.includes(".")) {
      delete (value as Record<string, unknown>)[key];
      continue;
    }
    sanitizeInPlace((value as Record<string, unknown>)[key]);          // recurse into nested objects/arrays
  }
};
// middleware: sanitizeInPlace(req.body); sanitizeInPlace(req.query); sanitizeInPlace(req.params);
```

> ⚠️ **Why not the popular `express-mongo-sanitize`?** Its v2 does `req.query = clean`. In **Express 5**
> `req.query` / `req.params` are **getter-only**, so that assignment **throws** `Cannot set property
> query` — the *same* trap that forced `validateRequest` to use `Object.defineProperty` (§4). The fix
> is to mutate the objects **in place** (delete bad keys), never reassign the getter. (Your
> `xss-clean` dependency breaks the same way — leave it unwired on Express 5.)

> 🧠 **Defense in depth here:** Zod (§2) already strips unknown keys on *validated* routes, so a
> `$gt` in the body usually dies at the bouncer. `mongoSanitize` is the belt-and-suspenders layer
> that also covers any route you forget to validate — security layers should overlap, not rely on
> one another.

### 14.5 What's deliberately left out (and why)

| Skipped | Why / when to add |
|---------|-------------------|
| **Rate limiting** (`express-rate-limit`) | Deferred — add before exposing publicly to blunt brute-force / scraping. |
| **`helmet` CSP tuning** | Default helmet is right for a JSON API; tune Content-Security-Policy only when serving HTML. |
| **Auth / RBAC** | Its own branch (`feature/auth-rbac`). CORS is *not* a substitute (see Q1 above). |

---

## 15. `product.service.ts` — aggregation pipelines (the mental model)

**One line:** *An aggregation is an **assembly line for data**: docs enter at the top and flow through
an ordered array of **stages** — each stage reshapes the stream and hands it to the next. `find()`
returns documents; `aggregate()` **computes** over them (group, count, average, join, bucket).*

```
Product collection  ──►  [ $match ]  ──►  [ $group ]  ──►  [ $sort ]  ──►  [ $project ]  ──►  result
   (all docs)            filter rows     fold into        order the        choose/rename
                         (use index!)    buckets          buckets          output fields
```

> 🧠 **`find` vs `aggregate`:** `find({price:{$gt:10}})` = "give me the matching *rows*."
> `aggregate([...])` = "*derive new facts* from the rows" — totals, averages, per-group counts,
> joined data. If the answer is a **number or a summary**, reach for `aggregate`.

### Stage cheat-card (the 8 you'll use 90% of the time)

| Stage | SQL analogy | Does |
|-------|-------------|------|
| `$match` | `WHERE` | Filter docs. **Put it FIRST** so it can use an index and shrink the stream early. |
| `$group` | `GROUP BY` | Fold many docs into buckets keyed by `_id`; compute `$sum`, `$avg`, `$min`, `$max`. |
| `$sort` | `ORDER BY` | Order the stream. After `$group`, sort on the computed fields. |
| `$project` | `SELECT a, b` | Pick / rename / compute output fields (`1` keep, `0` drop). |
| `$limit` / `$skip` | `LIMIT` / `OFFSET` | Pagination. |
| `$lookup` | `JOIN` | Pull in docs from another collection. |
| `$facet` | — | Run **several sub-pipelines on the same input** in one query (data + count together). |
| `$unwind` | — | Explode an array field into one doc per element (e.g. one row per `tag`). |

### Example 1 — category stats (the "give me a dashboard number" case)

**One line:** *Group every product by `category` → count them, average the price, sum the stock.*

```ts
// productService.categoryStats()
async categoryStats() {
  return Product.aggregate([
    { $match: { inStock: true } },                 // 1. only sellable products (index-friendly, first)
    { $group: {                                    // 2. fold into one bucket PER category
        _id: "$category",                          //    bucket key = the category value
        count:    { $sum: 1 },                     //    +1 per doc in the bucket
        avgPrice: { $avg: "$price" },              //    average across the bucket
        totalQty: { $sum: "$quantity" },           //    sum across the bucket
    }},
    { $sort: { count: -1 } },                       // 3. most-stocked category first
    { $project: {                                   // 4. tidy the shape the API returns
        _id: 0, category: "$_id",                   //    rename _id → category, hide raw _id
        count: 1,
        avgPrice: { $round: ["$avgPrice", 2] },     //    money → 2 decimals
        totalQty: 1,
    }},
  ]);
}
// → [{ category: "electronics", count: 42, avgPrice: 199.99, totalQty: 530 }, ...]
```

### Example 2 — `$facet`: paginated data **and** total count in ONE round trip

**One line:** *Your `findAll` (§8) runs `find` + `countDocuments` as **two** queries; `$facet` runs
both branches over the same filtered stream in **one** trip to Mongo — the pro pattern for paginated
list endpoints.*

```ts
// productService.findAllFacet(q)
async findAllFacet(q: ProductQueryDto) {
  const filter = buildFilter(q);                    // same conditional filter you built in §8
  const [result] = await Product.aggregate([
    { $match: filter },                             // filter ONCE — both branches below reuse it
    { $facet: {                                     // two sub-pipelines on the SAME input:
        data: [                                     //   branch A → the page of documents
          { $sort:  { [q.sortBy]: q.sort === "asc" ? 1 : -1 } },
          { $skip:  (q.page - 1) * q.limit },
          { $limit: q.limit },
        ],
        meta: [{ $count: "total" }],                //   branch B → just the total count
    }},
    { $project: {                                   // flatten meta:[{total}] → a plain number
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] }, // 0 when no matches
    }},
  ]);
  const total = result?.total ?? 0;
  return { data: result?.data ?? [], page: q.page, limit: q.limit, total,
           totalPages: Math.ceil(total / q.limit) };
}
```

> 🧠 **Why `$facet` beats two queries:** the `$match` (the expensive part) runs **once** and both
> branches share it — fewer round trips, one consistent snapshot. The cost: results live in memory
> between branches, so always `$match` *before* `$facet` to keep the stream small.

### Example 3 — `$lookup`: the JOIN Mongo says it doesn't have

**One line:** *Pull related docs from another collection — here, attach each product's `reviews`.*

```ts
// imagine a separate `reviews` collection: { productId, rating, text }
async withReviews(id: string) {
  return Product.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },  // ⚠️ aggregate does NOT auto-cast _id — do it yourself
    { $lookup: {
        from: "reviews",            // the OTHER collection (its real MongoDB name, usually plural/lowercased)
        localField: "_id",          // field on THIS doc (product)
        foreignField: "productId",  // field on the review that points back
        as: "reviews",              // matched reviews land in this NEW array field
    }},
    { $addFields: { avgRating: { $avg: "$reviews.rating" } } }, // compute on the joined array
  ]);
}
```

### Gotchas that bite everyone (memorize)

| Gotcha | Fix |
|--------|-----|
| **`_id` isn't auto-cast in `aggregate`.** `find()` casts a string id for you; `$match` does **not**. | Wrap it: `new mongoose.Types.ObjectId(id)`. |
| **`$match` late = slow.** A `$match` after `$group`/`$lookup` can't use an index. | Put `$match` (and `$limit`) as **early** as possible. |
| **`aggregate()` returns plain JS objects, not Mongoose docs.** | No `.save()`, no virtuals, no getters — you get raw data. That's a feature for read APIs. |
| **`$group._id` is mandatory.** `_id: null` groups *everything* into one bucket (use for a grand total). | `{ $group: { _id: null, grandTotal: { $sum: "$price" } } }`. |

> 🧠 **One-sentence model:** `find` *selects rows*, `aggregate` *manufactures answers* — chain small
> stages, filter first, and remember each stage only sees what the previous stage emitted.
