// ============================================================
// challenge.test.ts — Typed Query Builder with Schema Inference
// ============================================================
import {
  createQueryBuilder,
  applyFilter,
  type ColumnType,
  type SelectedRow,
  type AggRow,
  type QueryRow,
  type TableSchema,
  type AggregationDef,
} from "./challenge";

// ------------------------------------------------------------------
// MOCK SCHEMA & DATA
// ------------------------------------------------------------------

const OrdersSchema = {
  id:         { type: "number",  nullable: false },
  customerId: { type: "number",  nullable: false },
  status:     { type: "string",  nullable: false },
  total:      { type: "number",  nullable: true  },
  createdAt:  { type: "date",    nullable: false },
} as const satisfies TableSchema;

type OrdersSchema = typeof OrdersSchema;

const now = new Date("2026-01-01T00:00:00Z");

const ORDERS = [
  { id: 1, customerId: 42, status: "completed", total: 120,  createdAt: new Date("2026-01-02T00:00:00Z") },
  { id: 2, customerId: 42, status: "pending",   total: 80,   createdAt: new Date("2026-01-03T00:00:00Z") },
  { id: 3, customerId: 99, status: "completed", total: null, createdAt: new Date("2026-01-04T00:00:00Z") },
  { id: 4, customerId: 99, status: "cancelled", total: 200,  createdAt: new Date("2026-01-05T00:00:00Z") },
  { id: 5, customerId: 42, status: "completed", total: 50,   createdAt: new Date("2026-01-06T00:00:00Z") },
] as const satisfies ReadonlyArray<{ [K in keyof OrdersSchema]: (typeof OrdersSchema)[K]["type"] extends "number" ? number | null : (typeof OrdersSchema)[K]["type"] extends "string" ? string | null : (typeof OrdersSchema)[K]["type"] extends "date" ? Date | null : never }>;

// ------------------------------------------------------------------
// TYPE-LEVEL TESTS (compile-time only — these must not produce errors)
// ------------------------------------------------------------------

// 2-A: ColumnType resolves nullability correctly
type _T1 = ColumnType<OrdersSchema, "total">;    // should be: number | null
type _T2 = ColumnType<OrdersSchema, "status">;   // should be: string

// 2-B: SelectedRow picks the right shape
type _T3 = SelectedRow<OrdersSchema, "id" | "status">; // { id: number; status: string }

// 2-D: AggRow maps aliases to number
type _SampleAgg = [{ fn: "sum"; column: "total"; alias: "revenue" }];
type _T4 = AggRow<_SampleAgg>; // { revenue: number }

// 2-E: QueryRow merges columns + aggs
type _T5 = QueryRow<OrdersSchema, "id" | "status", _SampleAgg>;
// should be: { id: number; status: string; revenue: number }

// ------------------------------------------------------------------
// RUNTIME TESTS
// ------------------------------------------------------------------

async function runTests(): Promise<void> {
  const qb = createQueryBuilder(OrdersSchema, ORDERS);

  // ----------------------------------------------------------------
  // Test 1: applyFilter — unit tests for all operators
  // ----------------------------------------------------------------
  console.assert(applyFilter(5, { op: "eq",  value: 5 })  === true,  "T1a: eq true");
  console.assert(applyFilter(5, { op: "eq",  value: 6 })  === false, "T1b: eq false");
  console.assert(applyFilter(5, { op: "neq", value: 6 })  === true,  "T1c: neq true");
  console.assert(applyFilter(5, { op: "gt",  value: 4 })  === true,  "T1d: gt true");
  console.assert(applyFilter(5, { op: "gte", value: 5 })  === true,  "T1e: gte eq");
  console.assert(applyFilter(5, { op: "lt",  value: 6 })  === true,  "T1f: lt true");
  console.assert(applyFilter(5, { op: "lte", value: 4 })  === false, "T1g: lte false");
  console.assert(applyFilter(5, { op: "in",  value: [1, 5, 9] }) === true,  "T1h: in true");
  console.assert(applyFilter(null, { op: "isNull" })      === true,  "T1i: isNull true");
  console.assert(applyFilter(5,    { op: "isNull" })      === false, "T1j: isNull false on non-null");
  console.assert(applyFilter(5,    { op: "isNotNull" })   === true,  "T1k: isNotNull true");
  console.assert(applyFilter(null, { op: "isNotNull" })   === false, "T1l: isNotNull false on null");

  // ----------------------------------------------------------------
  // Test 2: select + where (column projection + filtering)
  // ----------------------------------------------------------------
  const completedByCustomer42 = await qb
    .select("id", "status", "total")
    .where({ customerId: { op: "eq", value: 42 }, status: { op: "eq", value: "completed" } })
    .execute();

  // Expect orders 1 and 5 (both completed, customerId=42)
  console.assert(completedByCustomer42.length === 2, "T2a: 2 completed orders for customer 42");
  console.assert(
    completedByCustomer42.every(r => r.status === "completed"),
    "T2b: all rows have status=completed"
  );
  // Type check: result rows must have id, status, total — no other fields
  const _r2: { id: number; status: string; total: number | null } = completedByCustomer42[0]!;
  void _r2;

  // ----------------------------------------------------------------
  // Test 3: aggregation — sum of totals for customer 42
  // ----------------------------------------------------------------
  const aggs = [
    { fn: "sum",   column: "total", alias: "totalRevenue" },
    { fn: "count", column: "id",    alias: "orderCount"   },
  ] as const satisfies readonly AggregationDef[];

  const aggResult = await qb
    .where({ customerId: { op: "eq", value: 42 } })
    .aggregate(aggs)
    .execute();

  // customer 42 has totals: 120, 80, 50 → sum=250, count=3
  console.assert(aggResult.length === 1, "T3a: aggregation returns single row");
  console.assert(aggResult[0]!.totalRevenue === 250, "T3b: sum(total) = 250");
  console.assert(aggResult[0]!.orderCount   === 3,   "T3c: count(id) = 3");
  // Type check: result must have totalRevenue and orderCount as number
  const _r3: { totalRevenue: number; orderCount: number } = aggResult[0]!;
  void _r3;

  // ----------------------------------------------------------------
  // Test 4: orderBy + limit
  // ----------------------------------------------------------------
  const top2ByIdDesc = await qb
    .select("id", "status")
    .orderBy({ column: "id", direction: "desc" })
    .limit(2)
    .execute();

  console.assert(top2ByIdDesc.length === 2,  "T4a: limit=2 returns 2 rows");
  console.assert(top2ByIdDesc[0]!.id === 5,  "T4b: first row is id=5 (desc)");
  console.assert(top2ByIdDesc[1]!.id === 4,  "T4c: second row is id=4 (desc)");

  // ----------------------------------------------------------------
  // Test 5: isNull filter
  // ----------------------------------------------------------------
  const nullTotals = await qb
    .select("id", "total")
    .where({ total: { op: "isNull" } })
    .execute();

  console.assert(nullTotals.length === 1,         "T5a: one row with null total");
  console.assert(nullTotals[0]!.id === 3,         "T5b: that row is id=3");
  console.assert(nullTotals[0]!.total === null,   "T5c: total is null");

  console.log("All tests passed ✅");
}

runTests().catch(console.error);
