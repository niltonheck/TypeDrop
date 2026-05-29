// ============================================================
// Typed Shopping Cart Aggregator
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// --- Domain types -----------------------------------------------

export type Category = "electronics" | "clothing" | "food" | "books";

export interface RawCartItem {
  id: string;
  name: string;
  category: Category;
  priceInCents: number;
  quantity: number;
}

// A validated cart item is identical in shape to RawCartItem but
// lives under a branded type so callers can't skip validation.
export type ValidatedCartItem = RawCartItem & { readonly __validated: true };

// Discount rules are discriminated by `kind`:
//   - "flat"       → subtract a fixed number of cents from the total
//   - "percentage" → subtract a percentage (0–100) of the total
//   - "bogo"       → buy-one-get-one: every 2 units of a specific
//                    category cost the price of 1
export type DiscountRule =
  | { kind: "flat"; amountInCents: number }
  | { kind: "percentage"; percent: number }
  | { kind: "bogo"; category: Category };

export interface OrderSummary {
  lineItems: LineItem[];
  subtotalInCents: number;     // sum of all line-item totals, before discounts
  discountInCents: number;     // total amount saved (always >= 0)
  totalInCents: number;        // subtotalInCents - discountInCents (floor at 0)
  itemCount: number;           // total number of individual units
}

export interface LineItem {
  id: string;
  name: string;
  category: Category;
  unitPriceInCents: number;
  quantity: number;
  lineTotalInCents: number;    // unitPriceInCents * quantity
}

// --- 1. Validation ----------------------------------------------
// TODO: Implement `validateCartItem`.
//
// Requirements:
//   1. Accept a value of type `unknown`.
//   2. Return `ValidatedCartItem` if the value is a non-null object
//      with the correct shape:
//        - id: non-empty string
//        - name: non-empty string
//        - category: one of the four Category values
//        - priceInCents: integer > 0
//        - quantity: integer >= 1
//   3. Throw a `TypeError` with a descriptive message for any
//      validation failure (do NOT return null/undefined).

export function validateCartItem(raw: unknown): ValidatedCartItem {
  // TODO
  throw new Error("Not implemented");
}

// --- 2. Line-item builder ---------------------------------------
// TODO: Implement `buildLineItems`.
//
// Requirements:
//   4. Accept a `ReadonlyArray<ValidatedCartItem>`.
//   5. Return a `LineItem[]` where each entry maps directly from
//      the corresponding ValidatedCartItem (compute lineTotalInCents).

export function buildLineItems(
  items: ReadonlyArray<ValidatedCartItem>
): LineItem[] {
  // TODO
  throw new Error("Not implemented");
}

// --- 3. Discount calculator -------------------------------------
// TODO: Implement `applyDiscounts`.
//
// Requirements:
//   6. Accept the `subtotalInCents` (number), the original validated
//      items (for bogo logic), and a `ReadonlyArray<DiscountRule>`.
//   7. Apply ALL rules and ACCUMULATE the total discount in cents.
//      Rules are applied to the ORIGINAL subtotal (not cascaded).
//   8. For "flat"       → discount = rule.amountInCents
//   9. For "percentage" → discount = Math.floor(subtotal * percent / 100)
//  10. For "bogo"       → for every item in the matching category,
//                         discount = Math.floor(lineTotalInCents / 2)
//                         (i.e. half the cost of that category's items)
//  11. Return the total discount clamped to [0, subtotalInCents].

export function applyDiscounts(
  subtotalInCents: number,
  items: ReadonlyArray<ValidatedCartItem>,
  rules: ReadonlyArray<DiscountRule>
): number {
  // TODO
  throw new Error("Not implemented");
}

// --- 4. Order summary builder -----------------------------------
// TODO: Implement `buildOrderSummary`.
//
// Requirements:
//  12. Accept a `ReadonlyArray<ValidatedCartItem>` and
//      `ReadonlyArray<DiscountRule>`.
//  13. Compose buildLineItems + applyDiscounts to produce an
//      OrderSummary.
//  14. itemCount = sum of all quantities.
//  15. totalInCents must never be negative (floor at 0).

export function buildOrderSummary(
  items: ReadonlyArray<ValidatedCartItem>,
  rules: ReadonlyArray<DiscountRule>
): OrderSummary {
  // TODO
  throw new Error("Not implemented");
}
