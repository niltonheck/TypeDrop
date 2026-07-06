// ============================================================
// challenge.test.ts — Typed Product Inventory Filter & Summarizer
// ============================================================
import {
  parseProduct,
  parseProducts,
  filterProducts,
  summarizeInventory,
  processInventory,
  type Product,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const rawValid: unknown[] = [
  { id: "p1", name: "Laptop",      category: "electronics", priceUsd: 999.99, stockCount: 5,  status: "in_stock"      },
  { id: "p2", name: "T-Shirt",     category: "clothing",    priceUsd: 19.99,  stockCount: 2,  status: "low_stock"     },
  { id: "p3", name: "Coffee Beans",category: "groceries",   priceUsd: 12.50,  stockCount: 0,  status: "out_of_stock"  },
  { id: "p4", name: "Desk Chair",  category: "furniture",   priceUsd: 249.00, stockCount: 10, status: "in_stock"      },
  { id: "p5", name: "Lego Set",    category: "toys",        priceUsd: 59.99,  stockCount: 3,  status: "low_stock"     },
];

const rawWithBad: unknown[] = [
  ...rawValid,
  { id: "",   name: "Bad Product", category: "electronics", priceUsd: 10,     stockCount: 1,  status: "in_stock"      }, // empty id
  { id: "p7", name: "Ghost Item",  category: "magic",       priceUsd: 5,      stockCount: 1,  status: "in_stock"      }, // bad category
  { id: "p8", name: "Free Thing",  category: "toys",        priceUsd: -1,     stockCount: 1,  status: "in_stock"      }, // price <= 0
  null,   // not an object
  42,     // not an object
];

// -----------------------------------------------------------
// Test 1: parseProduct — valid input returns ok: true
// -----------------------------------------------------------
const validRaw = rawValid[0];
const parsed = parseProduct(validRaw);
console.assert(parsed.ok === true, "Test 1 FAILED: valid product should parse ok");
if (parsed.ok) {
  console.assert(parsed.value.id === "p1",            "Test 1a FAILED: id mismatch");
  console.assert(parsed.value.category === "electronics", "Test 1b FAILED: category mismatch");
}

// -----------------------------------------------------------
// Test 2: parseProduct — invalid input returns ok: false
// -----------------------------------------------------------
const badCategory = parseProduct({ id: "x1", name: "Ghost", category: "magic", priceUsd: 5, stockCount: 1, status: "in_stock" });
console.assert(badCategory.ok === false, "Test 2 FAILED: bad category should fail");

const negativePrice = parseProduct({ id: "x2", name: "Free", category: "toys", priceUsd: 0, stockCount: 1, status: "in_stock" });
console.assert(negativePrice.ok === false, "Test 2b FAILED: zero price should fail");

// -----------------------------------------------------------
// Test 3: parseProducts — silently skips invalid, returns only valid
// -----------------------------------------------------------
const products = parseProducts(rawWithBad);
console.assert(products.length === 5, `Test 3 FAILED: expected 5 valid products, got ${products.length}`);

// -----------------------------------------------------------
// Test 4: filterProducts — category + maxPrice filter
// -----------------------------------------------------------
const allProducts = parseProducts(rawValid) as Product[];

const filtered = filterProducts(allProducts, {
  categories: ["electronics", "furniture"],
  maxPriceUsd: 500,
});
// Laptop (999.99) is excluded by maxPrice; Desk Chair (249.00) passes
console.assert(filtered.length === 1,                  "Test 4 FAILED: expected 1 product after filter");
console.assert(filtered[0].id === "p4",                "Test 4b FAILED: expected Desk Chair");

// -----------------------------------------------------------
// Test 5: summarizeInventory + processInventory — shape & values
// -----------------------------------------------------------
const summary = summarizeInventory(allProducts);
console.assert(summary.totalProducts === 5,            "Test 5 FAILED: totalProducts should be 5");
console.assert(summary.lowOrOutOfStock.length === 3,   "Test 5b FAILED: 3 products are low/out of stock");

// byCategory should contain all 5 categories
console.assert("electronics" in summary.byCategory,   "Test 5c FAILED: missing electronics category");
console.assert("groceries"   in summary.byCategory,   "Test 5d FAILED: missing groceries category");

// Electronics: 1 product, price 999.99, stockCount 5 → stockValue = 4999.95
const elec = summary.byCategory["electronics"];
console.assert(elec !== undefined,                     "Test 5e FAILED: electronics summary missing");
if (elec) {
  console.assert(elec.totalProducts === 1,             "Test 5f FAILED: electronics totalProducts");
  console.assert(elec.totalStock === 5,                "Test 5g FAILED: electronics totalStock");
  console.assert(
    Math.abs(elec.averagePriceUsd - 999.99) < 0.01,   "Test 5h FAILED: electronics averagePrice"
  );
  console.assert(elec.statuses["in_stock"] === 1,      "Test 5i FAILED: electronics in_stock count");
  console.assert(elec.statuses["low_stock"] === 0,     "Test 5j FAILED: electronics low_stock count");
}

// processInventory end-to-end: only groceries, any status
const grocerySummary = processInventory(rawWithBad, { categories: ["groceries"] });
console.assert(grocerySummary.totalProducts === 1,     "Test 6 FAILED: expected 1 grocery product");
console.assert(grocerySummary.lowOrOutOfStock.length === 1, "Test 6b FAILED: coffee beans should be out_of_stock");

console.log("All tests passed! ✅");
