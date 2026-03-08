
// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts  –  Typed Inventory Aggregator
// ─────────────────────────────────────────────────────────────────────────────
import {
  validateRecord,
  partitionRecords,
  aggregateByCategory,
  processInventory,
  type RawRecord,
  type InventoryItem,
  type CategorySummary,
} from "./challenge";

// ─── Mock data ────────────────────────────────────────────────────────────────

const raw: RawRecord[] = [
  { id: "A1", name: "Laptop",      category: "electronics", quantity: 10, unitPrice: 99900, warehouseId: "WH1" },
  { id: "A2", name: "T-Shirt",     category: "clothing",    quantity: 50, unitPrice: 1999,  warehouseId: "WH1" },
  { id: "A3", name: "Headphones",  category: "electronics", quantity: 25, unitPrice: 4999,  warehouseId: "WH2" },
  { id: "A4", name: "Bread",       category: "food",        quantity: 100, unitPrice: 299,  warehouseId: "WH3" },
  // ── invalid records ──
  { id: "B1", name: "Ghost",       category: "gadgets",     quantity: 5,  unitPrice: 100,   warehouseId: "WH1" }, // bad category
  { id: "B2", name: "Broken Item", category: "clothing",    quantity: -3, unitPrice: 500,   warehouseId: "WH2" }, // negative qty
  { id: "B3", name: "Free Thing",  category: "food",        quantity: 10, unitPrice: -1,    warehouseId: "WH3" }, // negative price
];

// ─── Test 1: validateRecord – valid item returns ok: true ─────────────────────
const validResult = validateRecord(raw[0]);
console.assert(validResult.ok === true, "Test 1a FAILED: valid record should return ok: true");
if (validResult.ok) {
  console.assert(
    validResult.value.category === "electronics",
    "Test 1b FAILED: category should be 'electronics'"
  );
}

// ─── Test 2: validateRecord – bad category returns ok: false ─────────────────
const badCatResult = validateRecord(raw[4]); // "gadgets"
console.assert(badCatResult.ok === false, "Test 2a FAILED: unknown category should return ok: false");
if (!badCatResult.ok) {
  console.assert(
    badCatResult.error.reason === "unknown_category",
    "Test 2b FAILED: reason should be 'unknown_category'"
  );
  console.assert(
    badCatResult.error.recordId === "B1",
    "Test 2c FAILED: recordId should be 'B1'"
  );
}

// ─── Test 3: partitionRecords – correct counts ───────────────────────────────
const { valid, errors } = partitionRecords(raw);
console.assert(valid.length === 4,  `Test 3a FAILED: expected 4 valid items, got ${valid.length}`);
console.assert(errors.length === 3, `Test 3b FAILED: expected 3 errors, got ${errors.length}`);

// ─── Test 4: aggregateByCategory – electronics summary ───────────────────────
const summary = aggregateByCategory(valid);
const elec = summary["electronics"] as CategorySummary;
console.assert(elec !== undefined,                "Test 4a FAILED: electronics summary missing");
console.assert(elec.totalItems === 2,             `Test 4b FAILED: expected 2 items, got ${elec.totalItems}`);
console.assert(elec.totalQuantity === 35,         `Test 4c FAILED: expected qty 35, got ${elec.totalQuantity}`);
// totalValue: (10 * 99900) + (25 * 4999) = 999000 + 124975 = 1123975
console.assert(elec.totalValue === 1123975,       `Test 4d FAILED: expected 1123975, got ${elec.totalValue}`);
// averageUnitPrice: Math.round((99900 + 4999) / 2) = Math.round(52449.5) = 52450
console.assert(elec.averageUnitPrice === 52450,   `Test 4e FAILED: expected 52450, got ${elec.averageUnitPrice}`);

// ─── Test 5: processInventory – full pipeline ────────────────────────────────
const pipeline = processInventory(raw);
console.assert(
  pipeline.errors.length === 3,
  `Test 5a FAILED: expected 3 pipeline errors, got ${pipeline.errors.length}`
);
console.assert(
  pipeline.summary["food"] !== undefined,
  "Test 5b FAILED: food category missing from pipeline summary"
);
const food = pipeline.summary["food"] as CategorySummary;
// totalValue: 100 * 299 = 29900
console.assert(
  food.totalValue === 29900,
  `Test 5c FAILED: food totalValue expected 29900, got ${food.totalValue}`
);

console.log("All tests passed! ✅");
