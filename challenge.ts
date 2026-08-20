// ─── Domain Types ────────────────────────────────────────────────────────────

export type Category = "electronics" | "clothing" | "books" | "home";
export type Region = "north" | "south" | "east" | "west";

export interface SaleRecord {
  id: string;
  category: Category;
  region: Region;
  amount: number;      // sale value in USD cents
  quantity: number;    // units sold
}

// ─── Result Types ─────────────────────────────────────────────────────────────

export interface GroupSummary {
  totalAmount: number;   // sum of amount across all records in the group
  totalQuantity: number; // sum of quantity across all records in the group
  count: number;         // number of records in the group
  avgAmount: number;     // mean amount (rounded to nearest integer)
}

// TODO 1 – Define `GroupableKey`
//   A union of the keys of SaleRecord whose VALUE type is a string (i.e. the
//   fields that make sense as grouping keys: "category", "region").
//   Use a conditional type + keyof so it stays in sync with SaleRecord
//   automatically — do NOT hard-code the literal union.
export type GroupableKey = {
  [K in keyof SaleRecord]: SaleRecord[K] extends string ? K : never;
}[keyof SaleRecord];

// TODO 2 – Define `GroupedSummary<K>`
//   A mapped type that, given a GroupableKey K, produces a Record whose keys
//   are exactly the value-type of SaleRecord[K] and whose values are GroupSummary.
//   Example: GroupedSummary<"category"> ≡ Record<Category, GroupSummary>
export type GroupedSummary<K extends GroupableKey> = Record<
  SaleRecord[K],   // <-- replace this stub; it must resolve to the correct union
  GroupSummary
>;

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * TODO 3 – Implement `groupAndSummarise`
 *
 * Requirements:
 *  R1. Group `records` by the field named `key`.
 *  R2. For each group compute: totalAmount, totalQuantity, count, avgAmount
 *      (avgAmount = Math.round(totalAmount / count)).
 *  R3. Return a `GroupedSummary<K>` — a Record keyed by every possible value
 *      of SaleRecord[K].  Groups with zero records must still be present with
 *      all-zero summaries (use `allValues` to discover every possible value).
 *  R4. The function must be generic in K so the return type is precise.
 *
 * @param records   - array of sale records to aggregate
 * @param key       - the SaleRecord field to group by
 * @param allValues - every possible value for SaleRecord[K], used to
 *                    pre-populate zero-entry groups
 */
export function groupAndSummarise<K extends GroupableKey>(
  records: SaleRecord[],
  key: K,
  allValues: ReadonlyArray<SaleRecord[K]>,
): GroupedSummary<K> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 4 – Implement `topGroup`
 *
 * Given a GroupedSummary<K>, return the group key whose `totalAmount` is
 * highest.  If two groups tie, return the one that comes first
 * alphabetically.
 *
 * The return type must be `SaleRecord[K]` (the specific string union),
 * not just `string`.
 */
export function topGroup<K extends GroupableKey>(
  summary: GroupedSummary<K>,
): SaleRecord[K] {
  // TODO: implement
  throw new Error("Not implemented");
}
