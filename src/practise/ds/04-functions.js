// ════════════════════════════════════════════════════════════════════
// 04 — FUNCTIONS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Pure functions, HOFs, closures, async — the shape of service code.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── PURE function add(a, b). Log add(2, 3).
// Expected: 5
// ↓


// ── Q02 ── arrow function square(n). Log square(6).
// Expected: 36
// ↓


// ── Q03 ── default param: greet(name, greeting = "Hello"). Log greet("Amit") & greet("Sara","Hi").
// Expected: "Hello, Amit"  "Hi, Sara"
// ↓


// ── Q04 ── rest params: sum(...nums). Log sum(1, 2, 3, 4).
// Expected: 10
// ↓


// ── Q05 ── spread an array into Math.max. Log the max.
// Expected: 9
const q05Nums = [3, 9, 1, 7];
// ↓


// ── Q06 ── return an object from an arrow in one line (mind the parentheses).
// makeUser("Amit") → { name: "Amit", role: "user" }
// Expected: { name: "Amit", role: "user" }
// ↓


// ── Q07 ── boolean predicate isEven(n). Log isEven(4) & isEven(7).
// Expected: true  false
// ↓


// ── Q08 ── early return: getRole(user) returns "guest" if no user, else user.role.
// Log getRole(null) & getRole({ role: "admin" }).
// Expected: "guest"  "admin"
// ↓


// ── Q09 ── function that returns a function: greeter("Hi") returns fn(name) → "Hi, name".
// Log greeter("Hi")("Amit").
// Expected: "Hi, Amit"
// ↓


// ── Q10 ── pass an arrow as a callback to map: triple each number.
// Expected: [3, 6, 9]
const q10Nums = [1, 2, 3];
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── higher-order: applyTwice(fn, x) returns fn(fn(x)). Log applyTwice(n => n + 3, 10).
// Expected: 16
// ↓


// ── Q12 ── closure counter: makeCounter() returns fn; each call returns next number.
// Call 3 times, log each.
// Expected: 1  2  3
// ↓


// ── Q13 ── currying: multiply(a)(b). Log multiply(3)(4).
// Expected: 12
// ↓


// ── Q14 ── predicate + filter: isAdult(u) = age >= 18; filter then map to names.
// Expected: ["Amit", "Sara"]
const q14Users = [
  { name: "Amit", age: 28 },
  { name: "Kid", age: 12 },
  { name: "Sara", age: 18 },
];
// ↓


// ── Q15 ── compose(f, g) → x => f(g(x)). shout = compose(s => s+"!", s => s.toUpperCase()).
// Log shout("hi").
// Expected: "HI!"
// ↓


// ── Q16 ── once(fn): returns a fn that runs the original only the FIRST time; later calls
// return the first result. Wrap () => "init". Call wrapped twice, log both.
// Expected: "init"  "init"   (and the original runs only once)
// ↓


// ── Q17 ── default param from another param: range(start, end = start + 2) → [start..end].
// Log range(1) & range(1, 4).
// Expected: [1, 2, 3]  [1, 2, 3, 4]
// ↓


// ── Q18 ── a function that takes an object and returns a getter:
// prop("name") returns u => u.name. Log prop("name")({ name: "Amit" }).
// Expected: "Amit"
// ↓


// ── Q19 ── memoize-lite: write square with a cache object; calling twice with 5 computes once.
// Log square(5) twice.
// Expected: 25  25
// ↓


// ── Q20 ── reducer pattern: a function (acc, item) that tallies amounts; feed it to reduce.
// Expected: 1100
const q20Orders = [{ amount: 500 }, { amount: 600 }];
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (async + real service-shaped helpers)                     │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── async/await: write delay(ms) that resolves after ms, and an async run() that
// awaits delay(100) then logs "done". Call run().
// Expected: "done"  (after ~100ms)
// ↓


// ── Q22 ── a function returning a Promise that RESOLVES "ok"; consume it with .then and log.
// Expected: "ok"
// ↓


// ── Q23 ── a function returning a Promise that REJECTS "fail"; catch it and log the reason.
// Expected: "fail"
// ↓


// ── Q24 ── Promise.all: await two resolved promises (1 and 2) and log their sum.
// Expected: 3
// ↓


// ── Q25 ── wrap a throwing fn in try/catch; safeParse(json) returns the object or null.
// Log safeParse('{"a":1}') & safeParse("not json").
// Expected: { a: 1 }  null
// ↓


// ── Q26 ── pipe(...fns): left-to-right compose. pipe(inc, double)(3) where inc=+1, double=*2.
// Expected: 8
// ↓


// ── Q27 ── debounce concept (logic only): write a function that, given an array of calls,
// returns only the LAST argument (simulate "keep the latest"). Log lastOf([1, 2, 3]).
// Expected: 3
// ↓


// ── Q28 ── retry logic (sync sim): tryUntil(fn, n) calls fn up to n times until it returns
// truthy; fn returns true on the 2nd call. Log how many attempts it took.
// Expected: 2
// ↓


// ── Q29 ── build a validator factory: minLen(3) returns s => s.length >= 3.
// Log minLen(3)("ab") & minLen(3)("abcd").
// Expected: false  true
// ↓


// ── Q30 ── a tiny middleware chain: run([fn1, fn2], ctx) calls each with ctx in order,
// each mutating ctx; fn1 sets ctx.a=1, fn2 sets ctx.b=2. Log the final ctx.
// Expected: { a: 1, b: 2 }
// ↓
