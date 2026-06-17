// ════════════════════════════════════════════════════════════════════
// 01 — OBJECTS
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Destructure `name` and `role` from the user into their own variables and log both.
// Expected: Amit  admin
const q01User = { id: 1, name: "Amit", role: "admin", email: "amit@x.com" };

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// Get an array of the object's keys.
// Expected: ["id", "name", "price"]
const q02Product = { id: 10, name: "Keyboard", price: 4999 };

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// Get an array of the object's values.
// Expected: [10, "Keyboard", 4999]
const q03Product = { id: 10, name: "Keyboard", price: 4999 };

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// Merge defaults with overrides so the override wins. (think: query options)
// Expected: { page: 1, limit: 25, sort: "asc" }
const q04Defaults = { page: 1, limit: 10, sort: "asc" };
const q04Override = { limit: 25 };

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// Read the deeply nested city. Use optional chaining so it won't throw if address is missing.
// Expected: Pune
const q05User = { name: "Sara", address: { city: "Pune", pin: "411001" } };

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// Add a property whose KEY comes from a variable (computed key).
// Expected: { id: 1, status: "active" }
const q06Base = { id: 1 };
const q06Field = "status";
const q06Value = "active";

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// Convert the object into an array of [key, value] pairs.
// Expected: [["a", 1], ["b", 2], ["c", 3]]
const q07Obj = { a: 1, b: 2, c: 3 };

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// Convert the array of [key, value] pairs BACK into an object.
// Expected: { x: 10, y: 20 }
const q08Pairs = [["x", 10], ["y", 20]];

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// Make a shallow clone, change the clone's name, and confirm the original is untouched.
// Expected: Bravo  Alpha     (clone.name first, then original.name)
const q09Original = { name: "Alpha", tier: "free" };

// your answer ↓


// ── Q10 ──────────────────────────────────────────────
// "pick": build a new object containing ONLY the keys id and email.
// Expected: { id: 7, email: "ravi@x.com" }
const q10User = { id: 7, name: "Ravi", email: "ravi@x.com", password: "secret" };

// your answer ↓


// ── Q11 ──────────────────────────────────────────────
// "omit": build a new object WITHOUT the password key (keep everything else).
// Expected: { id: 7, name: "Ravi", email: "ravi@x.com" }
const q11User = { id: 7, name: "Ravi", email: "ravi@x.com", password: "secret" };

// your answer ↓


// ── Q12 ── (mini real-world) ─────────────────────────
// From the array of orders, build a summary object of { category: totalCount }.
// Expected: { books: 2, food: 1, electronics: 1 }
const q12Orders = [
  { id: 1, category: "books" },
  { id: 2, category: "food" },
  { id: 3, category: "books" },
  { id: 4, category: "electronics" },
];

// your answer ↓
