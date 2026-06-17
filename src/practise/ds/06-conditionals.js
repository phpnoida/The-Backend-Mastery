// ════════════════════════════════════════════════════════════════════
// 06 — CONDITIONALS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Guard clauses, switch, validation branching — how services make decisions.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── if/else if/else: "A" for >=90, "B" for >=75, else "C".
// Expected: "B"
const q01Score = 80;
// ↓


// ── Q02 ── log "even" or "odd".
// Expected: "even"
const q02Num = 10;
// ↓


// ── Q03 ── log true if age is between 18 and 60 (inclusive).
// Expected: true
const q03Age = 30;
// ↓


// ── Q04 ── switch on role: admin→"full", editor→"write", default→"read".
// Expected: "write"
const q04Role = "editor";
// ↓


// ── Q05 ── log "empty" if the array has no items, else "has items".
// Expected: "empty"
const q05Items = [];
// ↓


// ── Q06 ── log "missing" if name is falsy (undefined/""), else the name.
// Expected: "missing"
const q06Name = "";
// ↓


// ── Q07 ── log "in stock" if quantity > 0 else "out of stock".
// Expected: "out of stock"
const q07Qty = 0;
// ↓


// ── Q08 ── log "allow" if active AND age >= 18, else "deny".
// Expected: "deny"
const q08User = { active: true, age: 16 };
// ↓


// ── Q09 ── switch with fallthrough: "sat"/"sun" → "weekend", others → "weekday".
// Expected: "weekend"
const q09Day = "sun";
// ↓


// ── Q10 ── default fallback: treat an empty status as "pending".
// Expected: "pending"
const q10Status = "";
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── guard clause: getDiscount(user) → 0 if no user, else 50.
// Log getDiscount(null) & getDiscount({ name: "Amit" }).
// Expected: 0  50
// ↓


// ── Q12 ── validateAge(age): undefined→"age required", <18→"too young", else "ok".
// Log all three: validateAge(undefined), validateAge(15), validateAge(30).
// Expected: "age required"  "too young"  "ok"
// ↓


// ── Q13 ── pickStatusCode(result): error "validation"→400, "notfound"→404,
// other error→500, no error→200. Log pickStatusCode({}) & pickStatusCode({ error: "notfound" }).
// Expected: 200  404
// ↓


// ── Q14 ── tier pricing: <=10 → "single", <=50 → "team", else "enterprise".
// Expected: "team"
const q14Seats = 25;
// ↓


// ── Q15 ── normalize a flag: accept true / "true" / 1 as truthy → log boolean.
// Expected: true
const q15Flag = "true";
// ↓


// ── Q16 ── role check: return true only if role is one of ["admin","owner","editor"].
// Expected: true
const q16Role = "owner";
// ↓


// ── Q17 ── clamp a requested limit into [1, 100]: 0→1, 250→100, else as-is. Test 250.
// Expected: 100
const q17Limit = 250;
// ↓


// ── Q18 ── shipping: free if total >= 500, else 50. Log the fee for total 480.
// Expected: 50
const q18Total = 480;
// ↓


// ── Q19 ── canEdit(user, post): true if user is the author OR an admin.
// Expected: true
const q19User = { id: 2, role: "admin" };
const q19Post = { authorId: 9 };
// ↓


// ── Q20 ── refund window: allow if daysSincePurchase <= 30 AND status === "delivered".
// Expected: false
const q20Order = { daysSincePurchase: 10, status: "shipped" };
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (decision logic you'll actually ship)                     │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── validateProduct(p): return an array of error strings (empty array = valid).
// Rules: title required; price > 0; category in [books, food].
// Test p below → Expected: ["price must be > 0", "invalid category"]
const q21Product = { title: "Pen", price: 0, category: "toys" };
// ↓


// ── Q22 ── same validator, a VALID product → empty array.
// Expected: []
const q22Product = { title: "Pen", price: 20, category: "food" };
// ↓


// ── Q23 ── map an error object to an HTTP response { status, message } without if-chains
// if you can (lookup table). notfound → { status: 404, message: "Not found" }.
// Expected: { status: 404, message: "Not found" }
const q23Error = { type: "notfound" };
// ↓


// ── Q24 ── access matrix: can(role, action). admin can do anything; user can only "read".
// Log can("user", "read") & can("user", "delete").
// Expected: true  false
// ↓


// ── Q25 ── discount engine: 20% if loyalty "gold" AND total > 1000; 10% if total > 1000;
// else 0. Return the percent. Test below.
// Expected: 20
const q25Cart = { loyalty: "gold", total: 1500 };
// ↓


// ── Q26 ── password strength: "strong" if length>=8 AND has a digit; "medium" if length>=8;
// else "weak". Test "abcd1234".
// Expected: "strong"
const q26Pwd = "abcd1234";
// ↓


// ── Q27 ── route a webhook by event type to a handler NAME via a lookup object;
// unknown types → "ignore". Test "payment.failed".
// Expected: "handleFailure"
const q27Event = "payment.failed";
// the map: { "payment.success": "handleSuccess", "payment.failed": "handleFailure" }
// ↓


// ── Q28 ── normalizeSort(sort): "asc"/"ASC"/1 → 1; "desc"/"DESC"/-1 → -1; anything else → 1.
// Test "DESC".
// Expected: -1
const q28Sort = "DESC";
// ↓


// ── Q29 ── stock status: qty===0 → "out", qty<5 → "low", else "in". Test 3.
// Expected: "low"
const q29Qty = 3;
// ↓


// ── Q30 ── full guard pipeline: createOrder(user, cart) returns the FIRST failing reason or "ok".
// Checks in order: no user → "auth"; empty cart → "empty"; total <= 0 → "invalid"; else "ok".
// Test below.
// Expected: "empty"
const q30User = { id: 1 };
const q30Cart = { items: [], total: 0 };
// ↓
