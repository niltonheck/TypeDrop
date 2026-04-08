// ============================================================
// Typed Shopping Cart Summarizer
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// ============================================================

// ── Domain types ─────────────────────────────────────────────

/** The category a product belongs to. */
export type Category = "electronics" | "clothing" | "food" | "books";

/** A validated cart item ready for processing. */
export interface CartItem {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;   // unit price, must be > 0
  quantity: number;   // must be a positive integer
}

// ── Discount types (discriminated union) ─────────────────────

/** Flat amount off the cart total (e.g. "$5 off"). */
export interface FlatDiscount {
  kind: "flat";
  amountUsd: number; // must be > 0
}

/** Percentage off the cart total (e.g. "10% off"). */
export interface PercentDiscount {
  kind: "percent";
  percent: number;   // 0 < percent <= 100
}

/** A buy-N-get-one-free deal applied per category. */
export interface BuyNGetOneFreeDiscount {
  kind: "buyNGetOneFree";
  category: Category;
  n: number;         // buy `n` items, get 1 free (must be >= 1)
}

export type Discount =
  | FlatDiscount
  | PercentDiscount
  | BuyNGetOneFreeDiscount;

// ── Result type ───────────────────────────────────────────────

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// ── Output types ──────────────────────────────────────────────

/** Per-item line in the final summary. */
export interface SummaryLine {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number; // unitPriceUsd * quantity (before discounts)
}

/** The fully typed order summary returned on success. */
export interface OrderSummary {
  lines: SummaryLine[];
  subtotalUsd: number;       // sum of all lineTotalUsd
  discountAmountUsd: number; // total discount applied (>= 0)
  totalUsd: number;          // subtotalUsd - discountAmountUsd (>= 0)
  itemCount: number;         // sum of all quantities
}

/** Validation error returned when an item fails validation. */
export interface CartValidationError {
  kind: "validation";
  itemIndex: number;
  reason: string;
}

// ── Validation ────────────────────────────────────────────────

const VALID_CATEGORIES: ReadonlySet<Category> = new Set([
  "electronics",
  "clothing",
  "food",
  "books",
]);

/**
 * TODO 1 — Validate a single unknown blob into a CartItem.
 *
 * Requirements:
 *  R1. The blob must be a non-null object.
 *  R2. `id` and `name` must be non-empty strings.
 *  R3. `category` must be one of the four valid Category values.
 *  R4. `priceUsd` must be a finite number > 0.
 *  R5. `quantity` must be a positive integer (> 0, no decimals).
 *
 * Return Result<CartItem, string> — the string is a human-readable
 * reason describing the first validation failure found.
 */
export function validateCartItem(
  raw: unknown
): Result<CartItem, string> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Discount calculation ──────────────────────────────────────

/**
 * TODO 2 — Calculate the total discount amount for a cart.
 *
 * Requirements:
 *  R6.  "flat"  → subtract `amountUsd` from the subtotal;
 *               clamp so the result never goes below 0.
 *  R7.  "percent" → subtract (percent / 100) * subtotal;
 *                   clamp so the result never goes below 0.
 *  R8.  "buyNGetOneFree" → for each category that matches,
 *       count the total quantity of items in that category.
 *       For every (n + 1) items, 1 item is free (the cheapest
 *       unit price in that category is used as the free item value).
 *       freeCount = Math.floor(totalQty / (n + 1))
 *       discountAmount = freeCount * cheapestUnitPrice
 *  R9.  If multiple discounts are provided, apply them
 *       independently against the original subtotal and sum
 *       the individual discount amounts (then clamp the grand
 *       total so it never goes below 0).
 *  R10. The returned discountAmountUsd must never exceed the subtotal.
 *
 * @param items    – validated cart items
 * @param subtotal – pre-computed subtotal (sum of line totals)
 * @param discounts – list of discounts to apply
 * @returns the total discount amount in USD (>= 0, <= subtotal)
 */
export function calculateDiscount(
  items: CartItem[],
  subtotal: number,
  discounts: Discount[]
): number {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Main entry point ──────────────────────────────────────────

/**
 * TODO 3 — Build a fully typed OrderSummary from raw unknown blobs.
 *
 * Requirements:
 *  R11. Validate every raw item with `validateCartItem`.
 *       On the FIRST validation failure, return
 *       Result<OrderSummary, CartValidationError> with ok: false,
 *       including the zero-based index of the failing item.
 *  R12. Build one SummaryLine per CartItem.
 *  R13. Compute subtotalUsd, discountAmountUsd (via calculateDiscount),
 *       totalUsd, and itemCount.
 *  R14. Return ok: true with the completed OrderSummary.
 */
export function summarizeCart(
  rawItems: unknown[],
  discounts: Discount[]
): Result<OrderSummary, CartValidationError> {
  // TODO: implement
  throw new Error("Not implemented");
}
