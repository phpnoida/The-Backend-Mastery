# Phase 1 — Question 02: Full E-Commerce Platform with Warehouse Management

> **Difficulty:** Senior Engineer level  
> **Previous scenario:** 01-ecommerce (basic). This builds on those concepts — do NOT reference your previous solution. Start fresh.

---

## The System

You are the **founding backend engineer** at a funded e-commerce startup — think Meesho or Nykaa scale target. You're designing the MongoDB schema from scratch before a single line of application code is written. This is the schema that will run for the next 5 years.

The system has **three types of humans** — Customers, Sellers, and Staff. They are fundamentally different and must **not** share a single collection.

The system also has a **warehouse management module** — the company operates its own fulfillment centers (like Amazon FBA), not just connecting buyers and sellers.

---

## Domain 1 — Identity

### Customer
- Name, email (unique), hashed password, phone
- Can have multiple saved addresses (street, city, state, pincode, country, label)
- Has one default address
- Has a **loyalty points** balance (earned on purchases, redeemed on orders)
- Has a **tier**: `silver`, `gold`, `platinum` (based on lifetime spend)
- Track last login timestamp
- Soft delete support (`deletedAt`)

### Seller
- Business name, owner name, email (unique), phone, hashed password
- **GSTIN** (Indian tax ID — unique, required for selling)
- Bank details for payouts: account number, IFSC code, account holder name — store these but **never return them in API responses by default**
- A seller has a **status**: `pending_verification`, `active`, `suspended`
- Track their **average seller rating** (customers rate sellers separately from products)
- A seller can operate from **multiple warehouses** (reference — they drop-ship from their own stock at our warehouses)
- `createdAt`, `updatedAt`

### Staff (internal employees)
- Name, email (unique), hashed password, phone
- **Department**: `warehouse`, `customer_support`, `finance`, `catalog`, `tech`
- **Permissions**: an array of permission strings (e.g., `["orders:read", "orders:write", "inventory:read"]`) — fine-grained, not just roles
- **Assigned warehouse** (optional — warehouse staff are assigned to one)
- `isActive` boolean
- `createdAt`, `updatedAt`

---

## Domain 2 — Catalog

### Brand
- Name (unique), slug, logo URL
- Country of origin
- `isActive`

### Category
- Name, slug (unique)
- Hierarchical — self-referencing parent (adjacency list, max 3 levels: Electronics → Audio → Headphones)
- `isActive`

### Product
- Name, description, brand (reference), category (reference)
- Sold by a seller (reference)
- A product can have **variants** — do NOT embed variants in the product document. Variants are a separate collection (explained below).
- `status`: `draft`, `active`, `inactive`, `banned`
- Tags (array of strings for search)
- **Base price** (the MRP — maximum retail price set by brand)
- SEO fields: `metaTitle`, `metaDescription`
- `avgRating`, `reviewCount` — denormalized, updated on review write
- `createdAt`, `updatedAt`

### ProductVariant
- Each variant = one purchasable SKU (Stock Keeping Unit)
- References its parent Product
- **Attributes**: flexible key-value pairs for the variant dimensions, e.g. `{ color: "Red", size: "XL" }` — think carefully about the data type here
- **SKU code** (unique across all variants — used in warehouse operations)
- **Price** (selling price — can differ from product base price)
- **Discounted price** (optional)
- Images (array of URLs — variant-specific, e.g., the red color image)
- `isActive`

---

## Domain 3 — Warehouse & Inventory

### Warehouse
- Name, code (unique short identifier like `"WH-BLR-01"`)
- Full address (embed)
- **Type**: `fulfillment_center`, `seller_hub`, `return_center`
- Manager (reference to Staff)
- `isActive`

