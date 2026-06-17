/**
 * Phase 2 — Query Practice
 * Topic: 04 — Update Operations
 *
 * Operators covered: $set, $unset, $inc, $push, $pull, $addToSet, updateOne, updateMany, findOneAndUpdate
 *
 * Rules:
 * - Write every answer cold.
 * - After each update, log the updated document to confirm the change.
 * - Run with: npx tsx praiesctice/phase2-quer/04-update-operations.ts
 *
 * IMPORTANT: These mutate real data. Re-run `npm run seed` to reset.
 */

import mongoose from "mongoose";
import Customer from "../../src/modules/customer/customer.model.js";
import Seller from "../../src/modules/seller/seller.model.js";
import Product from "../../src/modules/product/product.model.js";
import Order from "../../src/modules/order/order.model.js";
import InventoryItem from "../../src/modules/inventory/inventory.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Pick any customer from your DB (grab their email from Compass).
// Update that customer's tier to "platinum" using their email as the filter.
// Return the UPDATED document (findOneAndUpdate with returnDocument: "after").
// Collections: customers
// Operators: $set, findOneAndUpdate

// YOUR ANSWER:

const fn1 = async () => {
  const data = await Customer.findOneAndUpdate(
    {
      email: "deion_quigley9@hotmail.com",
    },
    {
      $set: {
        tier: "platinum",
      },
    },
    {
      new: true,
    }
  );
  console.log("data-->", data);
};
// await fn1();

// ─── Q2 ──────────────────────────────────────────────────────────────────────
// Add 500 loyalty points to the same customer from Q1.
// Do NOT overwrite their existing loyaltyPoints — INCREMENT it.
// Collections: customers
// Operators: $inc

// YOUR ANSWER:

const fn2 = async () => {
  const data = await Customer.findOneAndUpdate(
    {
      email: "deion_quigley9@hotmail.com",
    },
    {
      $inc: {
        loyaltyPoints: 500,
      },
    },
    {
      new: true,
    }
  );
  console.log("data-->", data);
};
// await fn2();

// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Push a new address into the same customer's address array.
// New address: { street: "42, MG Road", city: "Bangalore", state: "Karnataka",
//               country: "India", pincode: "560001", label: "Office", isDefault: false }
// Collections: customers
// Operators: $push

// YOUR ANSWER:

const fn3 = async () => {
  const data = await Customer.findOneAndUpdate(
    {
      email: "deion_quigley9@hotmail.com",
    },
    {
      $push: {
        address: {
          street: "42, MG Road",
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          pincode: "560001",
          label: "Office",
          isDefault: false,
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("data-->", data);
};
// await fn3();

// ─── Q4 ──────────────────────────────────────────────────────────────────────
// Remove the "Office" address you just added from Q3 (pull by matching label: "Office").
// Collections: customers
// Operators: $pull

// YOUR ANSWER:
const fn4 = async () => {
  const data = await Customer.findOneAndUpdate(
    {
      email: "deion_quigley9@hotmail.com",
    },
    {
      $pull: {
        address: {
          label: "Office",
        },
      },
    },
    {
      new: true,
    }
  );
  console.log("data", data);
};
// await fn4();

// ─── Q5 ──────────────────────────────────────────────────────────────────────
// A customer placed an order — reserve 3 units of inventory.
// Pick any InventoryItem from Compass.
// Atomically: decrement quantityAvailable by 3, increment quantityReserved by 3.
// Use a single updateOne call.
// Collections: inventoryitems
// Operators: $inc (multiple fields in one update)

// YOUR ANSWER:
const fn5 = async () => {
  const data = await InventoryItem.findByIdAndUpdate(
    "6a27afa478fb0ab4064a0c7b",
    {
      $inc: {
        quantityReserved: 3,
        quantityAvailable: -3,
      },
    },
    {
      new: true,
    }
  );
  console.log("data", data);
};
// await fn5();

// ─── Q6 ──────────────────────────────────────────────────────────────────────
// Suspend a seller — update their status to "suspended".
// Pick any active seller. Use updateOne.
// Collections: sellers
// Operators: $set

// YOUR ANSWER:

const fn6 = async () => {
  const data = await Seller.findByIdAndUpdate(
    "6a27afa478fb0ab4064a0a4d",
    {
      $set: {
        status: "suspended",
      },
    },
    {
      new: true,
    }
  );
  console.log("data-->", data);
};
// await fn6();

// ─── Q7 ──────────────────────────────────────────────────────────────────────
// Add the tag "sale" to a product. But if it already has "sale", don't add it again.
// Pick any product. Use $addToSet (not $push).
// Then try running it twice — confirm it doesn't duplicate.
// Collections: products
// Operators: $addToSet

// YOUR ANSWER:

const fn7 = async () => {
  const data = await Product.findByIdAndUpdate(
    "6a27afa478fb0ab4064a0a89",
    {
      //   $push: {
      //     tags: "sale",
      //   },
      $addToSet: {
        tags: "sale",
      },
    },
    { new: true }
  );
  console.log("data", data);
};
// await fn7();

// ─── Q8 ──────────────────────────────────────────────────────────────────────
// Mark ALL products of a specific seller as "inactive".
// Pick any seller _id from Compass. Use updateMany.
// Return the count of modified documents.
// Collections: products
// Operators: updateMany, $set

// YOUR ANSWER:

const f8 = async () => {
  const data = await Product.updateMany(
    {
      seller: "6a27afa478fb0ab4064a0a57",
    },
    {
      $set: {
        status: "inactive",
      },
    }
  );
  console.log("data", data);
};
await f8();

await mongoose.disconnect();
console.log("\nDone.");
