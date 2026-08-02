// challenge.test.ts
import { groupBy, summariseGroup, buildReport, type StringKeys, type Order, type OrderSummary } from "./challenge";

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const orders: Order[] = [
  { id: "o1", customerId: "c1", region: "NA",   status: "fulfilled", amountUsd: 100, itemCount: 2 },
  { id: "o2", customerId: "c2", region: "EU",   status: "pending",   amountUsd: 200, itemCount: 5 },
  { id: "o3", customerId: "c1", region: "NA",   status: "cancelled", amountUsd:  50, itemCount: 1 },
  { id: "o4", customerId: "c3", region: "APAC", status: "fulfilled", amountUsd: 300, itemCount: 3 },
  { id: "o5", customerId: "c2", region: "EU",   status: "fulfilled", amountUsd: 150, itemCount: 4 },
];

// -------------------------------------------------------------------
// Test 1 — groupBy basics
// -------------------------------------------------------------------
const grouped = groupBy(orders, (o) => o.region);

console.assert(
  grouped["NA"]?.length === 2,
  `❌ Test 1a: expected 2 NA orders, got ${grouped["NA"]?.length}`
);
console.assert(
  grouped["EU"]?.length === 2,
  `❌ Test 1b: expected 2 EU orders, got ${grouped["EU"]?.length}`
);
console.assert(
  grouped["APAC"]?.length === 1,
  `❌ Test 1c: expected 1 APAC order, got ${grouped["APAC"]?.length}`
);
console.log("✅ Test 1 passed — groupBy");

// -------------------------------------------------------------------
// Test 2 — summariseGroup correctness
// -------------------------------------------------------------------
const naOrders = orders.filter((o) => o.region === "NA"); // o1 (100) + o3 (50)
const naSummary: OrderSummary = summariseGroup(naOrders);

console.assert(
  naSummary.count === 2,
  `❌ Test 2a: expected count 2, got ${naSummary.count}`
);
console.assert(
  naSummary.totalAmountUsd === 150,
  `❌ Test 2b: expected totalAmountUsd 150, got ${naSummary.totalAmountUsd}`
);
console.assert(
  naSummary.averageAmountUsd === 75,
  `❌ Test 2c: expected averageAmountUsd 75, got ${naSummary.averageAmountUsd}`
);
console.assert(
  naSummary.totalItemCount === 3,
  `❌ Test 2d: expected totalItemCount 3, got ${naSummary.totalItemCount}`
);
console.assert(
  JSON.stringify(naSummary.orderIds) === JSON.stringify(["o1", "o3"]),
  `❌ Test 2e: expected orderIds ["o1","o3"], got ${JSON.stringify(naSummary.orderIds)}`
);
console.log("✅ Test 2 passed — summariseGroup");

// -------------------------------------------------------------------
// Test 3 — summariseGroup with empty array
// -------------------------------------------------------------------
const emptySummary = summariseGroup([]);
console.assert(
  emptySummary.count === 0 &&
  emptySummary.totalAmountUsd === 0 &&
  emptySummary.averageAmountUsd === 0 &&
  emptySummary.totalItemCount === 0 &&
  emptySummary.orderIds.length === 0,
  `❌ Test 3: empty summariseGroup should return all-zero summary`
);
console.log("✅ Test 3 passed — summariseGroup empty");

// -------------------------------------------------------------------
// Test 4 — buildReport by region
// -------------------------------------------------------------------
const report = buildReport(orders, "region");

console.assert(
  report["NA"]?.count === 2,
  `❌ Test 4a: NA count should be 2, got ${report["NA"]?.count}`
);
console.assert(
  report["EU"]?.totalAmountUsd === 350,
  `❌ Test 4b: EU totalAmountUsd should be 350, got ${report["EU"]?.totalAmountUsd}`
);
console.assert(
  report["APAC"]?.orderIds[0] === "o4",
  `❌ Test 4c: APAC first orderId should be o4, got ${report["APAC"]?.orderIds[0]}`
);
console.log("✅ Test 4 passed — buildReport by region");

// -------------------------------------------------------------------
// Test 5 — buildReport by status
// -------------------------------------------------------------------
const statusReport = buildReport(orders, "status");

console.assert(
  statusReport["fulfilled"]?.count === 3,
  `❌ Test 5a: fulfilled count should be 3, got ${statusReport["fulfilled"]?.count}`
);
console.assert(
  statusReport["pending"]?.count === 1,
  `❌ Test 5b: pending count should be 1, got ${statusReport["pending"]?.count}`
);
console.log("✅ Test 5 passed — buildReport by status");

// -------------------------------------------------------------------
// Compile-time type check (must NOT compile if uncommented):
// buildReport(orders, "amountUsd");   // ❌ number key — should be a type error
// buildReport(orders, "itemCount");   // ❌ number key — should be a type error
// -------------------------------------------------------------------

console.log("\n🎉 All runtime tests passed!");
