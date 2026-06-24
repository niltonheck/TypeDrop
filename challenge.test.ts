// challenge.test.ts
import {
  validateCartItem,
  applyDiscount,
  buildOrderSummary,
  CartItem,
  Discount,
} from "./challenge";

// ── Mock data ──────────────────────────────────────────────────

const rawValidItem = {
  id: "item-1",
  name: "TypeScript Handbook",
  priceUSD: 20,
  quantity: 3,
  category: "books",
};

const rawInvalidItem = {
  id: 42,              // should be string
  name: "Bad Item",
  priceUSD: 10,
  quantity: 1,
  category: "books",
};

const cartItems: CartItem[] = [
  { id: "a", name: "Laptop",    priceUSD: 1000, quantity: 1, category: "electronics" },
  { id: "b", name: "T-Shirt",   priceUSD: 25,   quantity: 4, category: "clothing"    },
  { id: "c", name: "Novel",     priceUSD: 15,   quantity: 2, category: "books"       },
];
// subtotal = 1000*1 + 25*4 + 15*2 = 1000 + 100 + 30 = 1130

const percentDiscount: Discount = { kind: "percentage", code: "SAVE10", percent: 10 };
const fixedDiscount:   Discount = { kind: "fixed",      code: "FLAT50", amountUSD: 50 };
const bogoDiscount:    Discount = { kind: "bogo",       code: "BOGOCLOTH", category: "clothing" };

// ── Tests ──────────────────────────────────────────────────────

// 1. validateCartItem returns a well-typed CartItem for valid input
const validItem = validateCartItem(rawValidItem);
console.assert(
  validItem.id === "item-1" && validItem.quantity === 3 && validItem.category === "books",
  "TEST 1 FAILED: validateCartItem should parse a valid raw item"
);
console.log("TEST 1 passed: validateCartItem accepts valid input");

// 2. validateCartItem throws on invalid input
let threw = false;
try { validateCartItem(rawInvalidItem); } catch { threw = true; }
console.assert(threw, "TEST 2 FAILED: validateCartItem should throw for invalid id type");
console.log("TEST 2 passed: validateCartItem rejects invalid input");

// 3. applyDiscount — percentage (10% of 1130 = 113)
const percentSaving = applyDiscount(cartItems, percentDiscount);
console.assert(
  percentSaving === 113,
  `TEST 3 FAILED: expected 113, got ${percentSaving}`
);
console.log("TEST 3 passed: percentage discount = 113");

// 4. applyDiscount — fixed (flat $50 off)
const fixedSaving = applyDiscount(cartItems, fixedDiscount);
console.assert(
  fixedSaving === 50,
  `TEST 4 FAILED: expected 50, got ${fixedSaving}`
);
console.log("TEST 4 passed: fixed discount = 50");

// 5. applyDiscount — bogo on clothing (4 T-Shirts @ $25 each → 2 free = $50)
const bogoSaving = applyDiscount(cartItems, bogoDiscount);
console.assert(
  bogoSaving === 50,
  `TEST 5 FAILED: expected 50, got ${bogoSaving}`
);
console.log("TEST 5 passed: bogo discount = 50");

// 6. buildOrderSummary wires everything together
const summary = buildOrderSummary(
  [rawValidItem, rawValidItem],   // 2× { priceUSD:20, qty:3 } → subtotal = 120
  percentDiscount                 // 10% off → discount = 12, total = 108
);
console.assert(
  summary.subtotalUSD === 120 &&
  summary.discountUSD === 12 &&
  summary.totalUSD === 108 &&
  summary.appliedCode === "SAVE10",
  `TEST 6 FAILED: got ${JSON.stringify(summary)}`
);
console.log("TEST 6 passed: buildOrderSummary returns correct OrderSummary");

console.log("\nAll tests passed! ✅");
