// ============================================================
// challenge.test.ts
// ============================================================
import { applyDiscount, processCart } from "./challenge";
import type { CartResult, Discount } from "./challenge";

// ── applyDiscount ─────────────────────────────────────────────

const pctDiscount: Discount = { kind: "percentage", rate: 0.2 };
console.assert(
  applyDiscount(50, pctDiscount) === 40,
  "FAIL: 20% off $50 should be $40"
);

const fixedDiscount: Discount = { kind: "fixed", amount: 5 };
console.assert(
  applyDiscount(8, fixedDiscount) === 3,
  "FAIL: $5 off $8 should be $3"
);

// Fixed discount larger than price should clamp to 0
console.assert(
  applyDiscount(3, fixedDiscount) === 0,
  "FAIL: $5 off $3 should clamp to $0"
);

// No discount
console.assert(
  applyDiscount(100, undefined) === 100,
  "FAIL: no discount should return original price"
);

// ── processCart — invalid payload ─────────────────────────────

const notArray = processCart({ items: [] });
console.assert(
  notArray.kind === "error" && notArray.error.kind === "invalid_payload",
  "FAIL: non-array payload should produce invalid_payload error"
);

// ── processCart — invalid item ────────────────────────────────

const badItem = processCart([
  { id: "a1", name: "Widget", quantity: -1, unitPrice: 10 },
]);
console.assert(
  badItem.kind === "error" && badItem.error.kind === "invalid_item",
  "FAIL: negative quantity should produce invalid_item error"
);

const missingName = processCart([
  { id: "a2", quantity: 1, unitPrice: 5 },
]);
console.assert(
  missingName.kind === "error" && missingName.error.kind === "invalid_item",
  "FAIL: missing name should produce invalid_item error"
);

// ── processCart — success path ────────────────────────────────

const validCart = processCart([
  { id: "p1", name: "Book", quantity: 2, unitPrice: 15 },
  {
    id: "p2",
    name: "Pen",
    quantity: 5,
    unitPrice: 4,
    discount: { kind: "fixed", amount: 1 },
  },
  {
    id: "p3",
    name: "Notebook",
    quantity: 1,
    unitPrice: 20,
    discount: { kind: "percentage", rate: 0.25 },
  },
]);

console.assert(validCart.kind === "success", "FAIL: valid cart should succeed");

if (validCart.kind === "success") {
  const { summary } = validCart;

  // Book: 2 × $15 = $30
  // Pen:  5 × ($4 - $1) = $15
  // Notebook: 1 × ($20 × 0.75) = $15
  // Subtotal: $60
  console.assert(
    summary.subtotal === 60,
    `FAIL: subtotal should be 60, got ${summary.subtotal}`
  );

  console.assert(
    summary.totalItems === 8,
    `FAIL: totalItems should be 8, got ${summary.totalItems}`
  );

  console.assert(
    summary.appliedDiscountCount === 2,
    `FAIL: appliedDiscountCount should be 2, got ${summary.appliedDiscountCount}`
  );

  console.assert(
    summary.lines.length === 3,
    `FAIL: should have 3 lines, got ${summary.lines.length}`
  );
}

console.log("All assertions passed ✅");
