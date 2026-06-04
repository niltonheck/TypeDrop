// ============================================================
// challenge.test.ts — Typed Product Inventory Aggregator
// ============================================================
import {
  validateProduct,
  aggregateInventory,
  defaultDiscountRegistry,
  type Product,
  type DiscountRegistry,
  type InventoryReport,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validRaw = [
  {
    id: "p1",
    name: "Laptop Pro",
    category: "electronics",
    priceUsd: 1000,
    stockUnits: 5,
    warehouseCode: "WH-A",
  },
  {
    id: "p2",
    name: "Wireless Earbuds",
    category: "electronics",
    priceUsd: 200,
    stockUnits: 20,
    warehouseCode: "WH-B",
  },
  {
    id: "p3",
    name: "Cotton T-Shirt",
    category: "apparel",
    priceUsd: 40,
    stockUnits: 100,
    warehouseCode: "WH-A",
  },
  {
    id: "p4",
    name: "Organic Oats",
    category: "grocery",
    priceUsd: 5,
    stockUnits: 200,
    warehouseCode: "WH-C",
  },
];

const invalidRaw = [
  // missing name, negative price
  { id: "bad1", category: "electronics", priceUsd: -10, stockUnits: 5, warehouseCode: "WH-X" },
  // invalid category, fractional stockUnits
  { id: "bad2", name: "Ghost Item", category: "unknown_cat", priceUsd: 50, stockUnits: 3.7, warehouseCode: "WH-Y" },
  // entirely missing id
  { name: "No ID", category: "grocery", priceUsd: 2, stockUnits: 10, warehouseCode: "WH-Z" },
];

// -----------------------------------------------------------
// Test 1: validateProduct — happy path
// -----------------------------------------------------------
const validResult = validateProduct(validRaw[0]);
console.assert(validResult.ok === true, "Test 1a FAILED: valid product should pass validation");
if (validResult.ok) {
  console.assert(validResult.value.id === "p1", "Test 1b FAILED: id should be 'p1'");
  console.assert(validResult.value.category === "electronics", "Test 1c FAILED: category should be 'electronics'");
}

// -----------------------------------------------------------
// Test 2: validateProduct — collects multiple errors
// -----------------------------------------------------------
const invalidResult = validateProduct(invalidRaw[0]);
console.assert(invalidResult.ok === false, "Test 2a FAILED: invalid product should fail validation");
if (!invalidResult.ok) {
  console.assert(
    invalidResult.error.length >= 2,
    `Test 2b FAILED: expected >= 2 errors, got ${invalidResult.error.length}`
  );
  const fields = invalidResult.error.map((e) => e.field);
  console.assert(fields.includes("name"), "Test 2c FAILED: should report 'name' error");
  console.assert(fields.includes("priceUsd"), "Test 2d FAILED: should report 'priceUsd' error");
}

// -----------------------------------------------------------
// Test 3: defaultDiscountRegistry applies correct discounts
// -----------------------------------------------------------
const laptop: Product = {
  id: "p1", name: "Laptop Pro", category: "electronics",
  priceUsd: 1000, stockUnits: 5, warehouseCode: "WH-A",
};
const discountedLaptop = defaultDiscountRegistry.electronics(laptop);
console.assert(
  Math.abs(discountedLaptop - 900) < 0.01,
  `Test 3 FAILED: expected 900, got ${discountedLaptop}`
);

// -----------------------------------------------------------
// Test 4: aggregateInventory — counts and categories
// -----------------------------------------------------------
const allRaw = [...validRaw, ...invalidRaw];
const result = aggregateInventory(allRaw);

console.assert(result.validCount === 4, `Test 4a FAILED: expected 4 valid, got ${result.validCount}`);
console.assert(result.invalidCount === 3, `Test 4b FAILED: expected 3 invalid, got ${result.invalidCount}`);
console.assert("electronics" in result.report, "Test 4c FAILED: report should contain 'electronics'");
console.assert("apparel" in result.report, "Test 4d FAILED: report should contain 'apparel'");
console.assert("grocery" in result.report, "Test 4e FAILED: report should contain 'grocery'");
console.assert(!("furniture" in result.report), "Test 4f FAILED: report should NOT contain 'furniture'");

// -----------------------------------------------------------
// Test 5: aggregateInventory — correct aggregation values
// -----------------------------------------------------------
const elec = result.report.electronics;
console.assert(elec !== undefined, "Test 5a FAILED: electronics summary must exist");
if (elec) {
  // p1: 1000 * 0.9 = 900, stockUnits 5  → value 4500
  // p2:  200 * 0.9 = 180, stockUnits 20 → value 3600
  // total stock value = 8100, totalStockUnits = 25, avg price = (900+180)/2 = 540
  console.assert(elec.totalProducts === 2, `Test 5b FAILED: expected 2, got ${elec.totalProducts}`);
  console.assert(elec.totalStockUnits === 25, `Test 5c FAILED: expected 25, got ${elec.totalStockUnits}`);
  console.assert(
    Math.abs(elec.totalStockValueUsd - 8100) < 0.01,
    `Test 5d FAILED: expected 8100, got ${elec.totalStockValueUsd}`
  );
  console.assert(
    Math.abs(elec.averageDiscountedPriceUsd - 540) < 0.01,
    `Test 5e FAILED: expected avg 540, got ${elec.averageDiscountedPriceUsd}`
  );
  console.assert(
    elec.warehouseCodes.has("WH-A") && elec.warehouseCodes.has("WH-B"),
    "Test 5f FAILED: warehouseCodes should contain WH-A and WH-B"
  );
}

// -----------------------------------------------------------
// Test 6: errors map uses "__unknown__" for missing id
// -----------------------------------------------------------
console.assert(
  "__unknown__" in result.errors || "bad1" in result.errors,
  "Test 6a FAILED: errors map should contain invalid record keys"
);
const hasUnknown = "__unknown__" in result.errors;
console.assert(hasUnknown, "Test 6b FAILED: missing-id record should use '__unknown__' key");

console.log("All tests passed! ✅");
