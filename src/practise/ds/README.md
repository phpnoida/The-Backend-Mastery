# 🧠 JavaScript DS Drills — the logic that goes into your services

~100 bite-sized JavaScript exercises on the fundamentals you reach for **every time you write API
logic**: objects, arrays, strings, functions, operators, conditionals, typecasting, loops, maths.

These are the building blocks that live inside your **service** files (business logic). No APIs, no
server — just you, the data, and the output.

---

## How to use (Quokka.js)

1. Install the **Quokka.js** VSCode extension (Community edition is enough).
2. Open any `0X-topic.js` file.
3. Command palette → **"Quokka.js: Start on Current File"** (or `Ctrl/Cmd+K, Q`).
4. Write your answer under each question, `console.log(...)` it, and Quokka shows the result inline
   next to your code — no terminal, no run command.

> Tip: comment out questions you're not working on if Quokka gets noisy — or just scroll to the one
> you want; logging only the current answer keeps the inline output focused.

---

## The format

Every question looks like this:

```js
// ── Q03 ──────────────────────────────────────────────
// <the task>
// Expected: ["amit@x.com", "sara@x.com"]
const q03Users = [ /* ...dataset... */ ];

// your answer ↓ (console.log to see it in Quokka)

```

- **`Expected:`** is your self-check — write code until your output matches it.
- **The dataset** is given as a `const` so you can start immediately.
- **No solution code is provided** — the point is to *derive* it. Struggle first; that's the rep.

---

## Files

| File | Topic | Count |
|------|-------|:---:|
| `01-objects.js` | Objects — access, transform, merge, count | 12 |
| `02-arrays.js` | Arrays — map/filter/reduce, sort, group, paginate | 18 |
| `03-strings.js` | Strings — case, slugify, mask, parse | 12 |
| `04-functions.js` | Functions — pure, HOF, closure, compose | 10 |
| `05-operators.js` | Operators — spread, `?.`, `??`, short-circuit | 10 |
| `06-conditionals.js` | Conditionals — if/switch, guard clauses | 8 |
| `07-typecasting.js` | Typecasting — Number/String/Boolean, coercion | 10 |
| `08-loops.js` | Loops — for/of/in, while, build-in-loop | 10 |
| `09-maths.js` | Maths — round, random, %, pagination math | 10 |

Work top-to-bottom in each file — they ramp easy → harder, ending in a couple of "mini real-world"
combos (the kind of transform you'd actually write in an endpoint).

When you've attempted a file, ping me to **review your answers** (I'll check correctness *and*
whether the approach is idiomatic/clean) — or ask for a targeted hint on a single question.
