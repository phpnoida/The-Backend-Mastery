# Phase 3 — System Design & Performance Question Bank

> **How this works:** These are *spec-only* questions — no answers written here (on purpose).
> When you're ready, tell me **"phase 3, question N"** (or "start phase 3 grilling") and I'll
> ask it interactively, push back on your answer, follow up, and only *then* tell you what a
> staff-level answer looks like and where yours had gaps.
>
> Each question lists the **concepts it's testing** (so you know what to revise from
> `00-concepts.md`) and a collapsed **hint** for if you're stuck. Treat hints as a last resort.
>
> Difficulty: 🟢 warm-up · 🟡 core · 🔴 hard · ⚫ staff/architect.
> All scenarios use THIS repo's domain (Order, Product, Customer, Inventory, Warehouse, etc.).

---

## A. Indexing & Query Performance

### Q1 🟢 — Index the order-history query
The customer order-history endpoint runs:
`Order.find({ customerId }).sort({ createdAt: -1 }).limit(20)`.
Design the index. Justify the **key order**. Then prove it's optimal — what would `explain`
show, and what numbers confirm it?

*Testing: ESR rule, compound index, explain ratios.*

<details><summary>Hint</summary>Which is equality, which is sort? What does the index order need to be so the sort is free?</details>

---

### Q2 🟡 — The mystery slow query
An endpoint filtering orders by `status` and sorting by `createdAt` is slow even though
there's an index on `{ createdAt: -1 }` and another on `{ status: 1 }`. Diagnose it. Why don't
the two single-field indexes solve it? What's the fix?

*Testing: index intersection limits, compound vs single, in-memory SORT, selectivity.*

<details><summary>Hint</summary>Can Mongo use both indexes well at once? What does `explain` show for the sort stage — is there an in-memory SORT?</details>

---

### Q3 🟡 — Covered query
The product list page needs only `name` and `sellingPrice` for active products, sorted by
price. Design an index that lets MongoDB answer **without touching the documents at all**.
What exactly makes a query "covered," and how do you confirm it in `explain`?

*Testing: covered queries, projection, FETCH stage absence.*

<details><summary>Hint</summary>Every field in the filter, sort, AND projection must be in the index. What about `_id`?</details>

---

### Q4 🔴 — Too many indexes
Writes to the `product` collection have gotten slow. There are 14 indexes. Walk me through how
you'd decide which to drop without breaking query performance. What tools and what risk
mitigation?

*Testing: index cost on writes, `$indexStats`, hidden indexes, prefix rule consolidation.*

<details><summary>Hint</summary>How do you find unused indexes? How can you test "what if I drop this" in prod safely before actually dropping?</details>

---

## B. Schema Design

### Q5 🟢 — Reviews: embed or reference?
A product can have hundreds of thousands of reviews. Embed them in the product document or
separate collection? Defend your choice with a specific number/limit. Now: the product page
shows the **5 most recent** reviews — does that change anything?

*Testing: 16MB limit, unbounded array, Subset pattern.*

<details><summary>Hint</summary>What's the hard document size limit? What pattern lets you keep *some* reviews hot on the product but the rest elsewhere?</details>

---

### Q6 🟡 — Why does an Order snapshot product data?
Your `order.model.ts` copies `productName`, `mrp`, `sellingPrice` into each item instead of
just storing `variantId`. SQL instinct says that's duplication/denormalization — defend it.
What breaks if you used a `$lookup` to the live product instead?

*Testing: Extended Reference / snapshot pattern, historical correctness, $lookup on hot path.*

<details><summary>Hint</summary>What is an order, fundamentally? What happens to the order record when the product price changes next month?</details>

---

### Q7 🔴 — Model the category tree
Categories are hierarchical (Electronics → Mobiles → Smartphones, 3–4 levels). You need: (a)
"show all products under Electronics and everything beneath it," and (b) "show the breadcrumb
path for a product's category." Pick a tree pattern and justify it against the alternatives.

*Testing: tree patterns (parent-ref / ancestors array / materialized path), $graphLookup tradeoffs.*

<details><summary>Hint</summary>Three patterns exist. Which makes "whole subtree" a single indexed query? Which makes moving a node cheap? You're optimizing reads here.</details>

---

### Q8 ⚫ — The whale customer
99% of customers have < 100 orders. A handful of B2B accounts have **millions**. Any
"embed recent orders on the customer" idea breaks for them. How do you design so the common
case stays simple and the outliers don't blow up?

*Testing: Outlier pattern, access-pattern-driven design.*

<details><summary>Hint</summary>There's a named pattern for exactly "a few documents break the model." How do you flag and special-case them?</details>

---

## C. Concurrency & Transactions

### Q9 🟡 — Prevent overselling inventory
Two customers buy the last unit of a product at the same millisecond. Write the inventory
decrement so it's impossible to oversell — **without** a transaction or a lock. Then explain
why your approach is race-free.

*Testing: atomic conditional update, optimistic concurrency, `$inc` with a filter guard.*

<details><summary>Hint</summary>Put the precondition *in the filter* of the update. What does `matchedCount === 0` tell you? No read-then-write.</details>

