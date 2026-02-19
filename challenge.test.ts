// ============================================================
// challenge.test.ts
// ============================================================
import {
  ms,
  runPipeline,
  withBearerAuth,
  withRequestLogger,
  withRateLimitHeader,
  exponentialBackoff,
  sleep,
  type PipelineContext,
  type PipelineResult,
  type Executor,
  type RetryPolicy,
  type PipelineOptions,
} from "./challenge";

// ------------------------------------------------------------------
// Shared mock types
// ------------------------------------------------------------------
interface ApiBody { query: string }
interface ApiResponse { data: string }
type ApiError = { code: number; message: string };

function makeCtx(overrides: Partial<PipelineContext<ApiBody>> = {}): PipelineContext<ApiBody> {
  return {
    requestId: "req-001",
    url: "https://api.example.com/search",
    method: "POST",
    headers: {},
    body: { query: "typescript" },
    meta: {},
    ...overrides,
  };
}

// ------------------------------------------------------------------
// TEST 1 — happy path: middleware chain mutates headers, executor succeeds
// ------------------------------------------------------------------
(async () => {
  const logs: string[] = [];

  const executor: Executor<ApiBody, ApiResponse, ApiError> = async (ctx, _signal) => {
    const hasAuth = ctx.headers["Authorization"]?.startsWith("Bearer ");
    const hasRateLimit = ctx.headers["X-Rate-Limit"] === "60";
    if (!hasAuth || !hasRateLimit)
      return { kind: "failure", error: { code: 400, message: "missing headers" }, durationMs: ms(0), attempts: 1 };
    return { kind: "success", response: { data: "result" }, durationMs: ms(0), attempts: 1 };
  };

  const options: PipelineOptions<ApiBody, ApiResponse, ApiError> = {
    context: makeCtx(),
    middlewares: [
      withBearerAuth(async () => "secret-token"),
      withRequestLogger((msg) => logs.push(msg)),
      withRateLimitHeader(60),
    ],
    executor,
  };

  const result = await runPipeline(options);

  console.assert(result.kind === "success", "TEST 1a FAILED: expected success");
  console.assert(
    (result as Extract<typeof result, { kind: "success" }>).response.data === "result",
    "TEST 1b FAILED: unexpected response data"
  );
  console.assert(logs.length === 2, `TEST 1c FAILED: expected 2 log lines, got ${logs.length}`);
  console.assert(logs[0].includes("→"), "TEST 1d FAILED: missing request log arrow");
  console.assert(logs[1].includes("←"), "TEST 1e FAILED: missing response log arrow");
  console.assert(result.attempts === 1, "TEST 1f FAILED: expected 1 attempt");
  console.log("TEST 1 PASSED ✓");
})();

// ------------------------------------------------------------------
// TEST 2 — retry: executor fails twice, succeeds on 3rd attempt
// ------------------------------------------------------------------
(async () => {
  let callCount = 0;

  const executor: Executor<ApiBody, ApiResponse, ApiError> = async (_ctx, _signal) => {
    callCount++;
    if (callCount < 3)
      return { kind: "failure", error: { code: 503, message: "unavailable" }, durationMs: ms(0), attempts: 1 };
    return { kind: "success", response: { data: "eventually ok" }, durationMs: ms(0), attempts: 1 };
  };

  const retry: RetryPolicy<ApiError> = {
    maxAttempts: 3,
    backoff: exponentialBackoff(ms(1), ms(10)), // tiny delays for tests
    retryIf: (failure) => failure.error.code === 503,
  };

  const options: PipelineOptions<ApiBody, ApiResponse, ApiError> = {
    context: makeCtx(),
    middlewares: [],
    executor,
    retry,
  };

  const result = await runPipeline(options);

  console.assert(result.kind === "success", "TEST 2a FAILED: expected success after retries");
  console.assert(result.attempts === 3, `TEST 2b FAILED: expected 3 attempts, got ${result.attempts}`);
  console.log("TEST 2 PASSED ✓");
})();

