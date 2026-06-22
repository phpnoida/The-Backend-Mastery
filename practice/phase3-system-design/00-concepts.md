# Phase 3 — MongoDB System Design & Performance (Senior / Architect Reference)

> **How to use this file:** Read it slowly, top to bottom, more than once. Every section
> ends with a **"Senior signal"** — the one-liner an interviewer or staff engineer listens
> for. When you can *teach* each section from memory using examples from THIS repo's
> e-commerce schema (Order, Product, Customer, Inventory, Warehouse), you're ready for
> `01-questions.md`.
>
> The goal is not to memorize syntax. It's to build **judgment** — knowing the tradeoff,
> the failure mode, and the "it depends" behind every decision.

---

## Table of Contents

1. [The Mental Model — why MongoDB behaves the way it does](#1)
2. [Schema Design & the Embed-vs-Reference Decision](#2)
3. [The Schema Design Patterns (the named playbook)](#3)
4. [Indexing — the single most important performance topic](#4)
5. [Reading `explain()` — proving your query is fast](#5)
6. [Query & Aggregation Performance](#6)
7. [Pagination at Scale](#7)
8. [Concurrency, Atomicity & Transactions](#8)
9. [Replication & High Availability](#9)
10. [Sharding & Horizontal Scale](#10)
11. [Operational Concerns](#11)
12. [Anti-Patterns Cheat Sheet](#12)

---

<a name="1"></a>
## 1. The Mental Model — why MongoDB behaves the way it does

Everything else makes sense once these are internalized:

- **The unit of atomicity is the single document.** A write to one document is always
  all-or-nothing, even if it touches 50 nested fields and array elements. This single fact
  drives almost every schema decision: *data that must change together should live together.*

- **WiredTiger storage engine** uses **document-level concurrency control** with MVCC
  (multi-version concurrency control). Two writes to *different* documents run concurrently;
  two writes to the *same* document serialize. There is no table-level lock.

- **Working set** = the indexes + frequently-accessed documents that should fit in RAM.
  MongoDB is fast when the working set fits in memory and slow (disk-bound) when it doesn't.
  Most "MongoDB is slow" stories are really "the working set spilled to disk" or "no index."

- **Reads are cheap to scale (add replicas / shards); consistency and writes are where the
  hard tradeoffs live.** Keep this asymmetry in mind during every design discussion.

> **Senior signal:** You reason from "single-document atomicity" and "working set in RAM"
> instead of memorizing rules.

---

<a name="2"></a>
## 2. Schema Design & the Embed-vs-Reference Decision

There is no "normalize everything" default like in SQL. You model around **how the data is
accessed**, not around eliminating redundancy.

### The decision framework

Ask, in order:

1. **Do these pieces of data get read together almost every time?** → lean **embed**.
2. **Do they change together atomically?** → lean **embed** (single-doc atomicity is free).
3. **Is the embedded side unbounded (grows forever)?** → **reference** (avoid the 16MB cliff).
4. **Is the embedded side queried/updated independently and frequently?** → **reference**.
5. **Is the sub-entity shared across many parents?** → **reference** (don't duplicate a
   product into every order... but see snapshotting below).

### The 16MB document limit & the unbounded array anti-pattern

A document can never exceed **16MB**. An array that grows without bound (e.g.
`order.statusHistory` is fine — bounded ~9 entries; but `product.reviews: [...]` embedding
every review is a **time bomb**). A popular product could get 500k reviews → blows the limit
and makes every product read drag megabytes off disk.

**Rule:** embed *bounded* sub-data; reference *unbounded* sub-data. In this repo, reviews
are their own collection (`reviews/review.model.ts`) — correct.

### Snapshotting vs referencing (the Order example)

Look at `order.model.ts`: items store `productName`, `mrp`, `sellingPrice` **copied in**, not
just a `variantId` reference. This is deliberate and correct:

- An order is a **historical financial record**. If the product price changes next week, the
  order must still show what the customer *actually paid*.
- Same for `shippingAddress` — snapshotted, because the customer might delete that address
  later, but the order must remain shippable/auditable.

This is the **Extended Reference / snapshot pattern**: copy the few fields you need at write
time, keep the `ObjectId` for the live link. You accept controlled duplication to buy
read-time simplicity and historical correctness.

> **Senior signal:** You say "model for the access pattern" and can defend a *denormalization*
> (snapshot) as deliberate, not accidental. You name the 16MB limit and unbounded-array trap
> unprompted.

---

<a name="3"></a>
## 3. The Schema Design Patterns (the named playbook)

These are the canonical MongoDB patterns. Knowing them *by name* is a senior signal — it
shows you've seen the problem before. Map each to this repo where possible.

| Pattern | Problem it solves | Example in this domain |
|---|---|---|
| **Computed** | Don't re-aggregate on every read | `product.avgRating` / `reviewCount` stored, updated on new review |
| **Subset** | Document too big; only need a slice often | Store the 5 most-recent reviews on the product, rest in reviews collection |
| **Extended Reference** | Joins on the hot path are expensive | Order item copies `productName`, `mrp` (no `$lookup` to render an order) |
| **Bucket** | Many tiny docs (time-series/events) bloat index overhead | Group inventory movements per-day per-warehouse into one bucket doc |
| **Outlier** | A few documents break the model (whale customer with 1M orders) | Flag outliers, overflow their data to a side collection |
| **Computed/Approximation** | Exact counts are expensive at scale | "10k+ sold" counter incremented probabilistically |
| **Schema Versioning** | Migrating schema with zero downtime | `schemaVersion: 2` field; app handles both shapes |
| **Polymorphic** | Similar-but-different entities in one collection | Products with category-specific attribute sets |
| **Attribute** | Many rare/varied fields you want to index uniformly | `attributes: [{k, v}]` for product specs, index `{ "attributes.k": 1, "attributes.v": 1 }` |
| **Tree patterns** | Hierarchies (category → subcategory) | Parent-ref, array-of-ancestors, or materialized-path on `category` |

### Tree patterns (because your `category` is hierarchical)

- **Parent reference**: each node stores `parentId`. Simple writes; reading a full subtree
  needs recursion or `$graphLookup`.
- **Array of ancestors**: store `ancestors: [rootId, ..., parentId]`. One indexed query gets
  the whole path/subtree. Costlier to move nodes.
- **Materialized path**: store `path: "/electronics/mobiles/"`. Regex-prefix queries find
  subtrees; index-friendly if anchored (`^/electronics/`).

> **Senior signal:** You answer "how would you model X" with a *named pattern* and its
> tradeoff, not an ad-hoc shape.

---

<a name="4"></a>
## 4. Indexing — the single most important performance topic

If you master one section, make it this one. Most production MongoDB pain is a missing or
wrong index.

### What an index is

A **B-tree** of ordered keys pointing at documents. It turns an O(n) collection scan
(`COLLSCAN`) into an O(log n) index seek (`IXSCAN`). Indexes cost write throughput (every
insert/update maintains every relevant index) and RAM/disk — so you index deliberately, not
everything.

### Single-field, compound, and the **ESR rule**

A **compound index** `{ a: 1, b: 1, c: 1 }` is sorted by `a`, then `b`, then `c`. The order
of keys is everything. Use the **ESR rule** to order a compound index:

> **E**quality first → **S**ort next → **R**ange last.

Example query: orders for a customer, shipped after a date, newest first:
```
find({ customerId: X, createdAt: { $gt: D } }).sort({ createdAt: -1 })
```
- Equality: `customerId`
- Sort: `createdAt`
- Range: `createdAt` (range and sort on same field here)

Index: `{ customerId: 1, createdAt: -1 }`. Equality narrows to one customer's slice, then the
index is *already* in `createdAt` order so the sort is free (no in-memory sort), and the range
walks a contiguous block. Get ESR wrong and Mongo does an in-memory sort or scans too many
keys.

### Index **prefix** rule

A compound index `{ a, b, c }` can serve queries on `{a}`, `{a,b}`, `{a,b,c}` — any **left
prefix**. It **cannot** serve a query on `{b}` or `{c}` alone. So order keys so the most
common standalone-queried field is leftmost. One well-ordered compound index can replace
several single-field indexes.

### Multikey indexes (arrays)

Indexing an array field creates a **multikey index** — one index entry per array element.
`product.tags` indexed → a query `{ tags: "wireless" }` is an index hit. Caveat: you can't
have a compound index with **two** array fields (Mongo can't represent the cartesian product).

### Covered queries

If a query's filter **and** its projection are all satisfied by the index, Mongo answers from
the index alone — **never touches the documents**. Blazing fast. Requires: all queried/returned
fields in the index, and `_id` explicitly excluded if not in the index.

### Specialized index types

- **Text index** — full-text search on string fields (`$text`). One per collection. For
  serious search, real systems reach for Atlas Search / Elasticsearch instead.
- **Partial index** — index only docs matching a filter: `{ partialFilterExpression: { status: "active" } }`.
  Smaller, cheaper. Great for "only index active products."
- **Sparse index** — index only docs where the field exists. (Partial is the more general,
  preferred tool.)
- **TTL index** — auto-delete docs after N seconds (`expireAfterSeconds`). Perfect for
  sessions, OTPs, carts, ephemeral data.
- **Unique index** — enforces uniqueness (`email`, `sku`, `coupon.code`). Combine with
  partial for "unique among active only."
- **Wildcard index** — `{ "attributes.$**": 1 }` indexes unknown/varied keys (pairs well with
  the Attribute pattern).
- **Hashed index** — for hashed sharding; randomizes distribution.
- **Hidden index** — keep the index but make the planner ignore it, to test "what if I dropped
  this?" safely in prod before actually dropping.

### Cardinality / selectivity

A **selective** index (high cardinality — many distinct values, e.g. `email`, `customerId`)
filters to few docs and is worth it. A **low-cardinality** index (`status` with 9 values,
`isActive` boolean) is weak alone — it still scans a huge slice. Low-cardinality fields earn
their place as the **equality prefix of a compound index**, not as a standalone index.

### Operational reality

- Index builds on huge collections are expensive; production uses **rolling builds** across
  replica set members to avoid impacting the primary.
- More indexes = slower writes and more RAM. Audit unused indexes (`$indexStats`) and drop them.
- ESR + prefix + covered queries is ~80% of real-world index design.

> **Senior signal:** You reach for ESR to order a compound index, you know one good compound
> index beats three single-field ones (prefix rule), and you mention covered queries,
> selectivity, and partial/TTL indexes by name.

---

<a name="5"></a>
## 5. Reading `explain()` — proving your query is fast

Never *claim* a query is fast — **prove it**. `db.coll.find(...).explain("executionStats")`
(or `Model.find().explain()` / `aggregate([...], { explain: true })`).

### What to look at

- **`winningPlan.stage`**:
  - `IXSCAN` = used an index ✅
  - `COLLSCAN` = full collection scan ❌ (fine for tiny collections, a red flag at scale)
  - `FETCH` = went to documents after the index (absent = covered query)
  - `SORT` = **in-memory sort** ❌ — means the index didn't satisfy the sort; fix the index order
- **The three numbers** (the ratio is what matters):
  - `nReturned` — docs returned
  - `totalKeysExamined` — index entries scanned
  - `totalDocsExamined` — documents scanned
- **The golden ratio:** you want `nReturned ≈ totalKeysExamined ≈ totalDocsExamined`. If you
  return 10 docs but examined 1,000,000, the index is wrong/missing or not selective.
- **`SORT_KEY_GENERATOR` / in-memory `SORT` stage** = you forgot to support the sort in the
  index. The "32MB sort memory" error / `allowDiskUse` need traces back to here.
- **`rejectedPlans`** — what the optimizer tried and discarded.

> **Senior signal:** Your first move when asked "is this query fast?" is "let's `explain` it"
> and you read the keys/docs-examined ratio, not just IXSCAN-vs-COLLSCAN.

---

<a name="6"></a>
## 6. Query & Aggregation Performance

### The optimizer & plan cache

MongoDB's query planner races candidate plans on a sample, picks a winner, and **caches** it
keyed by query *shape*. Cache resets on index changes, enough writes, or restart. Usually
helps; occasionally a stale plan needs a nudge (`planCacheClear`, or `hint()` to force an
index).

### Aggregation pipeline rules that matter

- **Filter early.** Put `$match` as the **first** stage so it can use an index and shrink the
  stream before expensive stages. `$match` after `$group` cannot use the original index.
- **Project early** to drop big unused fields and cut memory/network.
- The optimizer does some **automatic reordering** (e.g. pushing `$match` before `$sort`,
  coalescing `$sort`+`$limit` into a top-K sort) — but don't rely on it; write the pipeline in
  the efficient order yourself.
- **`$sort` + `$limit` adjacency** lets Mongo do a memory-bounded **top-K** sort instead of
  sorting the whole set. (This is exactly the `05d` sheet lesson.)
- **`$sort` memory cap is 100MB** per stage; beyond it you need `allowDiskUse: true` (slower,
  spills to disk) — or, better, an index that provides the order so no blocking sort happens.
- **`$lookup` is a left outer join** and is **expensive on hot paths** — it runs a query per
  input document unless the foreign field is indexed, and even then it doesn't scale like a
  pre-joined/embedded read. For high-QPS endpoints, prefer the Extended Reference (snapshot)
  pattern over a runtime `$lookup`. `$lookup` is great for analytics/reporting, risky for the
  product page.

### Materialized views

`$merge` / `$out` write an aggregation's result to a collection. Use a scheduled pipeline to
**pre-compute** expensive reports (daily sales per warehouse, top products) so the read path
hits a simple indexed collection instead of crunching live. This is the read-side of CQRS in
MongoDB.

### Projection & network

Always project only the fields you need. Returning whole documents over the wire is a silent,
common performance leak — especially with large arrays (items, history).

> **Senior signal:** You put `$match`/`$project` first, you know `$lookup` is a per-doc join to
> keep off hot paths, and you reach for `$merge` materialized views for heavy reporting.

---

<a name="7"></a>
## 7. Pagination at Scale

- **Offset pagination** (`$skip` + `$limit`, or `.skip().limit()`) is **O(skip)**: to serve
  page 10,000 the server walks and discards every earlier doc. Fine for small admin tables;
  it degrades badly for deep pages and is **unstable** if new docs are inserted between page
  loads (rows shift).
- **Keyset / cursor pagination** is the scalable answer. Remember the last-seen sort value and
  query forward:
  ```
  find({ createdAt: { $lt: lastSeenCreatedAt } }).sort({ createdAt: -1 }).limit(20)
  ```
  O(limit) regardless of depth, and stable under inserts. This is how "infinite scroll" feeds
  work.
- **Stable sort requires a tiebreaker.** Sorting only on a non-unique field (`createdAt`) lets
  equal-valued docs drift across page boundaries (duplicates/skips). Add a unique tiebreaker:
  `sort({ createdAt: -1, _id: -1 })`. The index must match: `{ createdAt: -1, _id: -1 }`.

> **Senior signal:** You call out that `$skip` is O(skip) and unstable, and you propose keyset
> pagination with an `_id` tiebreaker for feeds.

---

<a name="8"></a>
## 8. Concurrency, Atomicity & Transactions

### Prefer single-document atomicity

Most "I need a transaction" cases are really **"redesign so the data is in one document."**
A single update with `$inc`, `$push`, `$set`, array filters etc. is atomic and lock-free
across documents. Reach for transactions only when *multiple* documents must change together.

### Atomic operators & optimistic concurrency

- **`$inc`** is atomic — the canonical way to adjust `inventory.quantity` or a coupon's
  `usedCount` without a read-modify-write race.
- **`findOneAndUpdate`** reads + writes atomically and can return the new doc.
- **Optimistic concurrency / conditional update**: guard the update with the precondition in
  the filter, e.g. *only* decrement stock if enough remains:
  ```
  updateOne({ _id, quantity: { $gte: qty } }, { $inc: { quantity: -qty } })
  ```
  If `matchedCount === 0`, someone else got there first — no oversell, no lock. This is THE
  inventory-decrement pattern. (Mongoose also has `__v` versionKey for optimistic concurrency
  on document saves.)

### Multi-document ACID transactions

Real, since 4.0 (replica sets) / 4.2 (sharded). Snapshot isolation. But:

- They have **cost** — they hold locks, can abort under write conflict, and don't scale like
  single-doc writes.
- You **must** implement **retry logic** for `TransientTransactionError` /
  `UnknownTransactionCommitResult` — transactions can fail and must be retried as a unit.
- Keep them **short** and touching **few documents**. A long transaction is a throughput
  killer and a deadlock risk.
- Use them for genuinely-coupled writes: place order → decrement inventory → write payment
  record, all-or-nothing. (Your `08-transactions.ts` sheet.)

> **Senior signal:** Your instinct is "can single-document atomicity / a conditional `$inc`
> solve this?" *before* reaching for a transaction, and when you do use one you mention retry
> logic and keeping it short.

---

<a name="9"></a>
## 9. Replication & High Availability

### Replica set basics

A **replica set** = one **primary** (takes all writes) + N **secondaries** (replicate the
primary's **oplog**). If the primary dies, the set holds an **election** and a secondary is
promoted — automatic failover, typically seconds. This is how you get HA; **always run a
replica set in production**, never a standalone. (Bonus: transactions and change streams
*require* a replica set.)

### The oplog

A capped collection of every write, in order. Secondaries tail it and replay. Its size bounds
how long a secondary can be offline and still catch up without a full resync. Also what
**change streams** read from.

### Write concern — durability vs latency

`w` controls how many members must acknowledge a write before it returns:

- `w: 1` — only the primary acked. Fast, but a failover before replication can **lose** that
  write.
- `w: "majority"` — a majority acked; the write survives failover. The **safe default** for
  anything important (orders, payments).
- `j: true` — wait for the on-disk journal too.

Tradeoff: higher write concern = more durability, more latency.

### Read preference — where reads go

- `primary` (default) — strong consistency, all reads from primary.
- `secondary` / `secondaryPreferred` — offload reads to replicas, but you can read **stale**
  data (replication lag). Good for analytics/reporting, dangerous for read-your-own-write
  flows.
- `nearest` — lowest latency, geo-distributed reads.

### Read concern — what you're allowed to see

- `local` — whatever the node has (may not be durable).
- `majority` — only data acknowledged by a majority (won't be rolled back).
- `linearizable` / `snapshot` — strongest; snapshot is used inside transactions.

### Causal consistency

A session guarantee that you read-your-own-writes / monotonic reads even across primary and
secondaries — important when you write with `w:majority` then read from a secondary.

> **Senior signal:** You pair `w:"majority"` with `readConcern:"majority"` for money flows,
> you know secondary reads trade consistency for scale (replication lag), and you can explain
> failover via elections and the oplog.

---

<a name="10"></a>
## 10. Sharding & Horizontal Scale

Sharding = **horizontal partitioning** of a collection across multiple replica sets (shards),
coordinated by `mongos` routers and config servers. It's how you scale **beyond one machine's**
RAM/disk/write-throughput.

### When to shard

**Late, not early.** Shard when a single replica set can't hold the working set in RAM or
can't absorb the write rate. Sharding adds real operational complexity; vertical scaling +
good indexes carry you a long way first.

### Shard key selection — the make-or-break decision

The shard key determines how data distributes. A bad shard key is extremely painful to change.
Evaluate it on:

- **High cardinality** — many possible values, so data can split into many chunks.
- **Even frequency** — no single value dominates (a `status` key would pile everything in 9
  buckets → hotspots).
- **Non-monotonic** — a steadily-increasing key (`createdAt`, default `_id`) sends **every new
  write to the same "max" chunk** → a write **hotspot** on one shard. This is the classic
  mistake.

### Hashed vs ranged sharding

- **Hashed** — hash the key for even write distribution; kills the monotonic-hotspot problem.
  Cost: **range queries scatter** across all shards.
- **Ranged** — keeps key-adjacent data together; great for range queries, but risks hotspots
  if the key is monotonic or skewed.
- **Compound shard key** (e.g. `{ customerId: 1, orderDate: 1 }`) often balances even
  distribution with query locality.

### Targeted vs scatter-gather queries

- A query that **includes the shard key** routes to the **one** shard holding it — **targeted**,
  fast.
- A query **without** the shard key hits **every** shard — **scatter-gather**, slow, doesn't
  scale. So the shard key must align with your most common query's filter.

### Chunks, the balancer, zones

- Data is split into **chunks**; the **balancer** migrates chunks to keep shards even.
- A **jumbo chunk** (a single shard-key value too big to split) is a known pain — comes from
  low cardinality.
- **Zone sharding** pins ranges to specific shards (e.g. EU customers' data on EU-region
  shards) — for data locality / compliance.

> **Senior signal:** You pick a shard key for cardinality + even frequency + non-monotonicity,
> you know hashed kills hotspots but scatters range queries, and you align the shard key with
> the hot query to stay targeted instead of scatter-gather.

---

<a name="11"></a>
## 11. Operational Concerns

- **Connection pooling** — the driver maintains a pool (`maxPoolSize`, default 100). In
  serverless/Lambda, reuse the client across invocations; creating a client per request
  exhausts connections. Mongoose manages one pool per connection.
- **Change streams** — subscribe to a real-time feed of writes (built on the oplog). Use for
  cache invalidation, syncing to a search index, event-driven workflows — instead of polling.
- **Bulk writes** — `bulkWrite([...])` batches inserts/updates/deletes in one round trip;
  orders of magnitude faster than a loop of single writes.
- **`$merge` / `$out`** — materialize aggregation results (see §6).
- **Time-series collections** — purpose-built for metrics/IoT/append-heavy time data; auto
  bucketing, big storage and query wins over a normal collection.
- **Capped collections** — fixed-size, insertion-ordered, auto-evicting; for logs/buffers.
- **Backups & PITR** — snapshots + oplog give point-in-time recovery; know it exists.
- **Monitoring** — track replication lag, page faults / cache hit ratio, slow query log
  (`profiler`), connection counts, and per-index usage (`$indexStats`).

> **Senior signal:** You reuse the connection pool in serverless, use change streams instead of
> polling, and batch with `bulkWrite`.

---

<a name="12"></a>
## 12. Anti-Patterns Cheat Sheet (memorize these)

| Anti-pattern | Why it bites | Fix |
|---|---|---|
| **Unbounded array** in a doc | Hits 16MB, slow reads, multikey index bloat | Reference into a child collection (reviews, events) |
| **Massive documents** | Drags whole doc off disk for one field | Subset pattern; split rarely-used fields out |
| **No index on a filter/sort** | `COLLSCAN`, in-memory `SORT` | Add ESR-ordered index; verify with `explain` |
| **Too many indexes** | Slow writes, RAM pressure | Audit `$indexStats`, drop unused; prefer compound |
| **`$lookup` on the hot path** | Per-doc join, doesn't scale | Extended Reference / snapshot |
| **`$skip` deep pagination** | O(skip), unstable | Keyset/cursor + `_id` tiebreaker |
| **Monotonic shard key** (`_id`, `createdAt`) | Write hotspot on one shard | Hashed or compound shard key |
| **Low-cardinality shard key** (`status`) | Jumbo chunks, uneven load | High-cardinality key |
| **Transaction where one doc would do** | Throughput killer, lock contention | Single-doc atomic update / conditional `$inc` |
| **Read-modify-write for counters** | Lost-update race | Atomic `$inc` / conditional update |
| **`w:1` for money** | Lost write on failover | `w:"majority"` |
| **Case-insensitive `$regex` unanchored** | Can't use index, scans everything | Collation index, or store normalized field |

---

## Final framing — how to *answer* a system-design question

When I ask you a design question in `01-questions.md`, structure the answer like this — it's
how strong engineers think out loud:

1. **Clarify the access patterns first.** "What are the top 3 queries? What's the read:write
   ratio? What's the scale (docs, QPS, growth)?" Design follows access patterns.
2. **Propose the document model** — embed vs reference, with the reason (named pattern if one
   fits).
3. **Define the indexes** for the hot queries — ESR-ordered, and say which query each serves.
4. **Call out the consistency/concurrency needs** — atomic update vs transaction, write/read
   concern.
5. **State how it scales** — where replication and (eventually) sharding come in, and the
   shard key you'd pick.
6. **Name the failure modes & tradeoffs** you're accepting. There is no perfect design — there
   is the right tradeoff for the access pattern.

A junior gives one answer. A senior gives the tradeoff and the "it depends." That's the whole
game.
