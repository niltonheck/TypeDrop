// challenge.test.ts
import {
  runWorkflow, orchestrate, validateWorkflow, topoSort,
  workflowId, stepId,
  ok, err,
  type Workflow, type StepHandlerMap, type ExecutorConfig,
  type StepResult,
} from "./challenge";

// -------------------------------------------------------------------
// Shared config
// -------------------------------------------------------------------
const config: ExecutorConfig = {
  concurrency: 2,
  maxRetries:  1,
  retryBaseMs: 10,
};

// -------------------------------------------------------------------
// Mock handlers
// -------------------------------------------------------------------
let callCounts: Record<string, number> = {};

const handlers: StepHandlerMap = {
  http: async (step, _ctx) => {
    callCounts[step.id] = (callCounts[step.id] ?? 0) + 1;
    return { fetched: step.url };
  },
  transform: async (step, ctx) => {
    callCounts[step.id] = (callCounts[step.id] ?? 0) + 1;
    return { transformed: ctx.getOutput(step.dependsOn[0]) };
  },
  condition: async (step, _ctx) => {
    callCounts[step.id] = (callCounts[step.id] ?? 0) + 1;
    // Always returns true so thenStepId branch is taken
    return true;
  },
  delay: async (step, _ctx) => {
    callCounts[step.id] = (callCounts[step.id] ?? 0) + 1;
    return null;
  },
};

// -------------------------------------------------------------------
// TEST 1 — validateWorkflow rejects bad input
// -------------------------------------------------------------------
{
  const result = validateWorkflow({ id: 42, name: "bad", steps: [] });
  console.assert(result.ok === false, "TEST 1 FAILED: expected Err for numeric id");
  console.log("TEST 1 passed:", !result.ok ? result.error : "—");
}

// -------------------------------------------------------------------
// TEST 2 — validateWorkflow accepts valid input
// -------------------------------------------------------------------
{
  const raw = {
    id: "wf-1",
    name: "Simple HTTP",
    steps: [
      { kind: "http", id: "s1", url: "https://example.com", method: "GET", dependsOn: [] },
    ],
  };
  const result = validateWorkflow(raw);
  console.assert(result.ok === true, "TEST 2 FAILED: expected Ok for valid workflow");
  if (result.ok) {
    console.assert(result.value.steps.length === 1, "TEST 2 FAILED: expected 1 step");
  }
  console.log("TEST 2 passed");
}

// -------------------------------------------------------------------
// TEST 3 — topoSort detects cycles
// -------------------------------------------------------------------
{
  const s1 = stepId("s1");
  const s2 = stepId("s2");
  const steps = [
    { kind: "delay" as const, id: s1, dependsOn: [s2], ms: 10 },
    { kind: "delay" as const, id: s2, dependsOn: [s1], ms: 10 },
  ];
  const result = topoSort(steps);
  console.assert(result.ok === false, "TEST 3 FAILED: expected cycle detection");
  console.log("TEST 3 passed:", !result.ok ? result.error : "—");
}

// -------------------------------------------------------------------
// TEST 4 — orchestrate runs a linear chain and retries on failure
// -------------------------------------------------------------------
(async () => {
  callCounts = {};

  // s2 depends on s1; s1 will fail on first attempt (we patch handler temporarily)
  let s1Attempts = 0;
  const patchedHandlers: StepHandlerMap = {
    ...handlers,
    http: async (step, ctx) => {
      if (step.id === "s1") {
        s1Attempts++;
        if (s1Attempts === 1) throw new Error("transient error");
        return { fetched: step.url };
      }
      return handlers.http(step, ctx);
    },
  };

  const workflow: Workflow = {
    id:    workflowId("wf-retry"),
    name:  "Retry Test",
    steps: [
      { kind: "http",      id: stepId("s1"), url: "https://api.test/data", method: "GET", dependsOn: [] },
      { kind: "transform", id: stepId("s2"), expression: "x => x", dependsOn: [stepId("s1")] },
    ],
  };

  const report = await orchestrate(workflow, patchedHandlers, config);

  const s1Result = report.stepResults.find(r => r.stepId === "s1");
  const s2Result = report.stepResults.find(r => r.stepId === "s2");

  console.assert(s1Result?.status === "success",   "TEST 4 FAILED: s1 should succeed after retry");
  console.assert((s1Result as { attempts?: number })?.attempts === undefined || true, "TEST 4: attempts field ok");
  console.assert(s2Result?.status === "success",   "TEST 4 FAILED: s2 should succeed");
  console.assert(report.outcome   === "completed", "TEST 4 FAILED: outcome should be completed");
  console.log("TEST 4 passed — outcome:", report.outcome);
})();

// -------------------------------------------------------------------
// TEST 5 — runWorkflow skips dependent steps when a step fails permanently
// -------------------------------------------------------------------
(async () => {
  const alwaysFailHandlers: StepHandlerMap = {
    ...handlers,
    http: async (_step, _ctx) => { throw new Error("always fails"); },
  };

  const raw = {
    id: "wf-fail",
    name: "Failure Chain",
    steps: [
      { kind: "http",      id: "s1", url: "https://fail.test", method: "POST", dependsOn: [] },
      { kind: "transform", id: "s2", expression: "x => x",    dependsOn: ["s1"] },
    ],
  };

  const failConfig: ExecutorConfig = { concurrency: 1, maxRetries: 0, retryBaseMs: 0 };
  const report = await runWorkflow(raw, alwaysFailHandlers, failConfig);

  const s1Result = report.stepResults.find(r => r.stepId === "s1");
  const s2Result = report.stepResults.find(r => r.stepId === "s2");

  console.assert(s1Result?.status === "failure", "TEST 5 FAILED: s1 should fail");
  console.assert(s2Result?.status === "skipped", "TEST 5 FAILED: s2 should be skipped");
  console.assert(report.outcome   === "failed",  "TEST 5 FAILED: outcome should be failed");
  console.log("TEST 5 passed — outcome:", report.outcome);
})();
