// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts — Typed Workflow Orchestrator test harness
// Run with:  npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  validateWorkflow,
  buildExecutionStages,
  withRetry,
  withTimeout,
  executeStep,
  orchestrate,
  toStepId,
  TimeoutError,
  type WorkflowDef,
  type HandlerRegistry,
  type StepReport,
  type StepId,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function run(label: string, fn: () => Promise<void>): Promise<void> {
  console.log(`\n▶ ${label}`);
  try {
    await fn();
  } catch (err) {
    console.error(`  ✗ UNCAUGHT:`, err);
    process.exitCode = 1;
  }
}

// ── Mock workflow definitions ─────────────────────────────────────────────────

/** Valid 4-step diamond: fetch → [transform, enrich] → load */
const validRawDef = {
  workflowId: "etl-pipeline",
  steps: [
    {
      id: "fetch",
      dependsOn: [],
      retry: { maxAttempts: 1, baseDelayMs: 0 },
      timeout: { timeoutMs: 500 },
    },
    {
      id: "transform",
      dependsOn: ["fetch"],
      retry: { maxAttempts: 2, baseDelayMs: 10 },
      timeout: { timeoutMs: 500 },
    },
    {
      id: "enrich",
      dependsOn: ["fetch"],
      retry: { maxAttempts: 2, baseDelayMs: 10 },
      timeout: { timeoutMs: 500 },
    },
    {
      id: "load",
      dependsOn: ["transform", "enrich"],
      retry: { maxAttempts: 1, baseDelayMs: 0 },
      timeout: { timeoutMs: 500 },
    },
  ],
};

/** Circular dependency: a → b → a */
const cyclicRawDef = {
  workflowId: "cyclic",
  steps: [
    {
      id: "a",
      dependsOn: ["b"],
      retry: { maxAttempts: 1, baseDelayMs: 0 },
      timeout: { timeoutMs: 100 },
    },
    {
      id: "b",
      dependsOn: ["a"],
      retry: { maxAttempts: 1, baseDelayMs: 0 },
      timeout: { timeoutMs: 100 },
    },
  ],
};

/** Missing dependency reference */
const missingDepRawDef = {
  workflowId: "missing-dep",
  steps: [
    {
      id: "step1",
      dependsOn: ["ghost"],
      retry: { maxAttempts: 1, baseDelayMs: 0 },
      timeout: { timeoutMs: 100 },
    },
  ],
};

// ── Test 1: Validation ────────────────────────────────────────────────────────

await run("validateWorkflow", async () => {
  const good = validateWorkflow(validRawDef);
  assert(good.ok === true, "valid definition is accepted");
  if (good.ok) {
    assert(good.value.workflowId === "etl-pipeline", "workflowId preserved");
    assert(good.value.steps.length === 4, "all 4 steps parsed");
  }

  const cyclic = validateWorkflow(cyclicRawDef);
  assert(cyclic.ok === false, "cyclic definition is rejected");

  const missingDep = validateWorkflow(missingDepRawDef);
  assert(missingDep.ok === false, "missing dependency reference is rejected");

  const nullCase = validateWorkflow(null);
  assert(nullCase.ok === false, "null input is rejected");

  const noSteps = validateWorkflow({ workflowId: "x", steps: [] });
  assert(noSteps.ok === false, "empty steps array is rejected");
});

// ── Test 2: Execution stages ──────────────────────────────────────────────────

await run("buildExecutionStages", async () => {
  const result = validateWorkflow(validRawDef);
  assert(result.ok === true, "prerequisite: definition is valid");
  if (!result.ok) return;

  const stages = buildExecutionStages(result.value);
  assert(stages.length === 3, "diamond graph produces 3 stages");

  const stage0Ids = stages[0].map((s) => s.id).sort();
  assert(
    stage0Ids.length === 1 && stage0Ids[0] === "fetch",
    "stage 0 contains only 'fetch'"
  );

  const stage1Ids = stages[1].map((s) => s.id).sort();
  assert(
    stage1Ids.length === 2 &&
      stage1Ids[0] === "enrich" &&
      stage1Ids[1] === "transform",
    "stage 1 contains 'transform' and 'enrich' (concurrent)"
  );

  const stage2Ids = stages[2].map((s) => s.id).sort();
  assert(
    stage2Ids.length === 1 && stage2Ids[0] === "load",
    "stage 2 contains only 'load'"
  );
});

// ── Test 3: withRetry ─────────────────────────────────────────────────────────

