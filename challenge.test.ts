// challenge.test.ts
import {
  createPipeline,
  withLogging,
  withAuth,
  withRateLimit,
  RateLimiter,
  type PipelineResponse,
  type MiddlewareFn,
  type Merge,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────────────────────

function isOk(r: PipelineResponse): r is Extract<PipelineResponse, { kind: "ok" }> {
  return r.kind === "ok";
}
function isError(r: PipelineResponse): r is Extract<PipelineResponse, { kind: "error" }> {
  return r.kind === "error";
}

// ── Test 1: Empty pipeline resolves with default 200 ─────────────────────────

async function test1() {
  const pipeline = createPipeline<{ requestId: string }>();
  const result = await pipeline.run({ requestId: "req-1" });
  console.assert(isOk(result), "Test 1 FAILED: expected ok response");
  console.assert(
    isOk(result) && result.status === 200,
    "Test 1 FAILED: expected status 200"
  );
  console.log("Test 1 PASSED: empty pipeline returns default 200");
}

// ── Test 2: withLogging adds log array to context ────────────────────────────

async function test2() {
  let capturedLog: string[] = [];

  const terminal: MiddlewareFn<Merge<object, { log: string[] }>, Record<string, never>> =
    async (ctx, next) => {
      capturedLog = ctx.log;
      return next({});
    };

  const result = await createPipeline<object>()
    .use(withLogging)
    .use(terminal)
    .run({});

  console.assert(isOk(result), "Test 2 FAILED: expected ok response");
  console.assert(
    capturedLog.length === 1 && capturedLog[0].includes("request received"),
    `Test 2 FAILED: log entry missing, got: ${JSON.stringify(capturedLog)}`
  );
  console.log("Test 2 PASSED: withLogging injects log array");
}

// ── Test 3: withAuth short-circuits on empty token ───────────────────────────

async function test3() {
  const result = await createPipeline<{ token: string }>()
    .use(withAuth)
    .run({ token: "" });

  console.assert(isError(result), "Test 3 FAILED: expected error response");
  console.assert(
    isError(result) && result.status === 401,
    "Test 3 FAILED: expected 401"
  );
  console.log("Test 3 PASSED: withAuth returns 401 for empty token");
}

// ── Test 4: withAuth passes through and adds userId ──────────────────────────

async function test4() {
  let capturedUserId = "";

  const terminal: MiddlewareFn<
    Merge<{ token: string }, { userId: string }>,
    Record<string, never>
  > = async (ctx, next) => {
    capturedUserId = ctx.userId;
    return next({});
  };

  const result = await createPipeline<{ token: string }>()
    .use(withAuth)
    .use(terminal)
    .run({ token: "abc123" });

  console.assert(isOk(result), "Test 4 FAILED: expected ok response");
  console.assert(
    capturedUserId === "user-abc123",
    `Test 4 FAILED: expected userId "user-abc123", got "${capturedUserId}"`
  );
  console.log("Test 4 PASSED: withAuth injects userId");
}

// ── Test 5: Full pipeline — logging + auth + rate-limit ───────────────────────

async function test5() {
  const limiter = new RateLimiter();

  // Build a pipeline that requires token in the initial context
  const pipeline = createPipeline<{ token: string }>()
    .use(withLogging)
    .use(withAuth)
    .use(withRateLimit(limiter, 2, 60_000));

  // First two requests should pass
  const r1 = await pipeline.run({ token: "tok1" });
  const r2 = await pipeline.run({ token: "tok1" });
  // Third should be rate-limited
  const r3 = await pipeline.run({ token: "tok1" });

  console.assert(isOk(r1), "Test 5 FAILED: r1 should be ok");
  console.assert(isOk(r2), "Test 5 FAILED: r2 should be ok");
  console.assert(isError(r3), "Test 5 FAILED: r3 should be error");
  console.assert(
    isError(r3) && r3.status === 429,
    `Test 5 FAILED: expected 429, got ${isError(r3) ? r3.status : "ok"}`
  );
  console.log("Test 5 PASSED: full pipeline enforces rate limiting");
}

// ── Run all tests ─────────────────────────────────────────────────────────────

(async () => {
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
})();
