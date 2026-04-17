# Mongoose — Complete Senior-Level Reference

Stack: **Node.js + TypeScript + Mongoose + MongoDB**

This branch is a complete reference for Mongoose — schema design, CRUD, queries, aggregation, indexing, transactions, and TypeScript integration.

---

## Table of Contents

1. [Connection Setup](#1-connection-setup)
2. [Schema Design](#2-schema-design)
3. [TypeScript Integration](#3-typescript-integration)
4. [Schema Options](#4-schema-options)
5. [Validators](#5-validators)
6. [Virtual Fields](#6-virtual-fields)
7. [Middleware — Pre & Post Hooks](#7-middleware--pre--post-hooks)
8. [Instance Methods & Statics](#8-instance-methods--statics)
9. [Indexing](#9-indexing)
10. [CRUD — Insert](#10-crud--insert)
11. [CRUD — Read (Query Operators)](#11-crud--read-query-operators)
12. [Query Chain Methods](#12-query-chain-methods)
13. [CRUD — Update Operators](#13-crud--update-operators)
14. [CRUD — Delete](#14-crud--delete)
15. [Populate (References)](#15-populate-references)
16. [Lean Queries](#16-lean-queries)
17. [Transactions](#17-transactions)
18. [Bulk Write](#18-bulk-write)
19. [Aggregation Pipeline](#19-aggregation-pipeline)
20. [Error Handling](#20-error-handling)

---

## 1. Connection Setup

```ts
// src/config/mongoose.ts
import mongoose from 'mongoose';
import ENV from './env.js';

export const connectDB = async () => {
  const conn = await mongoose.connect(ENV.MONGO_URI, {
    // These are the important production options
    maxPoolSize: 10,        // max simultaneous connections in pool
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};
```

```ts
// src/server.ts — call before listening
await connectDB();
server.listen(PORT);
```

**Connection events** (useful for debugging):
```ts
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
```

---

## 2. Schema Design

### Full field-type reference

```ts
// sample.model.ts
import { Schema, model, Types, InferSchemaType } from 'mongoose';

const SampleSchema = new Schema({

  // --- Number ---
  c1: {
    type: Number,
    default: 0,
    min: [2, 'Value must be at least 2'],
    max: [100, 'Value must be at most 100'],
    required: [true, 'c1 is required'],
  },

  // --- String ---
  c2: {
    type: String,
    default: '',
    trim: true,
    minlength: [3, 'Too short'],
    maxlength: [50, 'Too long'],
    required: [true, 'c2 is required'],
    lowercase: true,          // auto-converts to lowercase before save
    // uppercase: true,       // auto-converts to uppercase
    enum: {
      values: ['admin', 'user', 'moderator'],
      message: '{VALUE} is not a valid role',
    },
  },

  // --- Boolean ---
  c3: {
    type: Boolean,
    default: false,
  },

  // --- Array of primitives ---
  c4: {
    type: [String],   // or: type: Array
    default: [],
  },

  // --- ObjectId reference (for populate) ---
  c5: {
    type: Types.ObjectId,
    ref: 'User',      // model name to populate from
    required: true,
  },

  // --- Nested/Embedded plain object ---
  c6: {
    street: { type: String },
    city:   { type: String },
    pin:    { type: Number },
  },

  // --- Array of embedded sub-documents (using a sub-schema) ---
  // c7: [AddressSchema],    // see Embedded Schemas section below

  // --- Mixed type (avoid in production — no type safety) ---
  c8: {
    type: Schema.Types.Mixed,
  },

  // --- Map (dynamic key/value pairs) ---
  c9: {
    type: Map,
    of: String,       // value type
  },

  // --- Date ---
  c10: {
    type: Date,
    default: Date.now,
  },
});
```

### Embedded sub-schema

```ts
const AddressSchema = new Schema({
  street: { type: String, required: true },
  city:   { type: String, required: true },
  pin:    { type: Number },
}, { _id: false });  // _id: false → no auto _id for each embedded doc

const UserSchema = new Schema({
  name:      { type: String, required: true },
  addresses: [AddressSchema],   // array of embedded address docs
  primary:   AddressSchema,     // single embedded address doc
});
```

### Embedding vs Referencing — when to use which

| Pattern | Use when | Mongoose syntax |
|---------|----------|-----------------|
| **Embed** (sub-doc) | Data is owned by parent, always read together, ≤ a few hundred items | `[AddressSchema]` |
| **Reference** (populate) | Data is shared across collections, large arrays, queried independently | `{ type: Types.ObjectId, ref: 'Model' }` |

> **Senior rule:** Embed for "has-a" ownership (user has addresses). Reference for "belongs-to" shared entities (post belongs to user). MongoDB's 16MB document limit and query patterns drive the decision.

---

## 3. TypeScript Integration

```ts
import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

const UserSchema = new Schema({
  name:  { type: String, required: true },
  email: { type: String, required: true },
  age:   { type: Number },
});

// Infer the type directly from the schema — single source of truth
export type UserType = InferSchemaType<typeof UserSchema>;

// HydratedDocument = UserType + Mongoose document methods (_id, save(), etc.)
export type UserDoc = HydratedDocument<UserType>;

export const User = model<UserType>('User', UserSchema);
```

**What is `HydratedDocument<T>`?**

A plain type like `UserType` only describes the data shape — `{ name: string, email: string }`. But a real Mongoose document also has `_id`, `save()`, `toJSON()`, `toObject()`, `$isModified()`, virtuals, and all other Mongoose document methods attached to it.

`HydratedDocument<UserType>` = your data shape **+** all those Mongoose document internals.

Use it when you write a function that receives a Mongoose document and needs to call document methods:

```ts
// Without HydratedDocument — TypeScript won't know .save() exists
async function updateEmail(user: UserType, newEmail: string) {
  user.email = newEmail;
  await user.save(); // TS error: save does not exist on UserType
}

// With HydratedDocument — correct
async function updateEmail(user: UserDoc, newEmail: string) {
  user.email = newEmail;
  await user.save(); // TS is happy
}
```

In practice: use `UserType` for plain data (API responses, DTOs). Use `UserDoc` (`HydratedDocument<UserType>`) for documents you manipulate and save.

---

**Why `InferSchemaType` over a manual interface?**
If you write `interface IUser { name: string }` separately, you must keep it in sync with the schema manually. `InferSchemaType` derives the type automatically — one change in schema = type updates everywhere.

---

## 4. Schema Options

```ts
const UserSchema = new Schema({ ... }, {
  // Auto-manage createdAt + updatedAt
  timestamps: true,

  // Control how the doc looks when sent via JSON (res.json())
  toJSON: {
    virtuals: true,      // include virtual fields in JSON output
    transform(doc, ret) {
      delete ret.__v;    // hide version key from API responses
      delete ret.password; // never expose password
      return ret;
    },
  },

  // Control when converting to plain object (.toObject())
  toObject: { virtuals: true },

  // minimize: false → keep empty objects as {} instead of removing them
  // Default is true (removes empty objects). Turn off if you need {} in output.
  minimize: false,

  // Collection name (default is plural lowercased model name)
  collection: 'users',
});
```

---

## 5. Validators

### Built-in validators

```ts
// String: enum, minlength, maxlength, match (regex)
role: {
  type: String,
  match: [/^[a-z]+$/, 'Only lowercase letters allowed'],
}

// Number: min, max
score: { type: Number, min: 0, max: 100 }
```

### Custom validator

```ts
phone: {
  type: String,
  validate: {
    validator: (v: string) => /^\d{10}$/.test(v),
    message: (props) => `${props.value} is not a valid phone number`,
  },
},
```

> **Note:** Validators only run on `save()`, `create()`, and `validate()`. They do NOT run on `updateOne()` / `findOneAndUpdate()` by default. Add `{ runValidators: true }` option to run them on update operations.

---

## 6. Virtual Fields

Virtual fields are computed properties — they exist on the document object but are **not stored in MongoDB**.

```ts
UserSchema.virtual('fullName').get(function () {
  // Use regular function (not arrow) — needs `this` context
  return `${this.firstName} ${this.lastName}`;
});

// If you also want a setter:
UserSchema.virtual('fullName')
  .get(function () { return `${this.firstName} ${this.lastName}`; })
  .set(function (name: string) {
    const [first, ...last] = name.split(' ');
    this.firstName = first;
    this.lastName = last.join(' ');
  });
```

> Remember: virtuals are excluded from JSON by default. Enable with `toJSON: { virtuals: true }` in schema options.

---

## 7. Middleware — Pre & Post Hooks

Middleware lets you run logic before or after Mongoose operations.

### Pre hook — runs BEFORE the operation

```ts
import bcrypt from 'bcryptjs';

UserSchema.pre('save', async function (next) {
  // `this` = the document being saved
  if (!this.isModified('password')) return next(); // skip if password unchanged

  this.password = await bcrypt.hash(this.password, 12);
  next(); // ALWAYS call next() or the operation will hang
});

// Pre hook for find — e.g., exclude soft-deleted docs
UserSchema.pre(/^find/, function (next) {
  // `this` = the Query object
  (this as any).find({ deletedAt: { $exists: false } });
  next();
});

// Pre hook for aggregation
UserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deletedAt: { $exists: false } } });
  next();
});
```

### Post hook — runs AFTER the operation

```ts
UserSchema.post('save', function (doc, next) {
  // `doc` = the saved document (already in DB)
  console.log(`User saved: ${doc._id}`);
  next();
});

// Post hook for error handling
UserSchema.post('save', function (error: any, doc: any, next: any) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});
```

### Hook target operations

| Hook string | Runs for |
|-------------|----------|
| `'save'` | `.save()`, `.create()` |
| `'validate'` | `.validate()` |
| `/^find/` | `.find()`, `.findOne()`, `.findById()`, etc. |
| `'updateOne'` | `.updateOne()` |
| `'deleteOne'` | `.deleteOne()` |
| `'aggregate'` | `.aggregate()` |

---

## 8. Instance Methods & Statics

### Instance methods — called on a document

```ts
// Define on the schema
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// TypeScript: extend the type
interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

const User = model<UserType, Model<UserType, {}, IUserMethods>>('User', UserSchema);

// Usage:
const user = await User.findById(id);
const isMatch = await user.comparePassword('plaintext');
```

### Static methods — called on the Model

```ts
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email });
};

// Usage:
const user = await User.findByEmail('amit@example.com');
```

> **Rule:** Use instance methods for logic that operates on a specific document (password check, token generation). Use statics for logic that queries the collection (findByEmail, findActive).

---

## 9. Indexing

```ts
// Single field index
UserSchema.index({ email: 1 });           // 1 = ascending, -1 = descending

// Unique index (also enforced at DB level)
UserSchema.index({ email: 1 }, { unique: true });

// Compound index — ESR rule: Equality → Sort → Range
// Queries that filter by role, sort by name, filter age range benefit from this order
UserSchema.index({ role: 1, name: 1, age: 1 });

// TTL index — auto-deletes documents after N seconds
UserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 }); // delete after 1 hour

// Sparse index — only indexes documents where the field exists
UserSchema.index({ phone: 1 }, { sparse: true });

// Text index — full-text search
UserSchema.index({ name: 'text', bio: 'text' });

// Geospatial index — for location queries
UserSchema.index({ location: '2dsphere' });

// Partial index — only indexes docs matching a filter (saves space)
UserSchema.index({ email: 1 }, {
  partialFilterExpression: { role: 'admin' }
});
```

### When to index

| Situation | Index? |
|-----------|--------|
| Field queried frequently in `find()` filter | Yes |
| Field used in `.sort()` | Yes |
| Write-heavy collection (logs, events) | Careful — each index slows writes |
| Small collection (< 1000 docs) | Usually no — full scan is fast |
| Field in `$lookup` `foreignField` | Yes — critical for join performance |
| Array field queried with `$in` / `$elemMatch` | Yes |

> **ESR Rule for compound indexes:** Put **E**quality fields first, then **S**ort fields, then **R**ange fields. This maximizes index usage.

---

## 10. CRUD — Insert

```ts
// 1. create() — shortcut, runs validators + hooks
const user = await User.create({ name: 'Amit', email: 'amit@example.com' });

// 2. new + save() — gives you access to the document before saving
const user = new User({ name: 'Amit' });
user.email = 'amit@example.com';
await user.save();

// 3. insertMany() — bulk insert, skips some hooks by default
const users = await User.insertMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
], { ordered: false }); // ordered:false = continue on error
```

> `create()` = `new Model() + save()`. Use `save()` directly when you need to modify fields between construction and saving (e.g., pre-save logic outside of hooks).

---

## 11. CRUD — Read (Query Operators)

### Basic finders

```ts
User.find({})                         // all documents
User.findOne({ email: 'a@b.com' })    // first match
User.findById('64abc...')             // by _id
User.countDocuments({ role: 'admin' }) // count
User.distinct('city')                 // unique values of a field
User.exists({ email: 'a@b.com' })     // returns _id if exists, else null
```

### Comparison operators

```ts
User.find({ age: { $gt: 25 } })         // greater than
User.find({ age: { $gte: 25 } })        // greater than or equal
User.find({ age: { $lt: 50 } })         // less than
User.find({ age: { $lte: 50 } })        // less than or equal
User.find({ age: { $ne: 25 } })         // not equal
User.find({ role: { $in: ['admin', 'moderator'] } })   // in array
User.find({ role: { $nin: ['banned'] } })              // not in array
```

### Logical operators

```ts
// $and — all conditions must match
User.find({ $and: [{ age: { $gte: 18 } }, { role: 'user' }] })

// $or — at least one condition matches
User.find({ $or: [{ role: 'admin' }, { age: { $gte: 60 } }] })

// $nor — none of the conditions match
User.find({ $nor: [{ role: 'banned' }, { age: { $lt: 13 } }] })

// $not
User.find({ age: { $not: { $gte: 18 } } })
```

### Element operators

```ts
User.find({ phone: { $exists: true } })   // field exists
User.find({ phone: { $exists: false } })  // field does not exist
User.find({ age: { $type: 'number' } })   // field is of type number
```

### String operators

```ts
// $regex — pattern matching
User.find({ name: { $regex: /^amit/i } })          // starts with "amit" (case insensitive)
User.find({ email: { $regex: /@gmail\.com$/ } })   // ends with @gmail.com

// Text search — requires text index
User.find({ $text: { $search: 'nodejs developer' } })
```

### Array operators

```ts
// $all — array contains all specified values
User.find({ tags: { $all: ['nodejs', 'typescript'] } })

// $size — array has exact length
User.find({ tags: { $size: 3 } })

// $elemMatch — at least one element matches all conditions
User.find({ scores: { $elemMatch: { $gte: 80, $lt: 100 } } })
```

### $expr — compare fields against each other

```ts
// Find orders where discount > price (a bug!)
Order.find({ $expr: { $gt: ['$discount', '$price'] } })

// With arithmetic — find orders where amount + tax > 150
Order.find({
  $expr: { $gt: [{ $add: ['$amount', '$tax'] }, 150] }
})
```

---

## 12. Query Chain Methods

Mongoose queries are chainable — call methods before `.exec()` or `await`.

```ts
const users = await User
  .find({ role: 'user' })
  .select('name email age -_id')  // include name,email,age; exclude _id
  .sort({ age: -1 })              // sort by age descending
  .skip(10)                       // skip first 10 (pagination)
  .limit(5)                       // return max 5
  .populate('address')            // join referenced docs
  .lean()                         // return plain JS object (not Mongoose doc)
  .exec();                        // execute (optional with await)
```

### .select()

```ts
.select('name email')       // include only name and email
.select('-password -__v')   // exclude password and __v
.select({ name: 1, _id: 0 }) // object form
```

### .sort()

```ts
.sort({ createdAt: -1 })          // newest first
.sort({ age: 1, name: -1 })       // compound sort
.sort('-createdAt')                // string shorthand: prefix - for desc
```

### .skip() + .limit() — Pagination

```ts
const page = 2;
const pageSize = 10;

const users = await User.find({})
  .skip((page - 1) * pageSize)
  .limit(pageSize);
```

---

## 13. CRUD — Update Operators

### Update methods

```ts
// updateOne — updates first match, does NOT return updated doc
await User.updateOne({ _id: id }, { $set: { name: 'New Name' } });

// updateMany — updates all matches
await User.updateMany({ role: 'user' }, { $set: { isVerified: true } });

// findOneAndUpdate — returns the document (by default: BEFORE update)
const updated = await User.findOneAndUpdate(
  { email: 'a@b.com' },
  { $set: { name: 'New' } },
  {
    new: true,            // return AFTER update (almost always what you want)
    runValidators: true,  // run schema validators on update
    upsert: false,        // if true: creates doc if not found
  }
);

// findByIdAndUpdate — same as above but by _id
const user = await User.findByIdAndUpdate(id, { $inc: { loginCount: 1 } }, { new: true });
```

### Update operators

```ts
// $set — set field values
{ $set: { name: 'Amit', role: 'admin' } }

// $unset — remove fields
{ $unset: { temporaryToken: '' } }

// $inc — increment / decrement
{ $inc: { loginCount: 1, balance: -100 } }

// $push — add item to array
{ $push: { tags: 'nodejs' } }

// $push with $each — add multiple items
{ $push: { tags: { $each: ['nodejs', 'typescript'] } } }

// $push with $slice — limit array size (keep last 5)
{ $push: { recentViews: { $each: [itemId], $slice: -5 } } }

// $addToSet — add to array only if not already present (like Set)
{ $addToSet: { tags: 'nodejs' } }

// $pull — remove matching items from array
{ $pull: { tags: 'outdated' } }

// $pop — remove first (-1) or last (1) element
{ $pop: { items: 1 } }

// $rename — rename a field
{ $rename: { oldName: 'newName' } }

// Nested field update
{ $set: { 'address.city': 'Delhi' } }

// Update item in array by index
{ $set: { 'items.0.price': 99 } }

// Array filters — update specific array element by condition
await Order.updateOne(
  { _id: orderId },
  { $set: { 'items.$[item].status': 'shipped' } },
  { arrayFilters: [{ 'item.productId': productId }] }
);
```

---

## 14. CRUD — Delete

```ts
// deleteOne — deletes first match
await User.deleteOne({ _id: id });

// deleteMany — deletes all matches
await User.deleteMany({ role: 'banned' });

// findByIdAndDelete — deletes and returns the deleted doc
const deleted = await User.findByIdAndDelete(id);

// findOneAndDelete — same but with filter
const deleted = await User.findOneAndDelete({ email: 'a@b.com' });

// Soft delete pattern (preferred in production)
await User.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });
```

---

## 15. Populate (References)

```ts
// Basic populate
const post = await Post.findById(id).populate('author');
// post.author is now the full User document, not just an ObjectId

// Select specific fields from populated doc
const post = await Post.findById(id).populate('author', 'name email -_id');

// Nested populate — populate a field inside a populated field
const post = await Post.findById(id).populate({
  path: 'comments',
  populate: {
    path: 'author',
    select: 'name',
  },
});

// Multiple populates
const post = await Post.findById(id)
  .populate('author', 'name')
  .populate('category', 'title');

// Populate with filter
const user = await User.findById(id).populate({
  path: 'posts',
  match: { published: true },
  select: 'title createdAt',
  options: { sort: { createdAt: -1 }, limit: 5 },
});
```

> **Performance note:** `populate()` does a second query behind the scenes. For large datasets, consider using `$lookup` in aggregation instead — it's a single DB operation.

---

## 16. Lean Queries

By default, Mongoose wraps query results in full Mongoose Documents (with methods like `.save()`, `.toJSON()`, virtuals). This has overhead.

`.lean()` returns plain JavaScript objects — faster and lighter.

```ts
// Without lean — returns Mongoose Document instances
const users = await User.find({ role: 'admin' });
// users[0].save()  → works
// users[0].comparePassword()  → works (if method defined)

// With lean — returns plain JS objects
const users = await User.find({ role: 'admin' }).lean();
// users[0].save()  → ERROR — plain object, no methods
// users[0]._id   → ObjectId (not stringified)
```

**When to use `.lean()`:**
- GET API endpoints where you only return data (no modification)
- Aggregation-like reads where you don't need Mongoose methods
- Performance-critical paths

**When NOT to use `.lean()`:**
- When you need to call `.save()` on the result
- When you need virtuals in the output
- When you need Mongoose document methods

---

## 17. Transactions

MongoDB transactions guarantee **ACID** properties across multiple operations — all succeed or all roll back. Requires a **replica set** (MongoDB Atlas has this by default; local dev needs `--replSet`).

### When to use transactions

- Transfer money between two accounts (debit one, credit another)
- Create an order AND reduce inventory simultaneously
- Any operation that spans multiple collections and must be atomic

### Basic transaction pattern

```ts
import mongoose from 'mongoose';

const transferMoney = async (fromId: string, toId: string, amount: number) => {
  // Step 1: Start a session
  const session = await mongoose.startSession();

  try {
    // Step 2: Start the transaction
    session.startTransaction();

    // Step 3: All operations pass the session option
    await Account.findByIdAndUpdate(
      fromId,
      { $inc: { balance: -amount } },
      { session, new: true, runValidators: true }
    );

    await Account.findByIdAndUpdate(
      toId,
      { $inc: { balance: amount } },
      { session }
    );

    // Step 4: Commit if everything succeeded
    await session.commitTransaction();

  } catch (err) {
    // Step 5: Abort on any error — rolls back ALL operations
    await session.abortTransaction();
    throw err;  // re-throw so the caller knows it failed

  } finally {
    // Step 6: Always end the session
    session.endSession();
  }
};
```

### withTransaction() — cleaner pattern (auto-retry on transient errors)

```ts
const session = await mongoose.startSession();

await session.withTransaction(async () => {
  // MongoDB auto-retries this block on transient errors
  await Order.create([{ userId, items, total }], { session });
  await Inventory.updateMany(
    { _id: { $in: itemIds } },
    { $inc: { stock: -1 } },
    { session }
  );
  // No need to call commit — withTransaction handles it
});

session.endSession();
```

### Transaction rules

- Always pass `{ session }` to every operation inside a transaction
- `insertMany` and `create` with session: `Model.create([doc], { session })` — note the array form
- Transactions work across multiple collections in the same database
- Transactions do NOT work across different databases
- Keep transactions short — long transactions hold locks and hurt performance

### When NOT to use transactions

| Situation | Why |
|-----------|-----|
| Single document update | MongoDB guarantees atomicity at the document level already |
| Read-only operations | No writes = no need for transaction |
| Eventually consistent data (view counts) | Overhead not worth it |

---

## 18. Bulk Write

For high-volume writes, `bulkWrite()` sends all operations in a single network round-trip.

```ts
await User.bulkWrite([
  // Insert
  { insertOne: { document: { name: 'Alice', email: 'alice@x.com' } } },

  // Update one
  { updateOne: {
    filter: { email: 'bob@x.com' },
    update: { $set: { role: 'admin' } },
    upsert: true,
  }},

  // Update many
  { updateMany: {
    filter: { role: 'user' },
    update: { $set: { isVerified: false } },
  }},

  // Delete one
  { deleteOne: { filter: { email: 'spam@x.com' } } },

  // Replace one
  { replaceOne: {
    filter: { _id: someId },
    replacement: { name: 'New Doc', email: 'new@x.com' },
  }},
], {
  ordered: false, // continue even if some operations fail (default: true = stop on first error)
});
```

---

## 19. Aggregation Pipeline

### Golden pipeline order

```
$match → $group → $sort → $limit → $project / $addFields
```

Always `$match` first to use indexes and reduce document count.

### Stage reference

#### $match — filter (use indexes here)

```ts
User.aggregate([
  { $match: {
    city: 'Delhi',
    age: { $gte: 18 },
    role: { $in: ['admin', 'user'] },
  }},
])
```

#### $group — aggregate

```ts
{ $group: {
  _id: '$role',                    // group key (null = all docs)
  total:     { $sum: '$salary' },
  count:     { $sum: 1 },
  avg:       { $avg: '$salary' },
  max:       { $max: '$salary' },
  min:       { $min: '$salary' },
  allNames:  { $push: '$name' },   // collect into array (duplicates)
  uniqueNames: { $addToSet: '$name' }, // collect unique values
  first:     { $first: '$name' },
  last:      { $last: '$name' },
}}
```

#### $project — shape output (like SELECT)

```ts
{ $project: {
  _id: 0,
  name: 1,
  revenue: { $multiply: ['$price', '$qty'] },
  label:   { $concat: ['$name', ' - ', '$city'] },
  upper:   { $toUpper: '$name' },
}}
```

#### $addFields — add without removing existing fields

```ts
{ $addFields: {
  fullName: { $concat: ['$firstName', ' ', '$lastName'] },
  isAdult:  { $gte: ['$age', 18] },
}}
// $set is an alias for $addFields (MongoDB 4.2+)
```

#### $sort + $limit — top-N

```ts
{ $sort:  { totalSpent: -1 } },
{ $limit: 10 },
// Pagination:
{ $skip:  (page - 1) * pageSize },
{ $limit: pageSize },
```

#### $lookup — join collections

```ts
// Simple form
{ $lookup: {
  from:         'users',
  localField:   'userId',
  foreignField: '_id',
  as:           'userInfo',    // result is an array
}},
{ $unwind: '$userInfo' },      // flatten array to object (left join → inner join)

// Pipeline form — more powerful, supports conditions
{ $lookup: {
  from: 'orders',
  let:  { uid: '$_id' },       // pass local variables
  pipeline: [
    { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
    { $sort:  { createdAt: -1 } },
    { $limit: 5 },
  ],
  as: 'recentOrders',
}},
```

#### $unwind — flatten array to documents

```ts
{ $unwind: '$tags' }
// or, to preserve docs with empty/null arrays:
{ $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } }
```

#### $facet — multiple pipelines in one query

```ts
{ $facet: {
  totalRevenue: [
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ],
  byCity: [
    { $group: { _id: '$city', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
  ],
  highValue: [
    { $match: { amount: { $gte: 1000 } } },
    { $count: 'count' },
  ],
}}
```

#### $filter — filter array elements (stays as array)

```ts
{ $project: {
  expensiveItems: {
    $filter: {
      input: '$items',
      as:    'item',
      cond:  { $gt: ['$$item.price', 100] }, // $$ = variable reference
    },
  },
}}
```

#### $cond + $switch — conditional

```ts
// $cond (if/else)
{ $addFields: {
  tier: { $cond: { if: { $gte: ['$amount', 500] }, then: 'Premium', else: 'Regular' } }
}}

// $switch (multiple branches)
{ $addFields: {
  tier: {
    $switch: {
      branches: [
        { case: { $gte: ['$amount', 1000] }, then: 'Platinum' },
        { case: { $gte: ['$amount', 500] },  then: 'Gold' },
        { case: { $gte: ['$amount', 100] },  then: 'Silver' },
      ],
      default: 'Bronze',
    },
  },
}}

// $ifNull — null-safe default
{ $addFields: { discount: { $ifNull: ['$discount', 0] } } }
```

#### Math operators

```ts
{ $project: {
  total:     { $multiply: ['$price', '$qty'] },
  profit:    { $subtract: ['$revenue', '$cost'] },
  avgUnit:   { $divide: ['$amount', '$qty'] },
  withTax:   { $add: ['$amount', 50] },
  remainder: { $mod: ['$qty', 3] },
  rounded:   { $round: ['$amount', 2] },
  floored:   { $floor: '$amount' },
  ceiled:    { $ceil: '$amount' },
  absVal:    { $abs: '$amount' },
}}
```

#### Date operators

```ts
// Extract parts
{ $project: {
  year:  { $year: '$soldAt' },
  month: { $month: '$soldAt' },       // 1-12
  day:   { $dayOfMonth: '$soldAt' },  // 1-31
  hour:  { $hour: '$soldAt' },
  dow:   { $dayOfWeek: '$soldAt' },   // 1=Sun, 7=Sat
}}

// Group by month (time-series reports)
{ $group: {
  _id:   { year: { $year: '$soldAt' }, month: { $month: '$soldAt' } },
  total: { $sum: '$amount' },
}}

// $dateToString — format for display or string-key grouping
{ $group: {
  _id:   { $dateToString: { format: '%Y-%m', date: '$soldAt' } },
  total: { $sum: '$amount' },
}}
// _id becomes "2024-03", easy to sort as string

// $dateDiff — duration between two dates
{ $addFields: {
  durationDays: { $dateDiff: { startDate: '$start', endDate: '$end', unit: 'day' } }
}}

// $dateAdd / $dateSubtract
{ $addFields: {
  expiresAt: { $dateAdd: { startDate: '$createdAt', unit: 'day', amount: 30 } }
}}

// $$NOW — current server timestamp
{ $match: { $expr: { $gte: ['$createdAt', { $dateSubtract: { startDate: '$$NOW', unit: 'day', amount: 7 } }] } } }

// Timezone support (always use for IST reports)
{ $project: {
  month: { $month: { date: '$soldAt', timezone: 'Asia/Kolkata' } }
}}
```

#### $expr in $match — compare two fields

```ts
// Find rows where field A > field B
{ $match: { $expr: { $gt: ['$itemPrice', '$itemPaid'] } } }

// With arithmetic
{ $match: { $expr: { $gt: [{ $add: ['$amount', '$tax'] }, 150] } } }
```

---

## 20. Error Handling

### Mongoose error types

```ts
import mongoose from 'mongoose';

try {
  await User.create({ name: 'x' }); // missing required email
} catch (err: any) {

  // ValidationError — schema validation failed
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    // e.g., ['email is required', 'age must be at least 18']
  }

  // CastError — wrong type (e.g., invalid ObjectId string)
  if (err instanceof mongoose.Error.CastError) {
    // err.path = field name, err.value = bad value
  }

  // Duplicate key — MongoDB unique index violation (code 11000)
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    // field = 'email'
  }
}
```

### In globalErrorHandler

```ts
// src/middlewares/globalErrorHandler.ts
if (err instanceof mongoose.Error.ValidationError) {
  return res.status(400).json({ message: 'Validation failed', errors: err.errors });
}

if (err instanceof mongoose.Error.CastError) {
  return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
}

if ((err as any).code === 11000) {
  const field = Object.keys((err as any).keyValue)[0];
  return res.status(409).json({ message: `${field} already exists` });
}
```

---

## Quick Reference

### Insert
| Method | Returns | Notes |
|--------|---------|-------|
| `Model.create(obj)` | Created doc | Runs validators + hooks |
| `new Model(obj).save()` | Saved doc | Runs validators + hooks |
| `Model.insertMany([])` | Array of docs | Skips some hooks |

### Read
| Method | Returns |
|--------|---------|
| `find(filter)` | Array |
| `findOne(filter)` | Doc or null |
| `findById(id)` | Doc or null |
| `countDocuments(filter)` | Number |
| `exists(filter)` | `{ _id }` or null |
| `distinct(field)` | Array of unique values |

### Update
| Method | Returns |
|--------|---------|
| `updateOne(filter, update)` | `{ modifiedCount, ... }` |
| `updateMany(filter, update)` | `{ modifiedCount, ... }` |
| `findOneAndUpdate(filter, update, opts)` | Updated doc |
| `findByIdAndUpdate(id, update, opts)` | Updated doc |

### Delete
| Method | Returns |
|--------|---------|
| `deleteOne(filter)` | `{ deletedCount }` |
| `deleteMany(filter)` | `{ deletedCount }` |
| `findByIdAndDelete(id)` | Deleted doc |

### Aggregation pipeline operator quick ref
| Use Case | Operator |
|----------|----------|
| Filter | `$match` |
| Group + totals | `$group` + `$sum / $avg / $min / $max` |
| Shape output | `$project` or `$addFields` |
| Top-N | `$sort + $limit` |
| Pagination | `$sort + $skip + $limit` |
| Join | `$lookup + $unwind` |
| Flatten array | `$unwind` |
| Filter array | `$filter` |
| Multi-stat in one query | `$facet` |
| If/else | `$cond` or `$switch` |
| Compare two fields | `$expr` |
| Null-safe default | `$ifNull` |
| Date parts | `$year / $month / $dayOfMonth` |
| Group by month | `$group` with `$dateToString '%Y-%m'` |
| Date difference | `$dateDiff` |
| Add/subtract date | `$dateAdd / $dateSubtract` |
| Current time | `$$NOW` |
