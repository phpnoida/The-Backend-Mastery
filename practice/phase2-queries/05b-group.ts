/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05b — $group   (the heart of aggregation)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $group buckets documents by a key (_id) and runs ACCUMULATORS over each bucket.
 *
 *  Skeleton:
 *      { $group: {
 *          _id: "$field",                 // the bucket key — see THE QUESTION below
 *          total: { $sum: "$amount" },
 *          count: { $sum: 1 },
 *      } }
 *
 *  THE QUESTION to ask every time: "what is ONE output row?" → that IS your _id.
 *      "per status"          → _id: "$status"
 *      "overall / across all"→ _id: null
 *      "per year+month"      → _id: { y: { $year: "$d" }, m: { $month: "$d" } }
 *
 *  Accumulators:
 *      $sum  $avg  $min  $max            (numbers)
 *      $push       → array, keeps duplicates + order
 *      $addToSet   → array, de-duplicated (a set)
 *      $first $last→ value from first/last doc  ← ONLY meaningful if you $sort first!
 *
 *  (Output order doesn't matter on this sheet — you'll drill $sort in 05d. Where a
 *   question needs $first/$last, a $sort is allowed as a peek-ahead.)
 *  Run with: npx tsx practice/phase2-queries/05b-group.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Review from "../../src/modules/reviews/review.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Number of orders per status.  ("per status" → which _id?)
// Stages: $group
// YOUR ANSWER:

const fn1 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        noOfOrders: { $sum: 1 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Total revenue (sum of totalAmount) per status.
// Stages: $group
// YOUR ANSWER:
const f2 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  console.log("data", data);
};
// await f2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Across ALL orders: average, min, and max totalAmount.  ("across all" → which _id?)
// Stages: $group
// YOUR ANSWER:

const fn3 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: null,
        min: { $min: "$totalAmount" },
        max: { $max: "$totalAmount" },
        average: { $avg: "$totalAmount" },
      },
    },
  ]);
  console.log("data", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Number of customers per tier.
// Stages: $group
// YOUR ANSWER:

const fn4 = async () => {
  const data = await Customer.aggregate([
    {
      $group: {
        _id: "$tier",
        totalCustomer: { $sum: 1 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Per customer: order count, total spent, and an ARRAY of every order amount.
// Return: { _id: customerId, customerName, orderCount, totalSpent, amounts: [...] }
// Hint: $first to carry customerName, $push to build the amounts array.
// Stages: $group
// YOUR ANSWER:

const fn5 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$customerId",
        customerName: { $first: "$customerName" },
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        amounts: { $push: "$totalAmount" },
      },
    },
  ]);
  console.log("data", data);
};
// await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Per status: the DISTINCT customer names that have an order in it. ($addToSet)
// Stages: $group
// YOUR ANSWER:

const fn6 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        customerName: { $addToSet: "$customerName" },
      },
    },
  ]);
  console.log("data", data);
};
await fn6();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Grand totals across all orders: totalMrp, totalDiscount, totalAmount, orderCount.
// Stages: $group  (_id: null)
// YOUR ANSWER:

const fn7 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalMrp: { $sum: "$totalMrp" },
        totalDiscount: { $sum: "$totalDiscount" },
        totalAmount: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn7()

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Revenue + order count per year-and-month of createdAt.  (compound object _id)
// Hint: _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }.
// Stages: $group
// YOUR ANSWER:

const fn8 = async () => {
  const data = await Order.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        orderCount: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  console.log("data", data);
};
// await fn8();

// ─── Q9 ──────────────────────────────────────────────────────────────────────
// Per variant (reviews): average rating and review count.
// Stages: $group
// YOUR ANSWER:
const f9 = async () => {
  const data = await Review.aggregate([
    {
      $group: {
        _id: "$variantId",
        reviewCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log("data", data);
};
// await f9();

// ─── Q10 ─────────────────────────────────────────────────────────────────────
// First & last order DATE per customer (their buyer lifespan).
// Return: { _id: customerId, firstOrder, lastOrder, orderCount }
// Hint: $sort by createdAt ASC first, THEN $group with $first / $last — remember the
//       golden rule: $first/$last are meaningless without a prior $sort.
// Stages: $sort, $group
// YOUR ANSWER:

await mongoose.disconnect();
console.log("\nDone.");
