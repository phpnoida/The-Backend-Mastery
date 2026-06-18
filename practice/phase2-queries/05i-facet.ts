/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SHEET 05i — $facet   (many pipelines, one query — dashboards & pagination)
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  ── REVISE THIS FIRST ──────────────────────────────────────────────────────
 *  $facet runs SEVERAL independent sub-pipelines over the SAME input documents and
 *  returns all their results in one document. One DB round-trip powers a whole screen.
 *
 *      { $facet: {
 *          byStatus: [ { $sortByCount: "$status" } ],
 *          revenue:  [ { $group: { _id: null, total: { $sum: "$totalAmount" } } } ],
 *          biggest:  [ { $sort: { totalAmount: -1 } }, { $limit: 5 } ],
 *      } }
 *      // → [{ byStatus: [...], revenue: [...], biggest: [...] }]
 *
 *  Each value is its OWN full pipeline (an array of stages). They don't see each other;
 *  they all start from whatever entered $facet.
 *
 *  TWO signature uses:
 *    1. DASHBOARD — several unrelated metrics at once (KPIs + chart + top-N table).
 *    2. PAGINATION — the page of data AND the total count in one query (the big one).
 *
 *  NOTE: every output is an ARRAY. For pagination you read totalCount[0]?.count ?? 0.
 *  Run with: npx tsx practice/phase2-queries/05i-facet.ts
 * ════════════════════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import Order from "../../src/modules/order/order.model.js";
import Product from "../../src/modules/product/product.model.js";

await mongoose.connect("mongodb://localhost:27017/backend-mastery-dev");
console.log("Connected\n");

// ─── Q1 ──────────────────────────────────────────────────────────────────────
// Orders DASHBOARD in one query, three sections:
//   byStatus → count per status (use $sortByCount)
//   revenue  → overall { total, avg } of totalAmount
//   biggest  → top 5 orders by amount as { customerName, totalAmount }
// Stages: $facet
// YOUR ANSWER:


// ─── Q2 ──────────────────────────────────────────────────────────────────────
// PAGINATION over active products — the pattern you'll ship in every list endpoint.
// One query returns: data → page 1 of 5 products sorted by reviewCount desc, AND
// totalCount → the total number of active products.
// Stages: $match, $facet { data: [$sort,$skip,$limit,$project], totalCount: [$count] }
// Hint: in code you'd read result[0].totalCount[0]?.count ?? 0 for the page count.
// YOUR ANSWER:


// ─── Q3 ──────────────────────────────────────────────────────────────────────
// Two histograms side by side over orders: a manual $bucket on totalAmount AND a
// $bucketAuto (4 buckets) on totalAmount — compare how the boundaries differ.
// Stages: $facet { manual: [$bucket], auto: [$bucketAuto] }
// YOUR ANSWER:


// ─── Q4 ──────────────────────────────────────────────────────────────────────
// One-query order KPIs: { totals: [{ orders, revenue, avg }], byStatus: [...] }.
// Stages: $facet
// YOUR ANSWER:


await mongoose.disconnect();
console.log("\nDone.");
