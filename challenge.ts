// ============================================================
// challenge.ts — Typed Query Builder with Schema Inference
// ============================================================
// Rules:
//   • No `any`, no `as`, no non-null assertions (!), no @ts-ignore
//   • strict: true must pass
//   • All TODOs must be replaced with real implementations
// ============================================================

// ------------------------------------------------------------------
// 1. SCHEMA PRIMITIVES
// ------------------------------------------------------------------

/** Maps a column type tag to its TypeScript runtime type. */
export type ColumnTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  date: Date;
};

export type ColumnTag = keyof ColumnTypeMap;

/** A single column descriptor attached to a table schema. */
export type ColumnDef<Tag extends ColumnTag = ColumnTag> = {
  type: Tag;
  nullable: boolean;
};

/**
 * A table schema is a record mapping column names to ColumnDefs.
 * Example:
 *   const Orders = {
 *     id:         { type: "number",  nullable: false },
 *     customerId: { type: "number",  nullable: false },
 *     status:     { type: "string",  nullable: false },
 *     total:      { type: "number",  nullable: true  },
 *     createdAt:  { type: "date",    nullable: false },
 *   } satisfies TableSchema;
 */
export type TableSchema = Record<string, ColumnDef>;

// ------------------------------------------------------------------
// 2. TYPE UTILITIES — implement all of these
// ------------------------------------------------------------------

/**
 * TODO 2-A: ColumnType<Schema, Col>
 * Resolves to the TypeScript type of column `Col` in `Schema`,
 * accounting for nullability (nullable: true → T | null).
 *
 * Example:
 *   ColumnType<typeof Orders, "total">   → number | null
 *   ColumnType<typeof Orders, "status">  → string
 */
export type ColumnType<
  Schema extends TableSchema,
  Col extends keyof Schema
> = TODO; // replace TODO with your type expression

/**
 * TODO 2-B: SelectedRow<Schema, Cols>
 * Given a schema and a tuple/union of column keys,
 * produces the object type containing exactly those columns.
 *
 * Example:
 *   SelectedRow<typeof Orders, "id" | "status"> → { id: number; status: string }
 */
export type SelectedRow<
  Schema extends TableSchema,
  Cols extends keyof Schema
> = TODO;

/**
 * TODO 2-C: AggregationDef
 * Describes a single aggregation: a SQL-style function applied to a column,
 * stored under an alias. The result type must always be `number`.
 *
 * Shape: { fn: "count" | "sum" | "avg" | "min" | "max"; column: string; alias: string }
 * (Keep it simple — alias result is always `number`.)
 */
export type AggregationDef = TODO;

/**
 * TODO 2-D: AggRow<Aggs>
 * Given a tuple of AggregationDefs, produces an object whose keys are the
 * aliases and whose values are `number`.
 *
 * Example:
 *   AggRow<[{ fn: "sum"; column: "total"; alias: "totalRevenue" }]>
 *   → { totalRevenue: number }
 */
export type AggRow<Aggs extends readonly AggregationDef[]> = TODO;

/**
 * TODO 2-E: QueryRow<Schema, Cols, Aggs>
 * The final row type returned by execute():
 *   • selected columns merged with aggregation aliases
 *   • When Cols is `never`, no column fields appear (aggregation-only query)
 */
export type QueryRow<
  Schema extends TableSchema,
  Cols extends keyof Schema,
  Aggs extends readonly AggregationDef[]
> = TODO;

// ------------------------------------------------------------------
// 3. WHERE CLAUSE TYPES
// ------------------------------------------------------------------

/** Supported filter operators per column type. */
export type FilterOperator<T> =
  | { op: "eq";      value: T }
  | { op: "neq";     value: T }
  | { op: "gt";      value: T }
  | { op: "gte";     value: T }
  | { op: "lt";      value: T }
  | { op: "lte";     value: T }
  | { op: "in";      value: readonly T[] }
  | { op: "isNull" }
  | { op: "isNotNull" };

/**
 * A WhereClause maps a subset of column names to their filter operator.
 * Only columns present in Schema may appear.
 */
export type WhereClause<Schema extends TableSchema> = {
  [Col in keyof Schema]?: FilterOperator<ColumnTypeMap[Schema[Col]["type"]]>;
};

// ------------------------------------------------------------------
// 4. ORDER-BY TYPES
// ------------------------------------------------------------------

export type SortDirection = "asc" | "desc";

export type OrderByClause<Schema extends TableSchema> = {
  column: keyof Schema;
  direction: SortDirection;
};

// ------------------------------------------------------------------
// 5. QUERY BUILDER — implement the class
// ------------------------------------------------------------------

/**
 * QueryBuilder is a fluent, immutable-style builder.
 * Each method returns a *new* builder instance with updated type parameters
 * so the compiler tracks selected columns and aggregations.
 *
 * Requirements:
 *   R-1  select(...cols) — narrows Cols to exactly the chosen columns;
 *        calling select() again REPLACES the previous selection.
 *   R-2  where(clause) — accepts a WhereClause<Schema>; chainable.
 *   R-3  aggregate(aggs) — accepts a readonly tuple of AggregationDef;
 *        calling aggregate() again REPLACES the previous aggregations.
 *   R-4  orderBy(clause) — accepts an OrderByClause<Schema>; chainable.
 *   R-5  limit(n) — stores a positive integer page size; chainable.
 *   R-6  execute() — returns Promise<QueryRow<Schema, Cols, Aggs>[]>
 *        The mock implementation must:
 *          (a) filter `_data` rows using the stored where clauses,
 *          (b) apply aggregations (if any) on the filtered set,
 *          (c) project only the selected columns (if any),
 *          (d) respect limit (if set).
 *        The return type must be inferred from Cols and Aggs — NOT hardcoded.
 *
 * TODO 5-A: Fill in the class body. The constructor signature and the
 *           internal state fields are provided as guidance; you must
 *           implement all methods.
 */
