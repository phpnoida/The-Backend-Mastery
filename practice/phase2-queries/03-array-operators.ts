/**
 * Phase 2 — Query Practice
 * Topic: 03 — Array Operators
 *
 * Operators covered: $in (on arrays), $all, $elemMatch, $size, $expr + $gt + $size
 *
 * Key models with arrays:
 *   Order.items[]         — { variantId, productName, quantity, mrp, sellingPrice, totalPrice }
 *   Customer.address[]    — { street, city, state, pincode, label, isDefault }
 *   Product.tags[]        — string[]
 *   Product.variants[]    — ObjectId[]
 *   Supplier.products[]   — ObjectId[] (variant refs)
 *
 * Rules:
 * - Write every answer cold.
 * - Run with: npx tsx practice/phase2-queries/03-array-operators.ts
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Product from "../../src/modules/product/product.model.js";
import Order from "../../src/modules/order/order.model.js";
import Supplier from "../../src/modules/supplier/supplier.model.js";
import ProductVariant from "../../src/modules/product/variant.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// const fnOne = async () => {
//   const data = 2;
//   console.log("data-->", data);
// };
// await fnOne();

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Find all products that have the tag "trending".
// Return: name, tags.
// Collections: products
// Note: tags is a string[]. How do you query "array contains this value"?

// YOUR ANSWER:

const fnOne = async () => {
  const data = await Product.find({
    tags: { $elemMatch: { $eq: "trending" } },
  })
    .select("name tags")
    .lean();
  console.log("data-->", data);
};
// await fnOne();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Find all products that have BOTH tags "trending" AND "nike" (case-sensitive).
// Return: name, tags.
// Collections: products
// Operators: $all

// YOUR ANSWER:
const fnS = async () => {
  const data = await Product.find({
    tags: {
      $all: [
        { $elemMatch: { $eq: "trending" } },
        { $elemMatch: { $eq: "nike" } },
      ],
    },
  })
    .select("name tags")
    .lean();
  console.log("data-->", data);
};
// await fnS();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Find all customers who have exactly 1 saved address.
// Return: name, email.
// Collections: customers
// Operators: $size

// YOUR ANSWER:

const fnT = async () => {
  const data = await Customer.find({
    address: {
      $size: 1,
    },
  })
    .select("name email")
    .lean();
  console.log("data-->", data);
};
// await fnT();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Find all orders where AT LEAST ONE item has a quantity >= 3.
// Return: customerName, items, totalAmount.
// Collections: orders
// Operators: $elemMatch
// Think: can you do this without $elemMatch? What's the difference?

// YOUR ANSWER:
const fnF = async () => {
  const data = await Order.find({
    items: {
      $elemMatch: {
        quantity: { $gte: 3 },
      },
    },
  })
    .select("customerName items totalAmount")
    .lean();
  console.log("data-->", data);
};
// await fnF();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Find all orders where AT LEAST ONE item has sellingPrice > ₹2,000.
// Return: customerName, totalAmount, status.
// Collections: orders
// Operators: $elemMatch

// YOUR ANSWER:

const fnSi = async () => {
  const data = await Order.find({
    items: {
      $elemMatch: {
        sellingPrice: {
          $gt: 2000,
        },
      },
    },
  })
    .select("customerName totalAmount status")
    .lean();
  console.log("data-->", data);
};
// await fnSi();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Find all orders that have MORE THAN 2 items in the items[] array.
// Return: customerName, totalAmount.
// Collections: orders
// Operators: $expr, $gt, $size
// Note: $size only works for exact match. For "greater than N items" you need $expr.

// YOUR ANSWER:

const fnSv = async () => {
  const data = await Order.find({
    $expr: { $gt: [{ $size: "$items" }, 2] },
  })
    .select("customerName totalAmount")
    .lean();
  console.log("data-->", data);
};
// await fnSv();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Pick any one ProductVariant _id from your database (via Compass).
// Find all suppliers who supply that variant (i.e., it appears in their products[]).
// Return: companyName, contactName, email.
// Collections: suppliers

// YOUR ANSWER:

const fnSe = async () => {
  const data = await Supplier.find({
    products: {
      $elemMatch: { $eq: "6a27afa478fb0ab4064a0ad8" },
    },
  })
    .select("companyName contactName email")
    .lean();
  console.log("data-->", data);
};
// await fnSe();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Find all customers who have a saved address in "Mumbai".
// (address is an embedded array — address[].city === "Mumbai")
// Return: name, email, address.
// Collections: customers
// Note: querying into an array of embedded objects — dot notation on array field.

// YOUR ANSWER:

const fnE = async () => {
  const data = await Customer.find({
    address: {
      $elemMatch: {
        city: "Mumbai",
      },
    },
  })
    .select("name email address")
    .lean();
  console.log("data-->", data);
};
await fnE();

await mongoose.disconnect();
console.log("\nDone.");
