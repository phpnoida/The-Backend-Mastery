/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05d — $sort / $limit / $skip   (ordering, top-N, pagination)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *      { $sort:  { totalAmount: -1 } }     // -1 desc, 1 asc; multi-key = tiebreak
 *      { $limit: 10 }                      // keep first N
 *      { $skip:  20 }                      // drop first N
 *
 *  ORDER OF STAGES MATTERS:
 *      $sort → $limit       = "top N"        (sort the whole set, then take N)
 *      $limit → $sort       = "sort an arbitrary N"   (almost always a BUG)
 *  Pagination = $sort → $skip → $limit, in that order.
 *
 *  PERF NOTE: $sort then $limit lets MongoDB do a "top-K" sort (cheap). $sort with no
 *  limit on a huge unindexed set can blow the 100MB in-memory sort cap. Sort on indexed
 *  fields where you can.
 *
 *  CAVEAT: $skip without a $sort returns documents in an undefined order — page 2 might
 *  repeat rows from page 1. ALWAYS sort before you skip.
 *  Run with: npx tsx practice/phase2-queries/05d-sort-limit-skip.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// The 10 most expensive orders (totalAmount desc).
// Stages: $sort, $limit
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// The 10 cheapest orders (totalAmount asc).
// Stages: $sort, $limit
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Top 5 customers by loyaltyPoints.
// Stages: $sort, $limit
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// The 5 most recently created orders.
// Stages: $sort (createdAt desc), $limit
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// COMPOUND SORT (tiebreak): products by avgRating desc, and within equal ratings,
// by reviewCount desc. Top 10.
// Stages: $sort, $limit
// Hint: { avgRating: -1, reviewCount: -1 } — keys are applied left to right.
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// PAGINATION — page 2, 10 orders per page, newest first.
// Hint: sort by createdAt desc, then $skip 10, then $limit 10. (page N → skip (N-1)*size)
// Stages: $sort, $skip, $limit
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Demonstrate the BUG: write $limit 5 BEFORE $sort and compare to $sort before $limit.
// Notice the first gives "5 random orders, then sorted" — not the top 5.
// Stages: $limit, $sort   vs   $sort, $limit
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
