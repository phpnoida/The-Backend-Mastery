/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05h — $bucket / $bucketAuto   (histograms)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  Bucketing = grouping by a RANGE instead of an exact value. Perfect for
 *  "how many orders fall in each price band" style reports.
 *
 *  $bucket (you choose the boundaries):
 *      { $bucket: {
 *          groupBy: "$totalAmount",
 *          boundaries: [0, 1000, 5000, 10000],   // must be sorted ascending
 *          default: "other",                      // catches values outside the range
 *          output: { count: { $sum: 1 }, avg: { $avg: "$totalAmount" } }
 *      } }
 *  A value v lands in the bucket [b_i, b_i+1)  → lower bound inclusive, upper exclusive.
 *  Anything below the first / above the last boundary goes to `default` (else it ERRORS).
 *
 *  $bucketAuto (Mongo chooses the boundaries):
 *      { $bucketAuto: { groupBy: "$loyaltyPoints", buckets: 5 } }
 *  Use when you DON'T know the distribution and just want ~N evenly-filled buckets.
 *  Run with: npx tsx practice/phase2-queries/05h-bucket.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Review from "../../src/modules/reviews/review.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Order-value histogram with boundaries [0, 1000, 5000, 10000, Infinity].
// For each band return count. Use default "other" for safety.
// Stages: $bucket
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Same bands as Q1 but also return the AVERAGE totalAmount per band.
// Stages: $bucket (output with $sum and $avg)
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Remove the Infinity boundary so the top band is [10000]. Find an order above 10000
// and watch it land in `default: "other"`. (Proves what `default` is for.)
// Stages: $bucket
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// $bucketAuto — split customers into 5 buckets by loyaltyPoints. Return each bucket's
// range (_id has min/max) and member count.
// Stages: $bucketAuto
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// $bucketAuto — split active products into 4 buckets by avgRating; show count per bucket.
// Stages: $match, $bucketAuto
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Rating histogram of reviews using $bucket with boundaries [1,2,3,4,5,6]
// (so each integer rating is its own band). Return count per rating.
// Stages: $bucket
// Hint: 6 is the exclusive upper edge so rating 5 has a bucket to live in.
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
