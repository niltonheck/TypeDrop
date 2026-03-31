// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateProduct,
  filterProducts,
  sortProducts,
  processCatalog,
  type RawProduct,
  type Product,
  type FilterOptions,
  type SortOptions,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const rawValid: RawProduct[] = [
  { id: "p1", name: "TypeScript Handbook", category: "books",       priceUsd: 29.99, inStock: true  },
  { id: "p2", name: "Wireless Headphones", category: "electronics", priceUsd: 89.99, inStock: true  },
  { id: "p3", name: "Winter Jacket",       category: "clothing",    priceUsd: 149.99,inStock: false },
  { id: "p4", name: "Action Figure",       category: "toys",        priceUsd: 14.99, inStock: true  },
  { id: "p5", name: "Organic Coffee",      category: "food",        priceUsd: 12.49, inStock: true  },
  { id: "p6", name: "Bluetooth Speaker",   category: "electronics", priceUsd: 59.99, inStock: false },
];

const rawInvalid: RawProduct[] = [
  { id: "",    name: "No ID",        category: "books",   priceUsd: 10,    inStock: true  }, // empty id
  { id: "p8",  name: 42,             category: "food",    priceUsd: 5,     inStock: true  }, // name not string
  { id: "p9",  name: "Bad Category", category: "weapons", priceUsd: 99,    inStock: true  }, // bad category
  { id: "p10", name: "Negative",     category: "toys",    priceUsd: -1,    inStock: true  }, // negative price
  { id: "p11", name: "Bad Stock",    category: "clothing",priceUsd: 20,    inStock: "yes" }, // inStock not boolean
];

// ------------------------------------------------------------------
// Test 1 — validateProduct: valid input produces Ok
// ------------------------------------------------------------------
const validResult = validateProduct(rawValid[0]);
console.assert(
  validResult.ok === true,
  "Test 1 FAILED: valid raw product should pass validation"
);
if (validResult.ok) {
  console.assert(
    validResult.value.id === "p1" &&
      validResult.value.category === "books" &&
      validResult.value.priceUsd === 29.99,
    "Test 1b FAILED: validated product fields should match raw input"
  );
}

// ------------------------------------------------------------------
// Test 2 — validateProduct: each invalid raw triggers correct field error
// ------------------------------------------------------------------
const expectedFields = ["id", "name", "category", "priceUsd", "inStock"];
rawInvalid.forEach((raw, i) => {
  const result = validateProduct(raw);
  console.assert(
    result.ok === false,
    `Test 2.${i + 1} FAILED: invalid product #${i + 1} should fail validation`
  );
  if (!result.ok) {
    console.assert(
      result.field === expectedFields[i],
      `Test 2.${i + 1}b FAILED: expected failing field "${expectedFields[i]}", got "${result.field}"`
    );
  }
});

// ------------------------------------------------------------------
// Test 3 — filterProducts: combined category + price + inStock filter
// ------------------------------------------------------------------
const validProducts: Product[] = rawValid
  .map((r) => validateProduct(r))
  .filter((r): r is ReturnType<typeof validateProduct> & { ok: true } => r.ok)
  .map((r) => r.value);

const filterOpts: FilterOptions = {
  categories: ["electronics", "books"],
  maxPrice: 90,
  onlyInStock: true,
};
const filtered = filterProducts(validProducts, filterOpts);
console.assert(
  filtered.length === 2,
  `Test 3 FAILED: expected 2 products after filtering, got ${filtered.length}`
);
console.assert(
  filtered.every((p) => ["electronics", "books"].includes(p.category)),
  "Test 3b FAILED: filtered products must only contain electronics or books"
);
console.assert(
  filtered.every((p) => p.inStock),
  "Test 3c FAILED: all filtered products must be inStock"
);

// ------------------------------------------------------------------
// Test 4 — sortProducts: sort by priceUsd ascending
// ------------------------------------------------------------------
const sortOpts: SortOptions = { field: "priceUsd", direction: "asc" };
const sorted = sortProducts(validProducts, sortOpts);
console.assert(
  sorted[0].id === "p5" && sorted[sorted.length - 1].id === "p3",
  `Test 4 FAILED: expected cheapest=p5 and most expensive=p3, got first=${sorted[0].id} last=${sorted[sorted.length - 1].id}`
);

// ------------------------------------------------------------------
// Test 5 — processCatalog: full pipeline with mixed valid/invalid input
// ------------------------------------------------------------------
const allRaw: RawProduct[] = [...rawValid, ...rawInvalid];
const result = processCatalog(
  allRaw,
  { onlyInStock: true, minPrice: 10 },
  { field: "name", direction: "asc" }
);
console.assert(
  result.errors.length === rawInvalid.length,
  `Test 5 FAILED: expected ${rawInvalid.length} errors, got ${result.errors.length}`
);
console.assert(
  result.products.every((p) => p.inStock && p.priceUsd >= 10),
  "Test 5b FAILED: all returned products must be inStock and priceUsd >= 10"
);
// Verify name-ascending order
const names = result.products.map((p) => p.name);
const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
console.assert(
  JSON.stringify(names) === JSON.stringify(sortedNames),
  "Test 5c FAILED: products must be sorted by name ascending"
);

console.log("All tests completed — check for any FAILED assertions above.");
