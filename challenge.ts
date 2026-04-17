// =============================================================
// Typed Query Plan Builder
// challenge.ts
// Compile target: TypeScript 5.x, strict: true, no `any`
// =============================================================

// ─────────────────────────────────────────────────────────────
// 1. PRIMITIVE / BRANDED TYPES
// ─────────────────────────────────────────────────────────────

/** Branded string that has passed field-name validation. */
export type FieldName = string & { readonly __brand: "FieldName" };

/** Branded string that has passed table-name validation. */
export type TableName = string & { readonly __brand: "TableName" };

// ─────────────────────────────────────────────────────────────
// 2. RAW (UNVALIDATED) QUERY DESCRIPTOR
// ─────────────────────────────────────────────────────────────

/**
 * The shape that arrives over the wire as `unknown`.
 * Do NOT trust any field — validate everything at runtime.
 */
export interface RawQueryDescriptor {
  readonly table: unknown;
  readonly select: unknown;   // string[]  — field names to project
  readonly filter: unknown;   // FilterClause | undefined
  readonly groupBy: unknown;  // string[]  | undefined
  readonly orderBy: unknown;  // OrderByClause | undefined
  readonly limit: unknown;    // number    | undefined
}

// ─────────────────────────────────────────────────────────────
// 3. VALIDATED QUERY DESCRIPTOR
// ─────────────────────────────────────────────────────────────

export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";

export interface FilterClause {
  readonly field: FieldName;
  readonly op: FilterOperator;
  /** Scalar or array value; keep it unknown — operators validate at execution time. */
  readonly value: unknown;
}

export type SortDirection = "asc" | "desc";

export interface OrderByClause {
  readonly field: FieldName;
  readonly direction: SortDirection;
}

export interface ValidatedQuery {
  readonly table: TableName;
  readonly select: ReadonlyArray<FieldName>;
  readonly filter: FilterClause | undefined;
  readonly groupBy: ReadonlyArray<FieldName> | undefined;
  readonly orderBy: OrderByClause | undefined;
  readonly limit: number | undefined;
}

// ─────────────────────────────────────────────────────────────
// 4. RESULT / ERROR TYPES
// ─────────────────────────────────────────────────────────────

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

export type QueryError =
  | { readonly kind: "validation"; readonly message: string }
  | { readonly kind: "planning";   readonly message: string }
  | { readonly kind: "execution";  readonly message: string; readonly stage: OperatorKind };

// ─────────────────────────────────────────────────────────────
// 5. EXECUTION PLAN — OPERATOR TYPES
// ─────────────────────────────────────────────────────────────

/**
 * Every operator in the plan is one of these discriminated variants.
 * The plan is a linear pipeline: each operator receives the output
 * of the previous one.
 */
export type OperatorKind =
  | "scan"
  | "filter"
  | "project"
  | "groupBy"
  | "sort"
  | "limit";

export type Row = Readonly<Record<FieldName, unknown>>;

// Each operator is typed by what it needs from the plan context.

export interface ScanOperator {
  readonly kind: "scan";
  readonly table: TableName;
}

export interface FilterOperatorNode {
  readonly kind: "filter";
  readonly clause: FilterClause;
}

export interface ProjectOperator {
  readonly kind: "project";
  readonly fields: ReadonlyArray<FieldName>;
}

export interface GroupByOperator {
  readonly kind: "groupBy";
  readonly keys: ReadonlyArray<FieldName>;
}

export interface SortOperator {
  readonly kind: "sort";
  readonly field: FieldName;
  readonly direction: SortDirection;
}

export interface LimitOperator {
  readonly kind: "limit";
  readonly count: number;
}

export type PlanOperator =
  | ScanOperator
  | FilterOperatorNode
  | ProjectOperator
  | GroupByOperator
  | SortOperator
  | LimitOperator;

/** An ordered list of operators to execute left-to-right. */
export interface ExecutionPlan {
  readonly operators: ReadonlyArray<PlanOperator>;
}

// ─────────────────────────────────────────────────────────────
// 6. STAGE RESULT — what each operator produces
// ─────────────────────────────────────────────────────────────

export interface StageResult {
  readonly stage: OperatorKind;
  readonly rowsIn: number;
  readonly rowsOut: number;
  readonly durationMs: number;
}

export interface QueryReport {
  readonly query: ValidatedQuery;
  readonly plan: ExecutionPlan;
  readonly stages: ReadonlyArray<StageResult>;
  readonly rows: ReadonlyArray<Row>;
  readonly totalDurationMs: number;
}

// ─────────────────────────────────────────────────────────────
// 7. TABLE REGISTRY  (in-memory "database")
// ─────────────────────────────────────────────────────────────

/**
 * A simple registry that maps table names to their rows.
 * Treat this as your data source during the scan stage.
 */
export type TableRegistry = ReadonlyMap<TableName, ReadonlyArray<Row>>;

// ─────────────────────────────────────────────────────────────
// 8. OPERATOR EXECUTOR TYPE
// ─────────────────────────────────────────────────────────────

