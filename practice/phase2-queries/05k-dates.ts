/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05k — Dates & Time
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  Time-series reporting is bread-and-butter backend work. Two styles to group by time:
 *
 *    1. DECOMPOSE: _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }
 *    2. TRUNCATE:  _id: { $dateTrunc: { date: "$createdAt", unit: "month" } }   (cleaner)
 *
 *  Toolbox:
 *      $year $month $dayOfMonth $dayOfWeek $hour   → extract a part (numbers)
 *      $dateToString: { format: "%Y-%m", date: "$d" }   → format as string
 *      $dateTrunc:    { date, unit: "week"|"month"|... } → snap down to period start
 *      $dateDiff:     { startDate, endDate, unit: "day" } → difference between two dates
 *      $dateAdd / $dateSubtract: { startDate, unit, amount } → date math
 *      $$NOW          → server's current timestamp (system variable)
 *
 *  Every doc has createdAt / updatedAt (timestamps: true).
 *  Run with: npx tsx practice/phase2-queries/05k-dates.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Orders per day-of-week — which weekday is busiest?
// Return: [{ _id: 1..7, count }] sorted by count desc. ($dayOfWeek: 1=Sun..7=Sat)
// Stages: $group ($dayOfWeek), $sort
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Peak ordering HOURS — distribution across the 24 hours.
// Return: [{ _id: 0..23, count }] sorted by hour asc.
// Stages: $group ($hour), $sort
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Monthly revenue with $dateTrunc (compare to the $dateFromParts dance in 05/Q6).
// Return: [{ _id: <first-of-month>, revenue, orders }] sorted asc.
// Stages: $group ($dateTrunc month), $sort
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Order AGE in days relative to now.
// Return: { orderId, status, ageDays } oldest first, limit 10.
// Stages: $addFields ($dateDiff with endDate "$$NOW"), $sort, $project, $limit
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Orders placed in the LAST 30 days — count them.
// Stages: $match (createdAt >= $$NOW - 30 days), $group (_id:null $sum:1)
// Hint: cutoff = { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 30 } } inside
//       a $match $expr ($gte). ($count stage was 05g; either works.)
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// SIGN-UP COHORTS — customers grouped by join month (createdAt).
// Return: [{ cohort: "YYYY-MM", newCustomers }] sorted asc.
// Stages: $group ($dateToString "%Y-%m"), $sort
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Login recency buckets from lastLogin: "active" (<=7d), "recent" (<=30d),
// "dormant" (>30d), "never" (no lastLogin).
// Return: [{ _id, count }].
// Stages: $addFields ($switch over $dateDiff vs $$NOW, $ifNull for never), $sortByCount/$group
// Hint: this fuses 05j ($switch/$ifNull) with dates. $ifNull catches the never-logged-in.
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
