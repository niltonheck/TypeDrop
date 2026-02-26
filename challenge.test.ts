// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts  –  run with: npx ts-node challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  parseProduct,
  groupByCategory,
  summariseCategory,
  buildInventoryReport,
  type Product,
  type InventoryReport,
} from "./challenge";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const validRecords: unknown[] = [
  { id: "p1", name: "Laptop",      category: "electronics", priceUsd: 999.99, stock: 10 },
  { id: "p2", name: "T-Shirt",     category: "clothing",    priceUsd: 19.99,  stock: 200 },
  { id: "p3", name: "Headphones",  category: "electronics", priceUsd: 149.50, stock: 35 },
  { id: "p4", name: "Rice (5 kg)", category: "food",        priceUsd: 8.49,   stock: 500 },
  { id: "p5", name: "Desk Chair",  category: "furniture",   priceUsd: 249.00, stock: 8  },
  { id: "p6", name: "Jeans",       category: "clothing",    priceUsd: 59.95,  stock: 75 },
];

const invalidRecords: unknown[] = [
  null,                                                                    // index 0 — not an object
  { id: "",   name: "Ghost",   category: "electronics", priceUsd: 10, stock: 5 },  // index 1 — empty id
  { id: "p8", name: "Widget", category: "gadgets",      priceUsd: 5,  stock: 3 },  // index 2 — bad category
  { id: "p9", name: "Freebie", category: "food",        priceUsd: -1, stock: 2 },  // index 3 — negative price
  { id: "p10",name: "Half",    category: "clothing",    priceUsd: 10, stock: 1.5 },// index 4 — fractional stock
];

const mixedRecords: unknown[] = [...validRecords, ...invalidRecords];

// ─── Test 1: parseProduct – valid record ─────────────────────────────────────
const parseOk = parseProduct(validRecords[0]);
console.assert(parseOk.ok === true, "Test 1a FAILED: valid record should parse ok");
if (parseOk.ok) {
  console.assert(parseOk.value.id === "p1",            "Test 1b FAILED: id should be 'p1'");
  console.assert(parseOk.value.category === "electronics", "Test 1c FAILED: category should be 'electronics'");
}
console.log("Test 1 passed ✓  parseProduct – valid record");

// ─── Test 2: parseProduct – invalid records ───────────────────────────────────
for (const raw of invalidRecords) {
  const result = parseProduct(raw);
  console.assert(result.ok === false, `Test 2 FAILED: expected failure for ${JSON.stringify(raw)}`);
}
console.log("Test 2 passed ✓  parseProduct – all invalid records rejected");

// ─── Test 3: groupByCategory ─────────────────────────────────────────────────
const products = validRecords.map((r) => {
  const res = parseProduct(r);
  if (!res.ok) throw new Error("Unexpected parse failure in test setup");
  return res.value;
});

const grouped = groupByCategory(products);
console.assert(grouped.get("electronics")?.length === 2, "Test 3a FAILED: electronics should have 2 products");
console.assert(grouped.get("clothing")?.length === 2,    "Test 3b FAILED: clothing should have 2 products");
console.assert(grouped.get("food")?.length === 1,        "Test 3c FAILED: food should have 1 product");
console.assert(grouped.get("furniture")?.length === 1,   "Test 3d FAILED: furniture should have 1 product");
console.log("Test 3 passed ✓  groupByCategory – correct buckets");

// ─── Test 4: summariseCategory ────────────────────────────────────────────────
const electronics = grouped.get("electronics")!;
const summary = summariseCategory("electronics", electronics);
console.assert(summary.productCount === 2,                    "Test 4a FAILED: productCount should be 2");
console.assert(summary.totalStock === 45,                     "Test 4b FAILED: totalStock should be 45");
console.assert(summary.averagePriceUsd === 574.75,            "Test 4c FAILED: averagePrice should be 574.75");
console.assert(summary.cheapestProduct.id === "p3",           "Test 4d FAILED: cheapest should be p3 (Headphones)");
console.log("Test 4 passed ✓  summariseCategory – correct aggregates");

// ─── Test 5: buildInventoryReport – mixed data ────────────────────────────────
const report: InventoryReport = buildInventoryReport(mixedRecords);

// Parse errors
console.assert(report.parseErrors.length === 5, `Test 5a FAILED: expected 5 parse errors, got ${report.parseErrors.length}`);

// Errors reference correct original indices (6–10 in mixedRecords)
const errorIndices = report.parseErrors.map((e) => e.index);
console.assert(
  [6, 7, 8, 9, 10].every((i) => errorIndices.includes(i)),
  `Test 5b FAILED: error indices should be [6,7,8,9,10], got ${JSON.stringify(errorIndices)}`
);

// Total valid products
console.assert(report.totalProducts === 6, `Test 5c FAILED: totalProducts should be 6, got ${report.totalProducts}`);

// Summaries sorted alphabetically
const categoryOrder = report.summaries.map((s) => s.category);
console.assert(
  JSON.stringify(categoryOrder) === JSON.stringify([...categoryOrder].sort()),
  `Test 5d FAILED: summaries not sorted alphabetically: ${JSON.stringify(categoryOrder)}`
);

// All four categories present
console.assert(report.summaries.length === 4, `Test 5e FAILED: expected 4 summaries, got ${report.summaries.length}`);
console.log("Test 5 passed ✓  buildInventoryReport – full pipeline");

console.log("\n🎉 All tests passed!");
