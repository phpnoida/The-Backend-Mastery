// ════════════════════════════════════════════════════════════════════
// 04 — FUNCTIONS
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Write a PURE function `add(a, b)` that returns their sum. Log add(2, 3).
// Expected: 5

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// Write `greet(name, greeting = "Hello")` using a DEFAULT param.
// Log greet("Amit") and greet("Sara", "Hi").
// Expected: "Hello, Amit"   "Hi, Sara"

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// Write `sum(...nums)` using REST params that totals any number of args.
// Log sum(1, 2, 3, 4).
// Expected: 10

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// You have a number array and a SPREAD it into Math.max. Log the max.
// Expected: 9
const q04Nums = [3, 9, 1, 7];

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// Higher-order: write `applyTwice(fn, x)` that returns fn(fn(x)).
// Log applyTwice(n => n + 3, 10).
// Expected: 16

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// Callback: write `processUsers(users, callback)` that calls callback on each name.
// Use it to log each name in UPPERCASE.
// Expected: AMIT  RAVI
const q06Users = [{ name: "Amit" }, { name: "Ravi" }];

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// Closure: write `makeCounter()` that returns a function; each call returns the next number.
// Call it 3 times and log each result.
// Expected: 1  2  3

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// Currying: write `multiply(a)(b)` so multiply(3)(4) returns 12.
// Expected: 12

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// Predicate function: write `isAdult(user)` returning true if age >= 18.
// Use it to FILTER the array, then log the resulting names.
// Expected: ["Amit", "Sara"]
const q09Users = [
  { name: "Amit", age: 28 },
  { name: "Kid", age: 12 },
  { name: "Sara", age: 18 },
];

// your answer ↓


// ── Q10 ── (mini real-world) ─────────────────────────
// Compose: write `compose(f, g)` returning x => f(g(x)).
// Build `shout = compose(s => s + "!", s => s.toUpperCase())`. Log shout("hi").
// Expected: "HI!"

// your answer ↓
