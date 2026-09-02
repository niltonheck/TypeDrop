// ============================================================
// challenge.ts — Typed Shopping Cart with Discount Strategy
// ============================================================
// Rules:
//   • No `any`, no type assertions (`as`), no non-null assertions (`!`)
//   • Must compile under strict: true
//   • Implement every function marked TODO
// ============================================================

// ------------------------------------------------------------------
// 1. PRODUCT & LINE-ITEM TYPES
// ------------------------------------------------------------------

/** A product available in the store catalogue. */
export interface Product {
  readonly id: string;
  readonly name: string;
  /** Unit price in cents (integer). */
  readonly unitPriceCents: number;
}

/** One row in the cart: which product, and how many. */
export interface LineItem {
  readonly product: Product;
  readonly quantity: number;
}

// ------------------------------------------------------------------
// 2. DISCOUNT — DISCRIMINATED UNION
// ------------------------------------------------------------------

/**
 * Percentage discount: take `percent`% off the subtotal.
 * Requirement: 0 < percent <= 100
 */
export interface PercentageDiscount {
  readonly kind: "percentage";
  readonly percent: number; // e.g. 10 means 10 %
}

/**
 * Fixed-amount discount: subtract a flat number of cents from the subtotal.
 * The result must never go below 0.
 */
export interface FixedDiscount {
  readonly kind: "fixed";
  readonly amountCents: number;
}

/**
 * Buy-X-get-Y-free discount applied to a specific product.
 * For every `buyQuantity` units of `productId`, `freeQuantity` units are free.
 * Example: buy 2 get 1 free on product "abc" — 3 units cost as if you bought 2.
 */
export interface BuyXGetYDiscount {
  readonly kind: "buyXgetY";
  readonly productId: string;
  readonly buyQuantity: number;
  readonly freeQuantity: number;
}

/** All supported discount strategies. */
export type Discount = PercentageDiscount | FixedDiscount | BuyXGetYDiscount;

// ------------------------------------------------------------------
// 3. CART SUMMARY TYPE
// ------------------------------------------------------------------

export interface CartSummary {
  /** All line items in the cart. */
  readonly lineItems: readonly LineItem[];
  /** Gross total before any discount, in cents. */
  readonly subtotalCents: number;
  /** The discount applied (or null if none). */
  readonly discount: Discount | null;
  /** Amount saved thanks to the discount, in cents (>= 0). */
  readonly discountAmountCents: number;
  /** Final amount the customer pays, in cents (>= 0). */
  readonly totalCents: number;
}

// ------------------------------------------------------------------
// 4. UTILITY TYPES  (use these in your implementations)
// ------------------------------------------------------------------

/**
 * TODO 1 — Define `DiscountKind` as a union of the `kind` literals
 * present in the Discount union, WITHOUT manually writing the strings.
 * Hint: use a utility type that extracts from Discount.
 */
export type DiscountKind = Discount["kind"];

/**
 * TODO 2 — Define `DiscountByKind` as a mapped type that maps each
 * DiscountKind to its corresponding Discount member.
 * e.g. DiscountByKind["fixed"] === FixedDiscount
 * Hint: use Extract<Discount, { kind: K }> inside a mapped type.
 */
export type DiscountByKind = {
  [K in DiscountKind]: Extract<Discount, { kind: K }>;
};

// ------------------------------------------------------------------
// 5. CORE FUNCTIONS
// ------------------------------------------------------------------

/**
 * TODO 3 — computeSubtotal
 * Sum the cost of all line items (unitPriceCents × quantity).
 * Returns the total in cents.
 */
export function computeSubtotal(lineItems: readonly LineItem[]): number {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 4 — computeDiscountAmount
 * Given a subtotal and a discount, return how many cents are saved.
 *
 * Rules per kind:
 *   "percentage" → Math.round(subtotalCents * percent / 100)
 *   "fixed"      → Math.min(amountCents, subtotalCents)  // never exceed subtotal
 *   "buyXgetY"   → find the matching line item (by productId);
 *                   for every (buyQuantity + freeQuantity) group of units,
 *                   freeQuantity units are free.
 *                   saved = freeUnitsCount * unitPriceCents
 *                   (0 if the product is not in the cart)
 *
 * Must handle ALL Discount kinds — the compiler should catch any missing branch.
 */
export function computeDiscountAmount(
  subtotalCents: number,
  discount: Discount,
  lineItems: readonly LineItem[]
): number {
  // TODO: implement — use a switch on discount.kind
  throw new Error("Not implemented");
}

/**
 * TODO 5 — buildCartSummary
 * Combine everything into a CartSummary.
 *
 * Requirements:
 *   • Compute the subtotal from the line items.
 *   • If discount is non-null, compute the discount amount; otherwise 0.
 *   • totalCents = subtotalCents - discountAmountCents  (floor at 0)
 *   • Return a fully-typed, readonly CartSummary.
 */
export function buildCartSummary(
  lineItems: readonly LineItem[],
  discount: Discount | null
): CartSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 6 — getDiscountLabel
 * Return a human-readable string for any discount.
 *
 * Format per kind:
 *   "percentage" → "10% off"
 *   "fixed"      → "$5.00 off"  (amountCents / 100, two decimal places)
 *   "buyXgetY"   → "Buy 2 get 1 free"
 *
 * Use a generic overload signature so callers that pass a specific
 * DiscountByKind[K] get back `string` (you may keep the return type as
 * string — the goal is to practise using DiscountByKind in the overloads).
 */
export function getDiscountLabel<K extends DiscountKind>(discount: DiscountByKind[K]): string;
export function getDiscountLabel(discount: Discount): string;
export function getDiscountLabel(discount: Discount): string {
  // TODO: implement
  throw new Error("Not implemented");
}
