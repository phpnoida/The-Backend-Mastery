/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05g — $count / $sortByCount   (the shortcut stages)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *      { $count: "total" }              // collapse the whole stream to { total: N }
 *
 *      { $sortByCount: "$status" }      // shorthand for:
 *      //   { $group: { _id: "$status", count: { $sum: 1 } } }
 *      //   { $sort:  { count: -1 } }
 *
 *  $count (the STAGE) ≠ $sum:1 (the accumulator). Same idea, different place:
 *      • $count → you only want the final number, nothing else survives.
 *      • $sum:1 inside $group → you want a count ALONGSIDE other fields.
 *
 *  $sortByCount is just a convenience: "group by X, count, sort desc" in one line.
 *  You already wrote it the long way in 05/Q1 — this is the express lane.
 *  Run with: npx tsx practice/phase2-queries/05g-count-sortbycount.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// How many active products are there? (just the number)
// Stages: $match, $count
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// How many delivered orders are there?
// Stages: $match, $count
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Orders per status, sorted desc — in ONE stage.
// Stages: $sortByCount
// Hint: compare this to what you wrote in 05-aggregation-basics Q1.
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Customers per tier, sorted desc — in one stage.
// Stages: $sortByCount
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Orders per shipping city, sorted desc.
// Stages: $sortByCount ($shippingAddress.city)
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Combine with $unwind (drilled in 05e): the most common product TAGS, sorted desc.
// Stages: $unwind ($tags), $sortByCount
// Hint: $sortByCount works on whatever the previous stage emits — unwind first.
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Prove the equivalence: write Q3 again the LONG way ($group + $sort) and confirm the
// output matches $sortByCount.
// Stages: $group, $sort
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
