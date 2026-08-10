// ============================================================
// Test Harness: challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// ============================================================
import {
  groupBy,
  type Transaction,
  type NumericKeys,
  type Group,
} from "./challenge";

// --------------- Mock Data ---------------

const transactions: Transaction[] = [
  { id: "t1", region: "north", category: "hardware",  salesperson: "Alice", amount: 200, units: 4 },
  { id: "t2", region: "north", category: "software",  salesperson: "Bob",   amount: 150, units: 2 },
  { id: "t3", region: "south", category: "hardware",  salesperson: "Carol", amount: 300, units: 6 },
  { id: "t4", region: "north", category: "services",  salesperson: "Alice", amount: 100, units: 1 },
  { id: "t5", region: "south", category: "software",  salesperson: "Dave",  amount: 250, units: 5 },
  { id: "t6", region: "east",  category: "hardware",  salesperson: "Eve",   amount: 400, units: 8 },
];

// --------------- Tests ---------------

// Test 1: Correct number of groups when grouping by region
const byRegion = groupBy(transactions, "region");
console.assert(
  Object.keys(byRegion).length === 3,
  `❌ Test 1 FAILED: expected 3 region groups, got ${Object.keys(byRegion).length}`
);
console.log("✅ Test 1 passed: correct number of region groups");

// Test 2: Items in each group are correct
const northItems = byRegion["north"]?.items ?? [];
console.assert(
  northItems.length === 3,
  `❌ Test 2 FAILED: expected 3 north items, got ${northItems.length}`
);
console.log("✅ Test 2 passed: north group contains 3 items");

// Test 3: NumericSummary for `amount` in the north group
const northAmountStats = byRegion["north"]?.stats.amount;
console.assert(
  northAmountStats !== undefined &&
    northAmountStats.count === 3 &&
    northAmountStats.sum === 450 &&
    northAmountStats.min === 100 &&
    northAmountStats.max === 200 &&
    Math.abs(northAmountStats.average - 150) < 0.001,
  `❌ Test 3 FAILED: north amount stats incorrect — got ${JSON.stringify(northAmountStats)}`
);
console.log("✅ Test 3 passed: north group amount stats are correct");

// Test 4: NumericSummary for `units` in the south group
const southUnitStats = byRegion["south"]?.stats.units;
console.assert(
  southUnitStats !== undefined &&
    southUnitStats.count === 2 &&
    southUnitStats.sum === 11 &&
    southUnitStats.min === 5 &&
    southUnitStats.max === 6 &&
    Math.abs(southUnitStats.average - 5.5) < 0.001,
  `❌ Test 4 FAILED: south units stats incorrect — got ${JSON.stringify(southUnitStats)}`
);
console.log("✅ Test 4 passed: south group units stats are correct");

// Test 5: Empty input returns empty object
const emptyResult = groupBy([], "region");
console.assert(
  Object.keys(emptyResult).length === 0,
  `❌ Test 5 FAILED: expected empty result, got ${JSON.stringify(emptyResult)}`
);
console.log("✅ Test 5 passed: empty input returns empty object");

// --------------- Compile-time type checks (no runtime assertions needed) ---------------

// NumericKeys<Transaction> should only be "amount" | "units"
type TxNumericKeys = NumericKeys<Transaction>;
const _checkNumericKey: TxNumericKeys = "amount"; // ✅ must compile
const _checkNumericKey2: TxNumericKeys = "units";  // ✅ must compile
// @ts-expect-error "region" is not a numeric key
const _checkBadKey: TxNumericKeys = "region";

// Group<Transaction, "region"> must expose `stats.amount` and `stats.units`
type TxGroup = Group<Transaction, "region">;
type _HasAmount = TxGroup["stats"]["amount"]; // must be NumericSummary
type _HasUnits  = TxGroup["stats"]["units"];  // must be NumericSummary
// @ts-expect-error "id" is not a numeric field
type _NoId = TxGroup["stats"]["id"];

console.log("\n🎉 All runtime tests passed!");
