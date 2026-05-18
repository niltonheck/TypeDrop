// challenge.test.ts
import { parseProduct, buildInventoryReport } from "./challenge";

// ── Mock raw data ────────────────────────────────────────────
const validElectronics = [
  { id: "e1", name: "Laptop",     category: "Electronics", price: 999.99, stock: 10, available: true  },
  { id: "e2", name: "Headphones", category: "Electronics", price: 49.99,  stock: 0,  available: false },
  { id: "e3", name: "Webcam",     category: "Electronics", price: 79.99,  stock: 5,  available: true  },
];

const validBooks = [
  { id: "b1", name: "TypeScript Deep Dive", category: "Books", price: 29.99, stock: 100, available: true },
  { id: "b2", name: "Clean Code",           category: "Books", price: 34.99, stock: 42,  available: true },
];

const invalidEntries: unknown[] = [
  null,
  { id: "x1", name: "Ghost",    category: "Electronics", price: -5,   stock: 3,    available: true  }, // price <= 0
  { id: "x2", name: "Phantom",  category: "Books",       price: 9.99, stock: -1,   available: false }, // stock < 0
  { id: "x3", name: "Specter",  category: "Tools",       price: 9.99, stock: 1.5,  available: true  }, // stock not integer
  { id: "x4",                   category: "Tools",       price: 9.99, stock: 2,    available: true  }, // missing name
];

const allRaw: unknown[] = [...validElectronics, ...validBooks, ...invalidEntries];

// ── parseProduct unit checks ─────────────────────────────────

// Valid product parses successfully
const parsed = parseProduct(validElectronics[0]);
console.assert(parsed.ok === true, "FAIL: valid product should parse ok");
if (parsed.ok) {
  console.assert(parsed.value.id === "e1",          "FAIL: id should be 'e1'");
  console.assert(parsed.value.price === 999.99,     "FAIL: price should be 999.99");
}

// Negative price is rejected
const badPrice = parseProduct({ id: "z1", name: "Bad", category: "X", price: 0, stock: 1, available: true });
console.assert(badPrice.ok === false, "FAIL: price 0 should be rejected");

// Non-integer stock is rejected
const badStock = parseProduct({ id: "z2", name: "Bad", category: "X", price: 5, stock: 2.7, available: true });
console.assert(badStock.ok === false, "FAIL: fractional stock should be rejected");

// ── buildInventoryReport integration checks ──────────────────
const report = buildInventoryReport(allRaw);

// Correct number of parsed products (5 valid) and parse errors (5 invalid)
console.assert(report.totalProducts === 5,      `FAIL: expected 5 totalProducts, got ${report.totalProducts}`);
console.assert(report.parseErrors.length === 5, `FAIL: expected 5 parseErrors, got ${report.parseErrors.length}`);

// Exactly 2 categories, sorted alphabetically
console.assert(report.summaries.length === 2,                "FAIL: expected 2 category summaries");
console.assert(report.summaries[0].category === "Books",     "FAIL: first category should be 'Books'");
console.assert(report.summaries[1].category === "Electronics","FAIL: second category should be 'Electronics'");

// Books summary
const books = report.summaries[0];
console.assert(books.productCount    === 2,                                         "FAIL: Books productCount should be 2");
console.assert(books.totalStock      === 142,                                       "FAIL: Books totalStock should be 142");
console.assert(books.availableCount  === 2,                                         "FAIL: Books availableCount should be 2");
console.assert(Math.abs(books.totalValue - (29.99*100 + 34.99*42)) < 0.001,        "FAIL: Books totalValue mismatch");

// Electronics summary
const elec = report.summaries[1];
console.assert(elec.productCount    === 3,                                          "FAIL: Electronics productCount should be 3");
console.assert(elec.totalStock      === 15,                                         "FAIL: Electronics totalStock should be 15");
console.assert(elec.availableCount  === 2,                                          "FAIL: Electronics availableCount should be 2");
console.assert(Math.abs(elec.totalValue - (999.99*10 + 49.99*0 + 79.99*5)) < 0.001,"FAIL: Electronics totalValue mismatch");

console.log("All tests passed! ✅");
