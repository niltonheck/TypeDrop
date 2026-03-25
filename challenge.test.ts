// challenge.test.ts
import {
  validateFilter,
  applyFilter,
  sortProducts,
  Product,
  RawFilterInput,
} from "./challenge";

// ----------------------------------------------------------
// Mock catalog
// ----------------------------------------------------------
const catalog: Product[] = [
  { id: "p1", name: "Wireless Headphones", category: "electronics", priceUsd: 79.99,  inStock: true,  rating: 4.5 },
  { id: "p2", name: "Running Shoes",       category: "sports",      priceUsd: 120.00, inStock: true,  rating: 4.2 },
  { id: "p3", name: "TypeScript Handbook", category: "books",       priceUsd: 29.99,  inStock: false, rating: 4.8 },
  { id: "p4", name: "Desk Lamp",           category: "home",        priceUsd: 45.00,  inStock: true,  rating: 3.9 },
  { id: "p5", name: "Yoga Mat",            category: "sports",      priceUsd: 35.00,  inStock: false, rating: 4.1 },
  { id: "p6", name: "Mechanical Keyboard", category: "electronics", priceUsd: 149.99, inStock: true,  rating: 4.7 },
];

// ----------------------------------------------------------
// Test 1: validateFilter — valid input returns ok: true
// ----------------------------------------------------------
const validRaw: RawFilterInput = {
  category: "sports",
  minPrice: "20",
  maxPrice: "200",
  inStockOnly: "true",
};
const validResult = validateFilter(validRaw);
console.assert(validResult.ok === true, "Test 1 FAILED: expected ok: true for valid input");
if (validResult.ok) {
  console.assert(validResult.value.category === "sports",      "Test 1a FAILED: category should be 'sports'");
  console.assert(validResult.value.minPrice === 20,            "Test 1b FAILED: minPrice should be 20");
  console.assert(validResult.value.maxPrice === 200,           "Test 1c FAILED: maxPrice should be 200");
  console.assert(validResult.value.inStockOnly === true,       "Test 1d FAILED: inStockOnly should be true");
}

// ----------------------------------------------------------
// Test 2: validateFilter — invalid inputs produce errors
// ----------------------------------------------------------
const badRaw: RawFilterInput = {
  category: "gadgets",      // not a valid Category
  minPrice: "fifty",        // not a number
  inStockOnly: "yes",       // not "true" | "false"
};
const badResult = validateFilter(badRaw);
console.assert(badResult.ok === false, "Test 2 FAILED: expected ok: false for invalid input");
if (!badResult.ok) {
  console.assert(badResult.errors.length >= 3, "Test 2a FAILED: expected at least 3 errors");
  const fields = badResult.errors.map((e) => e.field);
  console.assert(fields.includes("category"),    "Test 2b FAILED: expected error for 'category'");
  console.assert(fields.includes("minPrice"),    "Test 2c FAILED: expected error for 'minPrice'");
  console.assert(fields.includes("inStockOnly"), "Test 2d FAILED: expected error for 'inStockOnly'");
}

// ----------------------------------------------------------
// Test 3: applyFilter — category + inStockOnly filtering
// ----------------------------------------------------------
const filtered = applyFilter(catalog, { category: "sports", inStockOnly: true });
console.assert(filtered.length === 1,        "Test 3 FAILED: expected 1 in-stock sports product");
console.assert(filtered[0].id === "p2",      "Test 3a FAILED: expected product p2 (Running Shoes)");

// ----------------------------------------------------------
// Test 4: applyFilter — price range filtering
// ----------------------------------------------------------
const priceFiltered = applyFilter(catalog, { minPrice: 40, maxPrice: 100 });
console.assert(priceFiltered.length === 2,   "Test 4 FAILED: expected 2 products in $40–$100 range");
const priceIds = priceFiltered.map((p) => p.id).sort();
console.assert(
  JSON.stringify(priceIds) === JSON.stringify(["p1", "p4"]),
  "Test 4a FAILED: expected p1 (Headphones $79.99) and p4 (Lamp $45)"
);

// ----------------------------------------------------------
// Test 5: sortProducts — sort by priceUsd ascending
// ----------------------------------------------------------
const sortedByPrice = sortProducts(catalog, { field: "priceUsd", direction: "asc" });
const prices = sortedByPrice.map((p) => p.priceUsd);
const isSorted = prices.every((v, i) => i === 0 || v >= prices[i - 1]);
console.assert(isSorted, "Test 5 FAILED: products should be sorted by priceUsd ascending");
console.assert(sortedByPrice[0].id === "p3", "Test 5a FAILED: cheapest product should be p3 ($29.99)");

// ----------------------------------------------------------
// Test 6: sortProducts — sort by name descending
// ----------------------------------------------------------
const sortedByName = sortProducts(catalog, { field: "name", direction: "desc" });
console.assert(
  sortedByName[0].name === "Yoga Mat",
  "Test 6 FAILED: first product (desc) should be 'Yoga Mat'"
);

console.log("All tests passed! 🎉");
