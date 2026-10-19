// ============================================================
// Typed Shopping Cart Reducer
// ============================================================
// REQUIREMENTS
// 1. Define a `CartItem` type with: id (string), name (string),
//    priceInCents (number), quantity (number).
//
// 2. Define a `CartState` type with:
//    - items: CartItem[]
//    - totalItems: number          — sum of all quantities
//    - totalPriceInCents: number   — sum of (priceInCents * quantity)
//
// 3. Define a discriminated union `CartAction` covering exactly
//    these four variants (use a `type` discriminant field):
//      a. "ADD_ITEM"      — payload: Omit<CartItem, "quantity">
//                          (quantity always starts at 1;
//                           if the item already exists, increment its quantity)
//      b. "REMOVE_ITEM"   — payload: { id: string }
//                          (remove the item entirely)
//      c. "UPDATE_QTY"    — payload: { id: string; quantity: number }
//                          (set quantity to the given value;
//                           if quantity <= 0, remove the item)
//      d. "CLEAR_CART"    — no extra payload
//
// 4. Implement `cartReducer(state: CartState, action: CartAction): CartState`
//    - Must be a pure function (never mutate the incoming state).
//    - Must return a brand-new CartState with recalculated totals.
//    - The switch must be exhaustive — TypeScript should catch any
//      unhandled action variant at compile time.
//
// 5. Implement `createEmptyCart(): CartState`
//    - Returns the initial empty cart state.
//
// ============================================================
// TYPE DEFINITIONS — fill these in (no `any` allowed)
// ============================================================

export type CartItem = {
  // TODO
};

export type CartState = {
  // TODO
};

// TODO: define CartAction as a discriminated union of four variants
export type CartAction = never; // replace `never` with your union

// ============================================================
// HELPERS — implement these
// ============================================================

/** Recalculates totalItems and totalPriceInCents from items[]. */
function computeTotals(
  items: CartItem[]
): Pick<CartState, "totalItems" | "totalPriceInCents"> {
  // TODO
  throw new Error("Not implemented");
}

// ============================================================
// PUBLIC API — implement these
// ============================================================

export function createEmptyCart(): CartState {
  // TODO
  throw new Error("Not implemented");
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  // TODO — use a switch on action.type; handle all four variants
  // TIP: add a default branch that assigns action to a `never` variable
  //      to get exhaustiveness checking from the compiler.
  throw new Error("Not implemented");
}
