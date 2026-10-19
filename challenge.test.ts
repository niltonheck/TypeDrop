// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import { createEmptyCart, cartReducer, CartState, CartAction } from "./challenge";

// ── Seed data ────────────────────────────────────────────────
const empty = createEmptyCart();

const afterAddApple = cartReducer(empty, {
  type: "ADD_ITEM",
  id: "apple",
  name: "Apple",
  priceInCents: 150,
});

const afterAddBanana = cartReducer(afterAddApple, {
  type: "ADD_ITEM",
  id: "banana",
  name: "Banana",
  priceInCents: 80,
});

// Add apple again → should increment quantity to 2
const afterAddAppleAgain = cartReducer(afterAddBanana, {
  type: "ADD_ITEM",
  id: "apple",
  name: "Apple",
  priceInCents: 150,
});

const afterUpdateBananaQty = cartReducer(afterAddAppleAgain, {
  type: "UPDATE_QTY",
  id: "banana",
  quantity: 3,
});

const afterRemoveApple = cartReducer(afterUpdateBananaQty, {
  type: "REMOVE_ITEM",
  id: "apple",
});

const afterClear = cartReducer(afterRemoveApple, { type: "CLEAR_CART" });

// ── Assertions ───────────────────────────────────────────────

// 1. Empty cart starts zeroed out
console.assert(empty.items.length === 0, "FAIL #1a: empty cart should have no items");
console.assert(empty.totalItems === 0, "FAIL #1b: empty cart totalItems should be 0");
console.assert(empty.totalPriceInCents === 0, "FAIL #1c: empty cart totalPrice should be 0");

// 2. ADD_ITEM — duplicate id increments quantity
const appleItem = afterAddAppleAgain.items.find((i) => i.id === "apple");
console.assert(appleItem !== undefined, "FAIL #2a: apple should be in cart");
console.assert(appleItem?.quantity === 2, `FAIL #2b: apple quantity should be 2, got ${appleItem?.quantity}`);
console.assert(
  afterAddAppleAgain.totalItems === 3,
  `FAIL #2c: totalItems should be 3, got ${afterAddAppleAgain.totalItems}`
);
console.assert(
  afterAddAppleAgain.totalPriceInCents === 150 * 2 + 80,
  `FAIL #2d: totalPrice should be ${150 * 2 + 80}, got ${afterAddAppleAgain.totalPriceInCents}`
);

// 3. UPDATE_QTY — sets banana quantity to 3
const bananaItem = afterUpdateBananaQty.items.find((i) => i.id === "banana");
console.assert(bananaItem?.quantity === 3, `FAIL #3a: banana quantity should be 3, got ${bananaItem?.quantity}`);
console.assert(
  afterUpdateBananaQty.totalPriceInCents === 150 * 2 + 80 * 3,
  `FAIL #3b: totalPrice should be ${150 * 2 + 80 * 3}, got ${afterUpdateBananaQty.totalPriceInCents}`
);

// 4. REMOVE_ITEM — apple gone, only banana (qty 3) remains
console.assert(
  afterRemoveApple.items.length === 1,
  `FAIL #4a: should have 1 item, got ${afterRemoveApple.items.length}`
);
console.assert(
  afterRemoveApple.totalPriceInCents === 80 * 3,
  `FAIL #4b: totalPrice should be ${80 * 3}, got ${afterRemoveApple.totalPriceInCents}`
);

// 5. CLEAR_CART — back to zero
console.assert(afterClear.items.length === 0, "FAIL #5a: cleared cart should have no items");
console.assert(afterClear.totalItems === 0, "FAIL #5b: cleared cart totalItems should be 0");
console.assert(afterClear.totalPriceInCents === 0, "FAIL #5c: cleared cart totalPrice should be 0");

// 6. Immutability — original state untouched after each action
console.assert(empty.items.length === 0, "FAIL #6: original empty cart was mutated");

console.log("All assertions passed! ✅");
