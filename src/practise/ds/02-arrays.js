// ════════════════════════════════════════════════════════════════════
// 02 — ARRAYS  (the workhorse of API logic)
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Return a new array of just the names. (map)
// Expected: ["Amit", "Ravi", "Sara"]
const q01Users = [
  { id: 1, name: "Amit" },
  { id: 2, name: "Ravi" },
  { id: 3, name: "Sara" },
];

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// Return only the ACTIVE users. (filter)
// Expected: [{ id: 1, name: "Amit", active: true }, { id: 3, name: "Sara", active: true }]
const q02Users = [
  { id: 1, name: "Amit", active: true },
  { id: 2, name: "Ravi", active: false },
  { id: 3, name: "Sara", active: true },
];

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// Return emails of active users only. (filter + map)
// Expected: ["amit@x.com", "sara@x.com"]
const q03Users = [
  { name: "Amit", email: "amit@x.com", active: true },
  { name: "Ravi", email: "ravi@x.com", active: false },
  { name: "Sara", email: "sara@x.com", active: true },
];

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// Sum the total price of the cart. (reduce)
// Expected: 850
const q04Cart = [{ price: 300 }, { price: 250 }, { price: 300 }];

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// Find the FIRST product priced over 1000. (find)
// Expected: { id: 2, name: "Monitor", price: 8000 }
const q05Products = [
  { id: 1, name: "Cable", price: 200 },
  { id: 2, name: "Monitor", price: 8000 },
  { id: 3, name: "Mouse", price: 1500 },
];

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// Does ANY user have the admin role? (some)  →  then: do ALL users have an email? (every)
// Expected: true  true
const q06Users = [
  { name: "Amit", role: "admin", email: "a@x.com" },
  { name: "Ravi", role: "user", email: "r@x.com" },
];

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// Sort the products by price, ascending. (sort — don't mutate the original if you can avoid it)
// Expected names order: ["Mouse", "Cable", "Monitor"]
const q07Products = [
  { name: "Cable", price: 200 },
  { name: "Monitor", price: 8000 },
  { name: "Mouse", price: 150 },
];

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// Sort the products by price, DESCENDING.
// Expected names order: ["Monitor", "Cable", "Mouse"]
const q08Products = [
  { name: "Cable", price: 200 },
  { name: "Monitor", price: 8000 },
  { name: "Mouse", price: 150 },
];

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// Remove duplicates. (unique)
// Expected: [1, 2, 3, 4]
const q09Nums = [1, 2, 2, 3, 4, 4, 1];

// your answer ↓


// ── Q10 ──────────────────────────────────────────────
// Flatten one level deep.
// Expected: [1, 2, 3, 4, 5, 6]
const q10Nested = [[1, 2], [3, 4], [5, 6]];

// your answer ↓


// ── Q11 ──────────────────────────────────────────────
// Get the max price and the min price.
// Expected: 8000  150
const q11Prices = [200, 8000, 150, 1500];

// your answer ↓


// ── Q12 ──────────────────────────────────────────────
// Average the scores, rounded to a whole number.
// Expected: 77
const q12Scores = [70, 80, 90, 68];

// your answer ↓


// ── Q13 ──────────────────────────────────────────────
// Paginate: return PAGE 2 with PAGE SIZE 2 (i.e. the 3rd and 4th items). (slice)
// Expected: [{ id: 3 }, { id: 4 }]
const q13Items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
const q13Page = 2;
const q13Limit = 2;

// your answer ↓


// ── Q14 ──────────────────────────────────────────────
// Count how many users per role. (group/count → object)
// Expected: { admin: 2, user: 1 }
const q14Users = [
  { name: "Amit", role: "admin" },
  { name: "Ravi", role: "user" },
  { name: "Sara", role: "admin" },
];

// your answer ↓


// ── Q15 ──────────────────────────────────────────────
// Group the products into an object keyed by category: { category: [names...] }.
// Expected: { books: ["JS", "Node"], food: ["Tea"] }
const q15Products = [
  { name: "JS", category: "books" },
  { name: "Tea", category: "food" },
  { name: "Node", category: "books" },
];

// your answer ↓


// ── Q16 ──────────────────────────────────────────────
// Return the values present in BOTH arrays. (intersection)
// Expected: [2, 3]
const q16A = [1, 2, 3];
const q16B = [2, 3, 4];

// your answer ↓


// ── Q17 ──────────────────────────────────────────────
// Chunk the array into groups of 2.
// Expected: [[1, 2], [3, 4], [5]]
const q17Nums = [1, 2, 3, 4, 5];

// your answer ↓


// ── Q18 ── (mini real-world) ─────────────────────────
// API-style: from the orders, return total revenue for PAID orders only,
// and the count of paid orders, as an object.
// Expected: { revenue: 1100, count: 2 }
const q18Orders = [
  { id: 1, amount: 500, status: "paid" },
  { id: 2, amount: 300, status: "pending" },
  { id: 3, amount: 600, status: "paid" },
];

// your answer ↓
