/**
 * Phase 2 — Query Practice
 * Topic: 05 — Aggregation Basics
 *
 * Operators covered: $match, $group, $project, $sort, $limit, $count, $sum, $avg, $min, $max
 *
 * This is where real MongoDB power starts. Every question uses the aggregation pipeline.
 * Think of stages as a conveyor belt — documents flow through each stage one by one.
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/05-aggregation-basics.ts
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Order from "../../src/modules/order/order.model.js";
import Review from "../../src/modules/reviews/review.model.js";
import Product from "../../src/modules/product/product.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Count how many orders exist for each status.
// Expected output: [{ _id: "delivered", count: N }, { _id: "pending", count: N }, ...]
// Sort by count descending.
// Collections: orders
// Stages: $group, $sort

// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Calculate total revenue from all "delivered" orders (sum of totalAmount).
// Expected output: { totalRevenue: NNNN }
// Collections: orders
// Stages: $match, $group

// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Find the average order value (avg of totalAmount) for delivered orders.
// Also return the min and max order value in the same pipeline.
// Expected output: { avgOrderValue: N, minOrder: N, maxOrder: N }
// Collections: orders
// Stages: $match, $group

// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Count customers in each tier (silver, gold, platinum).
// Expected output: [{ _id: "silver", count: N }, ...]
// Collections: customers
// Stages: $group, $sort

// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Find the top 5 products by reviewCount (most reviewed first).
// Return: productId (_id), reviewCount.
// Hint: avgRating and reviewCount are stored on the product document — no join needed.
// Collections: products
// Stages: $match (status: active), $sort, $limit, $project

// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Monthly revenue report — group all orders by year+month of createdAt,
// calculate total revenue and order count per month.
// Expected output: [{ month: "2025-01", totalRevenue: N, orderCount: N }, ...]
// Sort by month ascending.
// Collections: orders
// Stages: $group (with $dateToString or $month + $year), $sort
// Hint: _id in $group can be an object: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }

// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Find all inventory items where quantityAvailable is BELOW reorderLevel (low stock alert).
// Count how many such items exist per warehouse.
// Expected output: [{ _id: warehouseId, lowStockCount: N }]
// Collections: inventoryitems
// Stages: $match ($expr to compare two fields), $group

// YOUR ANSWER:


// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Calculate the total discount given across ALL orders.
// Also calculate what percentage of totalMrp was discounted overall.
// Expected output: { totalMrp: N, totalDiscount: N, discountPercentage: "X.XX%" }
// Collections: orders
// Stages: $group, $project (with $divide, $multiply for percentage)

// YOUR ANSWER:


// ─── Q9 ──────────────────────────────────────────────────────────────────────
// Find all variants (by variantId) that have an average review rating below 3.
// Expected output: [{ _id: variantId, avgRating: N, reviewCount: N }]
// Only include variants with at least 2 reviews.
// Collections: reviews
// Stages: $group, $match (use $match AFTER $group to filter aggregated results — this is called $having equivalent)

// YOUR ANSWER:


// ─── Q10 ─────────────────────────────────────────────────────────────────────
// For each order status, calculate: count, totalRevenue (sum of totalAmount), avgOrderValue.
// Project a clean output: { status, orderCount, totalRevenue, avgOrderValue }.
// Sort by totalRevenue descending.
// Collections: orders
// Stages: $group, $project, $sort

// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
