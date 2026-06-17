import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });

// ── Models ───────────────────────────────────────────────────────────────────
import Brand from "../modules/brand/brand.model.js";
import Category from "../modules/category/category.model.js";
import Seller from "../modules/seller/seller.model.js";
import Warehouse from "../modules/warehouse/warehouse.model.js";
import Staff from "../modules/staff/staff.model.js";
import Product from "../modules/product/product.model.js";
import ProductVariant from "../modules/product/variant.model.js";
import Supplier from "../modules/supplier/supplier.model.js";
import Customer from "../modules/customer/customer.model.js";
import InventoryItem from "../modules/inventory/inventory.model.js";
import Order from "../modules/order/order.model.js";
import Review from "../modules/reviews/review.model.js";

// ── Helpers ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randPrice = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) / 10) * 10;

const CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
];

const indianPhone = () =>
  `${pick(["9", "8", "7", "6"])}${faker.string.numeric(9)}`;

const indianGstin = () =>
  `${randInt(10, 33)}${faker.string.alpha({ length: 5, casing: "upper" })}${faker.string.numeric(4)}${faker.string.alpha({ length: 1, casing: "upper" })}1Z5`;

const indianAddress = () => {
  const loc = pick(CITIES);
  return {
    street: `${randInt(1, 999)}, ${faker.location.street()}`,
    city: loc.city,
    state: loc.state,
    pincode: loc.pincode,
    country: "India",
  };
};

const ORDER_STATUSES = [
  "pending", "confirmed", "processing", "shipped",
  "out_for_delivery", "delivered", "cancelled", "return_requested", "returned",
] as const;

// ── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI =
    process.env["MONGO_URI"] ?? "mongodb://localhost:27017/backend-mastery";
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Drop all collections for a clean slate
  const collections = [
    "brands", "categories", "sellers", "warehouses", "staffs",
    "products", "productvariants", "suppliers", "customers",
    "inventoryitems", "orders", "reviews",
  ];
  for (const col of collections) {
    await mongoose.connection.collection(col).drop().catch(() => {}); // ignore if not exist
  }
  console.log("Dropped existing collections\n");

  // ── 1. BRANDS ──────────────────────────────────────────────────────────────
  const brandNames = [
    "Samsung", "Apple", "Nike", "Levi's", "Boat", "Puma", "Himalaya", "Prestige",
  ];
  const brands = await Brand.create(
    brandNames.map((name) => ({
      name,
      logoUrl: `https://cdn.example.com/logos/${name.toLowerCase()}.png`,
      countryOfOrigin: pick(["India", "USA", "South Korea", "China", "Germany"]),
      isActive: true,
    }))
  );
  console.log(`✓ Brands:     ${brands.length}`);

  // ── 2. CATEGORIES (3-level hierarchy) ─────────────────────────────────────
  const rootCats = await Category.create([
    { name: "Electronics", isActive: true },
    { name: "Fashion", isActive: true },
    { name: "Home & Kitchen", isActive: true },
    { name: "Health & Beauty", isActive: true },
    { name: "Sports & Fitness", isActive: true },
  ]);

  const subCats = await Category.create([
    { name: "Mobiles", parentCategory: rootCats[0]!._id, isActive: true },
    { name: "Laptops", parentCategory: rootCats[0]!._id, isActive: true },
    { name: "Audio", parentCategory: rootCats[0]!._id, isActive: true },
    { name: "Men's Clothing", parentCategory: rootCats[1]!._id, isActive: true },
    { name: "Women's Clothing", parentCategory: rootCats[1]!._id, isActive: true },
    { name: "Footwear", parentCategory: rootCats[1]!._id, isActive: true },
    { name: "Cookware", parentCategory: rootCats[2]!._id, isActive: true },
  ]);

  const leafCats = await Category.create([
    { name: "Headphones", parentCategory: subCats[2]!._id, isActive: true },
    { name: "Bluetooth Speakers", parentCategory: subCats[2]!._id, isActive: true },
    { name: "Running Shoes", parentCategory: subCats[5]!._id, isActive: true },
    { name: "Smartphones", parentCategory: subCats[0]!._id, isActive: true },
    { name: "Formal Shirts", parentCategory: subCats[3]!._id, isActive: true },
  ]);

  const allCategories = [...rootCats, ...subCats, ...leafCats];
  console.log(`✓ Categories: ${allCategories.length}`);

  // ── 3. SELLERS ─────────────────────────────────────────────────────────────
  const sellers = await Seller.create(
    Array.from({ length: 12 }, (_, i) => ({
      businessName: `${faker.company.name()} Pvt Ltd`,
      ownerName: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: indianPhone(),
      password: "$2b$10$hashedpassword",
      gstin: indianGstin(),
      bankInfo: {
        accountNumber: faker.string.numeric(12),
        ifsc: `HDFC${faker.string.numeric(7)}`,
        accountHolderName: faker.person.fullName(),
      },
      status: i < 9 ? "active" : i < 11 ? "suspended" : "pending_verification",
      avgRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    }))
  );
  console.log(`✓ Sellers:    ${sellers.length}`);

  // ── 4. WAREHOUSES ──────────────────────────────────────────────────────────
  const warehouseData = [
    { code: "WH-DEL-01", name: "Delhi Fulfillment Center", city: "Delhi", state: "Delhi", pincode: "110020" },
    { code: "WH-MUM-01", name: "Mumbai Fulfillment Center", city: "Mumbai", state: "Maharashtra", pincode: "400072" },
    { code: "WH-BLR-01", name: "Bangalore Hub", city: "Bangalore", state: "Karnataka", pincode: "560099" },
    { code: "WH-CHE-01", name: "Chennai Return Center", city: "Chennai", state: "Tamil Nadu", pincode: "600100" },
  ];
  const warehouses = await Warehouse.create(
    warehouseData.map((w) => ({
      warehouseCode: w.code,
      name: w.name,
      address: { street: `Plot ${randInt(1, 99)}, Industrial Area`, city: w.city, state: w.state, pincode: w.pincode },
      isActive: true,
    }))
  );
  console.log(`✓ Warehouses: ${warehouses.length}`);

  // ── 5. STAFF ───────────────────────────────────────────────────────────────
  const roles = ["super_admin", "admin", "warehouse_manager", "warehouse_staff", "customer_support", "delivery_agent"] as const;
  const departments = ["operations", "customer_support", "logistics", "finance", "hr", "tech"] as const;
  const staff = await Staff.create(
    Array.from({ length: 8 }, (_, i) => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: indianPhone(),
      password: "$2b$10$hashedpassword",
      role: roles[i % roles.length],
      department: departments[i % departments.length],
      warehouse: i < 5 ? warehouses[i % warehouses.length]!._id : undefined,
      isActive: true,
    }))
  );
  console.log(`✓ Staff:      ${staff.length}`);

  // ── 6. PRODUCTS ────────────────────────────────────────────────────────────
  const productTemplates = [
    // Electronics
    { name: "Samsung Galaxy S24", cat: leafCats[3]!, brand: brands[0]!, base: 59999 },
    { name: "Samsung Galaxy A54", cat: leafCats[3]!, brand: brands[0]!, base: 29999 },
    { name: "Apple iPhone 15", cat: leafCats[3]!, brand: brands[1]!, base: 79999 },
    { name: "Boat Rockerz 450", cat: leafCats[0]!, brand: brands[4]!, base: 1499 },
    { name: "Boat Airdopes 141", cat: leafCats[0]!, brand: brands[4]!, base: 999 },
    { name: "Boat Stone 1200", cat: leafCats[1]!, brand: brands[4]!, base: 1999 },
    // Fashion
    { name: "Nike Air Max 270", cat: leafCats[2]!, brand: brands[2]!, base: 8999 },
    { name: "Nike Revolution 6", cat: leafCats[2]!, brand: brands[2]!, base: 4999 },
    { name: "Puma Softride", cat: leafCats[2]!, brand: brands[5]!, base: 3999 },
    { name: "Levi's 511 Slim Jeans", cat: subCats[3]!, brand: brands[3]!, base: 2499 },
    { name: "Levi's 501 Original", cat: subCats[3]!, brand: brands[3]!, base: 2999 },
    { name: "Nike Dri-FIT Tee", cat: subCats[3]!, brand: brands[2]!, base: 1299 },
    // Health
    { name: "Himalaya Neem Face Wash", cat: rootCats[3]!, brand: brands[6]!, base: 149 },
    { name: "Himalaya Moisturizing Lotion", cat: rootCats[3]!, brand: brands[6]!, base: 199 },
    // Kitchen
    { name: "Prestige Pressure Cooker 3L", cat: subCats[6]!, brand: brands[7]!, base: 1799 },
    { name: "Prestige Iron Box", cat: subCats[6]!, brand: brands[7]!, base: 899 },
    // Generic fillers
    ...Array.from({ length: 24 }, (_, i) => ({
      name: `${pick(["Premium", "Pro", "Ultra", "Classic"])} ${pick(["Wireless Earbuds", "Smart Watch", "Casual Shirt", "Track Pants", "Running Shorts", "Face Serum", "Body Lotion", "Water Bottle"])} ${i + 1}`,
      cat: pick(allCategories),
      brand: pick(brands),
      base: randPrice(199, 9999),
    })),
  ];

  const products = await Product.create(
    productTemplates.map((p) => ({
      name: p.name,
      description: faker.commerce.productDescription(),
      brand: p.brand._id,
      category: p.cat._id,
      seller: pick(sellers)._id,
      startingPrice: p.base,
      status: "active",
      tags: [p.cat.name.toLowerCase(), p.brand.name.toLowerCase(), "trending"],
      avgRating: 0,
      reviewCount: 0,
    }))
  );
  console.log(`✓ Products:   ${products.length}`);

  // ── 7. PRODUCT VARIANTS ────────────────────────────────────────────────────
  const COLORS = ["Black", "White", "Blue", "Red", "Green", "Grey", "Navy", "Pink"];
  const SIZES_CLOTHING = ["XS", "S", "M", "L", "XL", "XXL"];
  const SIZES_SHOE = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"];
  const STORAGE = ["64GB", "128GB", "256GB", "512GB"];

  const variantDocs: mongoose.Document[] = [];
  for (const product of products) {
    const varCount = randInt(2, 4);
    for (let v = 0; v < varCount; v++) {
      const mrp = (product as any).startingPrice as number;
      const discount = randInt(5, 30);
      const sellingPrice = Math.round(mrp * (1 - discount / 100));
      const nameStr = (product as any).name as string;
      let attrs: Record<string, string> = { color: pick(COLORS) };
      if (nameStr.includes("Jeans") || nameStr.includes("Shirt") || nameStr.includes("Tee") || nameStr.includes("Track") || nameStr.includes("Short")) {
        attrs = { color: pick(COLORS), size: pick(SIZES_CLOTHING) };
      } else if (nameStr.includes("Shoe") || nameStr.includes("Nike") || nameStr.includes("Puma")) {
        attrs = { color: pick(COLORS), size: pick(SIZES_SHOE) };
      } else if (nameStr.includes("Galaxy") || nameStr.includes("iPhone")) {
        attrs = { color: pick(COLORS), storage: pick(STORAGE) };
      }

      variantDocs.push(
        new ProductVariant({
          name: Object.values(attrs).join(" / "),
          skuCode: `SKU-${(product as any)._id.toString().slice(-4).toUpperCase()}-${v}`,
          productId: (product as any)._id,
          attributes: attrs,
          mrp,
          sellingPrice,
          images: [`https://cdn.example.com/products/${(product as any)._id}/${v}.jpg`],
          isActive: true,
        })
      );
    }
  }
  const variants = await ProductVariant.insertMany(variantDocs);

  // Update each product's variants[] array and startingPrice
  for (const product of products) {
    const pId = (product as any)._id;
    const pVariants = variants.filter((v) => (v as any).productId.toString() === pId.toString());
    const minPrice = Math.min(...pVariants.map((v) => (v as any).sellingPrice));
    await Product.updateOne({ _id: pId }, { variants: pVariants.map((v) => v._id), startingPrice: minPrice });
  }
  console.log(`✓ Variants:   ${variants.length}`);

  // ── 8. SUPPLIERS ───────────────────────────────────────────────────────────
  const suppliers = await Supplier.create(
    Array.from({ length: 6 }, () => {
      const suppliedVariants = pickN(variants, randInt(5, 20));
      return {
        companyName: `${faker.company.name()} Trading Co`,
        contactName: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: indianPhone(),
        address: [indianAddress()],
        products: suppliedVariants.map((v) => v._id),
        isActive: true,
      };
    })
  );
  console.log(`✓ Suppliers:  ${suppliers.length}`);

  // ── 9. CUSTOMERS ───────────────────────────────────────────────────────────
  const TIERS = ["silver", "silver", "silver", "gold", "gold", "platinum"] as const;
  const customers = await Customer.create(
    Array.from({ length: 80 }, () => {
      const loc = pick(CITIES);
      return {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: indianPhone(),
        password: "$2b$10$hashedpassword",
        loyaltyPoints: randInt(0, 5000),
        tier: pick(TIERS),
        lastLogin: faker.date.recent({ days: 30 }),
        deletedAt: null,
        address: [
          {
            street: `${randInt(1, 999)}, ${faker.location.street()}`,
            city: loc.city,
            state: loc.state,
            country: "India",
            pincode: loc.pincode,
            label: "Home",
            isDefault: true,
          },
        ],
      };
    })
  );
  console.log(`✓ Customers:  ${customers.length}`);

  // ── 10. INVENTORY ITEMS ────────────────────────────────────────────────────
  const inventoryDocs = [];
  for (const variant of variants) {
    // Each variant goes to 2-3 warehouses
    const assignedWarehouses = pickN(warehouses, randInt(2, 3));
    for (const wh of assignedWarehouses) {
      const available = randInt(0, 200);
      const reorderLevel = randInt(10, 30);
      inventoryDocs.push({
        productVariantId: (variant as any)._id,
        warehouseId: (wh as any)._id,
        quantityAvailable: available,
        quantityReserved: randInt(0, Math.min(20, available)),
        quantityDamaged: randInt(0, 5),
        reorderLevel,
      });
    }
  }
  const inventoryItems = await InventoryItem.insertMany(inventoryDocs);
  console.log(`✓ Inventory:  ${inventoryItems.length}`);

  // ── 11. ORDERS ─────────────────────────────────────────────────────────────
  // Give 20 "power customers" 5-8 orders each, rest get 1-2
  const powerCustomers = pickN(customers, 20);
  const orderDocs = [];

  const buildOrder = (customer: any, daysAgo: number) => {
    const itemCount = randInt(1, 4);
    const selectedVariants = pickN(variants, itemCount);
    const items = selectedVariants.map((v: any) => ({
      variantId: v._id,
      productName: products.find((p: any) => p._id.toString() === v.productId.toString())?.name ?? "Product",
      variant: v.attributes,
      quantity: randInt(1, 3),
      mrp: v.mrp,
      sellingPrice: v.sellingPrice,
      totalPrice: v.sellingPrice * randInt(1, 3),
    }));
    const totalMrp = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
    const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
    const totalDiscount = totalMrp - totalAmount;

    // Bias toward delivered for older orders
    let status: (typeof ORDER_STATUSES)[number];
    if (daysAgo > 30) {
      status = pick(["delivered", "delivered", "delivered", "returned", "cancelled"]);
    } else if (daysAgo > 7) {
      status = pick(["delivered", "shipped", "out_for_delivery", "processing"]);
    } else {
      status = pick(["pending", "confirmed", "processing", "shipped"]);
    }

    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const loc = pick(CITIES);

    return {
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      totalMrp,
      totalDiscount: Math.max(0, totalDiscount),
      totalAmount,
      shippingAddress: {
        street: `${randInt(1, 999)}, ${faker.location.street()}`,
        city: loc.city,
        state: loc.state,
        pincode: loc.pincode,
      },
      status,
      statusHistory: [{ status: "pending", createdAt }, { status, createdAt: new Date(createdAt.getTime() + 3600000) }],
      createdAt,
      updatedAt: createdAt,
    };
  };

  for (const customer of powerCustomers) {
    const orderCount = randInt(5, 8);
    for (let i = 0; i < orderCount; i++) {
      orderDocs.push(buildOrder(customer, randInt(1, 180)));
    }
  }
  for (const customer of customers) {
    if (powerCustomers.includes(customer)) continue;
    const orderCount = randInt(1, 2);
    for (let i = 0; i < orderCount; i++) {
      orderDocs.push(buildOrder(customer, randInt(1, 180)));
    }
  }

  const orders = await Order.insertMany(orderDocs);
  console.log(`✓ Orders:     ${orders.length}`);

  // ── 12. REVIEWS ────────────────────────────────────────────────────────────
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered");
  const reviewDocs = [];
  const reviewedPairs = new Set<string>(); // prevent duplicate (customerId, variantId)

  for (const order of deliveredOrders) {
    const o = order as any;
    // 60% chance a delivered order gets a review
    if (Math.random() > 0.6) continue;
    const item = pick(o.items);
    const pairKey = `${o.customerId}-${item.variantId}`;
    if (reviewedPairs.has(pairKey)) continue;
    reviewedPairs.add(pairKey);

    // Biased toward 4-5 star (realistic distribution)
    const rating = pick([1, 3, 4, 4, 4, 5, 5, 5, 5]);
    reviewDocs.push({
      customerId: o.customerId,
      variantId: item.variantId,
      orderId: o._id,
      rating,
      title: rating >= 4 ? pick(["Great product!", "Excellent quality", "Worth the price", "Highly recommend"]) : pick(["Disappointed", "Not as expected", "Could be better"]),
      body: faker.lorem.sentences(2),
      images: Math.random() > 0.7 ? [`https://cdn.example.com/reviews/${faker.string.uuid()}.jpg`] : [],
      isVerified: true,
      isVisible: true,
    });
  }

  const reviews = await Review.insertMany(reviewDocs);

  // Update product avgRating and reviewCount
  const ratingAgg = await Review.aggregate([
    { $group: { _id: "$variantId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  for (const r of ratingAgg) {
    const variant = variants.find((v: any) => v._id.toString() === r._id.toString());
    if (variant) {
      await Product.updateOne(
        { _id: (variant as any).productId },
        { avgRating: parseFloat(r.avgRating.toFixed(1)), reviewCount: r.count }
      );
    }
  }
  console.log(`✓ Reviews:    ${reviews.length}`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n── Seed complete ──────────────────────────────────────");
  console.log(`   Brands:      ${brands.length}`);
  console.log(`   Categories:  ${allCategories.length}`);
  console.log(`   Sellers:     ${sellers.length}`);
  console.log(`   Warehouses:  ${warehouses.length}`);
  console.log(`   Staff:       ${staff.length}`);
  console.log(`   Products:    ${products.length}`);
  console.log(`   Variants:    ${variants.length}`);
  console.log(`   Suppliers:   ${suppliers.length}`);
  console.log(`   Customers:   ${customers.length}`);
  console.log(`   Inventory:   ${inventoryItems.length}`);
  console.log(`   Orders:      ${orders.length}`);
  console.log(`   Reviews:     ${reviews.length}`);
  console.log("───────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
