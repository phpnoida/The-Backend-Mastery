// ════════════════════════════════════════════════════════════════════
// 05 — OPERATORS  (the modern syntax you'll use in every handler)
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// Use SPREAD to copy the array and add 4 at the end (without mutating the original).
// Expected: [1, 2, 3, 4]
const q01Nums = [1, 2, 3];

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// Use SPREAD to merge two objects into one.
// Expected: { a: 1, b: 2, c: 3 }
const q02A = { a: 1, b: 2 };
const q02B = { c: 3 };

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// OPTIONAL CHAINING: log the city; it should be undefined (not an error) when address is missing.
// Expected: undefined
const q03User = { name: "Ghost" }; // no address

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// NULLISH (??): use 10 as the fallback ONLY when limit is null/undefined.
// Try it with q04Limit = 0 — note 0 should stay 0 (that's why ?? not ||).
// Expected: 0
const q04Limit = 0;

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// Contrast: now use || with the same 0. Observe how it wrongly falls back.
// Expected: 10
const q05Limit = 0;

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// TERNARY: log "adult" if age >= 18 else "minor".
// Expected: "adult"
const q06Age = 21;

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// SHORT-CIRCUIT (&&): log the user's name only if user exists, else undefined.
// Expected: "Amit"
const q07User = { name: "Amit" };

// your answer ↓


// ── Q08 ──────────────────────────────────────────────
// DESTRUCTURING with defaults: pull page and limit; limit isn't present so default it to 10.
// Expected: 2  10
const q08Query = { page: 2 };

// your answer ↓


// ── Q09 ──────────────────────────────────────────────
// `in` operator: does the object HAVE an "email" key? does it have "phone"?
// Expected: true  false
const q09User = { id: 1, email: "a@x.com" };

// your answer ↓


// ── Q10 ── (mini real-world) ─────────────────────────
// Build a clean filter object: start from base, override status, and only include `category`
// if it's provided (here it's undefined, so it must NOT appear in the result).
// Expected: { status: "active" }
const q10Base = {};
const q10Status = "active";
const q10Category = undefined;

// your answer ↓
