// ============================================================
// challenge.ts — Typed CSV Pipeline with Schema Validation & Aggregation
// ============================================================
// Implement every function marked TODO.
// Rules:
//   • strict: true — no `any`, no type assertions (`as`), no `!`
//   • Do not change existing type definitions or function signatures
//   • All requirements are numbered in comments below
// ============================================================

// -----------------------------------------------------------
// 1. COLUMN SCHEMA TYPES
// -----------------------------------------------------------

/** Supported column value kinds. */
export type ColumnKind = "string" | "number" | "boolean" | "date";

/** Maps a ColumnKind to its parsed TypeScript type. */
export type KindToPrimitive<K extends ColumnKind> =
  K extends "string"  ? string  :
  K extends "number"  ? number  :
  K extends "boolean" ? boolean :
  K extends "date"    ? Date    :
  never;

/** A single column declaration. */
export interface ColumnDef<K extends ColumnKind = ColumnKind> {
  readonly name: string;
  readonly kind: K;
  readonly optional?: boolean; // if true, empty cells are allowed (parsed as null)
}

/**
 * A schema is a readonly tuple of ColumnDefs.
 * Requirement 1: SchemaRow<S> must map each ColumnDef in tuple S
 * to `{ [name]: KindToPrimitive<kind> }` for required columns,
 * or `{ [name]: KindToPrimitive<kind> | null }` for optional ones —
 * all intersected into one object type.
 */
export type SchemaRow<S extends readonly ColumnDef[]> = {
  [I in keyof S]: S[I] extends ColumnDef<infer K>
    ? S[I]["optional"] extends true
      ? { readonly [N in S[I]["name"]]: KindToPrimitive<K> | null }
      : { readonly [N in S[I]["name"]]: KindToPrimitive<K> }
    : never;
}[number] extends infer U
  ? { [K in keyof (U extends unknown ? U : never)]: (U extends unknown ? U : never)[K] } // flatten union → intersection trick placeholder
  : never;
// NOTE: The above is intentionally left as a partial stub.
// Requirement 1: Replace or complete SchemaRow so that it correctly
// produces an intersection of all per-column object types.
// Hint: you'll need a UnionToIntersection helper type.

/** Helper: convert a union to an intersection. */
export type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

// -----------------------------------------------------------
// 2. RESULT TYPES
// -----------------------------------------------------------

export type ParseOk<T> = { readonly ok: true; readonly value: T };
export type ParseErr   = { readonly ok: false; readonly error: string; readonly row: number; readonly col: string };
export type ParseResult<T> = ParseOk<T> | ParseErr;

// -----------------------------------------------------------
// 3. PARSED OUTPUT
// -----------------------------------------------------------

export interface CsvParseOutput<S extends readonly ColumnDef[]> {
  readonly rows: SchemaRow<S>[];
  readonly errors: ParseErr[];
}

// -----------------------------------------------------------
// 4. CORE PARSING FUNCTION
// -----------------------------------------------------------

/**
 * parseCsv<S>(rawCsv, schema)
 *
 * Requirement 2: Split `rawCsv` on newlines; treat the first line as headers.
 * Requirement 3: Validate that every non-optional column name in `schema`
 *   appears in the header row (return a ParseErr for the entire file if not).
 * Requirement 4: For each subsequent non-empty line, split on commas and
 *   parse each cell according to its ColumnDef:
 *     • "string"  → trimmed cell value
 *     • "number"  → parseFloat; error if NaN
 *     • "boolean" → "true"/"1" → true, "false"/"0" → false; error otherwise
 *     • "date"    → new Date(cell); error if isNaN(date.getTime())
 * Requirement 5: If a cell is empty ("") and the column is optional → null.
 *   If a cell is empty and the column is required → ParseErr for that row.
 * Requirement 6: Rows with at least one error are excluded from `rows`
 *   but their errors are collected in `errors`.
 * Requirement 7: Successfully parsed rows are pushed to `rows` as SchemaRow<S>.
 */
export function parseCsv<S extends readonly ColumnDef[]>(
  rawCsv: string,
  schema: S
): CsvParseOutput<S> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. AGGREGATION TYPES & FUNCTION
// -----------------------------------------------------------

/** Picks only the keys whose value type (in SchemaRow<S>) extends number | null. */
export type NumericKeys<S extends readonly ColumnDef[]> = {
  [K in keyof SchemaRow<S>]: SchemaRow<S>[K] extends number | null ? K : never;
}[keyof SchemaRow<S>];

export interface AggregationSpec<S extends readonly ColumnDef[]> {
  /** Column to group rows by (must be a string-valued key). */
  readonly groupBy: {
    [K in keyof SchemaRow<S>]: SchemaRow<S>[K] extends string ? K : never;
  }[keyof SchemaRow<S>];
  /** Numeric columns to sum within each group. */
  readonly sum: ReadonlyArray<NumericKeys<S>>;
}

export type GroupSums<S extends readonly ColumnDef[], Spec extends AggregationSpec<S>> = {
  readonly [G: string]: {
    readonly count: number;
  } & {
    readonly [K in Spec["sum"][number] & string]: number;
  };
};

/**
 * aggregateRows<S, Spec>(rows, spec)
 *
 * Requirement 8: Group the parsed rows by `spec.groupBy`.
 * Requirement 9: Within each group, count the rows and sum each column
 *   listed in `spec.sum` (treat null values as 0 for summing).
 * Requirement 10: Return a `GroupSums<S, Spec>` where each key is a
 *   group value (string) and each value contains `count` plus one
 *   numeric entry per summed column.
 */
export function aggregateRows<
  S extends readonly ColumnDef[],
  Spec extends AggregationSpec<S>
>(
  rows: SchemaRow<S>[],
  spec: Spec
): GroupSums<S, Spec> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. PIPELINE HELPER
// -----------------------------------------------------------

/**
 * runPipeline<S, Spec>(rawCsv, schema, spec)
 *
 * Requirement 11: Parse the CSV, then — if there are any successfully
 *   parsed rows — aggregate them according to `spec`.
 * Requirement 12: Return an object with:
 *     • `parseOutput`  — the full CsvParseOutput<S>
 *     • `report`       — GroupSums<S, Spec> (empty object `{}` if no rows parsed)
 */
export function runPipeline<
  S extends readonly ColumnDef[],
  Spec extends AggregationSpec<S>
>(
  rawCsv: string,
  schema: S,
  spec: Spec
): { parseOutput: CsvParseOutput<S>; report: GroupSums<S, Spec> } {
  // TODO
  throw new Error("Not implemented");
}
