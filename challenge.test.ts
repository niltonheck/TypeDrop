// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseLineItem,
  validateDiscount,
  buildOrderSummary,
  Result,
  LineItem,
  CartValidationError,
} from "./challenge";

// ── helpers ───────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok === true;
}
function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return r.ok === false;
}

// ── mock data ─────────────────────────────────────────────────
const validRawItems: unknown[] = [
  { productId: "p1", name: "TypeScript Handbook", category: "books",       unitPrice: 2500, quantity: 2 },
  { productId: "p2", name: "Mechanical Keyboard", category: "electronics", unitPrice: 15000, quantity: 1 },
  { productId: "p3", name: "Cotton T-Shirt",       category: "clothing",   unitPrice: 3000, quantity: 3 },
];

const validRawDiscounts: unknown[] = [
  { kind: "percentage", percent: 10, category: "electronics" },
  { kind: "fixed", amountOff: 500, minimumSubtotal: 1000 },
];

// ── Test 1: parseLineItem — valid item ─────────────────────────
const r1 = parseLineItem(validRawItems[0], 0);
assert(isOk(r1), "parseLineItem accepts a valid item");
if (isOk(r1)) {
  assert(
    r1.value.subtotal === 5000,
    "parseLineItem computes subtotal = unitPrice * quantity (2500 * 2 = 5000)"
  );
}

// ── Test 2: parseLineItem — invalid category ──────────────────
const r2 = parseLineItem(
  { productId: "p9", name: "Mystery", category: "toys", unitPrice: 100, quantity: 1 },
  2
);
assert(isErr(r2), "parseLineItem rejects unknown category");
if (isErr(r2)) {
  assert(r2.error.kind === "invalid_item", "Error kind is 'invalid_item'");
}

// ── Test 3: validateDiscount — valid percentage discount ──────
const r3 = validateDiscount({ kind: "percentage", percent: 20 }, 0);
assert(isOk(r3), "validateDiscount accepts a valid percentage discount");

// ── Test 4: validateDiscount — invalid fixed discount ─────────
const r4 = validateDiscount({ kind: "fixed", amountOff: -50, minimumSubtotal: 0 }, 0);
assert(isErr(r4), "validateDiscount rejects negative amountOff");

// ── Test 5: buildOrderSummary — full happy path ───────────────
const r5 = buildOrderSummary(validRawItems, validRawDiscounts);
assert(isOk(r5), "buildOrderSummary succeeds with valid items and discounts");
if (isOk(r5)) {
  const s = r5.value;
  // subtotal: 5000 + 15000 + 9000 = 29000
  assert(s.subtotal === 29000, `subtotal is 29000 (got ${s.subtotal})`);
  // percentage 10% on electronics only: 10% of 15000 = 1500
  // fixed 500 off (minimumSubtotal 1000, met): 500
  // totalDiscount = 2000
  assert(s.totalDiscount === 2000, `totalDiscount is 2000 (got ${s.totalDiscount})`);
  // grandTotal = 29000 - 2000 = 27000
  assert(s.grandTotal === 27000, `grandTotal is 27000 (got ${s.grandTotal})`);
  // 3 distinct categories
  assert(s.categoryCount === 3, `categoryCount is 3 (got ${s.categoryCount})`);
  // topCategory: clothing (9000) > electronics (15000)? No — electronics wins
  assert(s.topCategory === "electronics", `topCategory is 'electronics' (got ${s.topCategory})`);
}

// ── Test 6: buildOrderSummary — empty cart ────────────────────
const r6 = buildOrderSummary([], []);
assert(isErr(r6), "buildOrderSummary returns error for empty cart");
if (isErr(r6)) {
  assert(r6.error.kind === "empty_cart", "Error kind is 'empty_cart'");
}
