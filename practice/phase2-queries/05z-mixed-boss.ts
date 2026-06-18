/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05z — 🏁 THE MIXED BOSS SHEET   (no operator hints — you choose the tools)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  You've drilled each operator in isolation (05a–05m). This sheet is INTERLEAVED:
 *  every question is a realistic reporting task and DELIBERATELY does not tell you which
 *  stages to use. Choosing the right tool IS the skill — that's what makes it stick.
 *
 *  For each one, before coding, jot down:
 *    1. What is ONE output row?  → your $group._id (or null, or "no group needed")
 *    2. Do I need to reach inside an array?  → $unwind (to group across) or $map/$filter
 *       (to reshape in place)?
 *    3. What's the final shape?  → $project / $addFields
 *
 *  No $lookup here — these all stay within a single collection.
 *  Run with: npx tsx practice/phase2-queries/05z-mixed-boss.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";
import Review from "../../src/modules/reviews/review.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// MONTHLY SALES REPORT: for each month, total revenue, order count, and average order
// value, but ONLY counting delivered orders. Output month as "YYYY-MM", sorted ascending.
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// TOP 10 BEST-SELLING PRODUCTS (by units sold across all order items) with their total
// revenue and number of distinct orders they appeared in.
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// CUSTOMER LIFETIME VALUE table — per customer: order count, total spent, average order
// value, first & last order date. Only customers with 2+ orders. Sort by total spent desc.
// Top 20.
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// ORDERS DASHBOARD in ONE query: { byStatus, revenueBands, topCustomers } where
//   byStatus     = count per status
//   revenueBands = order-amount histogram [0,1000,5000,10000,Inf]
//   topCustomers = top 5 by total spent { customerName, totalSpent }
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// LOW-STOCK ALERT, ranked: inventory items where quantityAvailable < reorderLevel.
// Per warehouse: the count of low-stock items AND the total shortfall
// (sum of reorderLevel - quantityAvailable). Most-critical warehouse first.
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// REVIEW QUALITY per variant: avg rating, review count, and % of reviews that are
// verified. Only variants with 3+ reviews and a verified-rate below 50%. (Suspicious.)
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// COHORT RETENTION-ish: group customers by sign-up month, and for each cohort show how
// many are "active" (logged in within the last 30 days) vs total. One pass.
// YOUR ANSWER:


// ─── Q8 ──────────────────────────────────────────────────────────────────────
// DISCOUNT EFFECTIVENESS: across all orders, total MRP, total discount given, and the
// overall discount percentage formatted as a "X.XX%" string. (Watch your $group._id —
// this is the exact trap from 05/Q8: "across ALL" means one bucket.)
// YOUR ANSWER:


// ─── Q9 ──────────────────────────────────────────────────────────────────────
// PRODUCT CATALOG PAGE (paginated): active products sorted by avgRating desc then
// reviewCount desc, page 2 of 12 per page, projected to { id, name, rating, reviews },
// AND the total active-product count — all in one query.
// YOUR ANSWER:


// ─── Q10 ─────────────────────────────────────────────────────────────────────
// BASKET ANALYSIS: average number of items per order, average distinct products per
// order, and the single largest basket (most items) with its customerName. One pipeline
// if you can; two is fine.
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
