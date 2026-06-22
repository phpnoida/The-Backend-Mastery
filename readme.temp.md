# 🧠 Zod + Express CRUD — How It All Connects (Reference)

> Read top → bottom once. Every block has a **one-line plain-English** summary, then the code.
> This is the *target* shape (best-practice, generic `validateRequest`, no `as` casts).

---

## 1. The 30-second mental model

A request is a parcel moving down an assembly line. Each station does **one** job and hands it on:

```
HTTP request
   │
   ▼
[ ROUTE ]          "which URL + method? send it down the right line"
   │
   ▼
[ validateRequest ] (middleware)   "gatekeeper: is the parcel clean? bad → 400 STOP here"
   │  (attaches the clean, typed data to req.validated)
   ▼
[ CONTROLLER ]     "translator: read req → call the right service → shape the HTTP reply"
   │
   ▼
[ SERVICE ]        "the worker: talks to the DB, knows zero about HTTP"
   │
   ▼
[ MODEL ]          "the DB blueprint: what a Product looks like in MongoDB"
   │
   ▼
MongoDB
```

**Golden rule:** bad data never reaches the controller. Validation is the *edge*. By the time
your controller runs, the data is already clean **and** correctly typed.

**One-line-per-layer:**

| Layer | One line |
|-------|----------|
| **schema** (Zod) | The rulebook for incoming data — and the source of every TS type. |
| **route** | The switchboard — maps URL+method to `[validator, controller]`. |
| **validateRequest** | The bouncer — checks the rulebook, rejects bad input with 400, passes clean+typed data on. |
| **controller** | The translator — HTTP in, service call, HTTP out. No DB code, no business rules. |
| **service** | The worker — pure DB logic. Knows nothing about `req`/`res`. |
| **model** | The blueprint — the MongoDB shape + DB-level guarantees (`unique`, `required`). |

---

## 2. `product.schema.ts` — the rulebook (and where types are born)

**One line:** *Zod schemas validate incoming data at runtime, and `z.infer` turns each one into a TS type for free — write the rules once, get the type automatically.*

```ts
import { z } from "zod";

// the POST body rulebook
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

// PATCH body = same rules, every field optional (DRY — don't retype)
export const productUpdateSchema = productCreateSchema.partial();

// GET ?query — values arrive as STRINGS, so coerce the numbers
export const productQuerySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort:   z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["title", "price", "createdAt"]).default("createdAt"),
  category: z.enum(["electronics","books","clothing","food","toys"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search:   z.string().trim().optional(),
});

// :id param — a 24-char Mongo ObjectId
export const productParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

// 🔑 the types are DERIVED from the schemas — one source of truth
export type ProductCreateDto = z.infer<typeof productCreateSchema>;
export type ProductUpdateDto = z.infer<typeof productUpdateSchema>;
export type ProductQueryDto  = z.infer<typeof productQuerySchema>;
export type ProductParamDto  = z.infer<typeof productParamsSchema>;
```

**Why it matters:** the schema is the *only* place the shape is defined. Change a rule here and
the TS type updates everywhere automatically. No drift, ever.

---

## 3. `validateRequest.ts` — the bouncer (generic version)

**One line:** *A reusable middleware that runs a Zod schema against one part of the request; if it fails it stops with a clean 400, if it passes it stashes the clean, typed data on `req.validated`.*

```ts
import { type ZodType, type infer as ZInfer } from "zod"; // (just for illustration)
import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import AppError from "@/utils/AppError";

type RequestSource = "body" | "query" | "params";

// <T extends z.ZodType>  ← the generic: "remember WHICH schema was passed"
const validateRequest =
  <T extends z.ZodType>(schema: T, source: RequestSource = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join(".") || source}: ${i.message}`)
        .join("; ");
      return next(new AppError(message, 400)); // ⛔ STOP — controller never runs
    }

    // result.data is typed as z.output<T> — the CLEAN, coerced, defaulted value.
    // We park it on req.validated so the controller reads it WITHOUT an `as` cast.
    req.validated = result.data;
    next(); // ✅ pass the clean parcel down the line
  };

export default validateRequest;
```

**The two jobs, restated:**
1. **Reject** bad input → `400` *before* the controller. (security + clean errors)
2. **Transform** good input → coerced numbers, applied defaults, then hand it on typed.

**The generic `<T>`** is the magic: because the function *remembers which schema* you gave it,
`result.data` is typed as that schema's exact output — not `any`, not a guess.

---

## 4. `express.d.ts` — teaching TS about `req.validated`

**One line:** *Express's `Request` doesn't know about our custom `req.validated`, so we declare it once, globally — this is "declaration merging."*

```ts
// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      validated?: unknown; // each handler narrows this to its own DTO
    }
  }
}
export {};
```

**Why:** without this, `req.validated = ...` is a TS error ("property doesn't exist"). This file
adds the property to *every* `Request` in the project. Write it once, forget it.

---

## 5. `product.route.ts` — the switchboard

**One line:** *Maps each URL+method to a chain of `[validator(s), controller]` — read a route line left-to-right and you see the entire request pipeline.*

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
    validateRequest(productParamsSchema, "params"),   // ① check the id
    validateRequest(productUpdateSchema, "body"),     // ② check the body  ← BOTH
    ctrl.updateProduct)
  .delete(validateRequest(productParamsSchema, "params"), ctrl.deleteProduct);

export default router;
```

