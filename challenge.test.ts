import { groupAndSummarise, topGroup } from "./challenge";
import type { SaleRecord, Category, Region } from "./challenge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const records: SaleRecord[] = [
  { id: "s1", category: "electronics", region: "north", amount: 15000, quantity: 3 },
  { id: "s2", category: "electronics", region: "south", amount: 8000,  quantity: 2 },
  { id: "s3", category: "clothing",    region: "north", amount: 4000,  quantity: 5 },
  { id: "s4", category: "books",       region: "east",  amount: 1200,  quantity: 4 },
  { id: "s5", category: "clothing",    region: "west",  amount: 6000,  quantity: 8 },
  { id: "s6", category: "home",        region: "south", amount: 9500,  quantity: 1 },
  { id: "s7", category: "books",       region: "north", amount: 800,   quantity: 2 },
];

const ALL_CATEGORIES: ReadonlyArray<Category> = ["electronics", "clothing", "books", "home"];
const ALL_REGIONS:    ReadonlyArray<Region>   = ["north", "south", "east", "west"];

// ─── Tests ────────────────────────────────────────────────────────────────────

// Test 1 – group by category: electronics totalAmount
const byCat = groupAndSummarise(records, "category", ALL_CATEGORIES);
console.assert(
  byCat.electronics.totalAmount === 23000,
  `T1 FAIL: expected electronics.totalAmount=23000, got ${byCat.electronics.totalAmount}`,
);

// Test 2 – group by category: clothing count & quantity
console.assert(
  byCat.clothing.count === 2 && byCat.clothing.totalQuantity === 13,
  `T2 FAIL: expected clothing count=2 qty=13, got count=${byCat.clothing.count} qty=${byCat.clothing.totalQuantity}`,
);

// Test 3 – zero-entry groups are present with all-zero summaries
console.assert(
  byCat.home.count === 1 && byCat.books.totalAmount === 2000,
  `T3 FAIL: expected home.count=1 and books.totalAmount=2000, got home.count=${byCat.home.count} books.totalAmount=${byCat.books.totalAmount}`,
);

// Test 4 – group by region: west has zero records except s5
const byRegion = groupAndSummarise(records, "region", ALL_REGIONS);
console.assert(
  byRegion.west.count === 1 && byRegion.west.totalAmount === 6000,
  `T4 FAIL: expected west count=1 amount=6000, got count=${byRegion.west.count} amount=${byRegion.west.totalAmount}`,
);

// Test 5 – topGroup returns the category with highest totalAmount
const best = topGroup(byCat);
console.assert(
  best === "electronics",
  `T5 FAIL: expected topGroup="electronics", got "${best}"`,
);

console.log("All tests passed! ✅");
