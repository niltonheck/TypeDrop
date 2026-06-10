// challenge.test.ts
import {
  isValidCartItem,
  isValidDiscountRule,
  applyDiscount,
  buildOrderSummary,
  type CartItem,
  type OrderSummary,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validPercentageItem: unknown = {
  id: "item-1",
  name: "Wireless Headphones",
  unitPrice: 80,
  quantity: 2,
  discount: { kind: "percentage", percent: 25 },
};

const validFlatItem: unknown = {
  id: "item-2",
  name: "USB-C Cable",
  unitPrice: 15,
  quantity: 3,
  discount: { kind: "flat", amount: 5 },
};

const validBuyNGetMItem: unknown = {
  id: "item-3",
  name: "Protein Bar",
  unitPrice: 10,
  quantity: 7,
  discount: { kind: "buyNgetM", buyN: 3, getM: 1 },
};

const validNoDiscountItem: unknown = {
  id: "item-4",
  name: "Water Bottle",
  unitPrice: 20,
  quantity: 1,
  discount: { kind: "none" },
};

const invalidItem1: unknown = {
  // missing id
  name: "Ghost Product",
  unitPrice: 10,
  quantity: 1,
  discount: { kind: "none" },
};

const invalidItem2: unknown = {
  id: "item-bad",
  name: "Bad Discount",
  unitPrice: 10,
  quantity: 2,
  discount: { kind: "percentage", percent: 150 }, // percent > 100 — invalid
};

const invalidItem3: unknown = null;

// -----------------------------------------------------------
// Test 1: isValidCartItem correctly narrows valid & invalid items
// -----------------------------------------------------------
console.assert(
  isValidCartItem(validPercentageItem) === true,
  "TEST 1a FAILED: valid percentage item should pass validation"
);
console.assert(
  isValidCartItem(invalidItem1) === false,
  "TEST 1b FAILED: item missing id should fail validation"
);
console.assert(
  isValidCartItem(invalidItem2) === false,
  "TEST 1c FAILED: item with percent > 100 should fail validation"
);
console.assert(
  isValidCartItem(invalidItem3) === false,
  "TEST 1d FAILED: null should fail validation"
);

// -----------------------------------------------------------
// Test 2: applyDiscount — percentage
// unitPrice=80, quantity=2, percent=25
// gross = 160, saved = 40, lineTotal = 120
// -----------------------------------------------------------
if (isValidCartItem(validPercentageItem)) {
  const result = applyDiscount(validPercentageItem);
  console.assert(
    result.lineTotal === 120,
    `TEST 2a FAILED: expected lineTotal=120, got ${result.lineTotal}`
  );
  console.assert(
    result.discountSaved === 40,
    `TEST 2b FAILED: expected discountSaved=40, got ${result.discountSaved}`
  );
}

// -----------------------------------------------------------
// Test 3: applyDiscount — flat
// unitPrice=15, quantity=3, flat=5
// gross = 45, saved = 5, lineTotal = 40
// -----------------------------------------------------------
if (isValidCartItem(validFlatItem)) {
  const result = applyDiscount(validFlatItem);
  console.assert(
    result.lineTotal === 40,
    `TEST 3a FAILED: expected lineTotal=40, got ${result.lineTotal}`
  );
  console.assert(
    result.discountSaved === 5,
    `TEST 3b FAILED: expected discountSaved=5, got ${result.discountSaved}`
  );
}

// -----------------------------------------------------------
// Test 4: applyDiscount — buyNgetM
// unitPrice=10, quantity=7, buyN=3, getM=1
// 2 full groups → 2 free → pay for 5 → lineTotal=50, saved=20
// -----------------------------------------------------------
if (isValidCartItem(validBuyNGetMItem)) {
  const result = applyDiscount(validBuyNGetMItem);
  console.assert(
    result.lineTotal === 50,
    `TEST 4a FAILED: expected lineTotal=50, got ${result.lineTotal}`
  );
  console.assert(
    result.discountSaved === 20,
    `TEST 4b FAILED: expected discountSaved=20, got ${result.discountSaved}`
  );
}

// -----------------------------------------------------------
// Test 5: buildOrderSummary — mixed valid/invalid inputs
// Valid items: percentage(120), flat(40), buyNgetM(50), none(20)
// subtotal = 230, totalSaved = 65, grandTotal = 230
// Invalid items (invalidItem1, invalidItem2, invalidItem3) are skipped
// -----------------------------------------------------------
const rawCart: unknown[] = [
  validPercentageItem,
  validFlatItem,
  validBuyNGetMItem,
  validNoDiscountItem,
  invalidItem1,
  invalidItem2,
  invalidItem3,
];

const summary: OrderSummary = buildOrderSummary(rawCart);

console.assert(
  summary.lines.length === 4,
  `TEST 5a FAILED: expected 4 valid lines, got ${summary.lines.length}`
);
console.assert(
  summary.subtotal === 230,
  `TEST 5b FAILED: expected subtotal=230, got ${summary.subtotal}`
);
console.assert(
  summary.totalSaved === 65,
  `TEST 5c FAILED: expected totalSaved=65, got ${summary.totalSaved}`
);
console.assert(
  summary.grandTotal === 230,
  `TEST 5d FAILED: expected grandTotal=230, got ${summary.grandTotal}`
);

console.log("All tests passed! ✅");