// ------------------------------------------------------------------
// TEST 3 — retry exhausted: all attempts fail, retryIf always true
// ------------------------------------------------------------------
(async () => {
  const executor: Executor<ApiBody, ApiResponse, ApiError> = async (_ctx, _signal) => ({
    kind: "failure",
    error: { code: 500, message: "boom" },
    durationMs: ms(0),
    attempts: 1,
  });

  const retry: RetryPolicy<ApiError> = {
    maxAttempts: 3,
    backoff: exponentialBackoff(ms(1), ms(10)),
  };

  const options: PipelineOptions<ApiBody, ApiResponse, ApiError> = {
    context: makeCtx(),
    middlewares: [],
    executor,
    retry,
  };

  const result = await runPipeline(options);

  console.assert(result.kind === "failure", "TEST 3a FAILED: expected failure after exhausted retries");
  console.assert(result.attempts === 3, `TEST 3b FAILED: expected 3 attempts, got ${result.attempts}`);
  console.log("TEST 3 PASSED ✓");
})();

// ------------------------------------------------------------------
// TEST 4 — middleware short-circuit: auth middleware bails early
// ------------------------------------------------------------------
(async () => {
  let executorCalled = false;

  const executor: Executor<ApiBody, ApiResponse, ApiError> = async (_ctx, _signal) => {
    executorCalled = true;
    return { kind: "success", response: { data: "should not reach" }, durationMs: ms(0), attempts: 1 };
  };

  // A middleware that always short-circuits
  const blockingMiddleware = async (
    _ctx: PipelineContext<ApiBody>,
    _next: (ctx: PipelineContext<ApiBody>) => Promise<PipelineResult<ApiResponse, ApiError>>
  ): Promise<PipelineResult<ApiResponse, ApiError>> => ({
    kind: "failure",
    error: { code: 401, message: "unauthorized" },
    durationMs: ms(0),
    attempts: 0,
  });

  const options: PipelineOptions<ApiBody, ApiResponse, ApiError> = {
    context: makeCtx(),
    middlewares: [blockingMiddleware],
    executor,
  };

  const result = await runPipeline(options);

  console.assert(result.kind === "failure", "TEST 4a FAILED: expected short-circuit failure");
  console.assert(!executorCalled, "TEST 4b FAILED: executor should not have been called");
  const failure = result as Extract<typeof result, { kind: "failure" }>;
  console.assert(failure.error.code === 401, "TEST 4c FAILED: expected 401 error code");
  console.log("TEST 4 PASSED ✓");
})();

// ------------------------------------------------------------------
// TEST 5 — exponentialBackoff values & sleep smoke test
// ------------------------------------------------------------------
(async () => {
  const backoff = exponentialBackoff(ms(10), ms(100));
  console.assert(backoff(1) === 10,  `TEST 5a FAILED: expected 10, got ${backoff(1)}`);
  console.assert(backoff(2) === 20,  `TEST 5b FAILED: expected 20, got ${backoff(2)}`);
  console.assert(backoff(3) === 40,  `TEST 5c FAILED: expected 40, got ${backoff(3)}`);
  console.assert(backoff(4) === 80,  `TEST 5d FAILED: expected 80, got ${backoff(4)}`);
  console.assert(backoff(5) === 100, `TEST 5e FAILED: expected cap 100, got ${backoff(5)}`);

  // sleep resolves normally
  await sleep(ms(5));

  // sleep aborts correctly
  const ctrl = new AbortController();
  ctrl.abort("cancelled");
  let abortThrown = false;
  try {
    await sleep(ms(5000), ctrl.signal);
  } catch {
    abortThrown = true;
  }
  console.assert(abortThrown, "TEST 5f FAILED: sleep should reject on aborted signal");
  console.log("TEST 5 PASSED ✓");
})();
