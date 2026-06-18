/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05e — $unwind   (explode an array into one-doc-per-element)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $unwind turns a doc with an N-element array into N docs, copying all other
 *  fields onto each. It's how you analyse the items INSIDE each order.
 *
 *      { _id: 1, items: [a, b, c] }   --$unwind: "$items"-->   { _id: 1, items: a }
 *                                                              { _id: 1, items: b }
 *                                                              { _id: 1, items: c }
 *
 *  THE classic combo:  $unwind → $group   (explode, then aggregate across elements).
 *
 *  Options form:
 *      { $unwind: { path: "$items",
 *                   preserveNullAndEmptyArrays: true,   // keep docs with empty/missing arr
 *                   includeArrayIndex: "idx" } }        // add the element's position
 *
 *  GOTCHA: by DEFAULT, $unwind DROPS documents whose array is empty or missing.
 *  Set preserveNullAndEmptyArrays: true when you must keep them.
 *
 *  Schema: order.items[] = { variantId, productName, quantity, mrp, sellingPrice, totalPrice }
 *  Run with: npx tsx practice/phase2-queries/05e-unwind.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Explode order items so each line item is its own row: { orderId, productName,
// quantity, totalPrice }. Limit 10.
// Stages: $unwind, $project, $limit
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// BEST-SELLING VARIANTS — top 10 variants by total quantity sold across all orders.
// Return: [{ _id: variantId, totalSold }] desc.
// Stages: $unwind, $group, $sort, $limit
// Hint: after $unwind the fields are "$items.variantId" and "$items.quantity".
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Revenue per product name: [{ _id: productName, revenue, unitsSold }] top 10 by revenue.
// Stages: $unwind, $group, $sort, $limit
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Tag popularity across products: [{ _id: tag, count }] top 15.
// Stages: $unwind ($tags), $group, $sort, $limit
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// preserveNullAndEmptyArrays — count products that have NO tags.
// Hint: unwind tags with preserve:true, then $match where tags is missing, then count
//       (use $group _id:null $sum:1, since $count stage comes in sheet 05g).
// Stages: $unwind (preserve), $match, $group
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// includeArrayIndex — show each line item's position within its order:
// { orderId, itemIndex, productName }. Limit 15.
// Stages: $unwind (with index), $project, $limit
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Per customer, total UNITS ever ordered: [{ _id: customerId, customerName, totalUnits }]
// top 10. (customerName survives the unwind — grab it with $first.)
// Stages: $unwind, $group, $sort, $limit
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
