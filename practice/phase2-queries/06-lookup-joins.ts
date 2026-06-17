/**
 * Phase 2 — Query Practice
 * Topic: 06 — $lookup Joins
 *
 * Operators covered: $lookup (simple + pipeline form), $unwind, $match after $lookup
 *
 * MongoDB has no foreign-key enforcement — $lookup is how you join collections.
 * Two forms:
 *   Simple:   { from, localField, foreignField, as }
 *   Pipeline: { from, let, pipeline, as }  ← more powerful, use when you need conditions
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/06-lookup-joins.ts
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Product from "../../src/modules/product/product.model.js";
import Review from "../../src/modules/reviews/review.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import ProductVariant from "../../src/modules/product/variant.model.js";
import Category from "../../src/modules/category/category.model.js";
import Supplier from "../../src/modules/supplier/supplier.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Get all orders with the customer's full document joined in.
// Start from orders, join → customers on customerId.
// Return: customerName (snapshot), customer.tier, customer.loyaltyPoints, totalAmount, status.
// Limit to 5 results.
// Collections: orders → customers
// Stages: $lookup, $unwind (to flatten the joined array), $project, $limit

// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Get all products with their brand name joined in.
// Start from products, join → brands on brand field.
// Return: product name, startingPrice, status, brand.name, brand.countryOfOrigin.
// Only active products.
// Collections: products → brands
// Stages: $match, $lookup, $unwind, $project

// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Get all reviews with the reviewer's name and the variant's skuCode joined in.
// Start from reviews.
// Return: rating, title, customer.name, variant.skuCode, variant.attributes.
// Collections: reviews → customers, reviews → productvariants
// Stages: two $lookups, two $unwinds, $project

// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Get all products with their category name AND the parent category name.
// (Category has a self-reference: parentCategory → Category)
// This needs two $lookups: one for the category, one for the parent category.
// Return: product name, category.name, parentCategory.name.
// Collections: products → categories → categories (self-join)
// Stages: $lookup (products→categories), $unwind, $lookup (categories→categories), $unwind, $project

// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Low stock report with full context:
// Get all inventory items where quantityAvailable < reorderLevel,
// joined with warehouse name and variant skuCode.
// Return: variant.skuCode, warehouse.name, quantityAvailable, reorderLevel.
// Collections: inventoryitems → warehouses, inventoryitems → productvariants
// Stages: $match ($expr), $lookup (×2), $unwind (×2), $project

// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Find all orders placed by "gold" or "platinum" customers.
// Start from orders, join → customers, filter after join on customer.tier.
// Return: customerName, customer.tier, totalAmount, status.
// Collections: orders → customers
// Stages: $lookup, $unwind, $match (AFTER $lookup on joined field), $project

// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Get each product variant with its parent product's name and seller's businessName.
// Start from productvariants.
// Return: variant name, skuCode, attributes, mrp, product.name, seller.businessName.
// Collections: productvariants → products → sellers
// Stages: $lookup (variants→products), $unwind, $lookup (products→sellers), $unwind, $project

// YOUR ANSWER:


// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Get each supplier with the full details of every variant they supply.
// Use the pipeline form of $lookup (because Supplier.products is an array of IDs).
// Return: supplier companyName, and an array of { skuCode, mrp, sellingPrice } for each variant.
// Collections: suppliers → productvariants
// Stages: $lookup (pipeline form with $in), $project
// Hint: pipeline form — { from: "productvariants", let: { variantIds: "$products" },
//         pipeline: [{ $match: { $expr: { $in: ["$_id", "$$variantIds"] } } }], as: "variantDetails" }

// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
