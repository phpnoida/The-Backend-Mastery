/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05m — Strings & Type Conversion
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  Real data is messy: you normalise case, derive dimensions from text (email domain,
 *  initials), and coerce types (ObjectId ↔ string) right inside the pipeline.
 *
 *      $concat   → join:        { $concat: ["$a", " ", "$b"] }
 *      $toUpper / $toLower → case
 *      $split    → string→array:{ $split: ["$email", "@"] }
 *      $substrCP → substring:   { $substrCP: ["$name", 0, 1] }   (use *CP = unicode-safe)
 *      $strLenCP → length
 *      $regexMatch → boolean:   { $regexMatch: { input: "$name", regex: "pro", options: "i" } }
 *      $toString / $toInt / $toDouble → coerce
 *      $convert  → coerce with safety: { input, to, onError, onNull }
 *      $type     → BSON type name of a value (debug messy fields)
 *
 *  #1 FOOTGUN: you cannot $concat an ObjectId — $toString it first.
 *  Run with: npx tsx practice/phase2-queries/05m-strings-types.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Order from "../../src/modules/order/order.model.js";
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// EMAIL DOMAIN BREAKDOWN — count customers per email domain.
// Return: [{ _id: "gmail.com", count }] sorted desc.
// Stages: $addFields (domain), $sortByCount (or $group + $sort)
// Hint: { $arrayElemAt: [ { $split: ["$email", "@"] }, 1 ] }.
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Build a display label "ALICE <alice@x.com>": uppercase name + lowercase email.
// Return: { customerId, label }. Limit 10.
// Stages: $project ($concat, $toUpper, $toLower)
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Initial — first character of name, uppercased. Return: { name, initial }. Limit 10.
// Stages: $project ($toUpper of $substrCP)
// Hint: $substrCP: ["$name", 0, 1].
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// $regexMatch — flag products whose name contains "pro" (case-insensitive), then
// (second pipeline) count how many match.
// Stages: $addFields ($regexMatch) ... / $match, $group(_id:null $sum:1)
// YOUR ANSWER:


// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Description length buckets: short (<100), medium (<300), long (>=300).
// Return: [{ _id, count }].
// Stages: $addFields ($strLenCP + $switch), $sortByCount/$group
// Hint: reuse the $switch muscle from 05j.
// YOUR ANSWER:


// ─── Q6 ──────────────────────────────────────────────────────────────────────
// $toString — make a human ref "ORD-<hex>" from each order's _id. Return: { orderRef,
// totalAmount }. Limit 10.
// Stages: $project ($concat ["ORD-", { $toString: "$_id" }])
// Hint: concat will THROW if you forget $toString on the ObjectId — try it both ways.
// YOUR ANSWER:


// ─── Q7 ──────────────────────────────────────────────────────────────────────
// $type — audit the `phone` field: report the BSON type across customers
// (string vs missing).
// Return: [{ _id: "string" | "missing" | ..., count }].
// Stages: $group (by { $type: "$phone" })
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
