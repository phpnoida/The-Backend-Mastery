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

const fn1 = async () => {
  const data = await Order.aggregate([
    {
      $sort: {
        totalAmount: -1,
      },
    },
    { $limit: 10 },
  ]);
  console.log("data1", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// The 10 cheapest orders (totalAmount asc).
// Stages: $sort, $limit
// YOUR ANSWER:
const fn2 = async () => {
  const data = await Order.aggregate([
    {
      $sort: {
        totalAmount: 1,
      },
    },
    {
      $limit: 10,
    },
  ]);
  console.log("data2", data);
};
// await fn2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Top 5 customers by loyaltyPoints.
// Stages: $sort, $limit
// YOUR ANSWER:

const fn3 = async () => {
  const data = await Customer.aggregate([
    {
      $sort: {
        loyaltyPoints: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);
  console.log("data3--->", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// The 5 most recently created orders.
// Stages: $sort (createdAt desc), $limit
// YOUR ANSWER:

const fn4 = async () => {
  const data = await Order.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);
  console.log("data4-->", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// COMPOUND SORT (tiebreak): products by avgRating desc, and within equal ratings,
// by reviewCount desc. Top 10.
// Stages: $sort, $limit
// Hint: { avgRating: -1, reviewCount: -1 } — keys are applied left to right.
// YOUR ANSWER:

const fn5 = async () => {
  const data = await Product.aggregate([
    {
      $sort: {
        avgRating: -1,
        reviewCount: -1,
      },
    },
    {
      $limit: 10,
    },
  ]);
  console.log("data5-->", data);
};
// await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// PAGINATION — page 2, 10 orders per page, newest first.
// Hint: sort by createdAt desc, then $skip 10, then $limit 10. (page N → skip (N-1)*size)
// Stages: $sort, $skip, $limit
// YOUR ANSWER:

const f6 = async () => {
  const data = await Order.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: 10,
    },
    {
      $limit: 10,
    },
  ]);
  console.log("data6-->", data);
};
// await f6();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Demonstrate the BUG: write $limit 5 BEFORE $sort and compare to $sort before $limit.
// Notice the first gives "5 random orders, then sorted" — not the top 5.
// Stages: $limit, $sort   vs   $sort, $limit
// YOUR ANSWER:

const fn7 = async () => {
  // it will first fetch first 5 orders and then sort will be based on those first 5 orders
  const data1 = await Order.aggregate([
    {
      $limit: 5,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  console.log("data7--->", data1);

  //   first sort orders means recent order and then get top 5 recent order
  const data2 = await Order.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);

  console.log("data2", data2);
};
await fn7();

await mongoose.disconnect();
console.log("\nDone.");
