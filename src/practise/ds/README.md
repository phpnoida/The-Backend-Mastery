# 🧠 JavaScript DS Drills — the logic that goes into your services

**270 JavaScript exercises** (30 per topic) on the fundamentals you reach for **every time you write
API logic**: objects, arrays, strings, functions, operators, conditionals, typecasting, loops, maths.

Each file is split into **Simple → Medium → Tough** (10 each), so you can warm up and then push.

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
| `01-objects.js` | Objects — access, transform, merge, group, normalize | 30 |
| `02-arrays.js` | Arrays — map/filter/reduce, sort, group, paginate, dedupe | 30 |
| `03-strings.js` | Strings — case, slugify, mask, parse, camel/snake | 30 |
| `04-functions.js` | Functions — pure, HOF, closure, compose, async/Promise | 30 |
| `05-operators.js` | Operators — spread, `?.`, `??`, destructuring, conditional-spread | 30 |
| `06-conditionals.js` | Conditionals — if/switch, guard clauses, validation, lookup tables | 30 |
| `07-typecasting.js` | Typecasting — Number/String/Boolean, coercion, sanitizing bodies | 30 |
| `08-loops.js` | Loops — for/of/in, while, build-in-loop, for-await | 30 |
| `09-maths.js` | Maths — round, random, %, money, pagination/stats | 30 |

Work top-to-bottom in each file. Each is divided into **Simple → Medium → Tough** (10 each); the
tough tier is "mini real-world" — the kind of transform you'd actually write in an endpoint.

When you've attempted a file, ping me to **review your answers** (I'll check correctness *and*
whether the approach is idiomatic/clean) — or ask for a targeted hint on a single question.
