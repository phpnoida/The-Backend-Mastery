// ════════════════════════════════════════════════════════════════════
// 09 — MATHS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Pagination, percentages, money, rounding — the numbers an API returns.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── round, floor, ceil of 3.6.
// Expected: 4  3  4
const q01Val = 3.6;
// ↓


// ── Q02 ── max and min of the list.
// Expected: 90  12
const q02Nums = [45, 90, 12, 33];
// ↓


// ── Q03 ── absolute value of -7.
// Expected: 7
const q03Val = -7;
// ↓


// ── Q04 ── is 10 even? (modulo)
// Expected: true
const q04Num = 10;
// ↓


// ── Q05 ── 2 to the power 10. (Math.pow or **)
// Expected: 1024
// ↓


// ── Q06 ── sum the array. (reduce)
// Expected: 100
const q06Nums = [10, 20, 30, 40];
// ↓


// ── Q07 ── average of the array.
// Expected: 25
const q07Nums = [10, 20, 30, 40];
// ↓


// ── Q08 ── remainder of 17 divided by 5.
// Expected: 2
// ↓


// ── Q09 ── round 2.5 and round 2.4 (note .5 rounds up).
// Expected: 3  2
// ↓


// ── Q10 ── square root of 144.
// Expected: 12
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── what percent is 30 of 40? round to whole.
// Expected: 75
const q11Got = 30;
const q11Total = 40;
// ↓


// ── Q12 ── apply a 20% discount to 250 → final price.
// Expected: 200
const q12Price = 250;
// ↓


// ── Q13 ── add 18% GST to 1000.
// Expected: 1180
const q13Amount = 1000;
// ↓


// ── Q14 ── pagination: total pages for 31 items at 10/page (round up).
// Expected: 4
const q14Total = 31;
const q14Size = 10;
// ↓


// ── Q15 ── pagination: skip/offset for page 3 at 10/page.
// Expected: 20
const q15Page = 3;
const q15Size = 10;
// ↓


// ── Q16 ── clamp 150 into [1, 100].
// Expected: 100
const q16Val = 150;
// ↓


// ── Q17 ── round a price to 2 decimals AS A NUMBER (not a string): 19.985 → 19.99.
// Expected: 19.99
const q17Price = 19.985;
// ↓


// ── Q18 ── random integer between 1 and 6 inclusive (dice).
// Expected: a whole number 1–6 (differs each run)
// ↓


// ── Q19 ── format paise→rupees: 123456 (paise) → "₹1234.56".
// Expected: "₹1234.56"
const q19Paise = 123456;
// ↓


// ── Q20 ── thousands separators: 1234567 → "1,234,567" (toLocaleString en-US).
// Expected: "1,234,567"
const q20Num = 1234567;
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (calculations a real endpoint performs)                   │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── cart total with reduce: sum price*qty across line items.
// Expected: 1100
const q21Items = [
  { price: 100, qty: 2 },
  { price: 300, qty: 3 },
];
// ↓


// ── Q22 ── build full pagination meta: { page, limit, total, totalPages, hasNext }.
// total=31, page=2, limit=10.
// Expected: { page: 2, limit: 10, total: 31, totalPages: 4, hasNext: true }
const q22Total = 31;
const q22Page = 2;
const q22Limit = 10;
// ↓


// ── Q23 ── average order value, rounded to 2 decimals.
// Expected: 366.67
const q23Amounts = [500, 300, 300];
// ↓


// ── Q24 ── median of the (already-unsorted) list.
// Expected: 5
const q24Nums = [9, 1, 5, 3, 7];
// ↓


// ── Q25 ── percent change from old→new, rounded to whole, with sign in mind.
// old=200, new=250 → +25.
// Expected: 25
const q25Old = 200;
const q25New = 250;
// ↓


// ── Q26 ── distribute 100 into 3 buckets as integers that still SUM to 100
// (e.g. [34, 33, 33]) — handle the remainder.
// Expected: [34, 33, 33]   (sum must be 100)
const q26Total = 100;
const q26Buckets = 3;
// ↓


// ── Q27 ── round money UP to the nearest rupee: 19.01 → 20.
// Expected: 20
const q27Price = 19.01;
// ↓


// ── Q28 ── compound interest: 1000 at 10% for 2 years, rounded to whole. P*(1+r)^t.
// Expected: 1210
const q28P = 1000;
const q28R = 0.1;
const q28T = 2;
// ↓


// ── Q29 ── sum a numeric field but IGNORE non-numbers safely.
// Expected: 30
const q29Vals = [10, "x", 20, null];
// ↓


// ── Q30 ── stats summary in one pass: { min, max, sum, avg } for the list (avg 2 decimals).
// Expected: { min: 12, max: 90, sum: 180, avg: 45 }
const q30Nums = [45, 90, 12, 33];
// ↓
