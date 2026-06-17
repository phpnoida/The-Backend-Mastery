// ════════════════════════════════════════════════════════════════════
// 08 — LOOPS  (30 questions · simple → medium → tough)
// Run with Quokka. "Expected" is your self-check. No solution code given.
// Iterating, accumulating, building lookups — the mechanics behind transforms.
// ════════════════════════════════════════════════════════════════════


// ╭──────────────────────────────────────────────────────────────────╮
// │  SIMPLE                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q01 ── classic for: log 1 to 5.
// Expected: 1 2 3 4 5 (each)
// ↓


// ── Q02 ── for...of: log each fruit.
// Expected: apple  banana  cherry
const q02Fruits = ["apple", "banana", "cherry"];
// ↓


// ── Q03 ── for...in: log each KEY.
// Expected: id  name  role
const q03User = { id: 1, name: "Amit", role: "admin" };
// ↓


// ── Q04 ── while: double from 1, log while <= 16.
// Expected: 1  2  4  8  16
// ↓


// ── Q05 ── forEach: log "index: value".
// Expected: "0: a"  "1: b"  "2: c"
const q05Arr = ["a", "b", "c"];
// ↓


// ── Q06 ── sum 1..100 with a loop.
// Expected: 5050
// ↓


// ── Q07 ── count items in the array WITHOUT using .length (loop + counter).
// Expected: 4
const q07Arr = [10, 20, 30, 40];
// ↓


// ── Q08 ── loop and collect only even numbers into a new array.
// Expected: [2, 4, 6]
const q08Nums = [1, 2, 3, 4, 5, 6];
// ↓


// ── Q09 ── for...of with entries(): log "0=a", "1=b".
// Expected: "0=a"  "1=b"
const q09Arr = ["a", "b"];
// ↓


// ── Q10 ── loop the object's entries: log "key:value" for each.
// Expected: "id:1"  "qty:5"
const q10Obj = { id: 1, qty: 5 };
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  MEDIUM                                                           │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q11 ── build a NEW array of each number tripled (map, not forEach).
// Expected: [3, 6, 9]
const q11Nums = [1, 2, 3];
// ↓


// ── Q12 ── break: stop at the first negative; collect numbers seen before it.
// Expected: [4, 7]
const q12Nums = [4, 7, -1, 9];
// ↓


// ── Q13 ── continue: skip odds, log evens.
// Expected: 2  4  6
const q13Nums = [1, 2, 3, 4, 5, 6];
// ↓


// ── Q14 ── nested loop: log every (size, color) pair.
// Expected: "S-red"  "S-blue"  "M-red"  "M-blue"
const q14Sizes = ["S", "M"];
const q14Colors = ["red", "blue"];
// ↓


// ── Q15 ── build a lookup { id: user } from the array (loop).
// Expected: { "1": { id: 1, name: "Amit" }, "2": { id: 2, name: "Ravi" } }
const q15Users = [{ id: 1, name: "Amit" }, { id: 2, name: "Ravi" }];
// ↓


// ── Q16 ── find the max WITHOUT Math.max (loop + compare).
// Expected: 90
const q16Nums = [45, 90, 12, 33];
// ↓


// ── Q17 ── reverse an array WITHOUT .reverse() (loop).
// Expected: [3, 2, 1]
const q17Nums = [1, 2, 3];
// ↓


// ── Q18 ── tally roles into { role: count } with a loop.
// Expected: { admin: 2, user: 1 }
const q18Users = [{ role: "admin" }, { role: "user" }, { role: "admin" }];
// ↓


// ── Q19 ── for...of over Object.entries: sum all the numeric values.
// Expected: 60
const q19Obj = { a: 10, b: 20, c: 30 };
// ↓


// ── Q20 ── early exit: does the list contain a banned word? loop + return true/false.
// Expected: true
const q20Words = ["hi", "spam", "ok"];
const q20Banned = "spam";
// ↓


// ╭──────────────────────────────────────────────────────────────────╮
// │  TOUGH  (loops you'd actually write — incl. async)                │
// ╰──────────────────────────────────────────────────────────────────╯

// ── Q21 ── flatten a nested array ONE level using a loop.
// Expected: [1, 2, 3, 4]
const q21Nested = [[1, 2], [3, 4]];
// ↓


// ── Q22 ── group product names by category into { cat: [names] } with a loop.
// Expected: { books: ["JS", "Node"], food: ["Tea"] }
const q22Products = [
  { name: "JS", category: "books" },
  { name: "Tea", category: "food" },
  { name: "Node", category: "books" },
];
// ↓


// ── Q23 ── dedupe by id with a Set + loop (keep first).
// Expected: [{ id: 1 }, { id: 2 }]
const q23Items = [{ id: 1 }, { id: 2 }, { id: 1 }];
// ↓


// ── Q24 ── chunk into pairs with a loop.
// Expected: [[1, 2], [3, 4], [5]]
const q24Nums = [1, 2, 3, 4, 5];
// ↓


// ── Q25 ── matrix sum: sum every number across the 2-D array (nested loop).
// Expected: 21
const q25Matrix = [[1, 2, 3], [4, 5, 6]];
// ↓


// ── Q26 ── for...await: given async getN(i) that resolves i, loop i=1..3 and sum the awaited
// values SEQUENTIALLY. Log the total.
// Expected: 6
// ↓


// ── Q27 ── why for...of beats forEach for await: loop the ids and await a fake save(id) that
// resolves `saved:id`, pushing results IN ORDER. (forEach won't await — prove you know.)
// Expected: ["saved:1", "saved:2"]
const q27Ids = [1, 2];
// ↓


// ── Q28 ── build a frequency map of characters with a loop.
// Expected: { a: 2, b: 1, c: 1 }
const q28Str = "aabc";
// ↓


// ── Q29 ── running totals: from amounts, produce a cumulative array.
// Expected: [10, 30, 60]
const q29Amounts = [10, 20, 30];
// ↓


// ── Q30 ── paginate manually: loop the items and collect ONLY page 2 (size 2) into an array.
// Expected: [{ id: 3 }, { id: 4 }]
const q30Items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
const q30Page = 2;
const q30Size = 2;
// ↓
