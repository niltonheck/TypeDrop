// challenge.test.ts
import {
  toStepId,
  toHandlerKind,
  validateWorkflow,
  topologicalSort,
  runWorkflow,
  executeWorkflowJson,
  type HandlerRegistry,
  type ValidatedWorkflow,
  type StepInputMap,
  type HandlerDescriptor,
  type HandlerKind,
  type StepId,
} from "./challenge";

// ------------------------------------------------------------------
// Mock handlers
// ------------------------------------------------------------------

type FetchConfig  = { url: string };
type FetchOutput  = { body: string };
type ParseConfig  = { field: string };
type ParseOutput  = { value: string };
type NotifyConfig = { message: string };
type NotifyOutput = { sent: boolean };

const fetchHandler: HandlerDescriptor<FetchConfig, FetchOutput> = {
  kind: toHandlerKind("fetch"),
  validate(raw: unknown): FetchConfig {
    if (
      typeof raw !== "object" || raw === null ||
      typeof (raw as Record<string, unknown>)["url"] !== "string"
    ) throw new Error("fetch config must have a string `url`");
    return { url: (raw as Record<string, unknown>)["url"] as string };
  },
  async execute(config, _inputs): Promise<FetchOutput> {
    return { body: `response-from-${config.url}` };
  },
};

const parseHandler: HandlerDescriptor<ParseConfig, ParseOutput> = {
  kind: toHandlerKind("parse"),
  validate(raw: unknown): ParseConfig {
    if (
      typeof raw !== "object" || raw === null ||
      typeof (raw as Record<string, unknown>)["field"] !== "string"
    ) throw new Error("parse config must have a string `field`");
    return { field: (raw as Record<string, unknown>)["field"] as string };
  },
  async execute(config, inputs): Promise<ParseOutput> {
    const fetchId = Object.keys(inputs)[0] as StepId;
    const upstream = inputs[fetchId] as FetchOutput | undefined;
    return { value: `${config.field}:${upstream?.body ?? "none"}` };
  },
};

const notifyHandler: HandlerDescriptor<NotifyConfig, NotifyOutput> = {
  kind: toHandlerKind("notify"),
  validate(raw: unknown): NotifyConfig {
    if (
      typeof raw !== "object" || raw === null ||
      typeof (raw as Record<string, unknown>)["message"] !== "string"
    ) throw new Error("notify config must have a string `message`");
    return { message: (raw as Record<string, unknown>)["message"] as string };
  },
  async execute(config, _inputs): Promise<NotifyOutput> {
    if (config.message === "FAIL") throw new Error("Simulated notify failure");
    return { sent: true };
  },
};

// Build the registry using a satisfies-friendly plain object
const registry = {
  [toHandlerKind("fetch")]:  fetchHandler,
  [toHandlerKind("parse")]:  parseHandler,
  [toHandlerKind("notify")]: notifyHandler,
} satisfies HandlerRegistry;

// ------------------------------------------------------------------
// TEST 1 — toStepId / toHandlerKind throw on empty string
// ------------------------------------------------------------------
let threw = false;
try { toStepId(""); } catch { threw = true; }
console.assert(threw, "TEST 1a FAILED: toStepId('') should throw");

threw = false;
try { toHandlerKind(""); } catch { threw = true; }
console.assert(threw, "TEST 1b FAILED: toHandlerKind('') should throw");

console.log("TEST 1 passed: branded constructors reject empty strings ✓");

// ------------------------------------------------------------------
// TEST 2 — validateWorkflow rejects dangling dependsOn reference
// ------------------------------------------------------------------
threw = false;
try {
  validateWorkflow(
    {
      workflowId: "wf-bad",
      steps: [
        { id: "s1", kind: "fetch", config: { url: "http://x.com" }, dependsOn: ["ghost"] },
      ],
    },
    registry
  );
} catch {
  threw = true;
}
console.assert(threw, "TEST 2 FAILED: should reject dangling dependsOn reference");
console.log("TEST 2 passed: dangling dependency reference rejected ✓");

// ------------------------------------------------------------------
// TEST 3 — topologicalSort detects a cycle
// ------------------------------------------------------------------
threw = false;
try {
  const cyclic: ValidatedWorkflow = {
    workflowId: "wf-cycle",
    steps: [
      { id: toStepId("a"), kind: toHandlerKind("fetch"), config: { url: "u" }, dependsOn: [toStepId("b")] },
      { id: toStepId("b"), kind: toHandlerKind("fetch"), config: { url: "u" }, dependsOn: [toStepId("a")] },
    ],
  };
  topologicalSort(cyclic);
} catch {
  threw = true;
}
console.assert(threw, "TEST 3 FAILED: topologicalSort should throw on cycle");
console.log("TEST 3 passed: cycle detected ✓");

// ------------------------------------------------------------------
// TEST 4 — happy-path runWorkflow (fetch → parse → notify)
// ------------------------------------------------------------------
const happyWorkflow: ValidatedWorkflow = {
  workflowId: "wf-happy",
  steps: [
    { id: toStepId("step-fetch"),  kind: toHandlerKind("fetch"),  config: { url: "https://api.example.com" }, dependsOn: [] },
    { id: toStepId("step-parse"),  kind: toHandlerKind("parse"),  config: { field: "title" }, dependsOn: [toStepId("step-fetch")] },
    { id: toStepId("step-notify"), kind: toHandlerKind("notify"), config: { message: "done" }, dependsOn: [toStepId("step-parse")] },
  ],
};

runWorkflow(happyWorkflow, registry).then((report) => {
  console.assert(report.overallStatus === "completed", "TEST 4a FAILED: overallStatus should be 'completed'");
  console.assert(report.results.length === 3, "TEST 4b FAILED: should have 3 results");
  console.assert(report.results.every((r) => r.status === "success"), "TEST 4c FAILED: all steps should succeed");
  const parseResult = report.results.find((r) => r.stepId === "step-parse");
  console.assert(
    parseResult?.status === "success" &&
    (parseResult.output as ParseOutput).value === "title:response-from-https://api.example.com",
    "TEST 4d FAILED: parse step should receive fetch output"
  );
  console.log("TEST 4 passed: happy-path workflow completed ✓");
});

// ------------------------------------------------------------------
// TEST 5 — failing step causes downstream skip; overallStatus = "partial"
// ------------------------------------------------------------------
const failWorkflow: ValidatedWorkflow = {
  workflowId: "wf-fail",
  steps: [
    { id: toStepId("step-fetch"),  kind: toHandlerKind("fetch"),  config: { url: "https://ok.com" }, dependsOn: [] },
    { id: toStepId("step-notify"), kind: toHandlerKind("notify"), config: { message: "FAIL" },       dependsOn: [] },
    { id: toStepId("step-parse"),  kind: toHandlerKind("parse"),  config: { field: "x" },            dependsOn: [toStepId("step-notify")] },
  ],
};

runWorkflow(failWorkflow, registry).then((report) => {
  console.assert(report.overallStatus === "partial", "TEST 5a FAILED: overallStatus should be 'partial'");
  const notifyResult = report.results.find((r) => r.stepId === "step-notify");
  console.assert(notifyResult?.status === "failure", "TEST 5b FAILED: notify step should fail");
  const parseResult = report.results.find((r) => r.stepId === "step-parse");
  console.assert(parseResult?.status === "failure", "TEST 5c FAILED: parse step should be skipped/failed");
  console.assert(
    parseResult?.status === "failure" && parseResult.error.includes("Skipped"),
    "TEST 5d FAILED: skipped step error should mention 'Skipped'"
  );
  console.log("TEST 5 passed: downstream skip on failure ✓");
});
