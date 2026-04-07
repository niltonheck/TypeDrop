
// ============================================================
// challenge.ts — Typed Query Plan Optimizer
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// ── 1. PRIMITIVE VALUE TYPES ─────────────────────────────────

export type LiteralValue = string | number | boolean | null;

// ── 2. EXPRESSION TREE (Discriminated Union) ─────────────────
//
// An Expr is one of:
//   • LiteralExpr   – a bare value
//   • ColumnRef     – reference to a named column in a table
//   • BinaryExpr    – left <op> right
//   • AggExpr       – aggregate function over a column
//   • CaseExpr      – CASE WHEN ... THEN ... ELSE ... END

export type BinaryOp = "+" | "-" | "*" | "/" | "=" | "!=" | "<" | ">" | "<=" | ">=" | "AND" | "OR";
export type AggFn    = "SUM" | "COUNT" | "AVG" | "MIN" | "MAX";

export type LiteralExpr = { kind: "literal"; value: LiteralValue };
export type ColumnRef   = { kind: "column";  table: string; name: string };
export type BinaryExpr  = { kind: "binary";  op: BinaryOp; left: Expr; right: Expr };
export type AggExpr     = { kind: "agg";     fn: AggFn;    source: ColumnRef };
export type CaseExpr    = {
  kind:  "case";
  whens: ReadonlyArray<{ when: Expr; then: Expr }>;
  else:  Expr;
};

// TODO 1 ── Define the `Expr` union type from the five variants above.
export type Expr = /* YOUR CODE HERE */ never;


// ── 3. QUERY NODE TREE ───────────────────────────────────────
//
// A QueryNode is one of:
//   • ScanNode    – full table scan
//   • FilterNode  – applies a predicate Expr to a child node
//   • ProjectNode – selects / renames columns; each output column has a name and Expr
//   • JoinNode    – inner join of left + right on a condition Expr
//   • AggNode     – groups by columns and computes AggExpr outputs

export type ScanNode = {
  op: "scan";
  table: string;
  alias: string;
};

export type FilterNode = {
  op: "filter";
  predicate: Expr;
  child: QueryNode;
};

export type ProjectNode = {
  op: "project";
  outputs: ReadonlyArray<{ alias: string; expr: Expr }>;
  child: QueryNode;
};

export type JoinNode = {
  op: "join";
  condition: Expr;
  left: QueryNode;
  right: QueryNode;
};

export type AggNode = {
  op: "agg";
  groupBy: ReadonlyArray<ColumnRef>;
  aggregates: ReadonlyArray<{ alias: string; expr: AggExpr }>;
  child: QueryNode;
};

// TODO 2 ── Define the `QueryNode` union type from the five variants above.
export type QueryNode = /* YOUR CODE HERE */ never;


// ── 4. RESULT TYPE ───────────────────────────────────────────

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

export type ParseError   = { kind: "parse";   message: string };
export type InvalidError = { kind: "invalid"; message: string };
export type OptimizerError = ParseError | InvalidError;


// ── 5. EXECUTION PLAN ────────────────────────────────────────

export type PlanNode =
  | { op: "SeqScan";  table: string; alias: string; estimatedRows: number }
  | { op: "Filter";   predicate: Expr; estimatedRows: number; child: PlanNode }
  | { op: "Project";  outputs: ReadonlyArray<{ alias: string; expr: Expr }>; estimatedRows: number; child: PlanNode }
  | { op: "HashJoin"; condition: Expr; estimatedRows: number; left: PlanNode; right: PlanNode }
  | { op: "HashAgg";  groupBy: ReadonlyArray<ColumnRef>; aggregates: ReadonlyArray<{ alias: string; expr: AggExpr }>; estimatedRows: number; child: PlanNode };

export type ExecutionPlan = {
  root: PlanNode;
  totalCost: number;   // sum of estimatedRows across all PlanNodes
  warnings: string[];  // e.g. "Full scan on large table: orders"
};


// ── 6. VISITOR ───────────────────────────────────────────────
//
// A generic, typed visitor over Expr nodes.
// Each visit method receives the concrete node type (not the union).

// TODO 3 ── Complete the ExprVisitor<R> interface so that:
//   • visitLiteral  receives a LiteralExpr  and returns R
//   • visitColumn   receives a ColumnRef    and returns R
//   • visitBinary   receives a BinaryExpr   and returns R
//   • visitAgg      receives an AggExpr     and returns R
//   • visitCase     receives a CaseExpr     and returns R
export interface ExprVisitor<R> {
  /* YOUR CODE HERE */
}

