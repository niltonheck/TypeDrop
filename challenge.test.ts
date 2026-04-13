// ============================================================
// Typed Workflow Orchestrator — challenge.test.ts
// ============================================================
import {
  Ok, Err,
  parseWorkflowDef, composeMiddleware, withRetry, runWorkflow,
} from "./challenge";
import type {
  StepId, WorkflowId,
  HandlerRegistry, MiddlewareFn,
  ExecutionError, StepOutcome,
} from "./challenge";

// ── Helpers ────────────────────────────────────────────────────────

const noDelay = (_ms: number): Promise<void> => Promise.resolve();

// ── Mock step IDs (cast via Ok-branded path, not `as`) ─────────────
// We rely on parseWorkflowDef to produce branded IDs in practice;
// here we simulate them for unit tests.
const sid = (s: string) => s as unknown as StepId;   // test-only helper

// ── 1. parseWorkflowDef — valid input ─────────────────────────────
const validRaw = {
  id: "wf-001",
  name: "Smoke Test Workflow",
  steps: [
    { kind: "http",      stepId: "s1", url: "https://api.example.com/data", method: "GET",  retries: 2 },
    { kind: "transform", stepId: "s2", expression: "x => x.data",           retries: 1 },
    { kind: "notify",    stepId: "s3", channel: "slack", template: "Done!",  retries: 0 },
  ],
  entryId: "s1",
};

const parsed = parseWorkflowDef(validRaw);
console.assert(parsed.ok === true, "TEST 1 FAILED: valid workflow should parse successfully");
if (parsed.ok) {
  console.assert(parsed.value.steps.length === 3, "TEST 1b FAILED: should have 3 steps");
  console.assert(parsed.value.id === "wf-001",    "TEST 1c FAILED: id should be preserved");
}

// ── 2. parseWorkflowDef — invalid input ───────────────────────────
const badRetries = {
  id: "wf-002", name: "Bad Retries",
  steps: [{ kind: "http", stepId: "s1", url: "https://x.com", method: "GET", retries: 9 }],
  entryId: "s1",
};
const parsedBad = parseWorkflowDef(badRetries);
console.assert(parsedBad.ok === false, "TEST 2 FAILED: retries=9 should fail validation");
if (!parsedBad.ok) {
  console.assert(
    parsedBad.error.kind === "ValidationError",
    "TEST 2b FAILED: error kind should be ValidationError"
  );
}

// ── 3. composeMiddleware ───────────────────────────────────────────
const log: string[] = [];

const mwA: MiddlewareFn = async (step, next) => {
  log.push(`A:before:${step.stepId}`);
  const r = await next();
  log.push(`A:after:${step.stepId}`);
  return r;
};
const mwB: MiddlewareFn = async (step, next) => {
  log.push(`B:before:${step.stepId}`);
  const r = await next();
  log.push(`B:after:${step.stepId}`);
  return r;
};

const fakeStep = { kind: "notify" as const, stepId: sid("t1"), channel: "email" as const, template: "hi", retries: 0 };
const terminal = async () => Ok("done" as unknown);
const composed = composeMiddleware([mwA, mwB], terminal);

await composed(fakeStep);
console.assert(
  JSON.stringify(log) === JSON.stringify(["A:before:t1","B:before:t1","B:after:t1","A:after:t1"]),
  `TEST 3 FAILED: middleware order wrong — got ${JSON.stringify(log)}`
);

// ── 4. withRetry — succeeds on second attempt ─────────────────────
let attempts4 = 0;
const flakyOp = async () => {
  attempts4++;
  if (attempts4 < 2) return Err<ExecutionError>({ kind: "ExecutionError", stepId: sid("r1"), message: "transient" });
  return Ok("ok" as unknown);
};
const retryResult = await withRetry(sid("r1"), 3, flakyOp, noDelay);
console.assert(retryResult.ok === true,  "TEST 4 FAILED: should succeed on second attempt");
console.assert(attempts4 === 2,          "TEST 4b FAILED: should have called op exactly twice");

// ── 5. withRetry — exhausts all attempts ──────────────────────────
let attempts5 = 0;
const alwaysFail = async () => {
  attempts5++;
  return Err<ExecutionError>({ kind: "ExecutionError", stepId: sid("r2"), message: "permanent" });
};
const exhausted = await withRetry(sid("r2"), 3, alwaysFail, noDelay);
console.assert(exhausted.ok === false,                         "TEST 5 FAILED: should fail after exhausting retries");
console.assert(!exhausted.ok && exhausted.error.kind === "RetryExhausted", "TEST 5b FAILED: error kind should be RetryExhausted");
console.assert(!exhausted.ok && exhausted.error.kind === "RetryExhausted" && exhausted.error.attempts === 3,
  "TEST 5c FAILED: attempts count should be 3");

// ── 6. runWorkflow — end-to-end ────────────────────────────────────
const mockRegistry: HandlerRegistry = {
  http:      async (_step) => Ok({ status: 200, body: "response" } as unknown),
  transform: async (_step) => Ok("transformed" as unknown),
  condition: async (_step) => Ok(true as unknown),   // always takes trueBranch
  notify:    async (_step) => Ok("sent" as unknown),
};

const e2eRaw = {
  id: "wf-e2e", name: "End-to-End",
  steps: [
    { kind: "http",      stepId: "e1", url: "https://api.example.com", method: "POST", retries: 1 },
    { kind: "transform", stepId: "e2", expression: "x => x",           retries: 0 },
    { kind: "notify",    stepId: "e3", channel: "webhook", template: "all done", retries: 0 },
  ],
  entryId: "e1",
};

const report = await runWorkflow(e2eRaw, mockRegistry);
console.assert(report.ok === true, "TEST 6 FAILED: e2e workflow should succeed");
if (report.ok) {
  console.assert(report.value.finalStatus === "completed", "TEST 6b FAILED: finalStatus should be 'completed'");
  console.assert(report.value.outcomes.length === 3,       "TEST 6c FAILED: should have 3 outcomes");
  const allSuccess = report.value.outcomes.every((o: StepOutcome) => o.status === "success");
  console.assert(allSuccess, "TEST 6d FAILED: all step outcomes should be 'success'");
}

console.log("All tests executed.");
