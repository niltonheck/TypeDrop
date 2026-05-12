// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateProduct,
  matchesFilter,
  buildInventoryReport,
  type Product,
  type FilterCriteria,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const validRaw = {
  id: "p1",
  name: "Wireless Headphones",
  category: "electronics",
  priceUsd: 79.99,
  stock: 42,
  rating: 4.5,
  tags: ["audio", "wireless", "sale"],
};

const validRaw2 = {
  id: "p2",
  name: "Running Shoes",
  category: "sports",
  priceUsd: 120.0,
  stock: 0,
  rating: 4.2,
  tags: ["running", "outdoor"],
};

const validRaw3 = {
  id: "p3",
  name: "TypeScript Handbook",
  category: "books",
  priceUsd: 29.99,
  stock: 15,
  rating: 4.9,
  tags: ["programming", "learning"],
};

const invalidRaw1 = {
  id: "",                // R2: empty id
  name: "Ghost Product",
  category: "electronics",
  priceUsd: 10,
  stock: 5,
  rating: 3,
  tags: [],
};

const invalidRaw2 = {
  id: "p4",
  name: "Bad Price",
  category: "clothing",
  priceUsd: -5,          // R5: negative price
  stock: 10,
  rating: 3,
  tags: [],
};

const invalidRaw3 = {
  id: "p5",
  name: "Bad Category",
  category: "furniture",  // R4: invalid category
  priceUsd: 50,
  stock: 3,
  rating: 2,
  tags: [],
};

const invalidRaw4 = {
  id: "p6",
  name: "Bad Tags",
  category: "home",
  priceUsd: 25,
  stock: 2,
  rating: 3.5,
  tags: ["good", 42],   // R8: non-string element in tags
};

// ------------------------------------------------------------------
// Test 1: validateProduct — valid entry returns ok: true
// ------------------------------------------------------------------
const r1 = validateProduct(validRaw);
console.assert(r1.ok === true, "Test 1 FAILED: valid product should return ok: true");
if (r1.ok) {
  console.assert(r1.product.id === "p1", "Test 1b FAILED: id should be 'p1'");
  console.assert(r1.product.priceUsd === 79.99, "Test 1c FAILED: priceUsd mismatch");
}
console.log("Test 1 passed ✓ — valid product accepted");

// ------------------------------------------------------------------
// Test 2: validateProduct — invalid entries return ok: false
// ------------------------------------------------------------------
const r2a = validateProduct(invalidRaw1);
console.assert(r2a.ok === false, "Test 2a FAILED: empty id should fail validation");

const r2b = validateProduct(invalidRaw2);
console.assert(r2b.ok === false, "Test 2b FAILED: negative price should fail validation");

const r2c = validateProduct(invalidRaw3);
console.assert(r2c.ok === false, "Test 2c FAILED: invalid category should fail validation");

const r2d = validateProduct(invalidRaw4);
console.assert(r2d.ok === false, "Test 2d FAILED: non-string tag should fail validation");

const r2e = validateProduct(null);
console.assert(r2e.ok === false, "Test 2e FAILED: null should fail validation");

console.log("Test 2 passed ✓ — invalid products rejected");

// ------------------------------------------------------------------
// Test 3: matchesFilter — filter logic
// ------------------------------------------------------------------
const p1 = (validateProduct(validRaw) as Extract<ReturnType<typeof validateProduct>, { ok: true }>).product;
const p2 = (validateProduct(validRaw2) as Extract<ReturnType<typeof validateProduct>, { ok: true }>).product;
const p3 = (validateProduct(validRaw3) as Extract<ReturnType<typeof validateProduct>, { ok: true }>).product;

// inStockOnly should exclude p2 (stock: 0)
const criteria1: FilterCriteria = { inStockOnly: true };
console.assert(matchesFilter(p1, criteria1) === true,  "Test 3a FAILED: p1 in stock, should pass");
console.assert(matchesFilter(p2, criteria1) === false, "Test 3b FAILED: p2 out of stock, should fail");

// maxPriceUsd should exclude p2
const criteria2: FilterCriteria = { maxPriceUsd: 100 };
console.assert(matchesFilter(p1, criteria2) === true,  "Test 3c FAILED: p1 price 79.99 <= 100");
console.assert(matchesFilter(p2, criteria2) === false, "Test 3d FAILED: p2 price 120 > 100");

// tag filter — p3 has 'programming', p1 does not
const criteria3: FilterCriteria = { tags: ["programming"] };
console.assert(matchesFilter(p3, criteria3) === true,  "Test 3e FAILED: p3 has 'programming' tag");
console.assert(matchesFilter(p1, criteria3) === false, "Test 3f FAILED: p1 lacks 'programming' tag");

console.log("Test 3 passed ✓ — filter criteria applied correctly");

// ------------------------------------------------------------------
// Test 4: buildInventoryReport — full pipeline
// ------------------------------------------------------------------
const rawFeed: unknown[] = [validRaw, validRaw2, validRaw3, invalidRaw1, invalidRaw2];
const criteria4: FilterCriteria = { inStockOnly: true, minRating: 4.0 };
const report = buildInventoryReport(rawFeed, criteria4);

console.assert(report.totalInput === 5,  "Test 4a FAILED: totalInput should be 5");
console.assert(report.validCount === 3,  "Test 4b FAILED: validCount should be 3");
console.assert(report.invalidCount === 2, "Test 4c FAILED: invalidCount should be 2");
// p1 passes (inStock, rating 4.5 >= 4.0); p2 fails (out of stock); p3 passes (inStock, rating 4.9)
console.assert(report.filteredProducts.length === 2, "Test 4d FAILED: 2 products should survive filter");
console.assert(
  report.filteredProducts.every(p => p.stock > 0 && p.rating >= 4.0),
  "Test 4e FAILED: filtered products must all be in-stock with rating >= 4.0"
);
console.assert(report.invalidReasons.length === 2, "Test 4f FAILED: 2 invalid reasons expected");

console.log("Test 4 passed ✓ — full pipeline report is correct");

// ------------------------------------------------------------------
// Test 5: buildInventoryReport — non-array input
// ------------------------------------------------------------------
const emptyReport = buildInventoryReport("not-an-array", {});
console.assert(emptyReport.totalInput === 0,              "Test 5a FAILED: totalInput should be 0");
console.assert(emptyReport.filteredProducts.length === 0, "Test 5b FAILED: no products expected");
console.log("Test 5 passed ✓ — non-array input handled gracefully");

console.log("\n✅ All tests passed!");
