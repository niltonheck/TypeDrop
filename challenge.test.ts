// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateCartItem,
  calculateDiscount,
  summarizeCart,
  CartItem,
  Discount,
  OrderSummary,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  console.assert(condition, `FAIL: ${message}`);
  if (condition) console.log(`  PASS: ${message}`);
}

// ── Mock data ─────────────────────────────────────────────────

const rawValid = [
  { id: "a1", name: "TypeScript Handbook", category: "books",       priceUsd: 29.99, quantity: 2 },
  { id: "b2", name: "Wireless Headphones", category: "electronics", priceUsd: 79.99, quantity: 1 },
  { id: "c3", name: "Cotton T-Shirt",      category: "clothing",    priceUsd: 19.99, quantity: 3 },
];

const validItems: CartItem[] = rawValid as CartItem[]; // only used in unit tests

// ── Test 1: validateCartItem — valid input ────────────────────
console.log("\n── Test 1: validateCartItem (valid) ──");
const r1 = validateCartItem(rawValid[0]);
assert(r1.ok === true, "valid item returns ok: true");
if (r1.ok) {
  assert(r1.value.id === "a1",       "id is preserved");
  assert(r1.value.priceUsd === 29.99,"priceUsd is preserved");
}

// ── Test 2: validateCartItem — invalid inputs ─────────────────
console.log("\n── Test 2: validateCartItem (invalid) ──");
const bad1 = validateCartItem({ id: "", name: "X", category: "books", priceUsd: 10, quantity: 1 });
assert(bad1.ok === false, "empty id fails validation");

const bad2 = validateCartItem({ id: "x", name: "X", category: "toys", priceUsd: 10, quantity: 1 });
assert(bad2.ok === false, "unknown category fails validation");

const bad3 = validateCartItem({ id: "x", name: "X", category: "food", priceUsd: -5, quantity: 1 });
assert(bad3.ok === false, "negative price fails validation");

const bad4 = validateCartItem({ id: "x", name: "X", category: "food", priceUsd: 5, quantity: 1.5 });
assert(bad4.ok === false, "non-integer quantity fails validation");

// ── Test 3: calculateDiscount ─────────────────────────────────
console.log("\n── Test 3: calculateDiscount ──");

// subtotal = 2*29.99 + 1*79.99 + 3*19.99 = 59.98 + 79.99 + 59.97 = 199.94
const subtotal = validItems.reduce((s, i) => s + i.priceUsd * i.quantity, 0);

const flatDiscount: Discount = { kind: "flat", amountUsd: 20 };
const d1 = calculateDiscount(validItems, subtotal, [flatDiscount]);
assert(Math.abs(d1 - 20) < 0.001, "flat $20 discount is 20");

const percentDiscount: Discount = { kind: "percent", percent: 10 };
const d2 = calculateDiscount(validItems, subtotal, [percentDiscount]);
assert(Math.abs(d2 - subtotal * 0.10) < 0.001, "10% discount matches expected");

// buyNGetOneFree: clothing category, n=2 → buy 2 get 1 free
// qty=3, freeCount = floor(3/3) = 1, cheapest = 19.99
const bngoDiscount: Discount = { kind: "buyNGetOneFree", category: "clothing", n: 2 };
const d3 = calculateDiscount(validItems, subtotal, [bngoDiscount]);
assert(Math.abs(d3 - 19.99) < 0.001, "buy2get1free on clothing gives 19.99 discount");

// clamp: flat discount larger than subtotal
const bigFlat: Discount = { kind: "flat", amountUsd: 9999 };
const d4 = calculateDiscount(validItems, subtotal, [bigFlat]);
assert(d4 === subtotal, "discount is clamped to subtotal");

// ── Test 4: summarizeCart — happy path ────────────────────────
console.log("\n── Test 4: summarizeCart (happy path) ──");
const result = summarizeCart(rawValid, [flatDiscount]);
assert(result.ok === true, "valid cart returns ok: true");
if (result.ok) {
  const s: OrderSummary = result.value;
  assert(s.lines.length === 3,                     "3 summary lines produced");
  assert(s.itemCount === 6,                         "itemCount is 6 (2+1+3)");
  assert(Math.abs(s.subtotalUsd - 199.94) < 0.01,  "subtotal is ~199.94");
  assert(Math.abs(s.discountAmountUsd - 20) < 0.001,"discountAmount is 20");
  assert(Math.abs(s.totalUsd - 179.94) < 0.01,     "total is ~179.94");
}

// ── Test 5: summarizeCart — validation failure ────────────────
console.log("\n── Test 5: summarizeCart (validation failure) ──");
const rawWithBad = [
  rawValid[0],
  { id: "bad", name: "", category: "books", priceUsd: 5, quantity: 1 }, // invalid: empty name
  rawValid[1],
];
const result2 = summarizeCart(rawWithBad, []);
assert(result2.ok === false, "invalid item causes ok: false");
if (!result2.ok) {
  assert(result2.error.kind === "validation", "error kind is 'validation'");
  assert(result2.error.itemIndex === 1,       "failing item index is 1");
}

console.log("\nAll tests complete.");