// TODO 4 ── Implement `walkExpr<R>(expr: Expr, visitor: ExprVisitor<R>): R`
//   Dispatch to the correct visitor method based on expr.kind.
//   Must be exhaustive — TypeScript should catch any missing branch.
export function walkExpr<R>(expr: Expr, visitor: ExprVisitor<R>): R {
  // YOUR CODE HERE
  throw new Error("not implemented");
}


// ── 7. COST MODEL ────────────────────────────────────────────

// Row-count heuristics (used by the planner):
export const TABLE_SIZES: Readonly<Record<string, number>> = {
  users:    10_000,
  orders:   500_000,
  products: 2_000,
  reviews:  750_000,
};

const LARGE_TABLE_THRESHOLD = 100_000;

// TODO 5 ── Implement `estimateRows(node: QueryNode): number`
//   • scan    → TABLE_SIZES[table] ?? 1_000  (unknown tables default to 1 000)
//   • filter  → Math.ceil(estimateRows(child) * 0.1)   (10 % selectivity)
//   • project → estimateRows(child)          (same cardinality)
//   • join    → Math.ceil(estimateRows(left) * estimateRows(right) * 0.001)
//   • agg     → groupBy.length === 0 ? 1 : Math.ceil(estimateRows(child) * 0.2)
export function estimateRows(node: QueryNode): number {
  // YOUR CODE HERE
  throw new Error("not implemented");
}


// ── 8. PLANNER ───────────────────────────────────────────────

// TODO 6 ── Implement `buildPlan(node: QueryNode, warnings: string[]): PlanNode`
//   Recursively convert a QueryNode into a PlanNode.
//   For each "scan" whose TABLE_SIZES entry exceeds LARGE_TABLE_THRESHOLD,
//   push the string `"Full scan on large table: <table>"` into `warnings`.
//   Attach the correct estimatedRows to every PlanNode variant.
export function buildPlan(node: QueryNode, warnings: string[]): PlanNode {
  // YOUR CODE HERE
  throw new Error("not implemented");
}


// ── 9. RAW INPUT VALIDATION ──────────────────────────────────

// TODO 7 ── Implement `parseExpr(raw: unknown): Result<Expr, ParseError>`
//   Validate and coerce an unknown blob into an Expr.
//   Requirements:
//   • raw must be a non-null object with a string `kind` field.
//   • "literal" → value must be string | number | boolean | null
//   • "column"  → table (string) + name (string) required
//   • "binary"  → op must be a valid BinaryOp; left + right recursively parsed
//   • "agg"     → fn must be a valid AggFn; source must parse as a ColumnRef
//   • "case"    → whens must be a non-empty array, each {when, then} recursively parsed;
//                 else recursively parsed
//   • Any other kind → ParseError
export function parseExpr(raw: unknown): Result<Expr, ParseError> {
  // YOUR CODE HERE
  throw new Error("not implemented");
}

// TODO 8 ── Implement `parseQueryNode(raw: unknown): Result<QueryNode, ParseError>`
//   Validate and coerce an unknown blob into a QueryNode.
//   Requirements:
//   • raw must be a non-null object with a string `op` field.
//   • "scan"    → table (string) + alias (string) required
//   • "filter"  → predicate (parsed via parseExpr) + child (recursively parsed)
//   • "project" → outputs must be a non-empty array of {alias: string, expr: parsed Expr};
//                 child recursively parsed
//   • "join"    → condition (parseExpr) + left + right (recursively parsed)
//   • "agg"     → groupBy (array of ColumnRef via parseExpr), aggregates (array of
//                 {alias: string, expr: AggExpr via parseExpr}), child recursively parsed
//   • Any other op → ParseError
export function parseQueryNode(raw: unknown): Result<QueryNode, ParseError> {
  // YOUR CODE HERE
  throw new Error("not implemented");
}


// ── 10. TOP-LEVEL OPTIMIZER ──────────────────────────────────

// TODO 9 ── Implement `optimize(raw: unknown): Result<ExecutionPlan, OptimizerError>`
//   1. Parse `raw` with `parseQueryNode`. Propagate any ParseError.
//   2. Build the plan with `buildPlan` (start with an empty warnings array).
//   3. Compute totalCost by summing estimatedRows across every PlanNode in the tree
//      (write a small recursive helper — do NOT export it).
//   4. Return { ok: true, value: { root, totalCost, warnings } }.
export function optimize(raw: unknown): Result<ExecutionPlan, OptimizerError> {
  // YOUR CODE HERE
  throw new Error("not implemented");
}
