// ════════════════════════════════════════════════════════════════════
// 02 — ARRAYS  (30 questions · simple → medium → tough)
// The single most-used toolkit in API logic. Run with Quokka.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── return a new array of just the names. (map)
// Expected: ["Amit", "Ravi", "Sara"]
const q01Users = [{ name: "Amit" }, { name: "Ravi" }, { name: "Sara" }];
// ↓


// ── Q02 ── return only the ACTIVE users. (filter)
// Expected: [{ id: 1, active: true }, { id: 3, active: true }]
const q02Users = [
  { id: 1, active: true },
  { id: 2, active: false },
  { id: 3, active: true },
];
// ↓


// ── Q03 ── sum the cart total. (reduce)
// Expected: 850
const q03Cart = [{ price: 300 }, { price: 250 }, { price: 300 }];
// ↓


// ── Q04 ── find the first product priced over 1000. (find)
// Expected: { id: 2, price: 8000 }
const q04Products = [{ id: 1, price: 200 }, { id: 2, price: 8000 }, { id: 3, price: 1500 }];
// ↓


// ── Q05 ── does ANY user have role "admin"? (some)
// Expected: true
const q05Users = [{ role: "user" }, { role: "admin" }];
// ↓


// ── Q06 ── do ALL users have an email? (every)
// Expected: false
const q06Users = [{ email: "a@x.com" }, { name: "no-email" }];
// ↓


// ── Q07 ── remove duplicates. (Set)
// Expected: [1, 2, 3, 4]
const q07Nums = [1, 2, 2, 3, 4, 4, 1];
// ↓


// ── Q08 ── get the index of "blue". (indexOf)
// Expected: 2
const q08Colors = ["red", "green", "blue"];
// ↓


// ── Q09 ── does the array include "mongo"? (includes)
// Expected: true
const q09Tags = ["node", "express", "mongo"];
// ↓


// ── Q10 ── how many active users are there? (filter + length)
// Expected: 2
const q10Users = [{ active: true }, { active: false }, { active: true }];
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── emails of ACTIVE users only. (filter + map)
// Expected: ["amit@x.com", "sara@x.com"]
const q11Users = [
  { email: "amit@x.com", active: true },
  { email: "ravi@x.com", active: false },
  { email: "sara@x.com", active: true },
];
// ↓


// ── Q12 ── sort products by price ASC (don't mutate the original — copy first).
// Expected names: ["Mouse", "Cable", "Monitor"]
const q12Products = [
  { name: "Cable", price: 200 },
  { name: "Monitor", price: 8000 },
  { name: "Mouse", price: 150 },
];
// ↓


// ── Q13 ── sort products by price DESC.
// Expected names: ["Monitor", "Cable", "Mouse"]
const q13Products = [
  { name: "Cable", price: 200 },
  { name: "Monitor", price: 8000 },
  { name: "Mouse", price: 150 },
];
// ↓


// ── Q14 ── max and min price. (spread into Math.max/min)
// Expected: 8000  150
const q14Prices = [200, 8000, 150, 1500];
// ↓


// ── Q15 ── average score, rounded to a whole number.
// Expected: 77
const q15Scores = [70, 80, 90, 68];
// ↓


// ── Q16 ── flatten one level deep.
// Expected: [1, 2, 3, 4, 5, 6]
const q16Nested = [[1, 2], [3, 4], [5, 6]];
// ↓


// ── Q17 ── values present in BOTH arrays. (intersection)
// Expected: [2, 3]
const q17A = [1, 2, 3];
const q17B = [2, 3, 4];
// ↓


// ── Q18 ── values in A that are NOT in B. (difference)
// Expected: [1]
const q18A = [1, 2, 3];
const q18B = [2, 3, 4];
// ↓


// ── Q19 ── paginate: page 2, pageSize 2 (the 3rd & 4th items). (slice)
// Expected: [{ id: 3 }, { id: 4 }]
const q19Items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
const q19Page = 2;
const q19Limit = 2;
// ↓


// ── Q20 ── count users per role → object. (reduce)
// Expected: { admin: 2, user: 1 }
const q20Users = [{ role: "admin" }, { role: "user" }, { role: "admin" }];
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (the transforms a real endpoint returns)                  │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── group products by category → { category: [names...] }.
// Expected: { books: ["JS", "Node"], food: ["Tea"] }
const q21Products = [
  { name: "JS", category: "books" },
  { name: "Tea", category: "food" },
  { name: "Node", category: "books" },
];
// ↓


// ── Q22 ── PAID orders only: return { revenue, count }.
// Expected: { revenue: 1100, count: 2 }
const q22Orders = [
  { amount: 500, status: "paid" },
  { amount: 300, status: "pending" },
  { amount: 600, status: "paid" },
];
// ↓


// ── Q23 ── chunk into groups of 2.
// Expected: [[1, 2], [3, 4], [5]]
const q23Nums = [1, 2, 3, 4, 5];
// ↓


// ── Q24 ── de-duplicate an array of objects by `id` (keep first seen).
// Expected: [{ id: 1, name: "Amit" }, { id: 2, name: "Ravi" }]
const q24Users = [
  { id: 1, name: "Amit" },
  { id: 2, name: "Ravi" },
  { id: 1, name: "Amit dup" },
];
// ↓


// ── Q25 ── sort by multiple keys: by `age` ASC, then by `name` ASC for ties.
// Expected names: ["Bob", "Amit", "Sara"]
const q25Users = [
  { name: "Sara", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Amit", age: 25 },
];
// ↓


// ── Q26 ── top 2 highest-priced product names.
// Expected: ["Monitor", "Mouse"]
const q26Products = [
  { name: "Cable", price: 200 },
  { name: "Monitor", price: 8000 },
  { name: "Mouse", price: 1500 },
];
// ↓


// ── Q27 ── from nested orders, get a FLAT list of all item names. (flatMap)
// Expected: ["pen", "book", "tea"]
const q27Orders = [
  { id: 1, items: ["pen", "book"] },
  { id: 2, items: ["tea"] },
];
// ↓


// ── Q28 ── search filter: names containing the letter "o" (case-insensitive).
// Expected: ["Tom", "Joe"]
const q28Names = ["Amit", "Ravi", "Tom", "Joe"];
// ↓


// ── Q29 ── partition users into [active, inactive] in ONE pass. (reduce)
// Expected: [[{ id: 1 }, { id: 3 }], [{ id: 2 }]]
const q29Users = [
  { id: 1, active: true },
  { id: 2, active: false },
  { id: 3, active: true },
];
// ↓


// ── Q30 ── full list endpoint: filter category "books", sort price DESC, paginate page 1 size 2,
//          return { data: [names], total }. (total = count BEFORE paginating)
// Expected: { data: ["Node", "JS"], total: 3 }
const q30Products = [
  { name: "JS", category: "books", price: 500 },
  { name: "Tea", category: "food", price: 100 },
  { name: "Node", category: "books", price: 800 },
  { name: "TS", category: "books", price: 300 },
];
// ↓
