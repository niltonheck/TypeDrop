// ============================================================
// Typed Paginated API Client with Aggregation
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Define a `Page<T>` type that wraps an array of items, an
//    optional `nextCursor` string, and a `totalCount` number.
// 2. Define a `FetchPage<T>` function type that accepts a cursor
//    (string | undefined) and returns Promise<Page<T>>.
// 3. Implement `fetchAllPages<T>` — follow the cursor chain until
//    `nextCursor` is absent, collecting every item. The function
//    must be generic and must NOT use `any`.
// 4. Define an `Aggregator<T, S>` interface with:
//      - `init(): S`                          — produce a fresh accumulator
//      - `reduce(acc: S, item: T): S`         — fold one item into the accumulator
//      - `finalize(acc: S): S`                — post-process the accumulator
// 5. Implement `paginatedAggregate<T, S>` that accepts a
//    `FetchPage<T>` and an `Aggregator<T, S>` and returns
//    `Promise<S>` — it must fetch ALL pages and aggregate items
//    in a single pass (do NOT collect all items first).
// 6. Define a `SaleRecord` type with fields:
//      - `id`: branded string  (`SaleId`)
//      - `region`: "NA" | "EU" | "APAC"
//      - `amount`: number
//      - `currency`: "USD" | "EUR" | "JPY"
// 7. Implement `buildSaleSummaryAggregator` — returns an
//    `Aggregator<SaleRecord, SaleSummary>` where `SaleSummary` is:
//      - `totalAmount`: number          (sum of all `amount` values)
//      - `countByRegion`: Record<SaleRecord["region"], number>
//      - `largestSale`: SaleRecord | null
// 8. All types must be inferred or declared explicitly — no `any`,
//    no unsafe type assertions (`as`).
// ============================================================

// ----- 1. Branded type helper --------------------------------
// TODO: declare a branded type `Brand<B, T>` using an
//       intersection with a phantom object type.
export type Brand<B, T> = unknown; // replace `unknown` with your implementation

// ----- 2. Domain types ---------------------------------------
// TODO: declare `SaleId` as a branded string
export type SaleId = unknown; // replace with your implementation

// TODO: declare `SaleRecord`
export type SaleRecord = {
  // fill in fields per requirement 6
};

// TODO: declare `SaleSummary`
export type SaleSummary = {
  // fill in fields per requirement 7
};

// ----- 3. Pagination types -----------------------------------
// TODO: declare `Page<T>` per requirement 1
export type Page<T> = unknown; // replace with your implementation

// TODO: declare `FetchPage<T>` per requirement 2
export type FetchPage<T> = unknown; // replace with your implementation

// ----- 4. Aggregator interface -------------------------------
// TODO: declare `Aggregator<T, S>` per requirement 4
export interface Aggregator<T, S> {
  // fill in the three methods
}

// ----- 5. Core functions -------------------------------------

/**
 * Follows the cursor chain, collecting every item across all pages.
 * REQUIREMENT 3: generic, no `any`, sequential page fetching.
 */
export async function fetchAllPages<T>(
  fetchPage: FetchPage<T>
): Promise<T[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Fetches all pages and folds items through the aggregator in one pass.
 * REQUIREMENT 5: must NOT buffer all items — reduce each page's items
 * as soon as they arrive.
 */
export async function paginatedAggregate<T, S>(
  fetchPage: FetchPage<T>,
  aggregator: Aggregator<T, S>
): Promise<S> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Returns a fully-typed aggregator for SaleRecord → SaleSummary.
 * REQUIREMENT 7.
 */
export function buildSaleSummaryAggregator(): Aggregator<SaleRecord, SaleSummary> {
  // TODO: implement
  throw new Error("Not implemented");
}
