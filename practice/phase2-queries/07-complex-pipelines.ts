/**
 * Phase 2 — Query Practice
 * Topic: 07 — Complex Pipelines
 *
 * Operators covered: multi-stage joins, $unwind on items[], $facet, $bucket,
 *                    $addFields, $cond, $group after $unwind
 *
 * These are senior-level queries. Each one joins 2–4 collections and has 5+ stages.
 * If stuck: write the stages you need in plain English first, then code each stage.
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/07-complex-pipelines.ts
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Review from "../../src/modules/reviews/review.model.js";
import Product from "../../src/modules/product/product.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";
import Customer from "../../src/modules/customer/customer.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Top 10 customers by total spend.
// Start from orders, group by customerId (sum totalAmount), join → customers for name.
// Return: customer.name, customer.tier, totalSpent, orderCount.
// Sort by totalSpent descending. Limit 10.
// Collections: orders → customers
// Stages: $group, $sort, $limit, $lookup, $unwind, $project

// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Revenue breakdown by product — using Order.items[] (the embedded array).
// Each order has an items[] array. Unwind it so each item becomes a document.
// Then group by variantId, sum (quantity × sellingPrice) to get revenue per variant.
// Return: variantId, productName (snapshot from item), totalRevenue, totalUnitsSold.
// Sort by totalRevenue descending. Limit 10.
// Collections: orders
// Stages: $unwind ("$items"), $group, $sort, $limit
// Key insight: after $unwind, each document is ONE item — access fields as $items.variantId etc.

// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Revenue by category — the full chain:
// Order.items[] → variantId → ProductVariant.productId → Product.category → Category.name
// $unwind items[], join variants, join products, join categories, group by category name.
// Return: category.name, totalRevenue, totalUnitsSold.
// Sort by totalRevenue descending.
// Collections: orders → productvariants → products → categories
// Stages: $unwind, $lookup (×3), $unwind (×3), $group, $sort

// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Bucket customers by loyaltyPoints into tiers:
//   0-499:    "new"
//   500-1999: "regular"
//   2000-4999:"loyal"
//   5000+:    "vip"
// Count customers in each bucket.
// Collections: customers
// Stages: $bucket (boundaries: [0, 500, 2000, 5000, Infinity], default: "vip")
// Note: $bucket requires sorted boundaries. The last bucket catches everything above.

// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// $facet — run two sub-pipelines simultaneously on the products collection:
//   facet 1 "byStatus":   count products grouped by status
//   facet 2 "topRated":   top 5 active products by avgRating (name, avgRating, reviewCount)
// Return both results in one query.
// Collections: products
// Stages: $facet

// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Monthly cohort: for each month, how many NEW customers placed their FIRST order?
// Steps:
//   1. For each customer, find their earliest order date ($group by customerId, $min createdAt)
//   2. Group those by year+month
//   3. Count new customers per month
// Return: [{ month: "2025-01", newCustomers: N }] sorted by month ascending.
// Collections: orders
// Stages: $group (min createdAt per customer), $group (count per month), $sort

// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
