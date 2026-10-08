// ============================================================
// Typed Schema-Validated Query Builder
// challenge.ts
// ============================================================
// RULES:
//  - No `any`, no `as`, no type assertions anywhere in your solution
//  - Must compile under strict: true
//  - The hardest part is the TYPING — keep runtime logic simple
// ============================================================

// -----------------------------------------------------------
// 1. COLUMN TYPE UNIVERSE
// -----------------------------------------------------------

/** Maps a schema-level column kind to its TypeScript runtime type. */
export type ColumnTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  date: Date;
};

export type ColumnKind = keyof ColumnTypeMap;

// -----------------------------------------------------------
// 2. TABLE SCHEMA DEFINITION
// -----------------------------------------------------------

/**
 * A schema is a record mapping column names to their ColumnKind.
 * Example:
 *   { id: "number", name: "string", active: "boolean" }
 */
export type TableSchema = Record<string, ColumnKind>;

/**
 * TODO (2a): Define `InferRow<S extends TableSchema>`.
 * Given a schema S, produce the object type where each key maps
 * to its resolved TypeScript type via ColumnTypeMap.
 *
 * Example:
 *   InferRow<{ id: "number"; name: "string" }>
 *   => { id: number; name: string }
 */
export type InferRow<S extends TableSchema> = {
  // TODO: mapped type over keyof S
  [K in keyof S]: ColumnTypeMap[S[K]];
};

// -----------------------------------------------------------
// 3. FILTER EXPRESSIONS
// -----------------------------------------------------------

/**
 * Supported filter operators per column kind.
 * - All kinds support "eq" and "neq"
 * - "number" and "date" additionally support "gt", "lt", "gte", "lte"
 * - "string" additionally supports "contains" and "startsWith"
 */
export type NumericOps = "eq" | "neq" | "gt" | "lt" | "gte" | "lte";
export type StringOps  = "eq" | "neq" | "contains" | "startsWith";
export type BooleanOps = "eq" | "neq";
export type DateOps    = "eq" | "neq" | "gt" | "lt" | "gte" | "lte";

export type OpsForKind<K extends ColumnKind> =
  K extends "number"  ? NumericOps :
  K extends "string"  ? StringOps  :
  K extends "boolean" ? BooleanOps :
  K extends "date"    ? DateOps    :
  never;

/**
 * TODO (3a): Define `FilterClause<S, Col>` where:
 *  - S extends TableSchema
 *  - Col extends keyof S
 *
 * A FilterClause must carry:
 *  - `column`: the column name (Col)
 *  - `op`: one of the operators valid for S[Col]'s kind
 *  - `value`: the TypeScript type that matches S[Col]'s kind
 *
 * All three fields must be co-constrained so the compiler rejects
 * mismatched op/value pairs for the column's type.
 */
export type FilterClause<S extends TableSchema, Col extends keyof S> = {
  column: Col;
  // TODO: op should be OpsForKind<S[Col]>
  op: OpsForKind<S[Col]>;
  // TODO: value should be ColumnTypeMap[S[Col]]
  value: ColumnTypeMap[S[Col]];
};

/**
 * TODO (3b): Define `AnyFilterClause<S>` — a union of FilterClause
 * over all columns in S, so a where-array can mix columns freely
 * while each clause is still individually type-safe.
 */
export type AnyFilterClause<S extends TableSchema> = {
  [Col in keyof S]: FilterClause<S, Col>;
}[keyof S];

// -----------------------------------------------------------
// 4. SORT CLAUSE
// -----------------------------------------------------------

export type SortDirection = "asc" | "desc";

/** A sort clause referencing a valid column in S. */
export type SortClause<S extends TableSchema> = {
  column: keyof S;
  direction: SortDirection;
};

// -----------------------------------------------------------
// 5. QUERY DESCRIPTOR
// -----------------------------------------------------------

