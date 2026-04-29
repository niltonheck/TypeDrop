// ============================================================
// Typed Shopping Cart Aggregator
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Define a `CartItem` type with: id (string), name (string),
//    quantity (positive integer), unitPrice (non-negative number),
//    and an optional discount of type `Discount`.
//
// 2. Define a `Discount` discriminated union with two variants:
//    - { kind: "percentage"; rate: number }   // 0–1 inclusive, e.g. 0.1 = 10 %
//    - { kind: "fixed"; amount: number }       // absolute deduction per item, >= 0
//
// 3. Define a `LineTotal` type that captures:
//    - itemId (string)
//    - name (string)
//    - quantity (number)
//    - unitPrice (number)
//    - discountedUnitPrice (number)   // unit price after discount
//    - lineTotal (number)             // discountedUnitPrice * quantity
//
// 4. Define an `OrderSummary` type with:
//    - lines: LineTotal[]
//    - subtotal: number               // sum of all lineTotals
//    - totalItems: number             // sum of all quantities
//    - appliedDiscountCount: number   // how many lines had a discount
//
// 5. Define a `CartValidationError` discriminated union with variants:
//    - { kind: "invalid_payload"; message: string }
//    - { kind: "invalid_item"; itemIndex: number; message: string }
//
// 6. Define a `CartResult` discriminated union:
//    - { kind: "success"; summary: OrderSummary }
//    - { kind: "error"; error: CartValidationError }
//
// 7. Implement `applyDiscount(unitPrice: number, discount: Discount | undefined): number`
//    - Returns the discounted price (never below 0).
//    - Must exhaustively handle both Discount variants via narrowing.
//
// 8. Implement `parseCartItem(raw: unknown, index: number): CartItem`
//    - Throws a `CartValidationError` with kind "invalid_item" if:
//        a) raw is not a plain object
//        b) id is missing or not a string
//        c) name is missing or not a string
//        d) quantity is not a positive integer (> 0, whole number)
//        e) unitPrice is not a finite number >= 0
//    - Parses the optional discount field if present.
//    - Hint: narrow `raw` with `typeof` / `instanceof` checks — no `as` or `any`.
//
// 9. Implement `processCart(raw: unknown): CartResult`
//    - If `raw` is not an array, return a CartResult error with kind "invalid_payload".
//    - Parse each element with `parseCartItem`; if any throws, return that error wrapped
//      in a CartResult error.
//    - On success, compute an `OrderSummary` and return a CartResult success.
//    - Use `applyDiscount` for each line.

// ── Type Definitions ──────────────────────────────────────────

export type Discount =
  | { kind: "percentage"; rate: number }
  | { kind: "fixed"; amount: number };

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: Discount;
};

export type LineTotal = {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountedUnitPrice: number;
  lineTotal: number;
};

export type OrderSummary = {
  lines: LineTotal[];
  subtotal: number;
  totalItems: number;
  appliedDiscountCount: number;
};

export type CartValidationError =
  | { kind: "invalid_payload"; message: string }
  | { kind: "invalid_item"; itemIndex: number; message: string };

export type CartResult =
  | { kind: "success"; summary: OrderSummary }
  | { kind: "error"; error: CartValidationError };

// ── Function Stubs ────────────────────────────────────────────

/**
 * TODO: Apply a discount to a unit price.
 * Returns the discounted price, clamped to a minimum of 0.
 */
export function applyDiscount(
  unitPrice: number,
  discount: Discount | undefined
): number {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Validate and parse a single raw cart item.
 * Throws a CartValidationError if the item is invalid.
 */
export function parseCartItem(raw: unknown, index: number): CartItem {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Parse and aggregate an entire cart payload.
 * Returns a CartResult (success or error).
 */
export function processCart(raw: unknown): CartResult {
  // TODO
  throw new Error("Not implemented");
}
