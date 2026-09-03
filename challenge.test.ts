// ============================================================
// challenge.test.ts
// ============================================================
import {
  ok,
  err,
  validateRow,
  runPipeline,
  type TableSchema,
  type FieldSchema,
  type Validated,
  type inferRow,
  type PipelineReport,
  type Sink,
  type Transformer,
  type ValidationError,
} from "./challenge";

// ------------------------------------------------------------------
// Mock schema: an "orders" table
// ------------------------------------------------------------------
const ordersSchema = {
  fields: {
    orderId:   { kind: "string"  } as FieldSchema,
    amount:    { kind: "number"  } as FieldSchema,
    confirmed: { kind: "boolean" } as FieldSchema,
    status:    { kind: "literal", value: "pending" } as FieldSchema,
  },
  required: ["orderId", "amount", "status"] as const,
} satisfies TableSchema;

// ------------------------------------------------------------------
// Type-level smoke test — uncomment to verify inferred shape
// ------------------------------------------------------------------
// type OrderRow = inferRow<typeof ordersSchema>;
// Expected:
//   { orderId: string; amount: number; status: "pending"; confirmed?: boolean }

// ------------------------------------------------------------------
// Helper: in-memory Sink
// ------------------------------------------------------------------
function makeSink<T>(): Sink<T> & { rows: T[] } {
  const rows: T[] = [];
  return {
    rows,
    write(row: T) {
      rows.push(row);
    },
  };
}

// ------------------------------------------------------------------
// Test 1: validateRow — valid record
// ------------------------------------------------------------------
const validRaw: unknown = {
  orderId: "ORD-001",
  amount: 99.99,
  confirmed: true,
  status: "pending",
};

const result1 = validateRow(ordersSchema, validRaw);
console.assert(result1.ok === true, "Test 1 FAILED: expected Ok for a valid record");
if (result1.ok) {
  console.assert(
    result1.value.orderId === "ORD-001",
    "Test 1b FAILED: orderId mismatch"
  );
  console.assert(
    result1.value.status === "pending",
    "Test 1c FAILED: status mismatch"
  );
}

// ------------------------------------------------------------------
// Test 2: validateRow — wrong type for a field
// ------------------------------------------------------------------
const wrongTypRaw: unknown = {
  orderId: 42,        // should be string
  amount: 10,
  status: "pending",
};

const result2 = validateRow(ordersSchema, wrongTypRaw);
console.assert(result2.ok === false, "Test 2 FAILED: expected Err for wrong field type");
if (!result2.ok) {
  console.assert(
    result2.error.field === "orderId",
    `Test 2b FAILED: expected field 'orderId', got '${result2.error.field}'`
  );
}

// ------------------------------------------------------------------
// Test 3: validateRow — literal value mismatch
// ------------------------------------------------------------------
const wrongLiteralRaw: unknown = {
  orderId: "ORD-002",
  amount: 5,
  status: "shipped",   // must be "pending"
};

const result3 = validateRow(ordersSchema, wrongLiteralRaw);
console.assert(result3.ok === false, "Test 3 FAILED: expected Err for literal mismatch");
if (!result3.ok) {
  console.assert(
    result3.error.field === "status",
    `Test 3b FAILED: expected field 'status', got '${result3.error.field}'`
  );
}

// ------------------------------------------------------------------
// Test 4: validateRow — not an object
// ------------------------------------------------------------------
const result4 = validateRow(ordersSchema, "not-an-object");
console.assert(result4.ok === false, "Test 4 FAILED: expected Err for non-object input");
if (!result4.ok) {
  console.assert(
    result4.error.field === "__root__",
    `Test 4b FAILED: expected field '__root__', got '${result4.error.field}'`
  );
}

// ------------------------------------------------------------------
// Test 5: runPipeline — mixed valid/invalid batch
// ------------------------------------------------------------------
const records: unknown[] = [
  { orderId: "ORD-010", amount: 10,  status: "pending", confirmed: false }, // valid
  { orderId: 999,       amount: 20,  status: "pending" },                   // invalid: orderId
  { orderId: "ORD-012", amount: 30,  status: "shipped" },                   // invalid: status
  { orderId: "ORD-013", amount: 40,  status: "pending" },                   // valid
];

type OrderOut = { id: string; total: number };

const transformer: Transformer<typeof ordersSchema, OrderOut> = (row) => ({
  id: row.orderId,
  total: row.amount,
});

const sink = makeSink<OrderOut>();
const report: PipelineReport = runPipeline(ordersSchema, transformer, records, sink);

console.assert(report.total   === 4, `Test 5a FAILED: total should be 4, got ${report.total}`);
console.assert(report.passed  === 2, `Test 5b FAILED: passed should be 2, got ${report.passed}`);
console.assert(report.failed  === 2, `Test 5c FAILED: failed should be 2, got ${report.failed}`);
console.assert(sink.rows.length === 2, `Test 5d FAILED: sink should have 2 rows, got ${sink.rows.length}`);
console.assert(
  report.errors[0].index === 1,
  `Test 5e FAILED: first error index should be 1, got ${report.errors[0]?.index}`
);
console.assert(
  report.errors[1].index === 2,
  `Test 5f FAILED: second error index should be 2, got ${report.errors[1]?.index}`
);

console.log("All tests passed ✅");
