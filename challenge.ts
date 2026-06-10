// ============================================================
// Typed Shopping Cart Discount Engine
// ============================================================
// SCENARIO:
//   Cart items arrive as `unknown` from a storefront API.
//   Validate each item, apply the correct discount rule, and
//   return a strongly-typed OrderSummary — with zero `any`.
// ============================================================

// -----------------------------------------------------------
// 1. CORE DOMAIN TYPES
// -----------------------------------------------------------

/** A percentage-off discount: e.g. 20 means 20% off */
export type PercentageDiscount = {
  kind: "percentage";
  percent: number; // 0–100
};

/** A flat amount subtracted from the item total */
export type FlatDiscount = {
  kind: "flat";
  amount: number; // absolute currency units, e.g. 5.00
};

/** Buy N items, pay for M (M < N) */
export type BuyNGetMDiscount = {
  kind: "buyNgetM";
  buyN: number;
  getM: number; // number of free items
};

/** No discount applied */
export type NoDiscount = {
  kind: "none";
};

export type DiscountRule =
  | PercentageDiscount
  | FlatDiscount
  | BuyNGetMDiscount
  | NoDiscount;

// -----------------------------------------------------------
// 2. CART & ORDER TYPES
// -----------------------------------------------------------

export type CartItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: DiscountRule;
};

export type OrderLineItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discountKind: DiscountRule["kind"];
  lineTotal: number;      // price after discount, for this line
  discountSaved: number;  // how much was saved on this line
};

export type OrderSummary = {
  lines: OrderLineItem[];
  subtotal: number;   // sum of all lineTotals
  totalSaved: number; // sum of all discountSaved
  grandTotal: number; // subtotal (same as subtotal here — no tax)
};

// -----------------------------------------------------------
// 3. VALIDATION
// -----------------------------------------------------------

/**
 * REQUIREMENT 1 — isValidCartItem
 * Accept `unknown` input and return a type predicate narrowing
 * it to `CartItem`. Validate:
 *   - `id`        : non-empty string
 *   - `name`      : non-empty string
 *   - `unitPrice` : finite number >= 0
 *   - `quantity`  : integer > 0
 *   - `discount`  : a valid DiscountRule (see isValidDiscountRule below)
 */
export function isValidCartItem(value: unknown): value is CartItem {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — isValidDiscountRule
 * Accept `unknown` and return a type predicate narrowing to
 * `DiscountRule`. Each variant is identified by its `kind` field:
 *   - "none"       : no extra fields required
 *   - "percentage" : `percent` must be a number in [0, 100]
 *   - "flat"       : `amount` must be a finite number >= 0
 *   - "buyNgetM"   : `buyN` and `getM` must be integers > 0, getM < buyN
 */
export function isValidDiscountRule(value: unknown): value is DiscountRule {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 4. DISCOUNT CALCULATION
// -----------------------------------------------------------

/**
 * REQUIREMENT 3 — applyDiscount
 * Given a validated CartItem, compute and return:
 *   - `lineTotal`     : the final price for the line after discount
 *   - `discountSaved` : the amount saved
 *
 * Rules per discount kind:
 *   "none"       → no reduction
 *   "percentage" → lineTotal = unitPrice * quantity * (1 - percent/100)
 *   "flat"       → lineTotal = max(0, unitPrice * quantity - amount)
 *   "buyNgetM"   → every full group of `buyN` units gives `getM` units free;
 *                  remaining units outside a full group are charged normally.
 *                  Example: buyN=3, getM=1, quantity=7, unitPrice=10
 *                    → 2 full groups → 2 free items → pay for 5 → lineTotal=50
 *
 * Tip: round both values to 2 decimal places (use a helper if you like).
 */
export function applyDiscount(item: CartItem): Pick<OrderLineItem, "lineTotal" | "discountSaved"> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. ENGINE ENTRY POINT
// -----------------------------------------------------------

/**
 * REQUIREMENT 4 — buildOrderSummary
 * Accept an array of `unknown` values (raw API payload).
 * - Validate each item with `isValidCartItem`; silently skip invalid entries.
 * - For each valid CartItem, call `applyDiscount` and build an `OrderLineItem`.
 * - Aggregate all lines into an `OrderSummary`.
 * - Round `subtotal`, `totalSaved`, and `grandTotal` to 2 decimal places.
 */
export function buildOrderSummary(rawItems: unknown[]): OrderSummary {
  // TODO: implement
  throw new Error("Not implemented");
}
