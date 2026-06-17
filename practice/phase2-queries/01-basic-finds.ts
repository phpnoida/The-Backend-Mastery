/**
 * Phase 2 — Query Practice
 * Topic: 01 — Basic Finds
 *
 * Rules:
 * - Write every answer cold. No docs, no README, no schema-reference sheet.
 * - If stuck for 5 min: write what you want in plain English as a comment first, then attempt the syntax.
 * - Run with: npx tsx practice/phase2-queries/01-basic-finds.ts
 * - Comment out questions you haven't answered yet so the file still runs.
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Seller from "../../src/modules/seller/seller.model.js";
import Staff from "../../src/modules/staff/staff.model.js";
import Brand from "../../src/modules/brand/brand.model.js";
import Product from "../../src/modules/product/product.model.js";
import ProductVariant from "../../src/modules/product/variant.model.js";
import Warehouse from "../../src/modules/warehouse/warehouse.model.js";
import Order from "../../src/modules/order/order.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Find all active brands, sorted alphabetically by name (A → Z).
// Return: all fields.
// Collections: brands

// YOUR ANSWER:
const brands = async () => {
  try {
    const brands = await Brand.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean();
    console.log("brands--->", brands);
  } catch (err) {
    console.log("err", err);
  }
};
// await brands();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Find all customers, return ONLY their name, email, and tier.
// Do NOT return _id.
// Collections: customers

// YOUR ANSWER:
const customers = async () => {
  const cust = await Customer.find({}).select("name email tier -_id").lean();
  console.log("customers-->", cust);
};
// await customers();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Find the single seller whose email is exactly "amit@example.com".
// (Use any email that exists in your seeded data — pick one from Compass.)
// Collections: sellers

// YOUR ANSWER:
const sellerFn = async (emailId: string) => {
  const seller = await Seller.findOne({ email: emailId }).lean();
  console.log("seller-->", seller);
};
// await sellerFn("meta68@yahoo.com");

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Find all warehouses. Return only warehouseCode and name. No _id.
// Collections: warehouses

const warehouse = async () => {
  const warehouses = await Warehouse.find()
    .select("warehouseCode name -_id")
    .lean();
  console.log("warhouses->", warehouses);
};
// await warehouse();

// YOUR ANSWER:

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// Find the 5 cheapest active products by startingPrice (ascending).
// Return: name and startingPrice only.
// Collections: products

// YOUR ANSWER:
const product = async () => {
  const data = await Product.find({
    status: "active",
  })
    .sort("startingPrice")
    .limit(5)
    .select("name startingPrice -_id")
    .lean();
  console.log("products", data);
};
// await product();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Find all staff who are in the "tech" department AND are currently active.
// Return: name, email, department.
// Collections: staffs
const fn = async () => {
  const data = await Staff.find({
    department: "tech",
    isActive: true,
  })
    .select("name email department")
    .lean();
  console.log("staff data-->", data);
};
// await fn();

// YOUR ANSWER:

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Find all orders with status "delivered", sorted by createdAt descending (newest first).
// Return: customerId, customerName, totalAmount, status, createdAt.
// Collections: orders

// YOUR ANSWER:
const orders = async () => {
  const orders = await Order.find({
    status: "delivered",
  })
    .sort("-createdAt")
    .select("customerId customerName totalAmount status createdAt")
    .lean();
  console.log("orders--->", orders);
};
//          await orders();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Find the top 10 customers sorted by loyaltyPoints descending.
// Return: name, email, tier, loyaltyPoints.
// Collections: customers

// YOUR ANSWER:
const cust = async () => {
  const data = await Customer.find()
    .sort("-loyaltyPoints")
    .limit(10)
    .select("name email tier loyaltyPoints")
    .lean();

  console.log("customers-->", data);
};
// await cust();

// ─── Q9 ──────────────────────────────────────────────────────────────────────
// Find all sellers with status "suspended".
// Return: businessName, ownerName, email, status.
// Collections: sellers

// YOUR ANSWER:
const sellers = async () => {
  const data = await Seller.find({
    status: "suspended",
  })
    .select("businessName ownerName email status")
    .lean();
  console.log("sellers", data);
};
// await sellers();

// ─── Q10 ─────────────────────────────────────────────────────────────────────
// Find all products with status "active", sorted by avgRating descending.
// Paginate: skip first 10, return next 10.
// Return: name, avgRating, reviewCount, startingPrice.
// Collections: products

// YOUR ANSWER:
const prFn = async () => {
  const data = await Product.find({
    status: "active",
  })
    .sort("-avgRating")
    .skip(10)
    .limit(10)
    .select("name avgRating reviewCount startingPrice")
    .lean();
  console.log("products-->", data);
};
await prFn();

await mongoose.disconnect();
console.log("\nDone.");
