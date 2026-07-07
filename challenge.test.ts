
// challenge.test.ts
import {
  runPipeline,
  makeAuthMiddleware,
  makeRateLimitMiddleware,
  makeTransformMiddleware,
  makeLogMiddleware,
  handleOutcome,
  type BaseContext,
  type ClientId,
  type LogEntry,
  type PipelineOutcome,
  type LogContext,
  type GatewayError,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function makeBase(overrides: Partial<BaseContext> = {}): BaseContext {
  return {
    requestId: "req-001",
    path:      "/api/data",
    method:    "POST",
    headers:   { authorization: "Bearer user-42:client-abc:read,write" },
    body:      JSON.stringify({ key: "value" }),
    ...overrides,
  };
}

const logs: LogEntry[] = [];
const logFn = (entry: LogEntry) => logs.push(entry);

// Limits: "client-abc" has quota 5
const limits = { ["client-abc" as ClientId]: 5 };

// Build pipeline
const pipeline = [
  makeAuthMiddleware(),
  makeRateLimitMiddleware(limits),
  makeTransformMiddleware(),
  makeLogMiddleware(logFn),
] as const;

// -----------------------------------------------------------
// Test 1: Full happy path → success outcome
// -----------------------------------------------------------
(async () => {
  logs.length = 0;
  const outcome = await runPipeline(makeBase(), pipeline as any /* widened for test */);
  console.assert(outcome.status === "success", "Test 1 FAILED: expected success");
  if (outcome.status === "success") {
    console.assert(outcome.ctx.userId === "user-42",     "Test 1 FAILED: wrong userId");
    console.assert(outcome.ctx.traceId.startsWith("req-001"), "Test 1 FAILED: wrong traceId prefix");
    console.assert(outcome.ctx.remainingQuota === 4,     "Test 1 FAILED: wrong remainingQuota");
    console.assert(logs.length === 1,                    "Test 1 FAILED: logFn not called");
    console.log("Test 1 PASSED: happy path success");
  }
})();

// -----------------------------------------------------------
// Test 2: Missing auth header → auth error
// -----------------------------------------------------------
(async () => {
  const base = makeBase({ headers: {} });
  const outcome = await runPipeline(base, pipeline as any);
  console.assert(outcome.status === "error",                "Test 2 FAILED: expected error");
  if (outcome.status === "error") {
    console.assert(outcome.error.kind === "auth",           "Test 2 FAILED: expected auth error");
    console.assert(outcome.error.statusCode === 401,        "Test 2 FAILED: expected 401");
    console.log("Test 2 PASSED: missing auth header halts with AuthError");
  }
})();

// -----------------------------------------------------------
// Test 3: Rate limit exceeded → rate_limit error
// -----------------------------------------------------------
(async () => {
  const zeroLimits = { ["client-abc" as ClientId]: 0 };
  const pipeline2 = [
    makeAuthMiddleware(),
    makeRateLimitMiddleware(zeroLimits),
    makeTransformMiddleware(),
    makeLogMiddleware(logFn),
  ] as const;
  const outcome = await runPipeline(makeBase(), pipeline2 as any);
  console.assert(outcome.status === "error",                   "Test 3 FAILED: expected error");
  if (outcome.status === "error") {
    console.assert(outcome.error.kind === "rate_limit",        "Test 3 FAILED: expected rate_limit");
    console.assert(outcome.error.statusCode === 429,           "Test 3 FAILED: expected 429");
    console.log("Test 3 PASSED: zero quota halts with RateLimitError");
  }
})();

// -----------------------------------------------------------
// Test 4: Invalid JSON body → transform error
// -----------------------------------------------------------
(async () => {
  const base = makeBase({ body: "{ not valid json" });
  const outcome = await runPipeline(base, pipeline as any);
  console.assert(outcome.status === "error",                   "Test 4 FAILED: expected error");
  if (outcome.status === "error") {
    console.assert(outcome.error.kind === "transform",         "Test 4 FAILED: expected transform");
    console.assert(outcome.error.statusCode === 422,           "Test 4 FAILED: expected 422");
    console.log("Test 4 PASSED: invalid JSON body halts with TransformError");
  }
})();

// -----------------------------------------------------------
// Test 5: handleOutcome maps all variants to correct HttpResponse
// -----------------------------------------------------------
(async () => {
  // Success case
  const successOutcome = await runPipeline(makeBase(), pipeline as any);
  const successResponse = handleOutcome(
    successOutcome as PipelineOutcome<LogContext, GatewayError>
  );
  console.assert(successResponse.statusCode === 200,           "Test 5a FAILED: expected 200");
  console.assert("requestId" in successResponse.body,          "Test 5a FAILED: missing requestId");

  // Auth error case
  const errOutcome: PipelineOutcome<LogContext, GatewayError> = {
    status: "error",
    error: { kind: "rate_limit", message: "Quota exceeded", statusCode: 429 },
  };
  const errResponse = handleOutcome(errOutcome);
  console.assert(errResponse.statusCode === 429,               "Test 5b FAILED: expected 429");
  console.assert("retryAfter" in errResponse.body,             "Test 5b FAILED: missing retryAfter");

  console.log("Test 5 PASSED: handleOutcome maps variants correctly");
})();
