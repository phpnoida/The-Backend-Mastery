import { z } from "zod";

// POST body — creating a product
export const productCreateSchema = z.object({
  title: z
    .string("Title is required")
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  sku: z
    .string("SKU is required")
    .regex(
      /^[A-Z0-9]+(-[A-Z0-9]+)*$/,
      "SKU must be uppercase letters/digits in hyphen-separated groups (e.g. KB-100)"
    ),
  price: z
    .number("Price is required")
    .gt(0, "Price must be greater than 0")
    .max(1000000, "Price cannot exceed 1,000,000"),
  category: z.enum(["electronics", "books", "clothing", "food", "toys"], {
    error:
      "values can be either electronics or books or clothing or food or toys",
  }),
  quantity: z
    .number("Quantity is required")
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be less than 0"),
  inStock: z.boolean().default(true),
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag cannot be empty")
        .max(20, "Each tag cannot exceed 20 characters")
    )
    .max(10, "At most 10 tags allowed")
    .default([]),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .default(""),
});

// PATCH body — every field optional, derived from create (DRY)
export const productUpdateSchema = productCreateSchema.partial();

// GET ?page=&limit=&sort=&sortBy= — query values always arrive as strings
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["title", "price", "createdAt"]).default("createdAt"),

  // New Optional Filters
  category: z
    .enum(["electronics", "books", "clothing", "food", "toys"])
    .optional(),
  search: z.string().trim().optional(),
  minPrice: z.coerce
    .number()
    .min(0, "Minimum price cannot be negative")
    .optional(),
  maxPrice: z.coerce
    .number()
    .min(0, "Maximum price cannot be negative")
    .optional(),
});

// :_id route param — Mongo ObjectId (24 hex chars)
export const productParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "invalid id"), // ④ stricter than .length(24)
});

export type ProductCreateDto = z.infer<typeof productCreateSchema>;
export type ProductUpdateDto = z.infer<typeof productUpdateSchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
export type ProductParamDto = z.infer<typeof productParamsSchema>;
