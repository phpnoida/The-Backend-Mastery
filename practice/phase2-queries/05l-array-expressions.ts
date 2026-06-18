/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05l — Array Expression Operators ($size $filter $map $reduce $arrayElemAt $slice)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  These reshape an array INSIDE one document — NO $unwind, output stays one-row-per-doc.
 *      Use $unwind (05e) when you GROUP across array elements of many docs.
 *      Use these when you SUMMARISE or RESHAPE an array but keep the document whole.
 *
 *      $size        → length:           { $size: "$items" }
 *      $filter      → keep some:         { $filter: { input, as, cond } }
 *      $map         → transform each:    { $map:    { input, as, in } }
 *      $reduce      → fold to one value: { $reduce: { input, initialValue, in } }
 *      $arrayElemAt → element at index   ($first = [0], $last = [-1])
 *      $slice       → sub-array:         { $slice: ["$items", 2] }
 *
 *  Inside $filter / $map / $reduce the current element is "$$this"; in $reduce the
 *  running accumulator is "$$value". (Or name your own via the `as` field.)
 *  Run with: npx tsx practice/phase2-queries/05l-array-expressions.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// $size — add itemCount per order WITHOUT $unwind (limit 10). Then, in a second
// pipeline, average itemCount across all orders. (Compare to the $unwind version in 05e.)
// Stages: $project/$addFields ($size) ... / $group (_id:null $avg of $size)
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// $filter — per order, keep only items with quantity > 1.
// Return: { orderId, bulkItems: [{ productName, quantity }] }. Limit 10.
// Stages: $project ($filter)
// Hint: { $filter: { input: "$items", as: "it", cond: { $gt: ["$$it.quantity", 1] } } }.
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// $map — reshape each order's items to a slim [{ name, lineTotal }]. Limit 10.
// Stages: $project ($map)
// Hint: in: { name: "$$this.productName", lineTotal: "$$this.totalPrice" }.
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// $reduce — fold items to a total quantity, and cross-check it equals
// { $sum: { $map: ... quantity } }. Return: { orderId, reduceTotal, sumTotal }. Limit 10.
// Stages: $project ($reduce and $sum-of-$map)
// Hint: { $reduce: { input: "$items", initialValue: 0,
//                    in: { $add: ["$$value", "$$this.quantity"] } } }.
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// $arrayElemAt / $first — the first item's productName per order. Limit 10.
// Stages: $project
// Hint: $arrayElemAt: ["$items.productName", 0]   (or $first).
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// $slice — first 2 items of each order as a preview. Limit 10.
// Stages: $project ($slice)
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// $filter + $arrayElemAt — pull each customer's DEFAULT address (isDefault: true),
// or null when they have none. Limit 10.
// Stages: $project
// Hint: $filter returns an array → take element 0; $arrayElemAt on [] yields null.
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
