
// ============================================================
// challenge.test.ts — Typed Query Plan Optimizer
// ============================================================
import {
  optimize,
  parseExpr,
  parseQueryNode,
  walkExpr,
  type ExprVisitor,
  type LiteralExpr,
  type ColumnRef,
  type BinaryExpr,
  type AggExpr,
  type CaseExpr,
  type Expr,
  type ExecutionPlan,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────

function assertOk<T, E>(
  r: { ok: true; value: T } | { ok: false; error: E },
  label: string
): T {
  console.assert(r.ok === true, `[FAIL] ${label} — expected ok:true, got ok:false`);
  if (!r.ok) throw new Error(label);
  return r.value;
}

function assertFail<T, E>(
  r: { ok: true; value: T } | { ok: false; error: E },
  label: string
): void {
  console.assert(r.ok === false, `[FAIL] ${label} — expected ok:false, got ok:true`);
}

// ── TEST 1: parseExpr — valid literal ────────────────────────
{
  const result = parseExpr({ kind: "literal", value: 42 });
  const expr = assertOk(result, "TEST 1: parseExpr literal");
  console.assert(
    expr.kind === "literal",
    `[FAIL] TEST 1 — expected kind 'literal', got '${expr.kind}'`
  );
  console.log("[PASS] TEST 1: parseExpr — valid literal");
}

// ── TEST 2: parseExpr — invalid kind ─────────────────────────
{
  const result = parseExpr({ kind: "unknown_kind" });
  assertFail(result, "TEST 2: parseExpr invalid kind");
  console.log("[PASS] TEST 2: parseExpr — invalid kind rejected");
}

// ── TEST 3: walkExpr — kind-counting visitor ──────────────────
{
  // Build: (users.id = 1) AND (users.active = true)
  const leftEq: Expr = {
    kind: "binary",
    op: "=",
    left:  { kind: "column", table: "users", name: "id" },
    right: { kind: "literal", value: 1 },
  };
  const rightEq: Expr = {
    kind: "binary",
    op: "=",
    left:  { kind: "column", table: "users", name: "active" },
    right: { kind: "literal", value: true },
  };
  const andExpr: Expr = { kind: "binary", op: "AND", left: leftEq, right: rightEq };

  // Visitor counts how many times each kind is visited (non-recursive visitor just counts root)
  const counts: Record<string, number> = {};
  const countVisitor: ExprVisitor<void> = {
    visitLiteral(_e: LiteralExpr)  { counts["literal"]  = (counts["literal"]  ?? 0) + 1; },
    visitColumn (_e: ColumnRef)    { counts["column"]   = (counts["column"]   ?? 0) + 1; },
    visitBinary (_e: BinaryExpr)   { counts["binary"]   = (counts["binary"]   ?? 0) + 1; },
    visitAgg    (_e: AggExpr)      { counts["agg"]      = (counts["agg"]      ?? 0) + 1; },
    visitCase   (_e: CaseExpr)     { counts["case"]     = (counts["case"]     ?? 0) + 1; },
  };

  walkExpr(andExpr, countVisitor);
  console.assert(
    counts["binary"] === 1,
    `[FAIL] TEST 3 — expected 1 binary visit, got ${counts["binary"]}`
  );
  console.log("[PASS] TEST 3: walkExpr — dispatches to correct visitor method");
}

// ── TEST 4: optimize — scan + filter plan ────────────────────
{
  const raw = {
    op: "filter",
    predicate: {
      kind: "binary",
      op: "=",
      left:  { kind: "column", table: "users", name: "id" },
      right: { kind: "literal", value: 1 },
    },
    child: { op: "scan", table: "users", alias: "u" },
  };

  const plan: ExecutionPlan = assertOk(optimize(raw), "TEST 4: optimize scan+filter");

  console.assert(
    plan.root.op === "Filter",
    `[FAIL] TEST 4 — root op should be 'Filter', got '${plan.root.op}'`
  );
  console.assert(
    plan.root.op === "Filter" && plan.root.child.op === "SeqScan",
    "[FAIL] TEST 4 — child of Filter should be SeqScan"
  );
  // users has 10_000 rows; filter selectivity 10% → 1_000; totalCost = 10_000 + 1_000
  console.assert(
    plan.totalCost === 11_000,
    `[FAIL] TEST 4 — expected totalCost 11000, got ${plan.totalCost}`
  );
  console.log("[PASS] TEST 4: optimize — scan + filter plan with correct cost");
}

// ── TEST 5: optimize — large-table scan warning ───────────────
{
  const raw = { op: "scan", table: "orders", alias: "o" };
  const plan: ExecutionPlan = assertOk(optimize(raw), "TEST 5: large table warning");

  console.assert(
    plan.warnings.some((w) => w.includes("orders")),
    `[FAIL] TEST 5 — expected warning mentioning 'orders', got: ${JSON.stringify(plan.warnings)}`
  );
  console.log("[PASS] TEST 5: optimize — large-table scan emits warning");
}

// ── TEST 6: optimize — agg node cost ─────────────────────────
{
  const raw = {
    op: "agg",
    groupBy: [{ kind: "column", table: "orders", name: "user_id" }],
    aggregates: [
      {
        alias: "total",
        expr: { kind: "agg", fn: "SUM", source: { kind: "column", table: "orders", name: "amount" } },
      },
    ],
    child: { op: "scan", table: "orders", alias: "o" },
  };

  const plan: ExecutionPlan = assertOk(optimize(raw), "TEST 6: agg node");
  // orders = 500_000; agg with 1 groupBy col → ceil(500_000 * 0.2) = 100_000
  // totalCost = 500_000 (scan) + 100_000 (agg) = 600_000
  console.assert(
    plan.totalCost === 600_000,
    `[FAIL] TEST 6 — expected totalCost 600000, got ${plan.totalCost}`
  );
  console.log("[PASS] TEST 6: optimize — agg node cost is correct");
}

// ── TEST 7: optimize — invalid raw input ─────────────────────
{
  const result = optimize({ op: "warp_drive", table: "users" });
  assertFail(result, "TEST 7: optimize invalid raw");
  console.log("[PASS] TEST 7: optimize — invalid raw returns error");
}

console.log("\n✅ All tests complete.");
