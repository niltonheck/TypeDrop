// ============================================================
// challenge.test.ts  —  run with:  npx ts-node challenge.test.ts
// ============================================================
import {
  validateWorkflowDefinition,
  createOrchestrator,
  extractStepIds,
  narrowError,
  type WorkflowDefinition,
  type WorkflowError,
  type TransformerFn,
  type StepMiddleware,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// -----------------------------------------------------------
// TEST 1 — validateWorkflowDefinition: valid input
// -----------------------------------------------------------
console.log("\n── Test 1: validateWorkflowDefinition (valid) ──");
{
  const raw = {
    id: "wf-001",
    name: "Loan Approval",
    entryStepId: "score",
    steps: [
      { type: "transform", id: "score",  transformer: "creditScorer" },
      { type: "branch",    id: "decide", branches: { approved: "notify", rejected: "archive", "*": "notify" } },
      { type: "transform", id: "notify", transformer: "emailSender" },
      { type: "merge",     id: "finish", strategy: "first" },
    ],
  };
  const result = validateWorkflowDefinition(raw);
  assert(result.ok === true, "Returns ok:true for valid definition");
  if (result.ok) {
    assert(result.value.id === "wf-001", "Preserves workflow id");
    assert(result.value.steps.length === 4, "Preserves all 4 steps");
    assert(result.value.steps[1].type === "branch", "Step[1] typed as branch");
  }
}

// -----------------------------------------------------------
// TEST 2 — validateWorkflowDefinition: invalid input
// -----------------------------------------------------------
console.log("\n── Test 2: validateWorkflowDefinition (invalid) ──");
{
  const missingId = { name: "Bad", entryStepId: "x", steps: [{ type: "transform", id: "x", transformer: "t" }] };
  const r1 = validateWorkflowDefinition(missingId);
  assert(r1.ok === false && r1.error.kind === "ValidationError", "Missing id → ValidationError");

  const badStepType = {
    id: "wf-x", name: "Bad", entryStepId: "x",
    steps: [{ type: "unknown", id: "x" }],
  };
  const r2 = validateWorkflowDefinition(badStepType);
  assert(r2.ok === false && r2.error.kind === "ValidationError", "Invalid step type → ValidationError");

  const badMergeStrategy = {
    id: "wf-y", name: "Bad", entryStepId: "x",
    steps: [{ type: "merge", id: "x", strategy: "average" }],
  };
  const r3 = validateWorkflowDefinition(badMergeStrategy);
  assert(r3.ok === false && r3.error.kind === "ValidationError", "Invalid merge strategy → ValidationError");
}

// -----------------------------------------------------------
// TEST 3 — orchestrator: happy path with branching
// -----------------------------------------------------------
console.log("\n── Test 3: Orchestrator happy path ──");
{
  const creditScorer: TransformerFn<unknown, number> = async (input) => {
    const score = typeof input === "number" ? input + 100 : 500;
    return { ok: true, value: { value: score, outcome: score >= 600 ? "approved" : "rejected" } };
  };

  const emailSender: TransformerFn<unknown, string> = async (input) => {
    return { ok: true, value: { value: `Email sent for score ${input}`, outcome: "done" } };
  };

  const registry = { creditScorer, emailSender };
  const orchestrator = createOrchestrator(registry);

  const definition: WorkflowDefinition = {
    id: "wf-001",
    name: "Loan Approval",
    entryStepId: "score",
    steps: [
      { type: "transform", id: "score",  transformer: "creditScorer" },
      { type: "branch",    id: "decide", branches: { approved: "notify", rejected: "notify", "*": "notify" } },
      { type: "transform", id: "notify", transformer: "emailSender" },
      { type: "merge",     id: "finish", strategy: "first" },
    ],
  };

  const report = await orchestrator.run(definition, 550);
  assert(report.status === "completed", "Workflow completes successfully");
  assert(report.trace.length === 4, "All 4 steps traced");
  assert(report.trace[0].type === "transform", "First trace entry is transform");
  assert(report.trace[1].type === "branch", "Second trace entry is branch");
  assert(typeof report.finalOutput === "string", "Final output is a string");
}

// -----------------------------------------------------------
// TEST 4 — orchestrator: StepError on unknown transformer
// -----------------------------------------------------------
console.log("\n── Test 4: Orchestrator StepError ──");
{
  const registry = {};
  const orchestrator = createOrchestrator(registry);

  const definition: WorkflowDefinition = {
    id: "wf-002",
    name: "Ghost Workflow",
    entryStepId: "phantom",
    steps: [{ type: "transform", id: "phantom", transformer: "nonExistent" }],
  };

  const report = await orchestrator.run(definition, null);
  assert(report.status === "failed", "Workflow fails on unknown transformer");
  assert(report.error?.kind === "StepError", "Error kind is StepError");
}

// -----------------------------------------------------------
// TEST 5 — orchestrator: TimeoutError
// -----------------------------------------------------------
console.log("\n── Test 5: Orchestrator TimeoutError ──");
{
  const slowTransformer: TransformerFn<unknown, string> = async (_input) => {
    await new Promise((res) => setTimeout(res, 200));
    return { ok: true, value: { value: "too late", outcome: "done" } };
  };

  const registry = { slowTransformer };
  const orchestrator = createOrchestrator(registry);

  const definition: WorkflowDefinition = {
    id: "wf-003",
    name: "Slow Workflow",
    entryStepId: "slow",
    steps: [{ type: "transform", id: "slow", transformer: "slowTransformer", timeoutMs: 50 }],
  };

  const report = await orchestrator.run(definition, null);
  assert(report.status === "failed", "Workflow fails on timeout");
  assert(report.error?.kind === "TimeoutError", "Error kind is TimeoutError");
}

// -----------------------------------------------------------
// TEST 6 — orchestrator: middleware chain
// -----------------------------------------------------------
console.log("\n── Test 6: Middleware chain ──");
{
  const log: string[] = [];

  const mw1: StepMiddleware = async (step, payload, next) => {
    log.push(`mw1:before:${step.id}`);
    const result = await next(payload);
    log.push(`mw1:after:${step.id}`);
    return result;
  };
  const mw2: StepMiddleware = async (step, payload, next) => {
    log.push(`mw2:before:${step.id}`);
    const result = await next(payload);
    log.push(`mw2:after:${step.id}`);
    return result;
  };

  const echo: TransformerFn<unknown, unknown> = async (input) => ({
    ok: true,
    value: { value: input, outcome: "done" },
  });

  const orchestrator = createOrchestrator({ echo }, [mw1, mw2]);
  const definition: WorkflowDefinition = {
    id: "wf-004",
    name: "MW Test",
    entryStepId: "e",
    steps: [{ type: "transform", id: "e", transformer: "echo" }],
  };

  await orchestrator.run(definition, 42);
  assert(
    log[0] === "mw1:before:e" && log[1] === "mw2:before:e",
    "Middleware executes in registration order (outermost first)"
  );
  assert(
    log[2] === "mw2:after:e" && log[3] === "mw1:after:e",
    "Middleware unwinds in reverse order"
  );
}

// -----------------------------------------------------------
// TEST 7 — extractStepIds
// -----------------------------------------------------------
console.log("\n── Test 7: extractStepIds ──");
{
  const definition: WorkflowDefinition = {
    id: "wf-005",
    name: "Mixed",
    entryStepId: "a",
    steps: [
      { type: "transform", id: "a", transformer: "t1" },
      { type: "transform", id: "b", transformer: "t2" },
      { type: "branch",    id: "c", branches: { x: "d" } },
      { type: "merge",     id: "d", strategy: "sum" },
    ],
  };
  const ids = extractStepIds(definition);
  assert(
    JSON.stringify(ids.transform) === JSON.stringify(["a", "b"]),
    "transform ids: [a, b]"
  );
  assert(JSON.stringify(ids.branch) === JSON.stringify(["c"]), "branch ids: [c]");
  assert(JSON.stringify(ids.merge)  === JSON.stringify(["d"]), "merge ids: [d]");
}

// -----------------------------------------------------------
// TEST 8 — narrowError exhaustive matching
// -----------------------------------------------------------
console.log("\n── Test 8: narrowError ──");
{
  const err: WorkflowError = { kind: "StepError", stepId: "x", message: "boom" };
  const msg = narrowError(err, {
    ValidationError: (e) => `validation: ${e.field}`,
    StepError:       (e) => `step: ${e.stepId}`,
    BranchError:     (e) => `branch: ${e.unmatchedOutcome}`,
    TimeoutError:    (e) => `timeout: ${e.limitMs}ms`,
  });
  assert(msg === "step: x", "narrowError dispatches to the correct handler");
}

// -----------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------
console.log(`\n══════════════════════════════`);
console.log(`  ${passed} passed  /  ${failed} failed`);
console.log(`══════════════════════════════\n`);
if (failed > 0) process.exit(1);
