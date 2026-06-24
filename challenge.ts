// challenge.ts
// ─────────────────────────────────────────────────────────────
// Typed Shopping Cart with Discount Rules & Order Summary
// ─────────────────────────────────────────────────────────────
// REQUIREMENTS
// 1. Define a `CartItem` type with: id (string), name (string),
//    priceUSD (number), quantity (number), category (ProductCategory).
// 2. Define a discriminated union `Discount` with three variants:
//      - { kind: "percentage"; code: string; percent: number }   // 0–100
//      - { kind: "fixed";      code: string; amountUSD: number } // flat deduction
//      - { kind: "bogo";       code: string; category: ProductCategory } // buy-one-get-one on a category
// 3. Implement `validateCartItem(raw: unknown): CartItem` — throws a
//    descriptive Error string if any field is missing or of the wrong type.
//    Allowed categories are the members of the `ProductCategory` union.
// 4. Implement `applyDiscount(items: CartItem[], discount: Discount): number`
//    that returns the total discount amount in USD (≥ 0).
//      - "percentage": percent off the entire subtotal.
//      - "fixed":      flat amount off (capped at subtotal so result ≥ 0).
//      - "bogo":       for every 2 items (by quantity) in the given category,
//                      the cheaper one is free. Sum all such savings.
// 5. Implement `buildOrderSummary(rawItems: unknown[], discount: Discount | null): OrderSummary`
//    that validates every item, computes subtotal, applies the discount (if any),
//    and returns an `OrderSummary`.

// ── Types ──────────────────────────────────────────────────────

export type ProductCategory = "electronics" | "clothing" | "food" | "books" | "toys";

// TODO (requirement 1): define CartItem
export type CartItem = {
  // ...
};

// TODO (requirement 2): define the Discount discriminated union
export type Discount =
  | { kind: "percentage"; code: string; percent: number }
  // add "fixed" and "bogo" variants here
  ;

export type OrderSummary = {
  items: CartItem[];
  subtotalUSD: number;    // sum of priceUSD * quantity for all items
  discountUSD: number;    // total amount saved (0 if no discount)
  totalUSD: number;       // subtotalUSD - discountUSD (never negative)
  appliedCode: string | null; // discount code used, or null
};

// ── Helpers ────────────────────────────────────────────────────

/** All valid product categories — use this for runtime validation. */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "electronics", "clothing", "food", "books", "toys",
];

// ── Functions to implement ─────────────────────────────────────

// TODO (requirement 3)
export function validateCartItem(raw: unknown): CartItem {
  // Hint: narrow `raw` to an object, then check each field individually.
  throw new Error("Not implemented");
}

// TODO (requirement 4)
export function applyDiscount(items: CartItem[], discount: Discount): number {
  // Hint: use a switch on discount.kind for exhaustive handling.
  throw new Error("Not implemented");
}

// TODO (requirement 5)
export function buildOrderSummary(
  rawItems: unknown[],
  discount: Discount | null
): OrderSummary {
  throw new Error("Not implemented");
}
