
// ============================================================
// Typed In-Memory Query Engine
// ============================================================
// You are building a lightweight, generic query engine that can
// filter, sort, and aggregate any typed record collection.
//
// RULES:
//  - No `any`, no `as`, no type assertions
//  - All field names must be validated at the type level
//  - Aggregation functions must only accept numeric fields
//  - strict: true must pass with zero errors
// ============================================================

// ── 1. Primitive value types allowed in records ──────────────
export type Primitive = string | number | boolean;

// ── 2. A record must be a flat object of Primitive values ────
export type FlatRecord = Record<string, Primitive>;

// ── 3. Extract only the keys whose value is a specific type ──
//  TODO: Implement `KeysOfType<T, V>` — a mapped/conditional
//        type that returns only the keys of T whose value
//        extends V.
//
//  Example:
//    KeysOfType<{ name: string; age: number; active: boolean }, number>
//    => "age"
export type KeysOfType<T extends FlatRecord, V extends Primitive> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// ── 4. Comparison operators ──────────────────────────────────
export type CompareOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";

// ── 5. A single filter clause ────────────────────────────────
//  TODO: Define `FilterClause<T>` so that:
//    - `field` is constrained to keyof T
//    - `op` is a CompareOp
//    - `value` must match the type of T[field]
//
//  HINT: You'll need a mapped type or a distributive helper
//        to link `field` and `value` together correctly.
export type FilterClause<T extends FlatRecord> = {
  [K in keyof T]: {
    field: K;
    op: CompareOp;
    value: T[K];
  };
}[keyof T];

// ── 6. Sort direction ────────────────────────────────────────
export type SortDirection = "asc" | "desc";

// ── 7. A sort descriptor ─────────────────────────────────────
//  TODO: Define `SortClause<T>` so that `field` is keyof T.
export type SortClause<T extends FlatRecord> = {
  field: keyof T;
  direction: SortDirection;
};

// ── 8. Aggregation operations (numeric fields only) ──────────
export type AggregateOp = "sum" | "avg" | "min" | "max" | "count";

// ── 9. An aggregation descriptor ─────────────────────────────
//  TODO: Define `AggregateClause<T>` so that:
//    - `op` is an AggregateOp
//    - `field` is only allowed to be a key of T whose value is `number`
//      (use KeysOfType here)
//    - `alias` is a plain string (the output key name)
export type AggregateClause<T extends FlatRecord> = {
  op: AggregateOp;
  field: KeysOfType<T, number>;
  alias: string;
};

// ── 10. The full query descriptor ────────────────────────────
export type Query<T extends FlatRecord> = {
  filters?: FilterClause<T>[];
  sort?: SortClause<T>;
  limit?: number;
  aggregations?: AggregateClause<T>[];
};

// ── 11. Aggregation result ───────────────────────────────────
//  A plain object mapping each `alias` to a number.
export type AggregateResult = Record<string, number>;

// ── 12. Query result ─────────────────────────────────────────
//  When aggregations are present, `rows` is empty and `aggregates`
//  is populated; otherwise `rows` holds the matched records.
export type QueryResult<T extends FlatRecord> = {
  rows: T[];
  aggregates: AggregateResult;
  totalMatched: number;
};

// ── 13. applyFilter ──────────────────────────────────────────
//  TODO: Implement this helper.
//  Requirements:
//    R1. Apply the `op` comparison between record[field] and value.
//    R2. "contains" must do a case-insensitive substring check
//        (only valid for string values; return false otherwise).
//    R3. "gt" / "gte" / "lt" / "lte" must return false for
//        non-numeric / non-string values (i.e., booleans).
export function applyFilter<T extends FlatRecord>(
  record: T,
  clause: FilterClause<T>
): boolean {
  // TODO
  throw new Error("Not implemented");
}

// ── 14. runQuery ─────────────────────────────────────────────
//  TODO: Implement the main query engine.
//  Requirements:
//    R4.  Apply every filter clause with AND semantics
//         (a record must pass ALL filters to be included).
//    R5.  After filtering, sort by `query.sort` if provided.
//         Strings: lexicographic; numbers: numeric; booleans: false < true.
//    R6.  Apply `query.limit` AFTER sorting (like SQL LIMIT).
//    R7.  Compute each aggregation over the FULL filtered set
//         (before limit is applied), and populate `aggregates`.
//         - sum: total of field values
//         - avg: arithmetic mean (0 if no rows)
//         - min: minimum value (Infinity if no rows)
//         - max: maximum value (-Infinity if no rows)
//         - count: number of matched rows (ignores `field`)
//    R8.  `totalMatched` is the count of records that passed
//         all filters (before limit).
//    R9.  When aggregations are requested, `rows` must be [] —
//         aggregation mode collapses all rows into numbers.
export function runQuery<T extends FlatRecord>(
  data: T[],
  query: Query<T>
): QueryResult<T> {
  // TODO
  throw new Error("Not implemented");
}