await run("withRetry", async () => {
  let callCount = 0;
  const flakyHandler = async (): Promise<unknown> => {
    callCount++;
    if (callCount < 3) throw new Error("transient");
    return "ok";
  };

  const result = await withRetry(flakyHandler, {
    maxAttempts: 3,
    baseDelayMs: 5,
  });
  assert(result.output === "ok", "handler succeeds on 3rd attempt");
  assert(result.attempts === 3, "attempts count is 3");

  let failCount = 0;
  const alwaysFails = async (): Promise<unknown> => {
    failCount++;
    throw new Error(`fail-${failCount}`);
  };
  try {
    await withRetry(alwaysFails, { maxAttempts: 2, baseDelayMs: 5 });
    assert(false, "should have thrown after exhausting retries");
  } catch (err) {
    assert(
      err instanceof Error && err.message === "fail-2",
      "last error is re-thrown after exhausting retries"
    );
    assert(failCount === 2, "handler called exactly maxAttempts times");
  }
});

// ── Test 4: withTimeout ───────────────────────────────────────────────────────

await run("withTimeout", async () => {
  const stepId = toStepId("slow-step");
  const timeoutPromise = withTimeout(stepId, 50);
  const slowWork = new Promise<string>((resolve) =>
    setTimeout(() => resolve("done"), 200)
  );

  try {
    await Promise.race([slowWork, timeoutPromise]);
    assert(false, "race should have rejected via timeout");
  } catch (err) {
    assert(err instanceof TimeoutError, "rejects with TimeoutError");
    assert(
      (err as TimeoutError).stepId === stepId,
      "TimeoutError carries stepId"
    );
  }
});

// ── Test 5: Full orchestration ────────────────────────────────────────────────

await run("orchestrate — happy path", async () => {
  const order: string[] = [];

  const registry: HandlerRegistry = {
    [toStepId("fetch")]: async (_ctx) => {
      order.push("fetch");
      return { rows: 42 };
    },
    [toStepId("transform")]: async (ctx) => {
      order.push("transform");
      const fetchOut = ctx[toStepId("fetch")] as { rows: number };
      return { transformed: fetchOut.rows * 2 };
    },
    [toStepId("enrich")]: async (_ctx) => {
      order.push("enrich");
      return { enriched: true };
    },
    [toStepId("load")]: async (_ctx) => {
      order.push("load");
      return { loaded: true };
    },
  } satisfies HandlerRegistry;

  const report = await orchestrate(validRawDef, registry);

  assert(report.workflowId === "etl-pipeline", "workflowId in report");
  assert(report.status === "completed", "all steps succeed → status completed");
  assert(report.stepReports.length === 4, "4 step reports emitted");
  assert(
    report.stepReports.every((r) => r.kind === "success"),
    "all step reports are success"
  );
  assert(order[0] === "fetch", "fetch runs first");
  assert(order[order.length - 1] === "load", "load runs last");
  assert(report.totalDurationMs >= 0, "totalDurationMs is non-negative");
});

await run("orchestrate — partial failure & skip propagation", async () => {
  const partialRawDef = {
    workflowId: "partial",
    steps: [
      {
        id: "a",
        dependsOn: [],
        retry: { maxAttempts: 1, baseDelayMs: 0 },
        timeout: { timeoutMs: 200 },
      },
      {
        id: "b",
        dependsOn: ["a"],
        retry: { maxAttempts: 1, baseDelayMs: 0 },
        timeout: { timeoutMs: 200 },
      },
      {
        id: "c",
        dependsOn: ["b"],
        retry: { maxAttempts: 1, baseDelayMs: 0 },
        timeout: { timeoutMs: 200 },
      },
    ],
  };

  const registry: HandlerRegistry = {
    [toStepId("a")]: async () => {
      throw new Error("step-a-boom");
    },
    [toStepId("b")]: async () => "should not run",
    [toStepId("c")]: async () => "should not run",
  } satisfies HandlerRegistry;

  const report = await orchestrate(partialRawDef, registry);

  assert(report.status === "partial_failure", "status is partial_failure");

  const aReport = report.stepReports.find((r) => r.stepId === toStepId("a"));
  const bReport = report.stepReports.find((r) => r.stepId === toStepId("b"));
  const cReport = report.stepReports.find((r) => r.stepId === toStepId("c"));

  assert(aReport?.kind === "failure", "step a is failure");
  assert(bReport?.kind === "skipped", "step b is skipped (dep failed)");
  assert(cReport?.kind === "skipped", "step c is skipped (transitive dep failed)");
});