### InventoryItem
- This is the **stock record**: how many units of a specific ProductVariant are at a specific Warehouse
- References: ProductVariant, Warehouse
- `quantityAvailable` — units ready to sell
- `quantityReserved` — units reserved by placed but unshipped orders (not yet fulfilled)
- `quantityDamaged` — units that failed QC
- `reorderLevel` — if `quantityAvailable` drops below this, trigger a restock alert
- Compound unique constraint: one record per (variant, warehouse) pair

### StockMovement
- **Audit log** of every inventory change — never update InventoryItem without writing a StockMovement
- References: ProductVariant, Warehouse
- `type`: `inbound` (stock received from supplier), `outbound` (shipped to customer), `return` (customer returned), `damage_write_off`, `adjustment` (manual correction)
- `quantity` (positive number — direction is captured by `type`)
- `referenceId` + `referenceType` — polymorphic reference to the cause: could be an Order, a PurchaseOrder, a Return, or a manual Staff action
- Who performed it (reference to Staff or System)
- `createdAt`

### Supplier
- Company name, contact name, email, phone
- Address (embed)
- Products they supply (array of ProductVariant references)
- `isActive`

### PurchaseOrder (Restocking order from Supplier to Warehouse)
- Reference to Supplier, Warehouse
- **Line items**: array of `{ variantId, quantityOrdered, quantityReceived, unitCost }`
- `status`: `draft`, `sent`, `partially_received`, `received`, `cancelled`
- Expected delivery date
- **Total cost**
- Created by (Staff reference)
- `createdAt`, `updatedAt`

---

## Domain 4 — Commerce

### Cart
- One cart per Customer (reference)
- Items: array of `{ variantId, quantity, addedAt }`
- `updatedAt` (so you can run abandoned cart jobs — find carts not updated in 24hrs)

> Think carefully: should Cart be its own collection or embedded in Customer?

### Order
- Reference to Customer
- **Snapshot** the customer's name and email at order time (customer can delete account)
- Items: array — each item must capture: variantId, productName (snapshot), variantAttributes (snapshot), quantity, unitPrice (snapshot), totalPrice
- **Shipping address** — snapshot, not reference
- `status`: `pending` → `confirmed` → `processing` → `shipped` → `out_for_delivery` → `delivered` → `cancelled` → `return_requested` → `returned`
- Status history: track timestamp of every status transition
- `totalMrp` (sum of base prices before discount)
- `totalDiscount`
- `couponDiscount`
- `totalAmount` (what customer actually paid)
- Coupon applied: store the **code string** (snapshot) and discount value — not a reference
- Payment reference (reference to Payment document)
- Assigned warehouse (which warehouse is fulfilling this order)
- `createdAt`, `updatedAt`

### Payment
- Reference to Order
- `method`: `cod`, `card`, `upi`, `netbanking`, `wallet`
- `status`: `pending`, `paid`, `failed`, `refunded`, `partially_refunded`
- `amount`
- `gateway`: `razorpay`, `stripe`, `paytm` (which payment processor was used)
- `gatewayTransactionId` — the ID from the payment gateway (for reconciliation)
- `paidAt` timestamp
- `refundedAmount`
- `createdAt`

### Coupon
- Code (unique), discountType (`percentage` or `flat`), discountValue
- `minOrderValue`
- `maxDiscountAmount` (for percentage coupons — cap the discount, e.g. max ₹200 off)
- `expiryDate`
- `maxUsage`, `usageCount`
- Applicable to: `all`, specific `categoryIds` (array), specific `productIds` (array)
- `isActive`

---

## Domain 5 — Fulfillment

