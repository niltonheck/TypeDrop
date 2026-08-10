// ============================================================
// Challenge: Typed GroupBy Aggregator with Summary Statistics
// ============================================================
// You're building the reporting layer for a sales dashboard.
// Given a flat array of typed records, group them by a chosen
// key and compute per-group statistics — all fully typed.
// ============================================================

// --------------- Provided Types (do not modify) ---------------

/** A single sales transaction record */
export interface Transaction {
  id: string;
  region: "north" | "south" | "east" | "west";
  category: "hardware" | "software" | "services";
  salesperson: string;
  amount: number;
  units: number;
}

/**
 * Summary statistics computed for a group of numeric values.
 * All fields are required.
 */
export interface NumericSummary {
  count: number;
  sum: number;
  min: number;
  max: number;
  average: number;
}

/**
 * A single group produced by groupBy.
 * - `key`   — the shared value of the grouping field for this group
 * - `items` — the original records belonging to this group
 * - `stats` — a NumericSummary keyed by every numeric field on T
 */
export type Group<T, K extends keyof T> = {
  key: T[K];
  items: T[];
  // Requirement 1: `stats` must only contain keys that are
  // numeric fields of T (i.e. fields whose value type is `number`).
  // Use a mapped / conditional type — no manual listing.
  stats: { [F in keyof T as T[F] extends number ? F : never]: NumericSummary };
};

/**
 * The full result returned by `groupBy`.
 * Keys are the stringified group values; values are Group objects.
 */
export type GroupByResult<T, K extends keyof T> = Record<
  string,
  Group<T, K>
>;

// --------------- Your Implementation ---------------

/**
 * Groups `records` by the field `key` and computes NumericSummary
 * statistics for every numeric field on T.
 *
 * Requirements:
 * 1. The `key` parameter must be constrained so it can only be a
 *    key of T (already done via the generic — keep it that way).
 * 2. Each group's `items` array contains only the records that
 *    share the same value for `key`.
 * 3. `stats` must be computed for EVERY numeric field on T
 *    (i.e. all fields whose type is `number`), not just `amount`.
 * 4. NumericSummary fields:
 *      - count  → number of items in the group
 *      - sum    → total of all values for that numeric field
 *      - min    → smallest value for that numeric field
 *      - max    → largest value for that numeric field
 *      - average → sum / count  (0 if count === 0)
 * 5. The return type must be `GroupByResult<T, K>` — do not widen
 *    or assert the return value.
 * 6. If `records` is empty, return an empty object `{}`.
 *
 * TODO: implement this function.
 */
export function groupBy<T extends object, K extends keyof T>(
  records: T[],
  key: K
): GroupByResult<T, K> {
  // TODO: implement
  throw new Error("Not implemented");
}

// --------------- Helper type (exported for tests) ---------------

/**
 * Utility: extract only the numeric field names of a type T.
 * TODO: implement this type alias using a conditional + mapped type.
 * It should equal `keyof Group<T, K>["stats"]` for any T and K.
 */
export type NumericKeys<T> = keyof {
  [F in keyof T as T[F] extends number ? F : never]: never;
};
