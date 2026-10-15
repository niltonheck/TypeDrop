// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  type Product,
  type FilterCriteria,
  type StringKeys,
  type GroupedProducts,
  filterProducts,
  groupBy,
  filterAndGroup,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────
const catalog: Product[] = [
  { id: "p1", name: "TypeScript Handbook", category: "books",       priceUsd: 29.99, inStock: true,  rating: 4.8 },
  { id: "p2", name: "Wireless Keyboard",   category: "electronics", priceUsd: 79.99, inStock: true,  rating: 4.2 },
  { id: "p3", name: "Noise-Cancel Headset",category: "electronics", priceUsd: 149.99,inStock: false, rating: 4.6 },
  { id: "p4", name: "Linen Shirt",         category: "clothing",    priceUsd: 44.99, inStock: true,  rating: 3.9 },
  { id: "p5", name: "Desk Lamp",           category: "home",        priceUsd: 34.99, inStock: true,  rating: 4.1 },
  { id: "p6", name: "Clean Code",          category: "books",       priceUsd: 34.99, inStock: false, rating: 4.5 },
];

// ── Test 1: filterProducts — single criterion ─────────────────
const booksOnly = filterProducts(catalog, { category: "books" });
console.assert(
  booksOnly.length === 2,
  `❌ Test 1 failed: expected 2 books, got ${booksOnly.length}`
);
console.log("✅ Test 1 passed: filter by category");

// ── Test 2: filterProducts — multiple criteria (AND logic) ────
const inStockElectronics = filterProducts(catalog, {
  category: "electronics",
  inStock: true,
});
console.assert(
  inStockElectronics.length === 1 && inStockElectronics[0].id === "p2",
  `❌ Test 2 failed: expected 1 in-stock electronic, got ${inStockElectronics.length}`
);
console.log("✅ Test 2 passed: filter by category AND inStock");

// ── Test 3: filterProducts — empty criteria returns all ───────
const all = filterProducts(catalog, {});
console.assert(
  all.length === catalog.length,
  `❌ Test 3 failed: empty criteria should return all ${catalog.length} products, got ${all.length}`
);
console.log("✅ Test 3 passed: empty criteria returns full catalog");

// ── Test 4: groupBy — groups by category ─────────────────────
const byCategory = groupBy(catalog, "category");
console.assert(
  byCategory["electronics"]?.length === 2,
  `❌ Test 4 failed: expected 2 electronics, got ${byCategory["electronics"]?.length}`
);
console.assert(
  byCategory["books"]?.length === 2,
  `❌ Test 4 failed: expected 2 books, got ${byCategory["books"]?.length}`
);
console.log("✅ Test 4 passed: groupBy category");

// ── Test 5: filterAndGroup — composes filter + group ─────────
const result = filterAndGroup(catalog, { inStock: true }, "category");
console.assert(
  result["electronics"]?.length === 1,
  `❌ Test 5 failed: expected 1 in-stock electronic, got ${result["electronics"]?.length}`
);
console.assert(
  result["books"]?.length === 1,
  `❌ Test 5 failed: expected 1 in-stock book, got ${result["books"]?.length}`
);
console.assert(
  result["clothing"]?.length === 1,
  `❌ Test 5 failed: expected 1 in-stock clothing item, got ${result["clothing"]?.length}`
);
console.log("✅ Test 5 passed: filterAndGroup composes correctly");

// ── Compile-time check: StringKeys must NOT include numeric keys
// Uncomment to verify the compiler rejects it:
// const badKey: StringKeys = "priceUsd"; // should be a type error
// const badKey2: StringKeys = "rating";  // should be a type error
// const badKey3: StringKeys = "inStock"; // should be a type error

console.log("\n🎉 All runtime tests passed!");
