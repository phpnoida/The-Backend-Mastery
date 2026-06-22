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
