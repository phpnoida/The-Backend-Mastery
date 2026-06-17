// ════════════════════════════════════════════════════════════════════
// 01 — OBJECTS  (30 questions · simple → medium → tough)
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// Only patterns you actually use writing backend/API code are included.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── destructure name and role into variables and log both.
// Expected: Amit  admin
const q01User = { id: 1, name: "Amit", role: "admin", email: "amit@x.com" };
// ↓


// ── Q02 ── get an array of the object's keys.
// Expected: ["id", "name", "price"]
const q02Product = { id: 10, name: "Keyboard", price: 4999 };
// ↓


// ── Q03 ── get an array of the object's values.
// Expected: [10, "Keyboard", 4999]
const q03Product = { id: 10, name: "Keyboard", price: 4999 };
// ↓


// ── Q04 ── get an array of [key, value] pairs.
// Expected: [["a", 1], ["b", 2]]
const q04Obj = { a: 1, b: 2 };
// ↓


// ── Q05 ── does the object HAVE an "email" key? does it have "phone"? (use "in")
// Expected: true  false
const q05User = { id: 1, email: "a@x.com" };
// ↓


// ── Q06 ── add/replace `status: "active"` immutably (spread into a new object).
// Expected: { id: 1, status: "active" }
const q06Base = { id: 1 };
// ↓


// ── Q07 ── add a property whose KEY comes from a variable (computed key).
// Expected: { active: true }
const q07Field = "active";
const q07Value = true;
// ↓


// ── Q08 ── shallow-clone the object into a new variable (spread).
// Expected: { name: "Alpha", tier: "free" }
const q08Original = { name: "Alpha", tier: "free" };
// ↓


// ── Q09 ── rebuild an object from [key, value] pairs.
// Expected: { x: 10, y: 20 }
const q09Pairs = [["x", 10], ["y", 20]];
// ↓


// ── Q10 ── how many keys does the object have?
// Expected: 3
const q10User = { id: 1, name: "Amit", role: "admin" };
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── merge defaults with overrides so the override wins.
// Expected: { page: 1, limit: 25, sort: "asc" }
const q11Defaults = { page: 1, limit: 10, sort: "asc" };
const q11Override = { limit: 25 };
// ↓


// ── Q12 ── "pick": new object with ONLY id and email.
// Expected: { id: 7, email: "ravi@x.com" }
const q12User = { id: 7, name: "Ravi", email: "ravi@x.com", password: "secret" };
// ↓


// ── Q13 ── "omit": new object WITHOUT the password key.
// Expected: { id: 7, name: "Ravi", email: "ravi@x.com" }
const q13User = { id: 7, name: "Ravi", email: "ravi@x.com", password: "secret" };
// ↓


// ── Q14 ── rename the `_id` key to `id` (keep the value), drop `_id`.
// Expected: { id: "abc", name: "Amit" }
const q14Doc = { _id: "abc", name: "Amit" };
// ↓


// ── Q15 ── safe nested read with a fallback: get address.city, else "N/A".
// Expected: N/A
const q15User = { name: "Ghost" }; // no address
// ↓


// ── Q16 ── transform values: return a NEW object with every value doubled.
// Expected: { a: 2, b: 4, c: 6 }
const q16Obj = { a: 1, b: 2, c: 3 };
// ↓


// ── Q17 ── filter an object: keep only entries whose value is > 1.
// Expected: { b: 2, c: 3 }
const q17Obj = { a: 1, b: 2, c: 3 };
// ↓


// ── Q18 ── invert keys and values.
// Expected: { "1": "a", "2": "b" }
const q18Obj = { a: 1, b: 2 };
// ↓


// ── Q19 ── turn the params object into a query string "page=2&limit=10".
// Expected: page=2&limit=10
const q19Params = { page: 2, limit: 10 };
// ↓


// ── Q20 ── remove keys whose value is null or undefined (clean a response object).
// Expected: { a: 1, c: 3 }
const q20Obj = { a: 1, b: null, c: 3, d: undefined };
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (real transforms you'll write inside services)            │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── build a summary object { category: count } from the orders.
// Expected: { books: 2, food: 1, electronics: 1 }
const q21Orders = [
  { id: 1, category: "books" },
  { id: 2, category: "food" },
  { id: 3, category: "books" },
  { id: 4, category: "electronics" },
];
// ↓


// ── Q22 ── group products by category: { category: [names...] }.
// Expected: { books: ["JS", "Node"], food: ["Tea"] }
const q22Products = [
  { name: "JS", category: "books" },
  { name: "Tea", category: "food" },
  { name: "Node", category: "books" },
];
// ↓


// ── Q23 ── build an index/lookup map { id: user } from the array.
// Expected: { "1": { id: 1, name: "Amit" }, "2": { id: 2, name: "Ravi" } }
const q23Users = [
  { id: 1, name: "Amit" },
  { id: 2, name: "Ravi" },
];
// ↓


// ── Q24 ── DEEP clone the nested object, change clone.address.city, prove original is untouched.
// Expected: Mumbai  Pune     (clone city first, then original city)
const q24User = { name: "Sara", address: { city: "Pune" } };
// ↓


// ── Q25 ── DEEP merge: nested objects should combine, not overwrite wholesale.
// Expected: { a: 1, b: 2, nested: { x: 1, y: 20, z: 30 } }
const q25Base = { a: 1, nested: { x: 1, y: 2 } };
const q25Patch = { b: 2, nested: { y: 20, z: 30 } };
// ↓


// ── Q26 ── read a value at a dot-path string "a.b.c" (you choose how; should return 42).
// Expected: 42
const q26Obj = { a: { b: { c: 42 } } };
const q26Path = "a.b.c";
// ↓


// ── Q27 ── merge an ARRAY of objects into one object.
// Expected: { a: 1, b: 2, c: 3 }
const q27List = [{ a: 1 }, { b: 2 }, { c: 3 }];
// ↓


// ── Q28 ── sum revenue per category: { category: totalAmount }.
// Expected: { books: 800, food: 300 }
const q28Orders = [
  { category: "books", amount: 500 },
  { category: "food", amount: 300 },
  { category: "books", amount: 300 },
];
// ↓


// ── Q29 ── collect emails per role: { role: [emails...] }.
// Expected: { admin: ["a@x.com", "s@x.com"], user: ["r@x.com"] }
const q29Users = [
  { email: "a@x.com", role: "admin" },
  { email: "r@x.com", role: "user" },
  { email: "s@x.com", role: "admin" },
];
// ↓


// ── Q30 ── normalize a DB doc for an API response: rename _id→id, drop password,
//           and add `isAdult: age >= 18`.
// Expected: { id: "u1", name: "Amit", age: 28, isAdult: true }
const q30Doc = { _id: "u1", name: "Amit", age: 28, password: "secret" };
// ↓
