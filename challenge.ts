// ============================================================
// Typed Shopping Cart Price Calculator
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ── 1. Domain Types ──────────────────────────────────────────

export type Currency = "USD" | "EUR" | "GBP";

export type DiscountKind =
  | { kind: "percentage"; percent: number }   // e.g. 10 → 10% off
  | { kind: "fixed";      amount: number };   // e.g. 5  → $5 off

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;   // in minor units (cents)
  quantity: number;    // must be >= 1
}

export interface Cart {
  currency: Currency;
  items: CartItem[];
  discount?: DiscountKind;  // optional single cart-level discount
}

// ── 2. Result / Error types ──────────────────────────────────

export type ValidationError =
  | { field: "currency";          message: string }
  | { field: "items";             message: string }
  | { field: `items[${number}]`;  message: string }
  | { field: "discount";          message: string };

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// ── 3. Output Types ──────────────────────────────────────────

export interface LineItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;   // unitPrice * quantity
}

export interface OrderSummary {
  currency: Currency;
  lines: LineItem[];
  subtotal: number;        // sum of all lineTotals
  discountApplied: number; // amount deducted (0 if none); never negative
  total: number;           // subtotal - discountApplied (never below 0)
}

// ── 4. Validation helper ─────────────────────────────────────

/**
 * TODO: Implement this function.
 *
 * Validate that `raw` is a well-formed Cart object.
 *
 * Requirements:
 *  1. `raw` must be a non-null object.
 *  2. `currency` must be one of: "USD" | "EUR" | "GBP".
 *  3. `items` must be a non-empty array.
 *  4. Each item must have:
 *       - productId: non-empty string
 *       - name:      non-empty string
 *       - unitPrice: integer >= 0
 *       - quantity:  integer >= 1
 *  5. If `discount` is present it must be:
 *       - { kind: "percentage", percent: number }  where 0 < percent <= 100
 *       - { kind: "fixed",      amount: number }   where amount > 0
 *
 * Return Result<Cart, ValidationError[]>.
 * Collect ALL errors before returning (do not short-circuit).
 */
export function validateCart(
  raw: unknown
): Result<Cart, ValidationError[]> {
  // TODO
  throw new Error("Not implemented");
}

// ── 5. Calculation helper ────────────────────────────────────

/**
 * TODO: Implement this function.
 *
 * Build an OrderSummary from a validated Cart.
 *
 * Requirements:
 *  1. Compute each line's lineTotal = unitPrice * quantity.
 *  2. Compute subtotal = sum of all lineTotals.
 *  3. Compute discountApplied:
 *       - "percentage": floor(subtotal * percent / 100)
 *       - "fixed":      min(amount, subtotal)   ← never exceed subtotal
 *       - no discount:  0
 *  4. total = subtotal - discountApplied  (guaranteed >= 0).
 *  5. All monetary values stay in minor units (integers).
 */
export function buildOrderSummary(cart: Cart): OrderSummary {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. Main entry point ──────────────────────────────────────

/**
 * TODO: Implement this function.
 *
 * Combine validation + calculation in one call.
 *
 * Requirements:
 *  1. Call validateCart(raw).
 *  2. If validation fails, return Result failure with the ValidationError[].
 *  3. If validation succeeds, call buildOrderSummary and return Result success
 *     with the OrderSummary.
 */
export function processCart(
  raw: unknown
): Result<OrderSummary, ValidationError[]> {
  // TODO
  throw new Error("Not implemented");
}