---

### Q10 🔴 — When do you actually need a transaction?
Placing an order must: (1) create the order, (2) decrement inventory for each item, (3) write
a payment record. Do you need a multi-document transaction? If yes, what must you handle that
people forget? If you could avoid it, how?

*Testing: multi-doc transactions, retry logic, keeping transactions short, single-doc alternatives.*

<details><summary>Hint</summary>Which of these writes touch different documents and MUST all succeed or all fail? What error class must your transaction code retry on?</details>

---

## D. Replication, Consistency & Scale

### Q11 🟡 — Where do reads go, and what concerns?
Payments must never be lost and must read-your-own-write. The analytics dashboard can tolerate
data a few seconds stale. Specify the **read preference**, **write concern**, and **read
concern** for each path, and justify the difference.

*Testing: w:majority, readConcern majority, read preference primary vs secondary, replication lag.*

<details><summary>Hint</summary>For money: what `w` survives a failover? For analytics: where can you send the reads to offload the primary, and what's the cost you accept?</details>

---

### Q12 🔴 — Failover behavior
The primary node crashes mid-traffic. Walk me through exactly what happens — to in-flight
writes, to reads, to the application — and how a write made with `w:1` could be lost while a
`w:"majority"` write survives.

*Testing: elections, oplog, rollback, write concern durability.*

<details><summary>Hint</summary>What process picks the new primary? What happens to a write the old primary acked but hadn't replicated before it died?</details>

---

### Q13 ⚫ — Pick a shard key for `orders`
The `orders` collection has outgrown one machine. The hot queries are: "orders for a customer"
and "orders in a date range." Propose a shard key. Evaluate it on cardinality, frequency, and
monotonicity. What goes wrong with `{ _id: 1 }`? With `{ status: 1 }`? With `{ createdAt: 1 }`?

*Testing: shard key selection, hotspotting, targeted vs scatter-gather, hashed vs ranged.*

<details><summary>Hint</summary>A monotonic key sends all new writes to one shard. A low-cardinality key makes jumbo chunks. Which field must be in the key so the hot query stays *targeted*?</details>

---

## E. Aggregation & Reporting

### Q14 🟡 — Order the pipeline
A report aggregates millions of orders: filter to last 30 days, join customer info, group by
customer, sort by total spend, take top 100. Write the stage order for maximum performance and
justify each placement. Where would it blow the sort memory cap, and what are your two fixes?

*Testing: $match-first, index use in aggregation, $sort+$limit top-K, 100MB cap, allowDiskUse vs index.*

<details><summary>Hint</summary>Which stage must come first to use an index and shrink the stream? Why is `$lookup` dangerous here, and can you defer/avoid it? How does `$sort`+`$limit` adjacency help?</details>

---

### Q15 🔴 — Expensive dashboard
The "sales per warehouse per day" dashboard recomputes a heavy aggregation on every page load
and it's hammering the primary. Redesign so the read path is cheap. What's the pattern, what
are the freshness tradeoffs, and how do you keep it updated?

*Testing: materialized views ($merge/$out), pre-computation, CQRS-in-Mongo, scheduled pipeline, change streams.*

<details><summary>Hint</summary>What if the answer were already sitting in a small indexed collection? How do you populate and refresh it? What freshness do you give up?</details>

---

## F. Pagination

### Q16 🟡 — Infinite-scroll feed
The customer's "my orders" screen is infinite scroll, newest first, and some customers have
50k orders. The current `skip/limit` implementation gets slow on deep scroll and occasionally
shows duplicates. Diagnose both bugs and redesign. Include the exact index.

*Testing: $skip is O(skip), instability under inserts, keyset pagination, unique tiebreaker.*

<details><summary>Hint</summary>Why is `skip(40000)` slow? Why do duplicates appear when sorting only on `createdAt`? What value do you "remember" to fetch the next page, and what tiebreaker makes the sort total?</details>

---

## Stretch — open-ended architect rounds (⚫)

These have no single right answer — they're for practicing the **clarify → model → index →
consistency → scale → tradeoffs** framework end to end.

- **S1.** Design the data layer for **flash-sale checkout** — 100k users buying 1k units in 60
  seconds. Inventory accuracy is non-negotiable. Walk the whole stack: schema, the decrement,
  hot-key contention, read path, what you shard, what you cache, what you accept.
- **S2.** Design **product search & filtering** (by category, price range, brand, attributes,
  in-stock, sorted by relevance/price). Which indexes? Where does MongoDB stop being the right
  tool and you reach for Atlas Search / Elasticsearch — and why?
- **S3.** A **0-downtime schema migration**: you're adding a required field and changing
  `shippingAddress`'s shape across 200M orders. How, with no downtime and a safe rollback?
  (Schema Versioning pattern.)

---

> Ping me with **"phase 3, Q<n>"** when you want to be grilled on one, or **"phase 3 random"**
> and I'll pick. I'll act as the interviewer: ask, challenge your answer, follow up on the weak
> spot, then give you the staff-level model answer and score the gap.
