/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05a — $match   (the pipeline's WHERE clause)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $match filters documents — only those that pass flow to the next stage.
 *  It uses the SAME query syntax as find(), so this sheet also revises your
 *  comparison/logical operators from sheets 01–03.
 *
 *  Skeleton:
 *      { $match: { <field>: <value> } }                  // equality
 *      { $match: { <field>: { $gt: 100 } } }             // comparison
 *      { $match: { $or: [ {...}, {...} ] } }             // logical
 *      { $match: { $expr: { $lt: ["$a", "$b"] } } }      // compare TWO fields
 *
 *  Operator cheat-sheet:
 *      $eq $ne $gt $gte $lt $lte          $in $nin
 *      $and $or $not $nor                 $exists $regex          $expr
 *
 *  GOLDEN RULES:
 *   • Put $match as EARLY as possible — it shrinks the stream and can use indexes.
 *   • Normal $match compares a field to a CONSTANT. To compare two FIELDS of the
 *     same document, you MUST wrap it in $expr.
 *
 *  (This sheet uses $limit only to keep console output short — focus on $match.)
 *  Run with: npx tsx practice/phase2-queries/05a-match.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// All delivered orders. (plain equality)
// Stages: $match
// YOUR ANSWER:
const fn1 = async () => {
  const data = await Order.aggregate([
    {
      $match: {
        status: "delivered",
      },
    },
  ]);
  console.log("data", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// All orders with totalAmount greater than 5000. ($gt)
// Stages: $match
// YOUR ANSWER:

const fn2 = async () => {
  const data = await Order.aggregate([
    {
      $match: {
        totalAmount: { $gt: 5000 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Orders whose status is one of: pending, confirmed, processing. ($in)
// Stages: $match
// YOUR ANSWER:

const fn3 = async () => {
  const data = await Order.aggregate([
    {
      $match: {
        status: { $in: ["pending", "confirmed", "processing"] },
      },
    },
    {
      $limit: 3,
    },
  ]);
  console.log("data", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Customers who are NOT on the silver tier. ($ne or $nin)
// Stages: $match
// YOUR ANSWER:

const fn4 = async () => {
  const data = await Customer.aggregate([
    {
      $match: {
        tier: { $ne: "silver" },
      },
    },
    {
      $limit: 2,
    },
  ]);
  console.log("data", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Customers who HAVE a phone number saved. ($exists)
// Hint: { phone: { $exists: true, $ne: null } } — exists true still allows null.
// Stages: $match
// YOUR ANSWER:

const fn5 = async () => {
  const data = await Customer.aggregate([
    {
      $match: {
        phone: { $exists: true, $ne: null },
      },
    },
  ]);
  console.log("data", data);
};
// await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Active products with avgRating >= 4. (two conditions = implicit $and)
// Stages: $match
// YOUR ANSWER:

const fn6 = async () => {
  const data = await Product.aggregate([
    {
      $match: {
        status: "active",
        avgRating: { $gte: 4 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn6();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Orders that are (delivered OR cancelled) AND over 10000. ($or nested with a field)
// Stages: $match
// Hint: { $and: [ { $or: [...] }, { totalAmount: { $gt: 10000 } } ] }.
// YOUR ANSWER:

const fn7 = async () => {
  const data = await Order.aggregate([
    {
      $match: {
        status: { $in: ["delivered", "cancelled"] },
        totalAmount: { $gt: 10000 },
      },
    },
  ]);
  console.log("data", data);
};
// await fn7();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Inventory items where quantityAvailable is below reorderLevel. (TWO fields → $expr)
// Stages: $match
// Hint: { $match: { $expr: { $lt: ["$quantityAvailable", "$reorderLevel"] } } }.
// YOUR ANSWER:

const fn8 = async () => {
  const data = await InventoryItem.aggregate([
    {
      $match: {
        $expr: { $gt: ["$reorderLevel", "$quantityAvailable"] },
      },
    },
  ]);
  console.log("data", data);
};
// await fn8()

// ─── Q9 ──────────────────────────────────────────────────────────────────────
// Customers whose name starts with "a" (case-insensitive). ($regex)
// Stages: $match
// Hint: { name: { $regex: "^a", $options: "i" } }.
// YOUR ANSWER:

const f9 = async () => {
  const data = await Customer.aggregate([
    {
      $match: {
        name: { $regex: /^a/i },
      },
    },
  ]);
  console.log("data", data);
};
// await f9();

// ─── Q10 ─────────────────────────────────────────────────────────────────────
// Inventory items that are healthy: quantityAvailable is at least DOUBLE reorderLevel.
// (two fields with arithmetic → $expr + $multiply)
// Stages: $match
// Hint: { $expr: { $gte: ["$quantityAvailable", { $multiply: ["$reorderLevel", 2] }] } }.
// YOUR ANSWER:

const f10 = async () => {
  const data = await InventoryItem.aggregate([
    {
      $match: {
        $expr: {
          $gte: ["$quantityAvailable", { $multiply: ["$reorderLevel", 2] }],
        },
      },
    },
  ]);
  console.log("data", data);
};
await f10();

await mongoose.disconnect();
console.log("\nDone.");
