/**
 * Phase 2 — Query Practice
 * Topic: 02 — Comparison Operators
 *
 * Operators covered: $gt, $gte, $lt, $lte, $eq, $ne, $in, $nin, $regex
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/02-comparison-operators.ts
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Seller from "../../src/modules/seller/seller.model.js";
import Staff from "../../src/modules/staff/staff.model.js";
import Product from "../../src/modules/product/product.model.js";
import Order from "../../src/modules/order/order.model.js";
import Review from "../../src/modules/reviews/review.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Find all products with startingPrice greater than ₹5,000.
// Return: name, startingPrice. Sort by startingPrice descending.
// Collections: products
// Operators: $gt

// YOUR ANSWER:
const pfn = async () => {
  const data = await Product.find({
    startingPrice: { $gt: 5000 },
  })
    .select("name startingPrice")
    .sort("-startingPrice")
    .lean();
  console.log("products", data);
};
await pfn();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Find all sellers with avgRating less than 3.5.
// Return: businessName, avgRating, status.
// Collections: sellers
// Operators: $lt

// YOUR ANSWER:
const seller = await Seller.find({
  avgRating: { $lt: 3.5 },
})
  .select("businessName avgRating status")
  .lean();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Find all orders where totalAmount is between ₹500 and ₹5,000 (both inclusive).
// Return: customerName, totalAmount, status.
// Collections: orders
// Operators: $gte, $lte

// YOUR ANSWER:
const order = await Order.find({
  totalAmount: { $gte: 500, $lte: 5000 },
})
  .select("customerName totalAmount status")
  .lean();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Find all products whose status is NOT "banned".
// Return: name, status.
// Collections: products
// Operators: $ne

// YOUR ANSWER:
const bp = await Product.find({
  status: { $ne: "banned" },
})
  .select("name status")
  .lean();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Find all customers with loyaltyPoints between 1,000 and 3,000 (inclusive).
// Return: name, tier, loyaltyPoints.
// Collections: customers
// Operators: $gte, $lte

// YOUR ANSWER:
const cust = await Customer.find({
  $and: [
    {
      loyaltyPoints: { $gte: 1000 },
    },
    {
      loyaltyPoints: { $lte: 3000 },
    },
  ],
})
  .select("name tier loyaltyPoints")
  .lean();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Find all reviews with rating 1 or 2 (negative reviews).
// Return: customerId, rating, title, isVerified.
// Sort by rating ascending.
// Collections: reviews
// Operators: $in

// YOUR ANSWER:

const review = await Review.find({
  rating: { $in: [1, 2] },
})
  .select("customerId rating title isVerified")
  .sort("rating")
  .lean();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Find all products whose name contains the word "Pro" (case-insensitive).
// Return: name, startingPrice.
// Collections: products
// Operators: $regex

// YOUR ANSWER:
const rp = await Product.find({
  name: { $regex: "pro", $options: "i" },
})
  .select("name startingPrice ")
  .lean();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Find all inventory items where quantityAvailable is exactly 0 (out of stock).
// Return: productVariantId, warehouseId, quantityAvailable, quantityReserved.
// Collections: inventoryitems
// Operators: $eq (or just direct match — think about which is cleaner)

// YOUR ANSWER:
const ip = await InventoryItem.find({
  quantityAvailable: 0,
})
  .select("productVariantId warehouseId quantityAvailable quantityReserved")
  .lean();

// ─── Q9 ──────────────────────────────────────────────────────────────────────
// Find all staff whose role is NOT "delivery_agent" and NOT "warehouse_staff".
// Return: name, role, department.
// Collections: staffs
// Operators: $nin

// YOUR ANSWER:
const sd = await Staff.find({
  role: { $nin: ["warehouse_staff", "delivery_agent"] },
})
  .select("name role department")
  .lean();

// ─── Q10 ─────────────────────────────────────────────────────────────────────
// Find all orders where totalAmount is NOT between ₹0 and ₹999.
// (i.e., orders of ₹1,000 and above)
// Return: customerName, totalAmount, status.
// Collections: orders
// Operators: $gte (think — is there a simpler way than $not here?)

// YOUR ANSWER:
const o = await Order.find({
  totalAmount: { $gte: 1000 },
})
  .select("customerName totalAmount status")
  .lean();

await mongoose.disconnect();
console.log("\nDone.");
