# Phase 1 — Question 01: E-Commerce Platform

## The System

You are designing the MongoDB schema for a production e-commerce platform — think Amazon/Flipkart scale.

---

## Business Requirements

### Users
- A user has a name, email (unique), hashed password, phone number, and role (`customer`, `seller`, `admin`)
- A user can have **multiple saved addresses** (home, work, etc.) — each address has street, city, state, pincode, country, and a label
- A user has one **default address** among their saved addresses
- Track when the user was created and last updated
- Store a user's **wishlist** (list of products they saved)

### Products
- A product has a name, description, price, and a discounted price (optional)
- Every product belongs to a **category** (e.g., Electronics, Clothing) and optionally a **subcategory**
- A product is sold by a **seller** (a User with role `seller`)
- A product has a **stock count**
- Products have **multiple images** (URLs)
- Products have **tags** for search (e.g., `["wireless", "bluetooth", "headphones"]`)
- A product has an **average rating** and a **total review count** (for fast display — you don't want to aggregate reviews every time the product page loads)
- Products can be **active or inactive** (soft visibility toggle)

### Categories
- A category has a name and a slug (URL-friendly unique string)
- Categories are **hierarchical** — a category can have a parent category (Electronics → Mobile Phones → Smartphones)

### Reviews
- A user can leave one review per product (rating 1–5, text comment)
- Store who wrote it, which product, when
- A review can be marked **verified** (only if the user actually purchased the product)

### Orders
- An order belongs to a user
- An order has **multiple items** — each item captures: which product, quantity, and the **price at the time of purchase** (price can change later — you must snapshot it)
- An order has a **shipping address** — snapshot it, don't reference (address can be deleted later)
- Order statuses: `pending` → `confirmed` → `shipped` → `delivered` → `cancelled` → `returned`
- Track **timestamps for each status change** (when did it get shipped? when delivered?)
- An order has a total amount, and a discount amount (if a coupon was applied)
- Store which **coupon code** was used (if any)
- Payment info: method (`cod`, `card`, `upi`), status (`pending`, `paid`, `failed`, `refunded`)

### Coupons
- A coupon has a code (unique), discount type (`percentage` or `flat`), discount value
- A coupon has a minimum order value to be applicable
- A coupon has an expiry date and a max usage count
- Track how many times a coupon has been used

---

## Your Task

Design **all Mongoose schemas** in TypeScript for this system.

For each schema, you must also answer:

1. Which fields did you choose to **embed** vs **reference**, and why?
2. Which fields would you **index**, and why?
3. Any **schema options** you set (timestamps, toJSON, etc.) and why?

---

## Hints (read only if stuck)

<details>
<summary>Hint 1 — Address</summary>
Should addresses be a separate collection or embedded in the User document? Think about how they're always accessed — do you ever query addresses without the user?
</details>

<details>
<summary>Hint 2 — Order items</summary>
Why can't order items just store a reference to the Product? What happens if the product price changes next week?
</details>

<details>
<summary>Hint 3 — Category hierarchy</summary>
How do you represent a tree in MongoDB? There are multiple patterns — pick the simplest one that works for 2–3 levels deep.
</details>

<details>
<summary>Hint 4 — avgRating on Product</summary>
This is a classic denormalization decision. Why store it on the product instead of computing it from reviews every time?
</details>

---

## Deliverable

Create a file `solution.ts` in this folder with all your schemas.

No need to connect to DB or run anything — just the schema definitions with your embed/reference/index decisions documented as comments.
