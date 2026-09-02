// ============================================================
// challenge.test.ts — verify your solution
// ============================================================
import {
  buildCartSummary,
  computeDiscountAmount,
  computeSubtotal,
  getDiscountLabel,
  type CartSummary,
  type Discount,
  type DiscountByKind,
  type DiscountKind,
  type LineItem,
  type Product,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const APPLE: Product = { id: "apple", name: "Apple", unitPriceCents: 100 };
const BREAD: Product = { id: "bread", name: "Bread", unitPriceCents: 250 };
const WINE: Product  = { id: "wine",  name: "Wine",  unitPriceCents: 1500 };

const cart: readonly LineItem[] = [
  { product: APPLE, quantity: 6 },  // 600 ¢
  { product: BREAD, quantity: 2 },  // 500 ¢
  { product: WINE,  quantity: 1 },  // 1500 ¢
];
// subtotal = 2600 ¢

// ------------------------------------------------------------------
// Test 1 — computeSubtotal
// ------------------------------------------------------------------
const subtotal = computeSubtotal(cart);
console.assert(subtotal === 2600, `Test 1 FAILED: expected subtotal 2600, got ${subtotal}`);
console.log(`Test 1 passed — subtotal: ${subtotal}¢`);

// ------------------------------------------------------------------
// Test 2 — computeDiscountAmount: percentage
// ------------------------------------------------------------------
const pctDiscount: Discount = { kind: "percentage", percent: 10 };
const pctSaving = computeDiscountAmount(subtotal, pctDiscount, cart);
console.assert(pctSaving === 260, `Test 2 FAILED: expected 260, got ${pctSaving}`);
console.log(`Test 2 passed — 10% off 2600¢ saves: ${pctSaving}¢`);

// ------------------------------------------------------------------
// Test 3 — computeDiscountAmount: fixed (capped at subtotal)
// ------------------------------------------------------------------
const fixedDiscount: Discount = { kind: "fixed", amountCents: 500 };
const fixedSaving = computeDiscountAmount(subtotal, fixedDiscount, cart);
console.assert(fixedSaving === 500, `Test 3 FAILED: expected 500, got ${fixedSaving}`);
console.log(`Test 3 passed — fixed $5.00 off saves: ${fixedSaving}¢`);

// Capping test: fixed discount larger than subtotal
const hugeFixed: Discount = { kind: "fixed", amountCents: 9999 };
const cappedSaving = computeDiscountAmount(subtotal, hugeFixed, cart);
console.assert(cappedSaving === 2600, `Test 3b FAILED: expected 2600 (capped), got ${cappedSaving}`);
console.log(`Test 3b passed — huge fixed discount capped to subtotal: ${cappedSaving}¢`);

// ------------------------------------------------------------------
// Test 4 — computeDiscountAmount: buyXgetY
// ------------------------------------------------------------------
// 6 apples, buy 2 get 1 free → groups of 3 → 2 groups → 2 free apples
// saved = 2 * 100 = 200 ¢
const bxgyDiscount: Discount = { kind: "buyXgetY", productId: "apple", buyQuantity: 2, freeQuantity: 1 };
const bxgySaving = computeDiscountAmount(subtotal, bxgyDiscount, cart);
console.assert(bxgySaving === 200, `Test 4 FAILED: expected 200, got ${bxgySaving}`);
console.log(`Test 4 passed — buy2get1free on 6 apples saves: ${bxgySaving}¢`);

// ------------------------------------------------------------------
// Test 5 — buildCartSummary & getDiscountLabel
// ------------------------------------------------------------------
const summary: CartSummary = buildCartSummary(cart, pctDiscount);
console.assert(summary.subtotalCents === 2600, `Test 5a FAILED: subtotal ${summary.subtotalCents}`);
console.assert(summary.discountAmountCents === 260, `Test 5b FAILED: discount ${summary.discountAmountCents}`);
console.assert(summary.totalCents === 2340, `Test 5c FAILED: total ${summary.totalCents}`);
console.log(`Test 5 passed — summary: subtotal=${summary.subtotalCents}¢, saved=${summary.discountAmountCents}¢, total=${summary.totalCents}¢`);

// getDiscountLabel
const pctLabel = getDiscountLabel(pctDiscount);
console.assert(pctLabel === "10% off", `Test 5d FAILED: label "${pctLabel}"`);

const fixedLabel = getDiscountLabel(fixedDiscount);
console.assert(fixedLabel === "$5.00 off", `Test 5e FAILED: label "${fixedLabel}"`);

const bxgyLabel = getDiscountLabel(bxgyDiscount);
console.assert(bxgyLabel === "Buy 2 get 1 free", `Test 5f FAILED: label "${bxgyLabel}"`);
console.log(`Test 5 labels passed — "${pctLabel}", "${fixedLabel}", "${bxgyLabel}"`);

// ------------------------------------------------------------------
// Type-level checks (compile-time only)
// ------------------------------------------------------------------

// DiscountKind must be the union of all kind literals
const _k: DiscountKind = "buyXgetY"; // must compile

// DiscountByKind must map each kind to the right member
const _byKind: DiscountByKind["fixed"] = { kind: "fixed", amountCents: 100 }; // must compile

console.log("\n✅ All tests passed!");
