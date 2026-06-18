/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05f — $addFields / $set   (add a field, keep everything else)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $addFields adds (or overwrites) fields while KEEPING all existing ones.
 *  $set is a 100% identical alias — use whichever reads better.
 *
 *      { $addFields: { savings: { $subtract: ["$totalMrp", "$totalAmount"] } } }
 *
 *  $addFields  vs  $project:
 *      $addFields → keep all + add new        (non-destructive)
 *      $project   → keep ONLY what you list   (destructive / exclusive)
 *  Reach for $addFields when you want "the whole document PLUS a computed field",
 *  especially when you'll $match or $sort on that new field in a later stage.
 *
 *  Overwriting: { $set: { status: { $toUpper: "$status" } } } replaces status in place.
 *  Run with: npx tsx practice/phase2-queries/05f-addfields-set.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Add savings = totalMrp - totalAmount to each order, keeping all original fields. Limit 5.
// Stages: $addFields, $limit
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Add isHighValue (boolean) = totalAmount > 5000 to each order. Limit 5.
// Stages: $addFields, $limit
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Add itemCount = number of items in the order (use $size on the items array). Limit 5.
// Stages: $addFields, $limit
// Hint: { $size: "$items" }. (Full array-operator drilling is sheet 05l.)
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Inventory: add totalStock = available + reserved + damaged. Limit 5.
// Stages: $addFields ($add), $limit
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Show $set IS $addFields: redo Q1 using $set instead of $addFields. Same result. Limit 5.
// Stages: $set, $limit
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Overwrite in place: uppercase each order's status. Limit 5.
// Stages: $set ($toUpper), $limit
// Hint: $set with the SAME key name replaces the field.
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// THE KILLER USE-CASE — compute then filter on the computed field:
// add isHighValue, then $match only the high-value orders, then count them.
// Stages: $addFields, $match, $group (_id:null, $sum:1)
// Hint: you can't $match on a field that doesn't exist yet — that's WHY $addFields
//       comes first. This "compute → filter" two-step is everywhere in real pipelines.
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
