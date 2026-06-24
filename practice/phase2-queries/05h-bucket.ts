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
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Order-value histogram with boundaries [0, 1000, 5000, 10000, Infinity].
// For each band return count. Use default "other" for safety.
// Stages: $bucket
// YOUR ANSWER:

const fn1 = async () => {
  const data = await Order.aggregate([
    {
      $bucket: {
        groupBy: "$totalAmount",
        boundaries: [100000, 200000, 300000, Infinity],
        default: "other",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);
  console.log("data1-->", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Same bands as Q1 but also return the AVERAGE totalAmount per band.
// Stages: $bucket (output with $sum and $avg)
// YOUR ANSWER:

const fn2 = async () => {
  const data = await Order.aggregate([
    {
      $bucket: {
        groupBy: "$totalAmount",
        boundaries: [100000, 200000, 300000, Infinity],
        default: "other",
        output: {
          count: { $sum: 1 },
          avg: { $avg: "$totalAmount" },
        },
      },
    },
  ]);
  console.log("data2--->", data);
};
// await fn2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Remove the Infinity boundary so the top band is [10000]. Find an order above 10000
// and watch it land in `default: "other"`. (Proves what `default` is for.)
// Stages: $bucket
// YOUR ANSWER:

const fn3 = async () => {
  const data = await Order.aggregate([
    {
      $bucket: {
        groupBy: "$totalAmount",
        boundaries: [100000, 200000, 300000],
        default: "other",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);
  console.log("data3-->", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// $bucketAuto — split customers into 5 buckets by loyaltyPoints. Return each bucket's
// range (_id has min/max) and member count.
// Stages: $bucketAuto
// YOUR ANSWER:

const fn4 = async () => {
  const data = await Customer.aggregate([
    {
      $bucketAuto: {
        groupBy: "$loyaltyPoints",
        buckets: 4,
        output: {
          memberCount: { $sum: 1 },
        },
      },
    },
  ]);
  console.log("data4-->", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// $bucketAuto — split active products into 4 buckets by avgRating; show count per bucket.
// Stages: $match, $bucketAuto
// YOUR ANSWER:
const fn5 = async () => {
  const data = await Product.aggregate([
    {
      $match: {
        status: "active",
      },
    },
    {
      $bucketAuto: {
        groupBy: "$avgRating",
        buckets: 4,
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);
  console.log("data5-->", data);
};
await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Rating histogram of reviews using $bucket with boundaries [1,2,3,4,5,6]
// (so each integer rating is its own band). Return count per rating.
// Stages: $bucket
// Hint: 6 is the exclusive upper edge so rating 5 has a bucket to live in.
// YOUR ANSWER:

const fn6 = async () => {
  const data = await Review.aggregate([
    {
      $bucket: {
        groupBy: "$rating",
        boundaries: [1, 2, 3, 4, 5, 6],
        default: "other",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);
  console.log("data6-->", data);
};
// await fn6();

await mongoose.disconnect();
console.log("\nDone.");
