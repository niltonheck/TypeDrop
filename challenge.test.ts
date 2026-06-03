// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseWorkflowDefinition,
  withRetry,
  executeWorkflow,
  type WorkflowId,
  type StepId,
  type HandlerRegistry,
  type StepOutput,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const wfId  = "wf-001" as WorkflowId;
const s1    = "step-1" as StepId;
const s2    = "step-2" as StepId;
const s3    = "step-3" as StepId;
const s4    = "step-4" as StepId;

// ------------------------------------------------------------------
// Mock registry
// ------------------------------------------------------------------
const registry: HandlerRegistry = {
  http: async (step, _signal) => {
    const out: StepOutput<"http"> = { statusCode: 200, body: `OK:${step.url}` };
    return out;
  },
  transform: async (step, _signal) => {
    const out: StepOutput<"transform"> = { result: `eval(${step.expression})` };
    return out;
  },
  condition: async (_step, _signal) => {
    const out: StepOutput<"condition"> = { evaluated: true, nextStepId: s3 };
    return out;
  },
  notify: async (step, _signal) => {
    const out: StepOutput<"notify"> = { delivered: true, provider: step.channel };
    return out;
  },
};

// ------------------------------------------------------------------
// Raw workflow fixture
// ------------------------------------------------------------------
const rawWorkflow = {
  id:        wfId,
  name:      "Test Workflow",
  timeoutMs: 5000,
  steps: [
    { id: s1, kind: "http",      retries: 1, url: "https://api.example.com/data", method: "GET" },
    { id: s2, kind: "condition", retries: 0, expression: "input > 0", onTrue: s3, onFalse: s4 },
    { id: s3, kind: "transform", retries: 0, expression: "input * 2" },
    { id: s4, kind: "notify",    retries: 0, channel: "slack", message: "Done!" },
  ],
};

// ------------------------------------------------------------------
// Test 1 — parseWorkflowDefinition: valid input
// ------------------------------------------------------------------
(function test_parse_valid() {
  const wf = parseWorkflowDefinition(rawWorkflow);
  console.assert(wf.id === wfId,               "T1a: id mismatch");
  console.assert(wf.steps.length === 4,        "T1b: wrong step count");
  console.assert(wf.steps[0].kind === "http",  "T1c: first step kind wrong");
  console.assert(wf.timeoutMs === 5000,        "T1d: timeoutMs wrong");
  console.log("✅ T1 parseWorkflowDefinition (valid)");
})();

// ------------------------------------------------------------------
// Test 2 — parseWorkflowDefinition: invalid input throws
// ------------------------------------------------------------------
(function test_parse_invalid() {
  let threw = false;
  try { parseWorkflowDefinition({ id: "", name: "x", steps: [], timeoutMs: 100 }); }
  catch { threw = true; }
  console.assert(threw, "T2a: should throw on empty id");

  let threw2 = false;
  try { parseWorkflowDefinition({ id: "x", name: "x", steps: [{ id: "s", kind: "unknown" }], timeoutMs: 100 }); }
  catch { threw2 = true; }
  console.assert(threw2, "T2b: should throw on unknown kind");
  console.log("✅ T2 parseWorkflowDefinition (invalid)");
})();

// ------------------------------------------------------------------
// Test 3 — withRetry: succeeds on first attempt
// ------------------------------------------------------------------
(async function test_retry_success() {
  const ctrl = new AbortController();
  let calls = 0;
  const { result, attempts } = await withRetry(
    async () => { calls++; return 42; },
    3,
    10,
    ctrl.signal
  );
  console.assert(result === 42,   "T3a: result should be 42");
  console.assert(attempts === 1,  "T3b: should only need 1 attempt");
  console.assert(calls === 1,     "T3c: fn called once");
  console.log("✅ T3 withRetry (immediate success)");
})();

// ------------------------------------------------------------------
// Test 4 — withRetry: retries then succeeds
// ------------------------------------------------------------------
(async function test_retry_eventual_success() {
  const ctrl = new AbortController();
  let calls = 0;
  const { result, attempts } = await withRetry(
    async () => {
      calls++;
      if (calls < 3) throw new Error("transient");
      return "done";
    },
    5,
    5,
    ctrl.signal
  );
  console.assert(result === "done", "T4a: result wrong");
  console.assert(attempts === 3,   "T4b: should take 3 attempts");
  console.log("✅ T4 withRetry (eventual success)");
})();

// ------------------------------------------------------------------
// Test 5 — executeWorkflow: full happy-path run
// ------------------------------------------------------------------
(async function test_execute_happy_path() {
  const report = await executeWorkflow(rawWorkflow, registry);

  console.assert(report.workflowId === wfId,          "T5a: workflowId wrong");
  console.assert(report.status === "completed",        "T5b: status should be completed");
  // condition step branches to s3; s4 is skipped
  const skipped = report.stepResults.filter(r => r.status === "skipped");
  console.assert(skipped.length === 1,                 "T5c: exactly 1 step should be skipped");
  console.assert(skipped[0].stepId === s4,             "T5d: s4 should be skipped");
  console.assert(report.summary.http.succeeded === 1,  "T5e: http summary wrong");
  console.assert(report.summary.notify.total === 1,    "T5f: notify total wrong (skipped counts)");
  console.log("✅ T5 executeWorkflow (happy path)");
})();

// ------------------------------------------------------------------
// Test 6 — executeWorkflow: step failure aborts remaining steps
// ------------------------------------------------------------------
(async function test_execute_step_failure() {
  const failingRegistry: HandlerRegistry = {
    ...registry,
    http: async (_step, _signal) => { throw new Error("HTTP 500"); },
  };
  const report = await executeWorkflow(rawWorkflow, failingRegistry);
  console.assert(report.status === "failed",           "T6a: status should be failed");
  const httpResult = report.stepResults.find(r => r.stepId === s1);
  console.assert(httpResult?.status === "failed",      "T6b: http step should be failed");
  const remaining = report.stepResults.filter(r => r.stepId !== s1);
  console.assert(remaining.every(r => r.status === "skipped"), "T6c: remaining should be skipped");
  console.log("✅ T6 executeWorkflow (step failure)");
})();
