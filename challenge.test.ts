// =============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// =============================================================
import {
  runQuery,
  validateQuery,
  buildPlan,
  buildExecutorRegistry,
  type TableName,
  type FieldName,
  type Row,
  type TableRegistry,
} from "./challenge";

// ─────────────────────────────────────────────────────────────
// Helpers to build branded types in test data
// ─────────────────────────────────────────────────────────────
const T = (s: string) => s as TableName;
const F = (s: string) => s as FieldName;

// ─────────────────────────────────────────────────────────────
// Mock table data
// ─────────────────────────────────────────────────────────────
const usersTable: ReadonlyArray<Row> = [
  { [F("id")]: 1, [F("name")]: "Alice", [F("age")]: 32, [F("dept")]: "eng" },
  { [F("id")]: 2, [F("name")]: "Bob",   [F("age")]: 25, [F("dept")]: "mkt" },
  { [F("id")]: 3, [F("name")]: "Carol", [F("age")]: 32, [F("dept")]: "eng" },
  { [F("id")]: 4, [F("name")]: "Dave",  [F("age")]: 41, [F("dept")]: "mkt" },
  { [F("id")]: 5, [F("name")]: "Eve",   [F("age")]: 25, [F("dept")]: "eng" },
];

const registry: TableRegistry = new Map([
  [T("users"), usersTable],
]);

// ─────────────────────────────────────────────────────────────
// TEST 1 — Validation rejects bad input
// ─────────────────────────────────────────────────────────────
const badResult = validateQuery({ table: 42, select: [] });
console.assert(
  !badResult.ok,
  "TEST 1 FAILED: validateQuery should reject numeric table name"
);
console.log("TEST 1 passed:", !badResult.ok);

// ─────────────────────────────────────────────────────────────
// TEST 2 — Full query: filter + project + sort + limit
// ─────────────────────────────────────────────────────────────
const report2 = runQuery(
  {
    table: "users",
    select: ["name", "age"],
    filter: { field: "age", op: "gte", value: 30 },
    orderBy: { field: "age", direction: "asc" },
    limit: 2,
  },
  registry
);

console.assert(report2.ok, "TEST 2 FAILED: query should succeed");
if (report2.ok) {
  console.assert(
    report2.value.rows.length === 2,
    `TEST 2 FAILED: expected 2 rows, got ${report2.value.rows.length}`
  );
  // After filter(age>=30) → [Alice(32), Carol(32), Dave(41)]
  // After sort(age asc)   → [Alice(32), Carol(32), Dave(41)]
  // After limit(2)        → [Alice(32), Carol(32)]
  const ages = report2.value.rows.map((r) => r[F("age")]);
  console.assert(
    ages.every((a) => (a as number) >= 30),
    `TEST 2 FAILED: all returned rows should have age >= 30, got ${JSON.stringify(ages)}`
  );
  console.log("TEST 2 passed: rows =", JSON.stringify(report2.value.rows));
}

// ─────────────────────────────────────────────────────────────
// TEST 3 — groupBy reduces rows to unique key combinations
// ─────────────────────────────────────────────────────────────
const report3 = runQuery(
  {
    table: "users",
    select: ["dept"],
    groupBy: ["dept"],
    orderBy: { field: "dept", direction: "asc" },
  },
  registry
);

console.assert(report3.ok, "TEST 3 FAILED: groupBy query should succeed");
if (report3.ok) {
  console.assert(
    report3.value.rows.length === 2,
    `TEST 3 FAILED: expected 2 groups (eng, mkt), got ${report3.value.rows.length}`
  );
  console.log("TEST 3 passed: groups =", JSON.stringify(report3.value.rows));
}

// ─────────────────────────────────────────────────────────────
// TEST 4 — "in" filter operator
// ─────────────────────────────────────────────────────────────
const report4 = runQuery(
  {
    table: "users",
    select: ["id", "name"],
    filter: { field: "dept", op: "in", value: ["eng"] },
  },
  registry
);

console.assert(report4.ok, "TEST 4 FAILED: 'in' filter query should succeed");
if (report4.ok) {
  console.assert(
    report4.value.rows.length === 3,
    `TEST 4 FAILED: expected 3 eng rows, got ${report4.value.rows.length}`
  );
  console.log("TEST 4 passed: rows =", JSON.stringify(report4.value.rows));
}

// ─────────────────────────────────────────────────────────────
// TEST 5 — Unknown table returns execution error
// ─────────────────────────────────────────────────────────────
const report5 = runQuery(
  { table: "orders", select: ["id"] },
  registry
);

console.assert(!report5.ok, "TEST 5 FAILED: unknown table should error");
if (!report5.ok) {
  console.assert(
    report5.error.kind === "execution",
    `TEST 5 FAILED: expected 'execution' error, got '${report5.error.kind}'`
  );
  console.log("TEST 5 passed: error =", JSON.stringify(report5.error));
}

console.log("\nAll tests complete.");
