// challenge.test.ts
import {
  filterProducts,
  sortProducts,
  filterAndSort,
  groupByCategory,
  type Product,
  type Category,
} from "./challenge";

// ---- Mock Data ----
const catalog: Product[] = [
  { id: "p1", name: "Wireless Headphones", category: "electronics", priceUsd: 89.99,  rating: 4.5, inStock: true  },
  { id: "p2", name: "Running Shoes",       category: "clothing",    priceUsd: 59.99,  rating: 4.2, inStock: true  },
  { id: "p3", name: "TypeScript Handbook", category: "books",       priceUsd: 29.99,  rating: 4.8, inStock: false },
  { id: "p4", name: "Smart LED Bulb",      category: "home",        priceUsd: 14.99,  rating: 3.9, inStock: true  },
  { id: "p5", name: "Mechanical Keyboard", category: "electronics", priceUsd: 129.99, rating: 4.7, inStock: false },
  { id: "p6", name: "Yoga Mat",            category: "home",        priceUsd: 34.99,  rating: 4.1, inStock: true  },
  { id: "p7", name: "Mystery Novel",       category: "books",       priceUsd: 12.99,  rating: 3.6, inStock: true  },
  { id: "p8", name: "Denim Jacket",        category: "clothing",    priceUsd: 74.99,  rating: 4.0, inStock: true  },
];

// ---- Test 1: filterProducts — inStockOnly ----
const inStockResults = filterProducts(catalog, { inStockOnly: true });
console.assert(
  inStockResults.every((p) => p.inStock),
  "FAIL Test 1a: all results should be in stock"
);
console.assert(
  inStockResults.length === 6,
  `FAIL Test 1b: expected 6 in-stock products, got ${inStockResults.length}`
);

// ---- Test 2: filterProducts — category + price range ----
const electronicsUnder100 = filterProducts(catalog, {
  category: "electronics",
  maxPriceUsd: 100,
});
console.assert(
  electronicsUnder100.length === 1 && electronicsUnder100[0].id === "p1",
  "FAIL Test 2: only Wireless Headphones should match electronics under $100"
);

// ---- Test 3: filterProducts — minRating ----
const highRated = filterProducts(catalog, { minRating: 4.5 });
console.assert(
  highRated.length === 3,
  `FAIL Test 3: expected 3 products with rating >= 4.5, got ${highRated.length}`
);

// ---- Test 4: sortProducts — price ascending ----
const byPriceAsc = sortProducts([...catalog], { key: "priceUsd", order: "asc" });
console.assert(
  byPriceAsc[0].id === "p7" && byPriceAsc[byPriceAsc.length - 1].id === "p5",
  "FAIL Test 4: cheapest should be Mystery Novel (p7), most expensive Mechanical Keyboard (p5)"
);

// ---- Test 5: filterAndSort — in-stock books sorted by rating desc ----
const inStockBooksByRating = filterAndSort(
  catalog,
  { category: "books", inStockOnly: true },
  { key: "rating", order: "desc" }
);
console.assert(
  inStockBooksByRating.length === 1 && inStockBooksByRating[0].id === "p7",
  "FAIL Test 5: only Mystery Novel is an in-stock book"
);

// ---- Test 6: groupByCategory — all Category keys present ----
const grouped = groupByCategory(catalog);
const allCategories: Category[] = ["electronics", "clothing", "books", "home"];
console.assert(
  allCategories.every((cat) => Array.isArray(grouped[cat])),
  "FAIL Test 6a: every category key must be present and be an array"
);
console.assert(
  grouped["electronics"].length === 2 &&
    grouped["clothing"].length === 2 &&
    grouped["books"].length === 2 &&
    grouped["home"].length === 2,
  "FAIL Test 6b: each category should have exactly 2 products"
);

console.log("All tests passed! ✅");
