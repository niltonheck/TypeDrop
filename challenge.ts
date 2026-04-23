// ============================================================
// Typed Shopping Cart Aggregator
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ── Domain types ─────────────────────────────────────────────

export type Category = "electronics" | "clothing" | "food" | "books";

export interface RawLineItem {
  productId: string;
  name: string;
  category: Category;
  unitPrice: number;   // in cents (integer)
  quantity: number;    // positive integer
}

// A validated, enriched line item with a computed subtotal.
export interface LineItem extends RawLineItem {
  subtotal: number; // unitPrice * quantity, BEFORE discounts
}

// ── Discount rules ────────────────────────────────────────────

// Discriminated union: discounts are either percentage-based or fixed-amount.
export type DiscountRule =
  | {
      kind: "percentage";
      /** 0–100 inclusive */
      percent: number;
      /** If set, only apply to this category */
      category?: Category;
    }
  | {
      kind: "fixed";
      /** Amount off in cents (integer, > 0) */
      amountOff: number;
      /** Minimum cart subtotal (pre-discount) required to apply, in cents */
      minimumSubtotal: number;
    };

// ── Validation result ─────────────────────────────────────────

// TODO 1 ─ Define a generic `Result<T, E>` type that is either:
//   • { ok: true;  value: T }
//   • { ok: false; error: E }
export type Result<T, E> = /* YOUR TYPE HERE */ never;

// ── Order summary ─────────────────────────────────────────────

export interface OrderSummary {
  items: LineItem[];
  /** Sum of all line-item subtotals, in cents */
  subtotal: number;
  /** Total discount applied, in cents (always >= 0) */
  totalDiscount: number;
  /** subtotal - totalDiscount, clamped to >= 0 */
  grandTotal: number;
  /** Number of distinct categories present */
  categoryCount: number;
  /** The category with the highest combined subtotal */
  topCategory: Category;
}

// ── Validation errors ─────────────────────────────────────────

export type CartValidationError =
  | { kind: "empty_cart" }
  | { kind: "invalid_item"; index: number; reason: string }
  | { kind: "invalid_discount"; index: number; reason: string };

// ─────────────────────────────────────────────────────────────
// TODO 2 ─ Implement `parseLineItem`
//
// Requirements:
//   R1. Accept a single `unknown` value and its position `index`.
//   R2. Return Result<LineItem, CartValidationError>.
//   R3. Validate that the value is a non-null object with:
//         - productId: non-empty string
//         - name:      non-empty string
//         - category:  one of the four valid Category values
//         - unitPrice: integer > 0
//         - quantity:  integer > 0
//   R4. On success, attach `subtotal = unitPrice * quantity`.
//   R5. On failure, return an `invalid_item` error with a descriptive reason.
// ─────────────────────────────────────────────────────────────
export function parseLineItem(
  raw: unknown,
  index: number
): Result<LineItem, CartValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────────────────────
// TODO 3 ─ Implement `validateDiscount`
//
// Requirements:
//   R6.  Accept a single `unknown` value and its position `index`.
//   R7.  Return Result<DiscountRule, CartValidationError>.
//   R8.  Validate the `kind` field first; branch on "percentage" vs "fixed".
//   R9.  For "percentage": percent must be 0–100 inclusive.
//         Optional `category` must be a valid Category if present.
//   R10. For "fixed": amountOff must be an integer > 0;
//         minimumSubtotal must be an integer >= 0.
//   R11. On failure, return an `invalid_discount` error with a descriptive reason.
// ─────────────────────────────────────────────────────────────
export function validateDiscount(
  raw: unknown,
  index: number
): Result<DiscountRule, CartValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ─────────────────────────────────────────────────────────────
// TODO 4 ─ Implement `buildOrderSummary`
//
// Requirements:
//   R12. Accept `rawItems: unknown[]` and `rawDiscounts: unknown[]`.
//   R13. Return Result<OrderSummary, CartValidationError>.
//   R14. Validate every item with `parseLineItem`; short-circuit on first error.
//   R15. Validate every discount with `validateDiscount`; short-circuit on first error.
//   R16. Return an `empty_cart` error if there are no valid items.
//   R17. Compute `subtotal` as the sum of all line-item subtotals.
//   R18. Apply discounts in order:
//         - "percentage" discounts: calculate percent of the ORIGINAL subtotal
//           (filtered to the matching category if `category` is set, else the full subtotal).
//         - "fixed" discounts: apply only if subtotal >= minimumSubtotal.
//         - Accumulate into `totalDiscount`; clamp grandTotal to >= 0.
//   R19. Compute `categoryCount` and `topCategory` from the validated items.
// ─────────────────────────────────────────────────────────────
export function buildOrderSummary(
  rawItems: unknown[],
  rawDiscounts: unknown[]
): Result<OrderSummary, CartValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}
