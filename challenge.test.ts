// challenge.test.ts
import {
  parseCartItem,
  resolveDiscount,
  applyDiscount,
  buildOrderSummary,
  type Category,
  type CartItem,
  type Discount,
  type DiscountPolicy,
  type OrderLine,
  type OrderSummary,
} from "./challenge";

// ── Mock discount policy ──────────────────────────────────────────────────────
const policy: DiscountPolicy = {
  electronics: { kind: "percentage", percent: 10 },
  clothing:    { kind: "fixed",      amountUsd: 5 },
  food:        { kind: "none" },
  books:       { kind: "percentage", percent: 20 },
};

// ── Mock raw items ────────────────────────────────────────────────────────────
const validRawItems: unknown[] = [
  { id: "a1", name: "Laptop",       category: "electronics", priceUsd: 999.99, quantity: 1 },
  { id: "b2", name: "T-Shirt",      category: "clothing",    priceUsd: 25.00,  quantity: 3 },
  { id: "c3", name: "Rice (5 kg)",  category: "food",        priceUsd: 8.50,   quantity: 2 },
  { id: "d4", name: "TypeScript Book", category: "books",    priceUsd: 45.00,  quantity: 2 },
];

// ── Test 1: parseCartItem — happy path ────────────────────────────────────────
const parsed = parseCartItem(validRawItems[0]);
console.assert(parsed.id === "a1",          "Test 1a: id should be 'a1'");
console.assert(parsed.category === "electronics", "Test 1b: category should be 'electronics'");
console.assert(parsed.priceUsd === 999.99,  "Test 1c: priceUsd should be 999.99");

// ── Test 2: parseCartItem — invalid category throws ───────────────────────────
let threw = false;
try {
  parseCartItem({ id: "x1", name: "Widget", category: "furniture", priceUsd: 10, quantity: 1 });
} catch (e) {
  threw = e instanceof TypeError;
}
console.assert(threw, "Test 2: parseCartItem should throw TypeError for unknown category");

// ── Test 3: applyDiscount — percentage ────────────────────────────────────────
const laptop: CartItem = {
  id: "a1", name: "Laptop", category: "electronics", priceUsd: 999.99, quantity: 1,
};
const percentDiscount: Discount = { kind: "percentage", percent: 10 };
const laptopTotal = applyDiscount(laptop, percentDiscount);
// 999.99 * 1 = 999.99 → 10% off → 899.991 → rounded to 899.99
console.assert(laptopTotal === 899.99, `Test 3: expected 899.99, got ${laptopTotal}`);

// ── Test 4: applyDiscount — fixed ─────────────────────────────────────────────
const shirt: CartItem = {
  id: "b2", name: "T-Shirt", category: "clothing", priceUsd: 25.00, quantity: 3,
};
const fixedDiscount: Discount = { kind: "fixed", amountUsd: 5 };
const shirtTotal = applyDiscount(shirt, fixedDiscount);
// 25 * 3 = 75 → 75 - 5 = 70.00
console.assert(shirtTotal === 70.00, `Test 4: expected 70.00, got ${shirtTotal}`);

// ── Test 5: buildOrderSummary — full happy path ───────────────────────────────
const summary = buildOrderSummary(validRawItems, policy);
console.assert(summary.ok === true, "Test 5a: summary should be ok");
if (summary.ok) {
  console.assert(summary.lines.length === 4, "Test 5b: should have 4 order lines");
  // electronics: 999.99 * 1 * 0.9 = 899.991 → 899.99
  // clothing:    25 * 3 - 5       = 70.00
  // food:        8.50 * 2         = 17.00
  // books:       45 * 2 * 0.8     = 72.00
  // grand total: 899.99 + 70 + 17 + 72 = 1058.99
  console.assert(
    summary.grandTotalUsd === 1058.99,
    `Test 5c: expected grandTotal 1058.99, got ${summary.grandTotalUsd}`
  );
}

// ── Test 6: buildOrderSummary — collects multiple errors ──────────────────────
const badItems: unknown[] = [
  { id: "",   name: "Bad ID",  category: "food",      priceUsd: 5,  quantity: 1 },
  { id: "z1", name: "Bad Cat", category: "furniture", priceUsd: 5,  quantity: 1 },
  { id: "z2", name: "Bad Qty", category: "books",     priceUsd: 5,  quantity: -1 },
];
const failSummary = buildOrderSummary(badItems, policy);
console.assert(failSummary.ok === false, "Test 6a: should fail");
if (!failSummary.ok) {
  console.assert(
    failSummary.errors.length === 3,
    `Test 6b: expected 3 errors, got ${failSummary.errors.length}`
  );
}

console.log("All tests passed! ✅");
