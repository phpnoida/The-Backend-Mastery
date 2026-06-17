// ════════════════════════════════════════════════════════════════════
// 05 — OPERATORS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Spread, ?., ??, short-circuit, destructuring — every handler uses these.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── spread-copy the array and append 4 (don't mutate the original).
// Expected: [1, 2, 3, 4]
const q01Nums = [1, 2, 3];
// ↓


// ── Q02 ── spread-merge two objects into one.
// Expected: { a: 1, b: 2, c: 3 }
const q02A = { a: 1, b: 2 };
const q02B = { c: 3 };
// ↓


// ── Q03 ── optional chaining: log address.city — should be undefined, not an error.
// Expected: undefined
const q03User = { name: "Ghost" };
// ↓


// ── Q04 ── nullish (??): default limit to 10 only when null/undefined. Here limit is 0.
// Expected: 0
const q04Limit = 0;
// ↓


// ── Q05 ── contrast: use || with the same 0 and watch it wrongly fall back to 10.
// Expected: 10
const q05Limit = 0;
// ↓


// ── Q06 ── ternary: log "adult" if age >= 18 else "minor".
// Expected: "adult"
const q06Age = 21;
// ↓


// ── Q07 ── short-circuit &&: log user.name only if user exists.
// Expected: "Amit"
const q07User = { name: "Amit" };
// ↓


// ── Q08 ── short-circuit ||: log the name, or "Anonymous" if it's an empty string.
// Expected: "Anonymous"
const q08Name = "";
// ↓


// ── Q09 ── strict equality: log (1 === 1) and (1 === "1").
// Expected: true  false
// ↓


// ── Q10 ── `in`: does the object have key "email"? "phone"?
// Expected: true  false
const q10User = { id: 1, email: "a@x.com" };
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── destructure with defaults: pull page & limit; limit missing → default 10.
// Expected: 2  10
const q11Query = { page: 2 };
// ↓


// ── Q12 ── rename while destructuring: pull `name` AS `userName`.
// Expected: "Amit"
const q12User = { name: "Amit" };
// ↓


// ── Q13 ── nested destructuring: pull city out of user.address.
// Expected: "Pune"
const q13User = { address: { city: "Pune" } };
// ↓


// ── Q14 ── array destructuring: grab first and second, and the rest into `others`.
// Expected: 1  2  [3, 4, 5]
const q14Nums = [1, 2, 3, 4, 5];
// ↓


// ── Q15 ── swap two variables using array destructuring (no temp var).
// Expected: 2  1
let q15a = 1;
let q15b = 2;
// ↓


// ── Q16 ── optional chaining + ??: get address.city or "N/A".
// Expected: "N/A"
const q16User = { name: "Ghost" };
// ↓


// ── Q17 ── optional call: user.getName?.() — should be undefined (no method), not an error.
// Expected: undefined
const q17User = { name: "Amit" };
// ↓


// ── Q18 ── conditionally spread: include { verified: true } only if isVerified is true.
// Expected: { id: 1, verified: true }
const q18Base = { id: 1 };
const q18IsVerified = true;
// ↓


// ── Q19 ── default + rename together: pull `role` AS `userRole`, default "guest".
// Expected: "guest"
const q19User = { id: 1 };
// ↓


// ── Q20 ── chained ??: first defined of (a, b, "fallback").
// Expected: "B"
const q20a = null;
const q20b = "B";
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (building request/response objects cleanly)               │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── build a Mongo-style filter: always include status; include `category` ONLY if defined.
// Here category is undefined → must NOT appear.
// Expected: { status: "active" }
const q21Status = "active";
const q21Category = undefined;
// ↓


// ── Q22 ── same as Q21 but category IS provided now.
// Expected: { status: "active", category: "books" }
const q22Status = "active";
const q22Category = "books";
// ↓


// ── Q23 ── destructure function params with defaults: paginate({ page = 1, limit = 10 } = {}).
// Log paginate() then paginate({ page: 3 }) as `${page}/${limit}`.
// Expected: "1/10"  "3/10"
// ↓


// ── Q24 ── merge with override + add computed key in one object literal.
// Expected: { a: 1, b: 9, ts: "now" }
const q24Base = { a: 1, b: 2 };
const q24Key = "ts";
// ↓


// ── Q25 ── deep optional chaining on arrays: get the first item's name, safely.
// Expected: undefined   (items is empty)
const q25Order = { items: [] };
// ↓


// ── Q26 ── pull a value with a deep default: const { meta: { total = 0 } = {} } = res.
// Log total when meta is missing.
// Expected: 0
const q26Res = {};
// ↓


// ── Q27 ── coalesce a display name: nickname ?? firstName ?? "Unknown".
// Expected: "Sara"
const q27User = { nickname: null, firstName: "Sara" };
// ↓


// ── Q28 ── build update object skipping undefined fields (only set what was provided).
// patch has name defined, email undefined → result has name only.
// Expected: { name: "New" }
const q28Patch = { name: "New", email: undefined };
// ↓


// ── Q29 ── ternary chain → grade: >=90 "A", >=75 "B", else "C". (one expression)
// Expected: "B"
const q29Score = 80;
// ↓


// ── Q30 ── shape an API response: from the doc, spread safe fields, rename _id→id,
// and include `phone` ONLY if present (it isn't).
// Expected: { id: "u1", name: "Amit" }
const q30Doc = { _id: "u1", name: "Amit", phone: undefined, password: "x" };
// ↓
