// ════════════════════════════════════════════════════════════════════
// 07 — TYPECASTING & COERCION  (huge for query params & request bodies)
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Convert the string "42" to a real Number. Confirm with typeof.
// Expected: 42  "number"
const q01Str = "42";

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// Convert the number 99 to a String. Confirm with typeof.
// Expected: "99"  "string"
const q02Num = 99;

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// parseInt vs Number: parse "25px" with parseInt, and try Number("25px").
// Expected: 25  NaN
const q03Val = "25px";

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// parseFloat the price string.
// Expected: 19.99
const q04Price = "19.99 USD";

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// == vs === : log ("5" == 5) then ("5" === 5).
// Expected: true  false

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// Truthy/falsy: convert each to Boolean → "", 0, "hello", null.
// Expected: false  false  true  false

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// JSON.parse the string into an object, then read its `page`.
// Expected: 2
const q07Json = '{"page": 2, "limit": 10}';

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// JSON.stringify the object into a string.
// Expected: '{"id":1,"name":"Amit"}'
const q08Obj = { id: 1, name: "Amit" };

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// Coercion gotcha: predict & log the result of ("3" + 2) then ("3" - 2).
// Expected: "32"  1

// your answer ↓


// ── Q10 ── (mini real-world) ─────────────────────────
// Query params arrive as strings. Given { page: "3", limit: "20", active: "true" },
// produce a typed object { page: 3, limit: 20, active: true } (numbers + real boolean).
// Expected: { page: 3, limit: 20, active: true }
const q10Query = { page: "3", limit: "20", active: "true" };

// your answer ↓
