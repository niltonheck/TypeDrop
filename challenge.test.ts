// challenge.test.ts
import {
  isCategory,
  isStockStatus,
  parseProduct,
  filterInventory,
  type Product,
  type InventorySummary,
} from "./challenge";

// ─── Mock data ───────────────────────────────────────────────────────────────

const validRaw: unknown[] = [
  {
    id: "p1",
    name: "Wireless Headphones",
    category: "electronics",
    priceUsd: 79.99,
    stockStatus: "in_stock",
    rating: 4.5,
    tags: ["audio", "wireless"],
  },
  {
    id: "p2",
    name: "Running Shoes",
    category: "sports",
    priceUsd: 120.0,
    stockStatus: "low_stock",
    rating: 4.8,
    tags: ["running", "outdoor"],
  },
  {
    id: "p3",
    name: "TypeScript Handbook",
    category: "books",
    priceUsd: 35.0,
    stockStatus: "in_stock",
    rating: 4.9,
    tags: ["programming", "typescript"],
  },
  {
    id: "p4",
    name: "Budget Earbuds",
    category: "electronics",
    priceUsd: 19.99,
    stockStatus: "out_of_stock",
    rating: 3.2,
    tags: ["audio"],
  },
  {
    id: "p5",
    name: "Yoga Mat",
    category: "sports",
    priceUsd: 45.0,
    stockStatus: "in_stock",
    rating: 4.1,
    tags: ["yoga", "fitness"],
  },
  // Invalid entries — must be silently discarded
  { id: "", name: "No ID", category: "books", priceUsd: 10, stockStatus: "in_stock", rating: 3, tags: [] },
  { id: "x1", name: "Bad Category", category: "food", priceUsd: 10, stockStatus: "in_stock", rating: 3, tags: [] },
  { id: "x2", name: "Negative Price", category: "home", priceUsd: -5, stockStatus: "in_stock", rating: 3, tags: [] },
  null,
  42,
  "a string",
];

// ─── Test 1: isCategory ───────────────────────────────────────────────────────
console.assert(isCategory("electronics") === true, "FAIL T1a: 'electronics' should be a valid Category");
console.assert(isCategory("food") === false,        "FAIL T1b: 'food' should NOT be a valid Category");
console.assert(isCategory(123) === false,            "FAIL T1c: 123 should NOT be a valid Category");

// ─── Test 2: isStockStatus ────────────────────────────────────────────────────
console.assert(isStockStatus("in_stock") === true,   "FAIL T2a: 'in_stock' should be a valid StockStatus");
console.assert(isStockStatus("sold_out") === false,  "FAIL T2b: 'sold_out' should NOT be a valid StockStatus");

// ─── Test 3: parseProduct ─────────────────────────────────────────────────────
const parsed = parseProduct(validRaw[0]);
console.assert(parsed !== null && parsed.id === "p1", "FAIL T3a: valid raw product should parse to Product with id 'p1'");
console.assert(parseProduct(null) === null,            "FAIL T3b: null should return null");
console.assert(parseProduct({ id: "x", name: "X", category: "food", priceUsd: 10, stockStatus: "in_stock", rating: 3, tags: [] }) === null,
  "FAIL T3c: invalid category 'food' should return null");

// ─── Test 4: filterInventory — category filter ────────────────────────────────
const electronicsResult: InventorySummary = filterInventory(validRaw, { category: "electronics" });
console.assert(
  electronicsResult.totalCount === 2,
  `FAIL T4: expected 2 electronics products, got ${electronicsResult.totalCount}`
);

// ─── Test 5: filterInventory — minRating + maxPriceUsd filters ────────────────
const affordableHighRated: InventorySummary = filterInventory(validRaw, {
  minRating: 4.0,
  maxPriceUsd: 50.0,
});
// Matches: TypeScript Handbook (books, 35.00, 4.9) and Yoga Mat (sports, 45.00, 4.1)
console.assert(
  affordableHighRated.totalCount === 2,
  `FAIL T5a: expected 2 affordable high-rated products, got ${affordableHighRated.totalCount}`
);
console.assert(
  affordableHighRated.categoryBreakdown["electronics"] === 0,
  `FAIL T5b: electronics breakdown should be 0, got ${affordableHighRated.categoryBreakdown["electronics"]}`
);

// ─── Test 6: filterInventory — tags filter ────────────────────────────────────
const audioResult: InventorySummary = filterInventory(validRaw, { tags: ["audio"] });
// Matches: Wireless Headphones (tags: audio, wireless) and Budget Earbuds (tags: audio)
console.assert(
  audioResult.totalCount === 2,
  `FAIL T6: expected 2 products tagged 'audio', got ${audioResult.totalCount}`
);

// ─── Test 7: categoryBreakdown always has all categories ─────────────────────
const allCategories: Array<string> = ["electronics", "clothing", "books", "home", "sports"];
const result: InventorySummary = filterInventory(validRaw, {});
console.assert(
  allCategories.every((c) => typeof result.categoryBreakdown[c] === "number"),
  "FAIL T7: categoryBreakdown must contain every Category key"
);

console.log("All tests passed! ✅");
