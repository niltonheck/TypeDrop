// challenge.test.ts
import {
  toSku,
  aggregateInventory,
  topCategories,
  type InventoryItem,
  type InventorySummary,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────────────────────
const items: InventoryItem[] = [
  { sku: toSku("SKU-001"), name: "Widget A",   category: "Widgets", priceUsd: 9.99,  stock: 100 },
  { sku: toSku("SKU-002"), name: "Widget B",   category: "Widgets", priceUsd: 4.99,  stock: 250 },
  { sku: toSku("SKU-003"), name: "Gadget X",   category: "Gadgets", priceUsd: 49.99, stock: 30  },
  { sku: toSku("SKU-004"), name: "Gadget Y",   category: "Gadgets", priceUsd: 29.99, stock: 80  },
  { sku: toSku("SKU-005"), name: "Doohickey Z",category: "Misc",    priceUsd: 1.99,  stock: 500 },
];

const summary: InventorySummary = aggregateInventory(items);

// ── Test 1: empty input returns empty object ──────────────────────────────────
const emptySummary = aggregateInventory([]);
console.assert(
  Object.keys(emptySummary).length === 0,
  "FAIL Test 1: empty input should return {}"
);
console.log("Test 1 passed: empty input → {}");

// ── Test 2: correct category count ───────────────────────────────────────────
console.assert(
  Object.keys(summary).length === 3,
  "FAIL Test 2: expected 3 categories (Widgets, Gadgets, Misc)"
);
console.log("Test 2 passed: 3 categories found");

// ── Test 3: Widgets summary values ───────────────────────────────────────────
const widgets = summary["Widgets"];
console.assert(widgets.totalItems === 2,        "FAIL Test 3a: Widgets totalItems should be 2");
console.assert(widgets.totalStock === 350,      "FAIL Test 3b: Widgets totalStock should be 350");
// totalValueUsd = (9.99*100) + (4.99*250) = 999 + 1247.5 = 2246.5
console.assert(
  Math.abs(widgets.totalValueUsd - 2246.5) < 0.001,
  "FAIL Test 3c: Widgets totalValueUsd should be ~2246.5"
);
// cheapest is SKU-002 (4.99), mostStocked is SKU-002 (250)
console.assert(widgets.cheapestSku    === toSku("SKU-002"), "FAIL Test 3d: cheapestSku should be SKU-002");
console.assert(widgets.mostStockedSku === toSku("SKU-002"), "FAIL Test 3e: mostStockedSku should be SKU-002");
console.log("Test 3 passed: Widgets summary is correct");

// ── Test 4: Gadgets summary values ───────────────────────────────────────────
const gadgets = summary["Gadgets"];
// cheapest is SKU-004 (29.99), mostStocked is SKU-004 (80)
console.assert(gadgets.cheapestSku    === toSku("SKU-004"), "FAIL Test 4a: cheapestSku should be SKU-004");
console.assert(gadgets.mostStockedSku === toSku("SKU-004"), "FAIL Test 4b: mostStockedSku should be SKU-004");
// totalValueUsd = (49.99*30) + (29.99*80) = 1499.7 + 2399.2 = 3898.9
console.assert(
  Math.abs(gadgets.totalValueUsd - 3898.9) < 0.01,
  "FAIL Test 4c: Gadgets totalValueUsd should be ~3898.9"
);
console.log("Test 4 passed: Gadgets summary is correct");

// ── Test 5: topCategories ordering ───────────────────────────────────────────
// Gadgets(~3898.9) > Widgets(~2246.5) > Misc(~995)
const top2 = topCategories(summary, 2);
console.assert(
  top2[0] === "Gadgets" && top2[1] === "Widgets",
  `FAIL Test 5a: top 2 should be ["Gadgets","Widgets"], got ${JSON.stringify(top2)}`
);
const topAll = topCategories(summary, 99);
console.assert(
  topAll.length === 3,
  "FAIL Test 5b: topCategories(summary, 99) should return all 3 categories"
);
console.log("Test 5 passed: topCategories ordering is correct");

console.log("\n✅ All tests passed!");
