// ============================================================
// challenge.test.ts — Test harness for the Catalog Filter Engine
// ============================================================
import {
  isProduct,
  parseProducts,
  getPriceBucket,
  applyFilter,
  buildFacets,
  searchCatalog,
  type Product,
  type CatalogFilter,
} from "./challenge";

// -----------------------------------------------------------
// Mock catalog data (raw unknown — as if from JSON.parse)
// -----------------------------------------------------------
const RAW_CATALOG: unknown = [
  // valid products
  { id: "p1", name: "Wireless Headphones", category: "electronics", priceUSD: 89.99,  rating: 4.5, inStock: true,  tags: ["audio", "wireless"] },
  { id: "p2", name: "Running Shoes",       category: "sports",      priceUSD: 129.99, rating: 4.2, inStock: true,  tags: ["footwear", "running"] },
  { id: "p3", name: "Desk Lamp",           category: "home",        priceUSD: 34.50,  rating: 3.8, inStock: false, tags: ["lighting"] },
  { id: "p4", name: "TypeScript Handbook", category: "books",       priceUSD: 19.99,  rating: 4.9, inStock: true,  tags: ["programming", "typescript"] },
  { id: "p5", name: "Yoga Mat",            category: "sports",      priceUSD: 24.99,  rating: 4.0, inStock: true,  tags: ["fitness", "yoga"] },
  { id: "p6", name: "4K Monitor",          category: "electronics", priceUSD: 349.00, rating: 4.7, inStock: false, tags: ["display", "wireless"] },
  { id: "p7", name: "Linen Shirt",         category: "clothing",    priceUSD: 49.99,  rating: 3.5, inStock: true,  tags: ["summer", "casual"] },
  { id: "p8", name: "Coffee Maker",        category: "home",        priceUSD: 79.95,  rating: 4.1, inStock: true,  tags: ["kitchen", "appliance"] },
  // invalid entries — should be silently skipped
  { id: "p9", name: "Ghost",              category: "unknown-cat",  priceUSD: 10,     rating: 3,   inStock: true,  tags: [] },   // bad category
  { id: "p10", name: "Expensive Thing",   category: "electronics",  priceUSD: -5,     rating: 3,   inStock: true,  tags: [] },   // negative price
  null,
  "not an object",
  { id: "p11", name: "No Rating",         category: "books",        priceUSD: 12.99,  rating: 6,   inStock: true,  tags: [] },   // rating > 5
  42,
];

// -----------------------------------------------------------
// Test 1: parseProducts filters out invalid entries
// -----------------------------------------------------------
const parsed = parseProducts(RAW_CATALOG);
console.assert(
  parsed.length === 8,
  `T1 FAIL: expected 8 valid products, got ${parsed.length}`
);
console.log(`T1 PASS: parseProducts returned ${parsed.length} valid products`);

// -----------------------------------------------------------
// Test 2: getPriceBucket maps prices correctly
// -----------------------------------------------------------
const bucketChecks: Array<[number, string]> = [
  [0,      "0-25"],
  [24.99,  "0-25"],
  [25,     "25-50"],
  [49.99,  "25-50"],
  [50,     "50-100"],
  [99.99,  "50-100"],
  [100,    "100-250"],
  [249.99, "100-250"],
  [250,    "250+"],
  [999,    "250+"],
];
let bucketPass = true;
for (const [price, expected] of bucketChecks) {
  const got = getPriceBucket(price);
  if (got !== expected) {
    console.assert(false, `T2 FAIL: getPriceBucket(${price}) = "${got}", expected "${expected}"`);
    bucketPass = false;
  }
}
if (bucketPass) console.log("T2 PASS: getPriceBucket maps all prices correctly");

// -----------------------------------------------------------
// Test 3: applyFilter — in-stock electronics with rating ≥ 4.4
// -----------------------------------------------------------
const filter1: CatalogFilter = {
  categories: ["electronics"],
  minRating: 4.4,
  inStockOnly: true,
};
const filtered1 = applyFilter(parsed, filter1);
// Only "Wireless Headphones" (4.5, in-stock); "4K Monitor" (4.7) is out-of-stock
console.assert(
  filtered1.length === 1 && filtered1[0].id === "p1",
  `T3 FAIL: expected [p1], got [${filtered1.map(p => p.id).join(", ")}]`
);
console.log(`T3 PASS: applyFilter returned correct in-stock electronics with rating ≥ 4.4`);

// -----------------------------------------------------------
// Test 4: applyFilter — price range + tags (ALL match)
// -----------------------------------------------------------
const filter2: CatalogFilter = {
  priceRange: { minUSD: 20, maxUSD: 100 },
  tags: ["wireless"],
};
const filtered2 = applyFilter(parsed, filter2);
// "Wireless Headphones" (89.99, has "wireless") ✓
// "4K Monitor" (349.00, has "wireless") ✗ — price too high
console.assert(
  filtered2.length === 1 && filtered2[0].id === "p1",
  `T4 FAIL: expected [p1], got [${filtered2.map(p => p.id).join(", ")}]`
);
console.log(`T4 PASS: applyFilter price-range + tags filter correct`);

// -----------------------------------------------------------
// Test 5: searchCatalog — full pipeline, facets are correct
// -----------------------------------------------------------
const filter3: CatalogFilter = {
  categories: ["sports", "home"],
};
const result = searchCatalog(RAW_CATALOG, filter3);
// sports: p2 (Running Shoes), p5 (Yoga Mat)
// home:   p3 (Desk Lamp), p8 (Coffee Maker)
console.assert(
  result.totalCount === 4,
  `T5a FAIL: expected totalCount 4, got ${result.totalCount}`
);
console.assert(
  result.facets.byCategory["sports"] === 2,
  `T5b FAIL: expected sports facet = 2, got ${result.facets.byCategory["sports"]}`
);
console.assert(
  result.facets.byCategory["home"] === 2,
  `T5c FAIL: expected home facet = 2, got ${result.facets.byCategory["home"]}`
);
console.assert(
  result.facets.inStockCount === 3,
  `T5d FAIL: expected inStockCount = 3, got ${result.facets.inStockCount}`
);
console.assert(
  result.facets.outOfStockCount === 1,
  `T5e FAIL: expected outOfStockCount = 1, got ${result.facets.outOfStockCount}`
);
console.log("T5 PASS: searchCatalog full pipeline + facets correct");
