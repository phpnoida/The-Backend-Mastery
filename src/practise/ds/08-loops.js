// ════════════════════════════════════════════════════════════════════
// 08 — LOOPS
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Classic for loop: log numbers 1 to 5.
// Expected: 1 2 3 4 5  (each logged)

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// for...of: log each fruit.
// Expected: apple  banana  cherry
const q02Fruits = ["apple", "banana", "cherry"];

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// for...in: log each KEY of the object.
// Expected: id  name  role
const q03User = { id: 1, name: "Amit", role: "admin" };

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// while loop: keep doubling from 1 and log values while <= 16.
// Expected: 1  2  4  8  16

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// forEach: log "index: value" for each element.
// Expected: "0: a"  "1: b"  "2: c"
const q05Arr = ["a", "b", "c"];

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// map vs forEach: use MAP to return a NEW array of each number tripled.
// Expected: [3, 6, 9]
const q06Nums = [1, 2, 3];

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// break: loop and STOP as soon as you hit a negative number; log numbers seen before stopping.
// Expected: 4  7
const q07Nums = [4, 7, -1, 9];

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// continue: log only the EVEN numbers by skipping odds.
// Expected: 2  4  6
const q08Nums = [1, 2, 3, 4, 5, 6];

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// Nested loops: log every (size, color) pair.
// Expected: "S-red"  "S-blue"  "M-red"  "M-blue"
const q09Sizes = ["S", "M"];
const q09Colors = ["red", "blue"];

// your answer ↓


// ── Q10 ── (mini real-world) ─────────────────────────
// Build an index object { id: user } from the array using a loop (fast lookup by id).
// Expected: { 1: { id: 1, name: "Amit" }, 2: { id: 2, name: "Ravi" } }
const q10Users = [
  { id: 1, name: "Amit" },
  { id: 2, name: "Ravi" },
];

// your answer ↓
