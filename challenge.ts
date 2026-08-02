// ============================================================
// Challenge: Typed GroupBy & Aggregation Pipeline
// ============================================================
// Your task: implement three typed utility functions used by the
// analytics reporting layer. Requirements are listed below each stub.
// Compile target: TypeScript 5.x, strict: true, no `any`.
// ============================================================

// -------------------------------------------------------------------
// SECTION 1 — Core Types
// -------------------------------------------------------------------

/** A single order record coming from the data warehouse. */
export interface Order {
  id: string;
  customerId: string;
  region: "NA" | "EU" | "APAC";
  status: "pending" | "fulfilled" | "cancelled";
  amountUsd: number;
  itemCount: number;
}

/**
 * The aggregated summary produced for each group.
 * All fields are required — never partial.
 */
export interface OrderSummary {
  count: number;
  totalAmountUsd: number;
  averageAmountUsd: number;
  totalItemCount: number;
  /** The ids of every order that belongs to this group. */
  orderIds: string[];
}

// -------------------------------------------------------------------
// SECTION 2 — groupBy
// -------------------------------------------------------------------

/**
 * Groups an array of items by the string value returned by `keyFn`.
 *
 * Requirements:
 * 1. The return type must be `Record<string, T[]>` — a plain object
 *    whose keys are the group names and values are arrays of the
 *    original items (not copies).
 * 2. Items must appear in their group array in the same order they
 *    appear in the input.
 * 3. The function must be generic over `T` — it should work for any
 *    item type, not just `Order`.
 * 4. `keyFn` receives each item and returns the group key (a string).
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// SECTION 3 — summariseGroup
// -------------------------------------------------------------------

/**
 * Reduces an array of `Order` objects into a single `OrderSummary`.
 *
 * Requirements:
 * 1. `count`            — total number of orders in the group.
 * 2. `totalAmountUsd`   — sum of `amountUsd` across all orders.
 * 3. `averageAmountUsd` — mean of `amountUsd`, rounded to 2 decimal
 *                         places (use Math.round). If the array is
 *                         empty, return 0.
 * 4. `totalItemCount`   — sum of `itemCount` across all orders.
 * 5. `orderIds`         — array of every order's `id`, in input order.
 * 6. Must handle an empty array gracefully (all numeric fields → 0,
 *    `orderIds` → []).
 */
export function summariseGroup(orders: Order[]): OrderSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// SECTION 4 — buildReport
// -------------------------------------------------------------------

/**
 * A report is a `Record` mapping each group key to its `OrderSummary`.
 * The key type is constrained to `string` (group names).
 */
export type Report = Record<string, OrderSummary>;

/**
 * Composes `groupBy` and `summariseGroup` into a single pipeline that:
 *
 * Requirements:
 * 1. Accepts a flat array of `Order` objects and a `groupKey` — one of
 *    the *string-valued* keys of `Order` (use a generic + mapped-type
 *    constraint to enforce this at the type level — no hardcoding).
 * 2. Groups the orders by the value of `order[groupKey]`.
 * 3. Summarises each group using `summariseGroup`.
 * 4. Returns a `Report` (i.e. `Record<string, OrderSummary>`).
 * 5. The `groupKey` parameter must be constrained so that only keys of
 *    `Order` whose value type is `string` are accepted. Passing a
 *    non-string key (e.g. `"amountUsd"`) must be a compile-time error.
 *
 * Hint: you'll need a conditional / mapped-type helper to extract only
 * the string-valued keys of `Order`.
 */

// TODO: define a helper type `StringKeys<T>` that resolves to the
// union of keys of T whose value type is string.
export type StringKeys<T> = /* TODO */ never;

export function buildReport<K extends StringKeys<Order>>(
  orders: Order[],
  groupKey: K
): Report {
  // TODO: implement
  throw new Error("Not implemented");
}