/**
 * TODO (5a): Define `QueryDescriptor<S, Cols>` where:
 *  - S extends TableSchema
 *  - Cols extends ReadonlyArray<keyof S>  (the selected column names)
 *
 * Fields:
 *  - `select`: Cols                          — columns to return
 *  - `where?`: ReadonlyArray<AnyFilterClause<S>>  — optional filters (AND-combined)
 *  - `orderBy?`: ReadonlyArray<SortClause<S>>     — optional sort order
 *  - `limit?`: number                        — optional page size
 *  - `offset?`: number                       — optional page offset
 */
export type QueryDescriptor<S extends TableSchema, Cols extends ReadonlyArray<keyof S>> = {
  select: Cols;
  where?: ReadonlyArray<AnyFilterClause<S>>;
  orderBy?: ReadonlyArray<SortClause<S>>;
  limit?: number;
  offset?: number;
};

// -----------------------------------------------------------
// 6. RESULT TYPE
// -----------------------------------------------------------

/**
 * TODO (6a): Define `QueryResult<S, Cols>` where:
 *  - S extends TableSchema
 *  - Cols extends ReadonlyArray<keyof S>
 *
 * The result row must contain ONLY the selected columns,
 * each typed correctly via InferRow<S>.
 *
 * Hint: Cols[number] gives the union of selected column names.
 * Hint: Pick<InferRow<S>, Cols[number]> selects the right fields.
 */
export type QueryResult<S extends TableSchema, Cols extends ReadonlyArray<keyof S>> = {
  rows: Array<Pick<InferRow<S>, Cols[number]>>;
  totalCount: number;
  executedAt: Date;
};

// -----------------------------------------------------------
// 7. TABLE HANDLE
// -----------------------------------------------------------

/**
 * A TableHandle binds a schema to an in-memory dataset and
 * exposes a single `query` method.
 */
export interface TableHandle<S extends TableSchema> {
  /**
   * TODO (7a): Type the `query` method signature so that:
   *  - It accepts a QueryDescriptor<S, Cols> for any Cols extends ReadonlyArray<keyof S>
   *  - It returns QueryResult<S, Cols>
   *  - Cols must be inferred from the `select` field — callers should NOT
   *    need to pass a type argument manually.
   */
  query<Cols extends ReadonlyArray<keyof S>>(
    descriptor: QueryDescriptor<S, Cols>
  ): QueryResult<S, Cols>;
}

// -----------------------------------------------------------
// 8. FILTER EVALUATION (runtime helper — types provided)
// -----------------------------------------------------------

/**
 * TODO (8a): Implement `evaluateFilter`.
 * Given a single AnyFilterClause<S> and a full InferRow<S>, return
 * true if the row satisfies the filter, false otherwise.
 *
 * Requirements:
 *  R1. Handle all ops: eq, neq, gt, lt, gte, lte, contains, startsWith
 *  R2. "contains" and "startsWith" only apply to strings — you may assume
 *      the schema guarantees this (no unsafe cast needed if you narrow correctly)
 *  R3. Date comparisons must use valueOf() (numeric comparison)
 *  R4. The function signature must remain fully generic — no `any`
 */
export function evaluateFilter<S extends TableSchema>(
  filter: AnyFilterClause<S>,
  row: InferRow<S>
): boolean {
  // TODO: implement runtime filter evaluation
  const rowVal = row[filter.column];
  const filterVal = filter.value;

  switch (filter.op) {
    case "eq":  return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() === filterVal.valueOf()
      : rowVal === filterVal;
    case "neq": return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() !== filterVal.valueOf()
      : rowVal !== filterVal;
    case "gt":  return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() > filterVal.valueOf()
      : (rowVal as number) > (filterVal as number);
    case "lt":  return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() < filterVal.valueOf()
      : (rowVal as number) < (filterVal as number);
    case "gte": return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() >= filterVal.valueOf()
      : (rowVal as number) >= (filterVal as number);
    case "lte": return rowVal instanceof Date && filterVal instanceof Date
      ? rowVal.valueOf() <= filterVal.valueOf()
      : (rowVal as number) <= (filterVal as number);
    case "contains":   return typeof rowVal === "string" && typeof filterVal === "string"
      ? rowVal.includes(filterVal)
      : false;
    case "startsWith": return typeof rowVal === "string" && typeof filterVal === "string"
      ? rowVal.startsWith(filterVal)
      : false;
    default: {
      // Exhaustive check — op is `never` here
      const _exhaustive: never = filter.op;
      return _exhaustive;
    }
  }
}

