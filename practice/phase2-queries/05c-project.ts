/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05c — $project   (reshape: pick, rename, compute)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $project decides the SHAPE of each document going forward. It is EXCLUSIVE:
 *  you list what you want, and only that survives (plus _id unless you drop it).
 *
 *  Skeleton:
 *      { $project: { status: 1, totalAmount: 1, _id: 0 } }    // include (keep these)
 *      { $project: { password: 0 } }                          // exclude (drop these)
 *      { $project: { amount: "$totalAmount" } }               // rename / lift a field
 *      { $project: { savings: { $subtract: ["$totalMrp", "$totalAmount"] } } } // compute
 *
 *  THE BIG RULE: you canNOT mix include (1) and exclude (0) in one $project —
 *  EXCEPT _id, which you may always set to 0. Pick a mode: keep-list OR drop-list.
 *
 *  Lifting nested fields: { city: "$shippingAddress.city" } pulls a sub-field up.
 *  Run with: npx tsx practice/phase2-queries/05c-project.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";
import Seller from "../../src/modules/seller/seller.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Show only status and totalAmount for each order, and DROP _id. Limit 10.
// Stages: $project, $limit
// YOUR ANSWER:
const fn1 = async () => {
  const data = await Order.aggregate([
    {
      $project: {
        status: 1,
        totalAmount: 1,
        _id: 0,
      },
    },
    {
      $limit: 10,
    },
  ]);
  console.log("data", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Same as Q1 but rename totalAmount → amount in the output. Limit 10.
// Stages: $project, $limit
// YOUR ANSWER:

const fn2 = async () => {
  const data = await Order.aggregate([
    {
      $project: {
        _id: 0,
        status: 1,
        amount: "$totalAmount",
      },
    },
    { $limit: 10 },
  ]);
  console.log("data", data);
};
// await fn2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Per order, output { orderId, savings } where savings = totalMrp - totalAmount.
// (orderId should be the _id renamed.) Limit 10.
// Stages: $project, $limit
// Hint: { orderId: "$_id", savings: { $subtract: [...] }, _id: 0 }.
// YOUR ANSWER:

const fn3 = async () => {
  const data = await Order.aggregate([
    {
      $project: {
        _id: 0,
        orderId: "$_id",
        savings: { $subtract: ["$totalMrp", "$totalAmount"] },
      },
    },
    {
      $limit: 10,
    },
  ]);
  console.log("data", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Lift a nested field: output { orderId, city } where city comes from shippingAddress.city.
// Limit 10.
// Stages: $project, $limit
// YOUR ANSWER:

const fn4 = async () => {
  const data = await Order.aggregate([
    {
      $project: {
        _id: 0,
        orderId: "$_id",
        city: "$shippingAddress.city",
      },
    },
    { $limit: 10 },
  ]);
  console.log("data", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Add a computed boolean: { orderId, totalAmount, isBigOrder } where isBigOrder is
// true when totalAmount > 5000. Limit 10.
// Stages: $project, $limit
// Hint: a comparison expression like { $gt: ["$totalAmount", 5000] } returns a boolean.
// YOUR ANSWER:
const fn5 = async () => {
  const data = await Order.aggregate([
    {
      $project: {
        _id: 0,
        orderId: "$_id",
        totalAmount: 1,
        isBigOrder: { $gt: ["$totalAmount", 5000] },
      },
    },
    { $limit: 10 },
  ]);
  console.log("data", data);
};
// await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// EXCLUSION MODE: return full customer docs but DROP password and __v only
// (keep everything else). Limit 5.
// Stages: $project, $limit
// Hint: this is the drop-list mode — { password: 0, __v: 0 }. Don't mix in any 1s.
// YOUR ANSWER:

const fn6 = async () => {
  const data = await Customer.aggregate([
    {
      $project: {
        password: 0,
        __v: 0,
      },
    },
    { $limit: 5 },
  ]);
  console.log("data", data);
};
// await fn6();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Reshape product into a card: { id, title, price, rating } from
// _id, name, startingPrice, avgRating. Round rating to 1 dp. Limit 10.
// Stages: $project, $limit
// Hint: { id: "$_id", title: "$name", price: "$startingPrice",
//         rating: { $round: ["$avgRating", 1] }, _id: 0 }.
// YOUR ANSWER:

const fn7 = async () => {
  const data = await Product.aggregate([
    {
      $project: {
        _id: 0,
        id: "$_id",
        title: "$name",
        price: "$startingPrice",
        rating: { $round: ["$avgRating", 1] },
      },
    },
    { $limit: 10 },
  ]);
  console.log("data", data);
};
// await fn7();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Prove the gotcha to yourself: try { status: 1, password: 0 } in ONE $project and
// observe the error. Then fix it the correct way (keep status, drop _id only).
// Stages: $project
// YOUR ANSWER:

const fn8 = async () => {
  const data = await Seller.aggregate([
    {
      $project: {
        status: 1,
        _id: 0,
        // password: 0,
      },
    },
  ]);
  console.log("data", data);
};
// await fn8();

await mongoose.disconnect();
console.log("\nDone.");
