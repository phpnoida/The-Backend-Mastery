// ════════════════════════════════════════════════════════════════════
// 06 — CONDITIONAL STATEMENTS
// Run with Quokka. Write your answer under each question and console.log it.
// "Expected" is your self-check. No solution code is given — derive it.
// ════════════════════════════════════════════════════════════════════

// ── Q01 ──────────────────────────────────────────────
// if / else if / else: log "A" for >=90, "B" for >=75, else "C".
// Expected: B
const q01Score = 80;

// your answer ↓


// ── Q02 ──────────────────────────────────────────────
// switch on role: "admin" → "full access", "editor" → "write access", default → "read only".
// Expected: "write access"
const q02Role = "editor";

// your answer ↓


// ── Q03 ──────────────────────────────────────────────
// GUARD CLAUSE / early return: write `getDiscount(user)` that returns 0 immediately if user is
// null, otherwise returns 50. Log getDiscount(null) then getDiscount({ name: "Amit" }).
// Expected: 0  50

// your answer ↓


// ── Q04 ──────────────────────────────────────────────
// RANGE check: log true if the number is between 1 and 100 (inclusive), else false.
// Expected: true
const q04Limit = 50;

// your answer ↓


// ── Q05 ──────────────────────────────────────────────
// Validation branching: write `validateAge(age)` →
//   missing/undefined → "age required", < 18 → "too young", else → "ok".
// Log all three: validateAge(undefined), validateAge(15), validateAge(30).
// Expected: "age required"  "too young"  "ok"

// your answer ↓


// ── Q06 ──────────────────────────────────────────────
// Default fallback: if status is empty/missing, treat it as "pending".
// Expected: "pending"
const q06Status = "";

// your answer ↓


// ── Q07 ──────────────────────────────────────────────
// Combine conditions: log "allow" only if user is active AND age >= 18, else "deny".
// Expected: "deny"
const q07User = { active: true, age: 16 };

// your answer ↓


// ── Q08 ── (mini real-world) ─────────────────────────
// Write `pickStatusCode(result)`:
//   result.error === "validation" → 400
//   result.error === "notfound"   → 404
//   result.error (anything else)  → 500
//   no error                      → 200
// Log pickStatusCode({}) and pickStatusCode({ error: "notfound" }).
// Expected: 200  404

// your answer ↓