### Shipment
- Reference to Order
- **Tracking number** (from logistics partner)
- `carrier`: `delhivery`, `bluedart`, `dtdc`, `shiprocket`, etc.
- `status`: `pending_pickup`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed_delivery`, `returned_to_warehouse`
- Estimated delivery date
- Actual delivery date
- Assigned warehouse (reference)
- `createdAt`, `updatedAt`

### ShipmentEvent (tracking timeline)
- Reference to Shipment
- `status` string (raw status from carrier)
- `location` string (e.g. "Bangalore Hub")
- `description`
- `timestamp`

> Think: should ShipmentEvent be embedded in Shipment or a separate collection?

### Return
- Reference to Order, Customer
- Items being returned: array of `{ orderItemVariantId, quantity, reason }`
- `reason`: `defective`, `wrong_item`, `not_as_described`, `changed_mind`
- `status`: `requested` → `pickup_scheduled` → `picked_up` → `received_at_warehouse` → `qc_passed` → `qc_failed` → `refund_initiated` → `completed`
- `refundMethod`: `original_payment`, `wallet`, `bank_transfer`
- Reference to Refund document (once created)
- `createdAt`, `updatedAt`

### Refund
- Reference to Order, Return (optional — refunds can happen without returns, e.g. partial refund for late delivery)
- `amount`
- `status`: `pending`, `processed`, `failed`
- `processedAt`
- `createdAt`

---

## Domain 6 — Engagement

### Review
- Customer (reference), ProductVariant (reference), Order (reference — to verify purchase)
- `rating` (1–5, required)
- `title`, `body`
- `images` (array of URLs — photo reviews)
- `isVerified` (boolean — set to true if the reference order actually contains this variant and is delivered)
- `isVisible` (boolean — moderation flag, default true)
- Compound unique: one review per (customer, variant) pair
- `createdAt`

### Notification
- Reference to Customer (or Seller or Staff — think about how to handle multiple recipient types)
- `type`: `order_placed`, `order_shipped`, `order_delivered`, `payment_failed`, `restock_alert`, `review_request`, etc.
- `title`, `body`
- `isRead` (boolean, default false)
- `readAt` timestamp
- `data` — flexible JSON payload (e.g. `{ orderId: "...", trackingNumber: "..." }`)
- `createdAt`

---

## Your Task

Design **all Mongoose schemas** in TypeScript.

Create **one file per domain** (you decide the grouping). Suggested structure:
```
src/modules/
  identity/
    customer.model.ts
    seller.model.ts
    staff.model.ts
  catalog/
    brand.model.ts
    category.model.ts
    product.model.ts
    productVariant.model.ts
  warehouse/
    warehouse.model.ts
    inventoryItem.model.ts
    stockMovement.model.ts
    supplier.model.ts
    purchaseOrder.model.ts
  commerce/
    cart.model.ts
    order.model.ts
    payment.model.ts
    coupon.model.ts
  fulfillment/
    shipment.model.ts
    shipmentEvent.model.ts
    return.model.ts
    refund.model.ts
  engagement/
    review.model.ts
    notification.model.ts
```

For **each schema**, document with comments:
1. **Embed vs Reference** decisions and why
2. **Indexes** you'd add and why
3. Any **schema options** (`timestamps`, `_id: false`, etc.)

---

## Senior-Level Traps (things a junior gets wrong — a senior gets right first try)

1. **ProductVariant.attributes** — how do you store flexible key-value pairs in a typed Mongoose schema?
2. **StockMovement.referenceId** — polymorphic references in MongoDB. What's the pattern?
3. **Notification recipient** — three different actor types (Customer, Seller, Staff). How do you model this without three separate fields that are mostly null?
4. **Cart** — separate collection or embedded in Customer? Make a decision and defend it.
5. **ShipmentEvent** — embedded array in Shipment vs separate collection. At 10M shipments with 8 events each, what's the right call?
6. **InventoryItem quantities** — `quantityAvailable`, `quantityReserved`, `quantityDamaged`. Why three fields instead of one? How does this enable atomic operations?
7. **Order.items snapshot** — you must snapshot `productName` and `variantAttributes` at order time. Why? What happens if you don't?

---

## Deliverable

All schema files under `src/modules/` following the folder structure above.

No need to run anything — schema definitions with embed/reference/index decisions as comments.

> This is the schema you will use for ALL of Phase 2 (queries), Phase 4 (production incidents), and Phase 5 (system design). Design it like it's going to production tomorrow.
