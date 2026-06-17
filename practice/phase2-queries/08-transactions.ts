/**
 * Phase 2 — Query Practice
 * Topic: 08 — Multi-Document Transactions
 *
 * MongoDB transactions ensure multiple operations succeed or fail together (ACID).
 * Pattern: start session → start transaction → operations → commit (or abort on error)
 *
 * IMPORTANT: Transactions require a replica set. For local dev, either:
 *   Option A: Use MongoDB Atlas (already a replica set)
 *   Option B: Convert local MongoDB to single-node replica set:
 *             1. Add `replication: { replSetName: "rs0" }` to mongod.conf
 *             2. Restart mongod
 *             3. Run in mongosh: rs.initiate()
 *
 * If you get "Transaction numbers are only allowed on a replica set member" error
 * → use Option A or B above before attempting these questions.
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/08-transactions.ts
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";
import Customer from "../../src/modules/customer/customer.model.js";
import ProductVariant from "../../src/modules/product/variant.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// PLACE AN ORDER (the core e-commerce transaction).
//
// Scenario: Customer wants to buy 2 units of a specific variant.
// These two operations must be atomic — either BOTH succeed or NEITHER does:
//   Operation 1: Decrement InventoryItem.quantityAvailable by 2
//                Increment InventoryItem.quantityReserved by 2
//                (Only proceed if quantityAvailable >= 2)
//   Operation 2: Create a new Order document
//
// Pick any customerId, variantId, and warehouseId from Compass.
// If inventory is insufficient, abort the transaction and throw an error.
//
// Skeleton:
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     ... operations with { session } option ...
//     await session.commitTransaction();
//   } catch (err) {
//     await session.abortTransaction();
//     throw err;
//   } finally {
//     await session.endSession();
//   }

// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// CANCEL AN ORDER (reverse of Q1).
//
// Scenario: Customer cancels a "confirmed" order.
// These must be atomic:
//   Operation 1: Update Order.status to "cancelled", add to statusHistory
//   Operation 2: Increment InventoryItem.quantityAvailable by the ordered quantity
//                Decrement InventoryItem.quantityReserved by the ordered quantity
//
// Pick any order with status "confirmed" or "processing" from Compass.
// If order is already "delivered" or "cancelled", abort and throw.

// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// SHIP AN ORDER.
//
// When an order ships, quantityReserved decreases (units physically leave).
// quantityAvailable stays the same — it was already deducted when order was placed.
//
// Atomic operations:
//   Operation 1: Update Order.status to "shipped"
//   Operation 2: Decrement InventoryItem.quantityReserved by quantity (units leave warehouse)
//
// Pick any order with status "processing" from Compass.

// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// LOYALTY POINTS ON DELIVERY.
//
// When an order is delivered, award loyalty points to the customer.
// Points = Math.floor(totalAmount / 100)  (1 point per ₹100 spent)
//
// Atomic operations:
//   Operation 1: Update Order.status to "delivered"
//   Operation 2: Increment Customer.loyaltyPoints by the calculated points
//   Operation 3: Update Customer.tier based on new total loyaltyPoints:
//                0-999 → silver, 1000-4999 → gold, 5000+ → platinum
//
// Pick any order with status "shipped" from Compass.
// Hint: use findOneAndUpdate with returnDocument:"after" to get new loyaltyPoints,
//       then compute the tier in code before the third update.

// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