/**
 * A typed function that executes a single operator.
 * Generic over the specific operator variant O.
 *
 * TODO: Define OperatorExecutor<O extends PlanOperator> as a function type
 *       that receives (operator: O, rows: ReadonlyArray<Row>, registry: TableRegistry)
 *       and returns Result<ReadonlyArray<Row>, QueryError>.
 */
export type OperatorExecutor<O extends PlanOperator> = // TODO

// ─────────────────────────────────────────────────────────────
// 9. EXECUTOR REGISTRY
// ─────────────────────────────────────────────────────────────

/**
 * A mapped type that maps every OperatorKind to its executor.
 *
 * TODO: Define ExecutorRegistry as a mapped type over OperatorKind
 *       where each key K maps to the executor for the operator
 *       whose `kind` discriminant equals K.
 *
 * Hint: Use Extract<PlanOperator, { kind: K }> to pick the right variant.
 */
export type ExecutorRegistry = // TODO

// ─────────────────────────────────────────────────────────────
// 10. CORE FUNCTIONS — implement all five
// ─────────────────────────────────────────────────────────────

/**
 * REQUIREMENT 1 — Validate raw input.
 *
 * Accepts `unknown` input and returns a Result.
 * - `table` must be a non-empty string → brand as TableName
 * - `select` must be a non-empty string[] → brand each element as FieldName
 * - `filter` is optional; if present must have:
 *     - `field`: non-empty string → FieldName
 *     - `op`: one of the FilterOperator literals
 *     - `value`: any non-undefined value
 * - `groupBy` is optional string[] → brand each as FieldName
 * - `orderBy` is optional; if present must have:
 *     - `field`: non-empty string → FieldName
 *     - `direction`: "asc" | "desc"
 * - `limit` is optional positive integer (> 0, finite, integer)
 * - On any violation return { ok: false, error: { kind: "validation", message: "..." } }
 */
export function validateQuery(raw: unknown): Result<ValidatedQuery, QueryError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Build an execution plan.
 *
 * Given a ValidatedQuery, return an ExecutionPlan whose `operators` array
 * contains operators in this fixed order (omit absent optional stages):
 *   scan → filter? → project → groupBy? → sort? → limit?
 *
 * - Always emit a ScanOperator and a ProjectOperator.
 * - Emit FilterOperatorNode only when query.filter is defined.
 * - Emit GroupByOperator only when query.groupBy is defined and non-empty.
 * - Emit SortOperator only when query.orderBy is defined.
 * - Emit LimitOperator only when query.limit is defined.
 * - Return { ok: false, error: { kind: "planning", message: "..." } } if
 *   a groupBy is requested but select contains fields not in groupBy keys
 *   AND those fields are not aggregate placeholders (for simplicity: just
 *   ensure every select field is present in groupBy keys when groupBy is set).
 */
export function buildPlan(
  query: ValidatedQuery
): Result<ExecutionPlan, QueryError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Build the executor registry.
 *
 * Return a fully-typed ExecutorRegistry whose executors implement:
 *
 * scan    — Look up table in registry; error if not found.
 *           Ignore incoming rows (scan is always first).
 *
 * filter  — Apply the FilterClause to each row.
 *           Supported ops: eq, neq, gt, gte, lt, lte, in
 *           For "in": clause.value must be an array; error if not.
 *           For comparison ops: both sides must be number or string; error if not.
 *
 * project — Keep only the fields listed in the operator.
 *           Rows missing a projected field should have that key set to `null`.
 *
 * groupBy — Group rows by the composite key of `keys` fields.
 *           Emit one representative row per unique key combination
 *           (first row of each group).
 *
 * sort    — Sort rows by `field` in the given direction.
 *           Treat missing field values as `null` (sort last for asc, first for desc).
 *
 * limit   — Keep only the first `count` rows.
 *
 * All executors must return Result<ReadonlyArray<Row>, QueryError>.
 */
export function buildExecutorRegistry(registry: TableRegistry): ExecutorRegistry {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4 — Execute a plan.
 *
 * Walk the operators array. For each operator:
 *   1. Look up its executor in the registry by `operator.kind`.
 *   2. Record rowsIn, call the executor, record rowsOut and durationMs.
 *   3. If the executor returns { ok: false }, immediately return that error
 *      wrapped as { kind: "execution", stage: operator.kind, message: ... }.
 *   4. Pipe the output rows into the next operator.
 *
 * Return a full QueryReport on success.
 */
export function executePlan(
  query: ValidatedQuery,
  plan: ExecutionPlan,
  executors: ExecutorRegistry
): Result<QueryReport, QueryError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — Top-level orchestrator.
 *
 * Compose validateQuery → buildPlan → buildExecutorRegistry → executePlan.
 * Short-circuit and return the first error encountered.
 * The registry parameter is your TableRegistry (in-memory data source).
 */
export function runQuery(
  raw: unknown,
  registry: TableRegistry
): Result<QueryReport, QueryError> {
  // TODO
  throw new Error("Not implemented");
}
