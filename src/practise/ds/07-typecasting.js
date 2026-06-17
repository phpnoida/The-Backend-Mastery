// ════════════════════════════════════════════════════════════════════
// 07 — TYPECASTING & COERCION  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Query params & JSON bodies arrive as strings — this is daily backend work.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── convert "42" to a Number; confirm with typeof.
// Expected: 42  "number"
const q01Str = "42";
// ↓


// ── Q02 ── convert 99 to a String; confirm with typeof.
// Expected: "99"  "string"
const q02Num = 99;
// ↓


// ── Q03 ── convert 1 and 0 to Booleans.
// Expected: true  false
// ↓


// ── Q04 ── typeof checks: log typeof "hi", typeof 5, typeof true.
// Expected: "string"  "number"  "boolean"
// ↓


// ── Q05 ── parseInt "25px".
// Expected: 25
const q05Val = "25px";
// ↓


// ── Q06 ── Number("25px") — note the gotcha.
// Expected: NaN
const q06Val = "25px";
// ↓


// ── Q07 ── parseFloat the price string.
// Expected: 19.99
const q07Price = "19.99 USD";
// ↓


// ── Q08 ── == vs ===: log ("5" == 5) then ("5" === 5).
// Expected: true  false
// ↓


// ── Q09 ── Array.isArray check: log for [1,2] and for "ab".
// Expected: true  false
// ↓


// ── Q10 ── String(num) vs num.toString(): convert 7 both ways, log both.
// Expected: "7"  "7"
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── truthy/falsy: Boolean() of "", 0, "0", null, [], {}.
// Expected: false  false  true  false  true  true
// ↓


// ── Q12 ── JSON.parse the string, then read .page.
// Expected: 2
const q12Json = '{"page": 2, "limit": 10}';
// ↓


// ── Q13 ── JSON.stringify the object.
// Expected: '{"id":1,"name":"Amit"}'
const q13Obj = { id: 1, name: "Amit" };
// ↓


// ── Q14 ── coercion gotcha: log ("3" + 2) then ("3" - 2).
// Expected: "32"  1
// ↓


// ── Q15 ── isNaN vs Number.isNaN: log Number.isNaN(Number("abc")).
// Expected: true
// ↓


// ── Q16 ── convert "true"/"false" strings to real booleans (think how — not Boolean("false")!).
// Log for "true" and "false".
// Expected: true  false
// ↓


// ── Q17 ── default a NaN to 0: parse "abc" as int and fall back to 0.
// Expected: 0
const q17Val = "abc";
// ↓


// ── Q18 ── Array.from a Set to dedupe + arrayify.
// Expected: [1, 2, 3]
const q18WithDupes = [1, 1, 2, 3, 3];
// ↓


// ── Q19 ── number formatting: 1234.5 → "1,234.5" using toLocaleString (en-US).
// Expected: "1,234.5"
const q19Num = 1234.5;
// ↓


// ── Q20 ── toFixed returns a STRING: 3.14159.toFixed(2) → log it and its typeof.
// Expected: "3.14"  "string"
const q20Num = 3.14159;
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (cleaning real request data)                              │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── coerce a query object: { page: "3", limit: "20", active: "true" }
// → { page: 3, limit: 20, active: true } (numbers + real boolean).
// Expected: { page: 3, limit: 20, active: true }
const q21Query = { page: "3", limit: "20", active: "true" };
// ↓


// ── Q22 ── safeNumber(v): return Number(v) if finite, else null. Test "12" and "x".
// Expected: 12  null
// ↓


// ── Q23 ── parse a comma list of ids string into an array of NUMBERS.
// Expected: [1, 2, 3]
const q23Ids = "1,2,3";
// ↓


// ── Q24 ── coerce checkbox-style values: "on"/"true"/"1"/true → true; everything else → false.
// Test "on" and "0".
// Expected: true  false
// ↓


// ── Q25 ── deep clone via JSON (note: drops functions/undefined). Clone & mutate nested, prove
// original untouched.
// Expected: 99  1   (clone.n.v first, then original.n.v)
const q25Obj = { n: { v: 1 } };
// ↓


// ── Q26 ── safe JSON.parse: return parsed object or null on bad input.
// Log for '{"a":1}' and "oops".
// Expected: { a: 1 }  null
// ↓


// ── Q27 ── normalize price: accept number OR numeric string, return a 2-decimal number.
// Test "19.5" and 19.
// Expected: 19.5  19
// ↓


// ── Q28 ── coerce tags: accept a single string OR an array, always return an array.
// Test "node" and ["a","b"].
// Expected: ["node"]  ["a", "b"]
// ↓


// ── Q29 ── Date from an ISO string → log the 4-digit year.
// Expected: 2026
const q29Iso = "2026-06-17T10:00:00Z";
// ↓


// ── Q30 ── full body sanitizer: trim strings, coerce numeric strings to numbers,
// drop keys whose value is "" . Input below.
// Expected: { name: "Amit", age: 30 }
const q30Body = { name: "  Amit  ", age: "30", note: "" };
// ↓
