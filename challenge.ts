// ============================================================
// Typed CSV Report Aggregator with Schema Validation & Grouped Statistics
// ============================================================
// TOPICS: Discriminated unions · Mapped types · Conditional types ·
//         Generics · Utility types · Parsing & Validation ·
//         Iteration & Aggregation · Error Result types
// ============================================================

// -----------------------------------------------------------
// 1. BRANDED TYPES
// -----------------------------------------------------------

/** A non-empty string brand — prevents passing raw strings where validated IDs are expected. */
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

export type RegionCode = Brand<string, "RegionCode">;
export type ProductSku  = Brand<string, "ProductSku">;

/**
 * TODO (1a): Implement `toRegionCode`.
 * Accept a raw string; return a `RegionCode` only if it matches /^[A-Z]{2,4}$/.
 * Return `null` otherwise. Do NOT use type assertions (`as`).
 * Hint: use a type-predicate helper or a factory with a discriminated return type.
 */
export function toRegionCode(raw: string): RegionCode | null {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO (1b): Implement `toProductSku`.
 * Accept a raw string; return a `ProductSku` only if it matches /^[A-Z0-9]{3,12}$/.
 * Return `null` otherwise.
 */
export function toProductSku(raw: string): ProductSku | null {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 2. RAW ROW & VALIDATION SCHEMA
// -----------------------------------------------------------

/** Exactly the string-keyed columns that arrive from a parsed CSV line. */
export type RawRow = Record<string, string>;

/** The validated, typed shape of a single sales record. */
export interface SalesRecord {
  readonly region:   RegionCode;
  readonly sku:      ProductSku;
  readonly units:    number;   // positive integer
  readonly revenue:  number;   // positive finite float, in USD
  readonly date:     Date;     // ISO-8601 date string → Date
}

// -----------------------------------------------------------
// 3. RESULT TYPE
// -----------------------------------------------------------

export type Ok<T>   = { readonly ok: true;  readonly value: T };
export type Err<E>  = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

/** Structured parse error — always carry the row index and field name. */
export interface ParseError {
  readonly rowIndex: number;
  readonly field:    keyof SalesRecord;
  readonly raw:      string;
  readonly reason:   string;
}

// -----------------------------------------------------------
// 4. ROW VALIDATOR
// -----------------------------------------------------------

/**
 * TODO (2): Implement `validateRow`.
 *
 * Given a `RawRow` and its 0-based `rowIndex`, return:
 *   - `Ok<SalesRecord>`  when ALL fields are valid.
 *   - `Err<ParseError>`  for the FIRST invalid field encountered,
 *     in field order: region → sku → units → revenue → date.
 *
 * Validation rules:
 *   - `region`  : present & passes `toRegionCode`
 *   - `sku`     : present & passes `toProductSku`
 *   - `units`   : present, parses as integer > 0
 *   - `revenue` : present, parses as finite float > 0
 *   - `date`    : present, valid ISO-8601 (use `new Date()`; reject NaN dates)
 *
 * Requirements:
 *   - Return type must be `Result<SalesRecord, ParseError>` — no widening.
 *   - Do NOT use `as` or `any`.
 */
export function validateRow(raw: RawRow, rowIndex: number): Result<SalesRecord, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. AGGREGATION TYPES
// -----------------------------------------------------------

/** Per-(region, sku) statistics produced after aggregation. */
export interface GroupStats {
  readonly region:       RegionCode;
  readonly sku:          ProductSku;
  readonly totalUnits:   number;
  readonly totalRevenue: number;
  readonly rowCount:     number;
  readonly avgRevenue:   number;  // totalRevenue / rowCount
}

/**
 * The final report shape returned by `aggregateReport`.
 *
 * TODO (3a): Replace `TODO_TYPE` with a mapped type over `RegionCode`-keyed records.
 *
 * `byRegion` must be:  `Map<RegionCode, Map<ProductSku, GroupStats>>`
 *
 * `summary` must be a mapped type: for each key K in `Omit<GroupStats, "region" | "sku">`,
 * the value is the SUM across ALL groups (avgRevenue should be the global average: totalRevenue / rowCount).
 */
export interface AggregateReport {
  readonly validCount:   number;
  readonly invalidCount: number;
  readonly errors:       ReadonlyArray<ParseError>;
  readonly byRegion:     Map<RegionCode, Map<ProductSku, GroupStats>>;
  readonly summary:      { [K in keyof Omit<GroupStats, "region" | "sku">]: number };
}

// -----------------------------------------------------------
// 6. MAIN AGGREGATOR
// -----------------------------------------------------------

/**
 * TODO (3b): Implement `aggregateReport`.
 *
 * Accept an array of `RawRow` objects (already split from CSV lines).
 * For each row:
 *   1. Call `validateRow` with its index.
 *   2. Collect `Err` results into `errors`; count them in `invalidCount`.
 *   3. For `Ok` results, upsert into the nested `byRegion` Map structure.
 *
 * After processing all rows, compute `summary` as the column-wise totals
 * across all `GroupStats` entries (avgRevenue = global totalRevenue / global rowCount).
 *
 * Requirements:
 *   - Single pass over `rows` for validation + grouping.
 *   - `summary` must be built from the final Map (a second pass over groups is fine).
 *   - Return type is exactly `AggregateReport`.
 *   - No `any`, no `as`.
 */
export function aggregateReport(rows: RawRow[]): AggregateReport {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. GENERIC UTILITY — `groupBy`
// -----------------------------------------------------------

/**
 * TODO (4): Implement a fully generic `groupBy` utility.
 *
 * Signature:
 *   groupBy<T, K extends string>(
 *     items: readonly T[],
 *     keyFn: (item: T) => K
 *   ): Record<K, T[]>
 *
 * Requirements:
 *   - The return type must be `Record<K, T[]>` — not a wider `Record<string, T[]>`.
 *   - Works for any T and any string-subtype K.
 *   - No `any`, no `as`.
 *
 * Note: This utility is NOT used by `aggregateReport` (which uses a Map),
 * but it exercises generic constraint typing independently.
 */
export function groupBy<T, K extends string>(
  items: readonly T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  // TODO
  throw new Error("Not implemented");
}