// -----------------------------------------------------------
// 9. createTableHandle — wire it all together
// -----------------------------------------------------------

/**
 * TODO (9a): Implement `createTableHandle`.
 *
 * Requirements:
 *  R1. Accept a `schema` (S) and `data` (ReadonlyArray<InferRow<S>>)
 *  R2. Return a TableHandle<S>
 *  R3. Inside `query`:
 *       - Apply all `where` filters (AND logic) using evaluateFilter
 *       - Apply `orderBy` sorts in declared order (stable, lexicographic for
 *         strings/booleans, numeric for numbers, valueOf() for dates)
 *       - `totalCount` = number of rows AFTER filtering, BEFORE pagination
 *       - Apply `offset` then `limit` to produce final `rows`
 *       - Pick only the `select` columns from each row
 *       - Set `executedAt` to `new Date()`
 *  R4. The result rows must be typed as Pick<InferRow<S>, Cols[number]>
 *      (the compiler should verify this — no cast needed if types are correct)
 */
export function createTableHandle<S extends TableSchema>(
  schema: S,
  data: ReadonlyArray<InferRow<S>>
): TableHandle<S> {
  // TODO: implement
  return {
    query<Cols extends ReadonlyArray<keyof S>>(
      descriptor: QueryDescriptor<S, Cols>
    ): QueryResult<S, Cols> {
      // R3a: filter
      let filtered = descriptor.where
        ? data.filter(row =>
            (descriptor.where as ReadonlyArray<AnyFilterClause<S>>).every(f =>
              evaluateFilter<S>(f, row)
            )
          )
        : [...data];

      // R3b: sort
      if (descriptor.orderBy && descriptor.orderBy.length > 0) {
        const sorts = descriptor.orderBy;
        filtered = filtered.slice().sort((a, b) => {
          for (const { column, direction } of sorts) {
            const av = a[column];
            const bv = b[column];
            let cmp = 0;
            if (av instanceof Date && bv instanceof Date) {
              cmp = av.valueOf() - bv.valueOf();
            } else if (typeof av === "number" && typeof bv === "number") {
              cmp = av - bv;
            } else if (typeof av === "string" && typeof bv === "string") {
              cmp = av < bv ? -1 : av > bv ? 1 : 0;
            } else if (typeof av === "boolean" && typeof bv === "boolean") {
              cmp = (av ? 1 : 0) - (bv ? 1 : 0);
            }
            if (cmp !== 0) return direction === "asc" ? cmp : -cmp;
          }
          return 0;
        });
      }

      // R3c: totalCount before pagination
      const totalCount = filtered.length;

      // R3d: pagination
      const offset = descriptor.offset ?? 0;
      const paginated = descriptor.limit !== undefined
        ? filtered.slice(offset, offset + descriptor.limit)
        : filtered.slice(offset);

      // R3e: project selected columns
      const rows = paginated.map(row => {
        const projected = {} as Pick<InferRow<S>, Cols[number]>;
        for (const col of descriptor.select) {
          (projected as InferRow<S>)[col] = row[col];
        }
        return projected;
      });

      return { rows, totalCount, executedAt: new Date() };
    },
  };
}

// -----------------------------------------------------------
// 10. BRANDED QUERY ID (stretch goal)
// -----------------------------------------------------------

/**
 * TODO (10a — BONUS): Define a branded type `QueryId` (a string brand)
 * and a function `makeQueryId(raw: string): QueryId`.
 * Then add an optional `queryId?: QueryId` field to QueryDescriptor.
 * The compiler should reject a plain `string` where a `QueryId` is expected.
 */

// TODO: define QueryId brand and makeQueryId here