export class QueryBuilder<
  Schema extends TableSchema,
  Cols extends keyof Schema = never,
  Aggs extends readonly AggregationDef[] = []
> {
  // Internal state — do not change the field names (the test harness reads them)
  readonly _schema: Schema;
  readonly _data: ReadonlyArray<{ [K in keyof Schema]: ColumnTypeMap[Schema[K]["type"]] | null }>;
  readonly _selectedCols: ReadonlyArray<keyof Schema>;
  readonly _whereClauses: ReadonlyArray<WhereClause<Schema>>;
  readonly _aggregations: Aggs;
  readonly _orderBy: OrderByClause<Schema> | null;
  readonly _limit: number | null;

  constructor(
    schema: Schema,
    data: ReadonlyArray<{ [K in keyof Schema]: ColumnTypeMap[Schema[K]["type"]] | null }>,
    state?: {
      selectedCols?: ReadonlyArray<keyof Schema>;
      whereClauses?: ReadonlyArray<WhereClause<Schema>>;
      aggregations?: Aggs;
      orderBy?: OrderByClause<Schema> | null;
      limit?: number | null;
    }
  ) {
    this._schema = schema;
    this._data = data;
    this._selectedCols = state?.selectedCols ?? [];
    this._whereClauses = state?.whereClauses ?? [];
    this._aggregations = state?.aggregations ?? ([] as unknown as Aggs);
    this._orderBy = state?.orderBy ?? null;
    this._limit = state?.limit ?? null;
  }

  // TODO 5-A-1: select<NewCols extends keyof Schema>(...cols: NewCols[])
  //   Returns QueryBuilder<Schema, NewCols, Aggs>
  select<NewCols extends keyof Schema>(
    ...cols: NewCols[]
  ): QueryBuilder<Schema, NewCols, Aggs> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO 5-A-2: where(clause: WhereClause<Schema>)
  //   Returns QueryBuilder<Schema, Cols, Aggs>
  where(clause: WhereClause<Schema>): QueryBuilder<Schema, Cols, Aggs> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO 5-A-3: aggregate<NewAggs extends readonly AggregationDef[]>(aggs: NewAggs)
  //   Returns QueryBuilder<Schema, Cols, NewAggs>
  aggregate<NewAggs extends readonly AggregationDef[]>(
    aggs: NewAggs
  ): QueryBuilder<Schema, Cols, NewAggs> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO 5-A-4: orderBy(clause: OrderByClause<Schema>)
  //   Returns QueryBuilder<Schema, Cols, Aggs>
  orderBy(clause: OrderByClause<Schema>): QueryBuilder<Schema, Cols, Aggs> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO 5-A-5: limit(n: number)
  //   Returns QueryBuilder<Schema, Cols, Aggs>
  limit(n: number): QueryBuilder<Schema, Cols, Aggs> {
    // TODO
    throw new Error("Not implemented");
  }

  // TODO 5-A-6: execute()
  //   Returns Promise<QueryRow<Schema, Cols, Aggs>[]>
  //   Implementation notes:
  //     • Apply each WhereClause (AND semantics between clauses,
  //       AND semantics between columns within a clause).
  //     • If _aggregations is non-empty, compute aggregations over
  //       the filtered rows and return a SINGLE result row containing
  //       the aggregation aliases (plus any selected columns' values
  //       from the FIRST filtered row, for simplicity).
  //     • If _aggregations is empty, project only _selectedCols
  //       (if _selectedCols is empty, return all columns).
  //     • Apply _orderBy after filtering/aggregation.
  //     • Apply _limit last.
  execute(): Promise<QueryRow<Schema, Cols, Aggs>[]> {
    // TODO
    throw new Error("Not implemented");
  }
}

// ------------------------------------------------------------------
// 6. FACTORY — implement this
// ------------------------------------------------------------------

/**
 * TODO 6: createQueryBuilder<Schema>(schema, data)
 * Returns a fresh QueryBuilder<Schema, never, []> with Cols=never, Aggs=[].
 * This is the public entry point.
 */
export function createQueryBuilder<Schema extends TableSchema>(
  schema: Schema,
  data: ReadonlyArray<{ [K in keyof Schema]: ColumnTypeMap[Schema[K]["type"]] | null }>
): QueryBuilder<Schema, never, []> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. HELPER — implement this
// ------------------------------------------------------------------

/**
 * TODO 7: applyFilter<T>(value: T | null, filter: FilterOperator<T>): boolean
 * Evaluates a single FilterOperator against a runtime value.
 * Must handle all 9 operator variants.
 * Export this so the test harness can unit-test it independently.
 */
export function applyFilter<T>(
  value: T | null,
  filter: FilterOperator<T>
): boolean {
  // TODO
  throw new Error("Not implemented");
}
