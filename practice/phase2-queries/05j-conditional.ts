/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05j — $cond / $switch / $ifNull   (IF/ELSE inside the pipeline)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  These let you branch on a value, and — combined with $sum — count/aggregate many
 *  buckets in a SINGLE pass. Every dashboard "X delivered, Y cancelled" is built this way.
 *
 *      $cond:   { $cond: [ <test>, <then>, <else> ] }
 *      $switch: { $switch: { branches: [ { case: <test>, then: <v> }, ... ],
 *                            default: <v> } }
 *      $ifNull: { $ifNull: [ "$maybeMissing", <fallback> ] }   // coalesce
 *
 *  THE FLAGSHIP PATTERN — conditional $sum (a one-pass pivot):
 *      delivered: { $sum: { $cond: [ { $eq: ["$status","delivered"] }, 1, 0 ] } }
 *                          └─ if delivered add 1 else add 0 ─┘
 *  Swap the `1` for "$totalAmount" to sum revenue per branch instead of counting.
 *  Run with: npx tsx practice/phase2-queries/05j-conditional.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Review from "../../src/modules/reviews/review.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// ONE-PASS STATUS PIVOT: in a single group, return { delivered, cancelled, pending }
// counts.
// Stages: $group (_id:null, three conditional $sum)
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Revenue split in one pass: { deliveredRevenue, cancelledRevenue }.
// Stages: $group (_id:null)
// Hint: add "$totalAmount" in the $cond `then` instead of 1.
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// $switch — label each order small (<1000) / medium (<5000) / large, then count each.
// Stages: $addFields ($switch), $sortByCount (or $group)
// Hint: branches test top-to-bottom, first match wins; always give a default.
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// $ifNull — count customers with vs without a phone, in one pass.
// Return: { withPhone, withoutPhone }.
// Stages: $group (_id:null)
// Hint: { $cond: [ { $ifNull: ["$phone", false] }, 1, 0 ] }.
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Per variant: avg rating of VERIFIED reviews only, vs avg of ALL reviews, plus the
// verified count. Return: [{ _id: variantId, verifiedAvg, overallAvg, verifiedCount }].
// Stages: $group (by variantId)
// Hint: $avg ignores null → { $avg: { $cond: ["$isVerified", "$rating", null] } } averages
//       only verified ratings. Slick trick worth memorising.
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// $switch as a lookup table: map tier → bonus points (silver 0, gold 100, platinum 500),
// then sum bonus per tier. Return: [{ _id: tier, members, bonusTotal }].
// Stages: $addFields ($switch), $group
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
