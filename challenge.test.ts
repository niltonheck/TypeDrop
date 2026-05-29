// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateCartItem,
  buildLineItems,
  applyDiscounts,
  buildOrderSummary,
  type ValidatedCartItem,
  type DiscountRule,
} from "./challenge";

// --- helpers ---------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

function assertThrows(fn: () => unknown, message: string): void {
  try {
    fn();
    console.error(`  ✗ FAIL (no throw): ${message}`);
    process.exitCode = 1;
  } catch {
    console.log(`  ✓ PASS (threw): ${message}`);
  }
}

// --- mock data -------------------------------------------------
const rawValid = {
  id: "item-1",
  name: "TypeScript Handbook",
  category: "books",
  priceInCents: 1999,
  quantity: 2,
};

const rawElectronics = {
  id: "item-2",
  name: "USB-C Hub",
  category: "electronics",
  priceInCents: 4999,
  quantity: 4,
};

// --- Test 1: validateCartItem accepts valid input ---------------
console.log("\nTest 1 — validateCartItem: valid input");
const book = validateCartItem(rawValid) as ValidatedCartItem;
assert(book.id === "item-1", "id is preserved");
assert(book.name === "TypeScript Handbook", "name is preserved");
assert(book.priceInCents === 1999, "priceInCents is preserved");
assert(book.quantity === 2, "quantity is preserved");

// --- Test 2: validateCartItem rejects bad input ----------------
console.log("\nTest 2 — validateCartItem: invalid inputs");
assertThrows(() => validateCartItem(null), "null is rejected");
assertThrows(() => validateCartItem({ ...rawValid, category: "music" }), "unknown category rejected");
assertThrows(() => validateCartItem({ ...rawValid, priceInCents: 0 }), "zero price rejected");
assertThrows(() => validateCartItem({ ...rawValid, quantity: 0 }), "zero quantity rejected");
assertThrows(() => validateCartItem({ ...rawValid, id: "" }), "empty id rejected");

// --- Test 3: buildLineItems computes totals --------------------
console.log("\nTest 3 — buildLineItems");
const hub = validateCartItem(rawElectronics) as ValidatedCartItem;
const lines = buildLineItems([book, hub]);
assert(lines.length === 2, "two line items returned");
assert(lines[0].lineTotalInCents === 1999 * 2, "book line total = 3998");
assert(lines[1].lineTotalInCents === 4999 * 4, "hub line total = 19996");

// --- Test 4: applyDiscounts -----------------------------------
console.log("\nTest 4 — applyDiscounts");
const subtotal = 1999 * 2 + 4999 * 4; // 3998 + 19996 = 23994
const rules: DiscountRule[] = [
  { kind: "flat", amountInCents: 500 },
  { kind: "percentage", percent: 10 },
  { kind: "bogo", category: "electronics" },
];
const discount = applyDiscounts(subtotal, [book, hub], rules);
// flat: 500
// percentage: Math.floor(23994 * 10 / 100) = 2399
// bogo electronics: Math.floor(19996 / 2) = 9998
// total discount = 500 + 2399 + 9998 = 12897
assert(discount === 12897, `discount = 12897 (got ${discount})`);

// Edge: discount cannot exceed subtotal
const bigFlatRules: DiscountRule[] = [{ kind: "flat", amountInCents: 999999 }];
const clampedDiscount = applyDiscounts(100, [book], bigFlatRules);
assert(clampedDiscount === 100, "discount clamped to subtotal");

// --- Test 5: buildOrderSummary --------------------------------
console.log("\nTest 5 — buildOrderSummary");
const summary = buildOrderSummary([book, hub], rules);
assert(summary.subtotalInCents === 23994, `subtotal = 23994 (got ${summary.subtotalInCents})`);
assert(summary.discountInCents === 12897, `discountInCents = 12897 (got ${summary.discountInCents})`);
assert(summary.totalInCents === 23994 - 12897, `total = 11097 (got ${summary.totalInCents})`);
assert(summary.itemCount === 6, `itemCount = 6 (got ${summary.itemCount})`);
assert(summary.lineItems.length === 2, "two line items in summary");

// total can never go negative
const hugeDiscount: DiscountRule[] = [{ kind: "percentage", percent: 100 }, { kind: "flat", amountInCents: 9999 }];
const zeroSummary = buildOrderSummary([book], hugeDiscount);
assert(zeroSummary.totalInCents === 0, "total floored at 0");

console.log("\nDone.\n");
