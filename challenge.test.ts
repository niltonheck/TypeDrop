// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  createTableHandle,
  type TableSchema,
  type InferRow,
  type AnyFilterClause,
} from "./challenge";

// -----------------------------------------------------------
// Mock schema & dataset
// -----------------------------------------------------------

const userSchema = {
  id:        "number",
  username:  "string",
  email:     "string",
  age:       "number",
  active:    "boolean",
  createdAt: "date",
} as const satisfies TableSchema;

type UserSchema = typeof userSchema;

const NOW = new Date("2024-06-01T00:00:00Z");
const users: ReadonlyArray<InferRow<UserSchema>> = [
  { id: 1, username: "alice",   email: "alice@example.com",   age: 30, active: true,  createdAt: new Date("2023-01-15") },
  { id: 2, username: "bob",     email: "bob@example.com",     age: 25, active: false, createdAt: new Date("2023-03-22") },
  { id: 3, username: "carol",   email: "carol@example.com",   age: 35, active: true,  createdAt: new Date("2022-11-05") },
  { id: 4, username: "dave",    email: "dave@example.com",    age: 28, active: true,  createdAt: new Date("2023-07-19") },
  { id: 5, username: "eve",     email: "eve@example.com",     age: 22, active: false, createdAt: new Date("2024-01-30") },
  { id: 6, username: "frank",   email: "frank@acme.com",      age: 41, active: true,  createdAt: new Date("2021-05-10") },
  { id: 7, username: "grace",   email: "grace@example.com",   age: 33, active: true,  createdAt: new Date("2022-08-14") },
];

const table = createTableHandle(userSchema, users);

// -----------------------------------------------------------
// Test 1: select projects only chosen columns
// -----------------------------------------------------------
const result1 = table.query({
  select: ["id", "username"] as const,
});
console.assert(result1.rows.length === 7, "Test 1a FAILED: expected 7 rows");
console.assert(
  result1.rows.every(r => "id" in r && "username" in r && !("email" in r)),
  "Test 1b FAILED: projected rows must contain only id and username"
);
console.log("Test 1 PASSED: column projection");

// -----------------------------------------------------------
// Test 2: where filter — active users older than 28
// -----------------------------------------------------------
const result2 = table.query({
  select: ["id", "username", "age", "active"] as const,
  where: [
    { column: "active", op: "eq",  value: true },
    { column: "age",    op: "gt",  value: 28   },
  ] satisfies ReadonlyArray<AnyFilterClause<UserSchema>>,
});
// Expected: alice(30,true), carol(35,true), frank(41,true), grace(33,true)
console.assert(result2.totalCount === 4, `Test 2a FAILED: expected totalCount 4, got ${result2.totalCount}`);
console.assert(
  result2.rows.every(r => r.active === true && r.age > 28),
  "Test 2b FAILED: all rows must be active and age > 28"
);
console.log("Test 2 PASSED: where filter with multiple clauses");

// -----------------------------------------------------------
// Test 3: string filter — email contains "@example.com"
// -----------------------------------------------------------
const result3 = table.query({
  select: ["id", "email"] as const,
  where: [
    { column: "email", op: "contains", value: "@example.com" },
  ] satisfies ReadonlyArray<AnyFilterClause<UserSchema>>,
});
// Expected: alice, bob, carol, dave, eve, grace (6 rows — frank has @acme.com)
console.assert(result3.totalCount === 6, `Test 3 FAILED: expected 6 rows, got ${result3.totalCount}`);
console.log("Test 3 PASSED: string contains filter");

// -----------------------------------------------------------
// Test 4: orderBy + limit + offset (pagination)
// -----------------------------------------------------------
const result4 = table.query({
  select: ["id", "age"] as const,
  orderBy: [{ column: "age", direction: "asc" }],
  limit: 3,
  offset: 0,
});
// Sorted asc by age: eve(22), bob(25), dave(28), alice(30), grace(33), carol(35), frank(41)
// First page of 3: eve, bob, dave
console.assert(result4.rows.length === 3, `Test 4a FAILED: expected 3 rows, got ${result4.rows.length}`);
console.assert(result4.rows[0].age === 22, `Test 4b FAILED: first row age should be 22, got ${result4.rows[0].age}`);
console.assert(result4.rows[2].age === 28, `Test 4c FAILED: third row age should be 28, got ${result4.rows[2].age}`);
console.assert(result4.totalCount === 7, `Test 4d FAILED: totalCount should be 7 (pre-pagination), got ${result4.totalCount}`);
console.log("Test 4 PASSED: orderBy + pagination");

// -----------------------------------------------------------
// Test 5: date filter — users created after 2023-01-01
// -----------------------------------------------------------
const result5 = table.query({
  select: ["id", "username", "createdAt"] as const,
  where: [
    { column: "createdAt", op: "gt", value: new Date("2023-01-01") },
  ] satisfies ReadonlyArray<AnyFilterClause<UserSchema>>,
  orderBy: [{ column: "createdAt", direction: "asc" }],
});
// Expected: alice(2023-01-15), bob(2023-03-22), dave(2023-07-19), eve(2024-01-30)
console.assert(result5.totalCount === 4, `Test 5a FAILED: expected 4 rows, got ${result5.totalCount}`);
console.assert(
  result5.rows[0].username === "alice",
  `Test 5b FAILED: first row should be alice, got ${result5.rows[0].username}`
);
console.log("Test 5 PASSED: date filter with orderBy");

console.log("\n✅ All tests passed!");