**Read it like a sentence:** "POST /products → validate the body → then run createProduct."
Note PATCH chains **two** validators (params *then* body) — both must pass.

> ⚠️ Gotcha note: `req.validated` holds **only the last validator's** output. For PATCH (params +
> body) decide how you read both — e.g. read `id` from `req.params` and the body from
> `req.validated`, or store under named keys. Keep it consistent.

---

## 6. `product.controller.ts` — the translator

**One line:** *Each handler reads the already-clean `req.validated`, calls one service function, and shapes the HTTP response — no DB code, no validation, no business rules.*

```ts
import catchAsync from "@/utils/catchAsync";
import AppError from "@/utils/AppError";
import { productService } from "./product.service";
import type { Request, Response } from "express";
import type {
  ProductCreateDto, ProductUpdateDto, ProductQueryDto, ProductParamDto,
} from "./product.schema";

// a tiny typed reader — the ONLY place a cast lives, instead of one per handler
const body = <T>(req: Request) => req.validated as T;

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.create(body<ProductCreateDto>(req));
  res.status(201).json({ status: "success", data: product });
});

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await productService.findAll(body<ProductQueryDto>(req));
  res.status(200).json({ status: "success", ...result });
});

export const getOneProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as ProductParamDto;
  const product = await productService.findById(id);
  if (!product) throw new AppError("Product not found", 404); // missing → 404 (not 500)
  res.status(200).json({ status: "success", data: product });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as ProductParamDto;
  const product = await productService.update(id, body<ProductUpdateDto>(req));
  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json({ status: "success", data: product });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as ProductParamDto;
  const product = await productService.delete(id);
  if (!product) throw new AppError("Product not found", 404);
  res.status(204).send(); // 204 = success, NO body
});
```

**Three rules a controller obeys:**
1. It **never** touches the DB directly — it calls a service.
2. It **never** re-validates — that already happened at the edge.
3. A missing record is a **404**, thrown as `AppError`, caught by `catchAsync` → global handler.

---

## 7. `product.service.ts` — the worker

**One line:** *Pure database logic — takes plain typed data, returns documents, and knows nothing about `req`, `res`, or HTTP status codes (so it's reusable and testable).*

```ts
import { Product, type ProductDoc } from "./product.model";
import type {
  ProductCreateDto, ProductUpdateDto, ProductQueryDto,
} from "./product.schema";

export const productService = {
  create: (data: ProductCreateDto): Promise<ProductDoc> => Product.create(data),

  findById: (id: string) => Product.findById(id),

  // runValidators re-checks the Mongoose rules on update — keep it on
  update: (id: string, data: ProductUpdateDto) =>
    Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  delete: (id: string) => Product.findByIdAndDelete(id),

  // the real list query: build filter conditionally → sort → paginate
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

    return { data, page: q.page, limit: q.limit, total,
             totalPages: Math.ceil(total / q.limit) };
  },
};
```

**Why HTTP-free?** The same `findById` could be called by a CLI script, a cron job, or a test —
none of which have a `req`. Keeping HTTP out of here is what makes it reusable.

---

## 8. `product.model.ts` — the blueprint

**One line:** *The Mongoose schema is the DB's own shape + last line of defense (`unique`, `required`, types) — Zod guards the door, this guards the database.*

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

export const Product = model("Product", productSchema);
```

**Zod vs Mongoose — why both?**
- **Zod** runs *first*, at the HTTP edge → clean `400`s, coercion, defaults for the *request*.
- **Mongoose** runs *last*, at the DB → enforces `unique` (Zod can't — it doesn't see the DB) and
  is the safety net if data ever reaches the model another way.
- Overlap (`required`, `min`) is normal and good — defense in depth.

---

## 9. Wiring it to boot (the plumbing)

**One line each:**

```ts
// src/config/mongoose.ts — open the DB connection, fail loudly if it can't
export const connectDB = async () => { await mongoose.connect(ENV.MONGO_URI); };

// src/server.ts — connect FIRST, then listen (no point serving with no DB)
const start = async () => { await connectDB(); server.listen(PORT); };
start();

// src/app.ts — mount the router under the API prefix
app.use("/api/v1", productRoute);
```

---

## 10. Full trace of one request (tie it together)

`PATCH /api/v1/products/665f.../  body: { "price": 3999 }`

1. **app.ts** — matches `/api/v1` → hands to `productRoute`.
2. **route** — matches `PATCH /products/:id` → runs the chain.
3. **validateRequest(params)** — `665f...` matches the ObjectId regex ✅ → `req.validated = { id }`.
4. **validateRequest(body)** — `{ price: 3999 }` passes `productUpdateSchema.partial()` ✅ →
   `req.validated = { price: 3999 }`.
5. **updateProduct** — reads `id` from params, body from `req.validated`, calls the service.
6. **service.update** — `findByIdAndUpdate(id, { price: 3999 }, { new, runValidators })`.
7. Found → returns updated doc → controller sends `200 + data`.
   Not found → service returns `null` → controller throws `AppError(404)` → `catchAsync` →
   global error handler → clean `404` JSON.

**One sentence to remember the whole thing:**
*Route picks the line → middleware cleans & types the data → controller translates → service does the DB work → model is the shape — and bad data dies at step 2.*
