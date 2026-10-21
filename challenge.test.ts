
import { applyFilter, runQuery } from "./challenge";
import type {
  FilterClause,
  Query,
  AggregateClause,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────
type Product = {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  rating: number;
};

const products: Product[] = [
  { id: 1, name: "Wireless Mouse",    price: 29,  inStock: true,  rating: 4 },
  { id: 2, name: "Mechanical Keyboard", price: 89, inStock: true, rating: 5 },
  { id: 3, name: "USB-C Hub",         price: 45,  inStock: false, rating: 3 },
  { id: 4, name: "Monitor Stand",     price: 35,  inStock: true,  rating: 4 },
  { id: 5, name: "Webcam HD",         price: 65,  inStock: false, rating: 4 },
  { id: 6, name: "Laptop Sleeve",     price: 19,  inStock: true,  rating: 3 },
];

// ── Test 1: applyFilter — "eq" on a boolean field ─────────────
const inStockFilter: FilterClause<Product> = {
  field: "inStock",
  op: "eq",
  value: true,
};
const inStockProducts = products.filter((p) => applyFilter(p, inStockFilter));
console.assert(
  inStockProducts.length === 4,
  `Test 1 FAILED: expected 4 in-stock products, got ${inStockProducts.length}`
);
console.log("Test 1 passed:", inStockProducts.map((p) => p.name));

// ── Test 2: applyFilter — "contains" on a string field ────────
const nameFilter: FilterClause<Product> = {
  field: "name",
  op: "contains",
  value: "key",  // should match "Mechanical Keyboard" (case-insensitive)
};
const keyMatches = products.filter((p) => applyFilter(p, nameFilter));
console.assert(
  keyMatches.length === 1 && keyMatches[0].name === "Mechanical Keyboard",
  `Test 2 FAILED: expected 1 match for "key", got ${keyMatches.length}`
);
console.log("Test 2 passed:", keyMatches.map((p) => p.name));

// ── Test 3: runQuery — filter + sort + limit ───────────────────
const q1: Query<Product> = {
  filters: [
    { field: "inStock", op: "eq",  value: true },
    { field: "price",   op: "lte", value: 50   },
  ],
  sort:  { field: "price", direction: "asc" },
  limit: 2,
};
const r1 = runQuery(products, q1);
console.assert(
  r1.totalMatched === 3,
  `Test 3a FAILED: totalMatched should be 3 (Mouse $29, Stand $35, Sleeve $19), got ${r1.totalMatched}`
);
console.assert(
  r1.rows.length === 2,
  `Test 3b FAILED: rows.length should be 2 after limit, got ${r1.rows.length}`
);
console.assert(
  r1.rows[0].name === "Laptop Sleeve" && r1.rows[1].name === "Wireless Mouse",
  `Test 3c FAILED: expected Laptop Sleeve then Wireless Mouse (sorted by price asc), got ${r1.rows.map((p) => p.name)}`
);
console.log("Test 3 passed:", r1.rows.map((p) => p.name), "totalMatched:", r1.totalMatched);

// ── Test 4: runQuery — aggregations ───────────────────────────
const q2: Query<Product> = {
  filters: [{ field: "inStock", op: "eq", value: true }],
  aggregations: [
    { op: "sum",   field: "price",  alias: "totalRevenue" },
    { op: "avg",   field: "rating", alias: "avgRating"    },
    { op: "count", field: "price",  alias: "numProducts"  },
  ],
};
const r2 = runQuery(products, q2);
console.assert(
  r2.rows.length === 0,
  `Test 4a FAILED: rows must be [] in aggregation mode, got ${r2.rows.length}`
);
// In-stock products: Mouse $29 r4, Keyboard $89 r5, Stand $35 r4, Sleeve $19 r3
// sum(price) = 172, avg(rating) = (4+5+4+3)/4 = 4, count = 4
console.assert(
  r2.aggregates["totalRevenue"] === 172,
  `Test 4b FAILED: totalRevenue should be 172, got ${r2.aggregates["totalRevenue"]}`
);
console.assert(
  r2.aggregates["avgRating"] === 4,
  `Test 4c FAILED: avgRating should be 4, got ${r2.aggregates["avgRating"]}`
);
console.assert(
  r2.aggregates["numProducts"] === 4,
  `Test 4d FAILED: count should be 4, got ${r2.aggregates["numProducts"]}`
);
console.log("Test 4 passed:", r2.aggregates);

// ── Test 5: runQuery — no query options returns all rows ───────
const r3 = runQuery(products, {});
console.assert(
  r3.rows.length === 6 && r3.totalMatched === 6,
  `Test 5 FAILED: expected all 6 rows, got ${r3.rows.length}`
);
console.log("Test 5 passed: all", r3.rows.length, "products returned");

console.log("\n✅ All tests passed!");
