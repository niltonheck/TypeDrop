// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Shopping Cart with Discount Resolution
//
// SCENARIO
// You're building the checkout module for a small e-commerce storefront.
// Raw cart payloads arrive as `unknown` from the client; your module must
// validate them into strongly-typed CartItem records, apply the correct
// discount strategy per item category, and return a fully-typed order summary.
//
// REQUIREMENTS
// 1. Define a `Category` union of exactly: "electronics" | "clothing" | "food" | "books"
// 2. Define a `CartItem` interface with: id (string), name (string),
//    category (Category), priceUsd (number), quantity (number)
// 3. Define a discriminated-union `Discount` type with three variants:
//      - { kind: "percentage"; percent: number }   — e.g. 10 means 10% off
//      - { kind: "fixed";      amountUsd: number } — flat amount off the LINE total
//      - { kind: "none" }                          — no discount
// 4. Define a `DiscountPolicy` as a Record that maps every Category to a Discount.
//    Use a mapped type or Record utility so adding a new Category causes a compile error
//    if the policy is not updated.
// 5. Implement `parseCartItem(raw: unknown): CartItem`
//    - Throws a TypeError with a descriptive message for any invalid field.
//    - Validates: id & name are non-empty strings, category is a valid Category,
//      priceUsd & quantity are positive finite numbers.
// 6. Define an `OrderLine` interface: item (CartItem), discount (Discount),
//    lineTotal (number)  — lineTotal is AFTER discount, rounded to 2 decimal places.
// 7. Implement `resolveDiscount(category: Category, policy: DiscountPolicy): Discount`
//    — simple lookup, but must be exhaustively typed.
// 8. Implement `applyDiscount(item: CartItem, discount: Discount): number`
//    — returns the discounted line total (priceUsd * quantity, then discount applied),
//      rounded to 2 decimal places.
//    — Use a switch on `discount.kind`; the default branch must be exhaustively checked
//      with a helper so TypeScript errors if a new variant is ever added without handling.
// 9. Implement `buildOrderSummary(rawItems: unknown[], policy: DiscountPolicy): OrderSummary`
//    — Parses each raw item via parseCartItem (collect ALL errors, don't stop at first).
//    — If any parse errors exist, returns { ok: false; errors: string[] }.
//    — Otherwise computes OrderLines and returns:
//        { ok: true; lines: OrderLine[]; grandTotalUsd: number }
//      where grandTotalUsd is the sum of all lineTotals, rounded to 2 decimal places.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Category ──────────────────────────────────────────────────────────────
// TODO: define the Category union type
export type Category = never; // replace `never` with the union

// ── 2. CartItem ──────────────────────────────────────────────────────────────
// TODO: define the CartItem interface
export interface CartItem {
  // TODO
}

// ── 3. Discount (discriminated union) ────────────────────────────────────────
// TODO: define the Discount discriminated union
export type Discount = never; // replace with the three-variant union

// ── 4. DiscountPolicy ────────────────────────────────────────────────────────
// TODO: define DiscountPolicy so every Category must have an entry
export type DiscountPolicy = never; // replace with the correct mapped/Record type

// ── 5. parseCartItem ─────────────────────────────────────────────────────────
/**
 * Parses an unknown value into a CartItem.
 * Throws TypeError with a descriptive message on any invalid field.
 */
export function parseCartItem(raw: unknown): CartItem {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. OrderLine ─────────────────────────────────────────────────────────────
// TODO: define the OrderLine interface
export interface OrderLine {
  // TODO
}

// ── 7. resolveDiscount ───────────────────────────────────────────────────────
/**
 * Looks up the Discount for a given category from the policy.
 */
export function resolveDiscount(category: Category, policy: DiscountPolicy): Discount {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. applyDiscount ─────────────────────────────────────────────────────────
/**
 * Returns the discounted line total (priceUsd * quantity, discount applied),
 * rounded to 2 decimal places.
 * The switch must be exhaustive — use the helper below.
 */
function assertNever(x: never): never {
  throw new Error(`Unhandled discount kind: ${JSON.stringify(x)}`);
}

export function applyDiscount(item: CartItem, discount: Discount): number {
  // TODO
  throw new Error("Not implemented");
}

// ── 9. OrderSummary & buildOrderSummary ──────────────────────────────────────
export type OrderSummary =
  | { ok: true;  lines: OrderLine[]; grandTotalUsd: number }
  | { ok: false; errors: string[] };

/**
 * Parses all raw items, applies the discount policy, and builds the summary.
 * Collects ALL parse errors before returning the failure variant.
 */
export function buildOrderSummary(
  rawItems: unknown[],
  policy: DiscountPolicy
): OrderSummary {
  // TODO
  throw new Error("Not implemented");
}
