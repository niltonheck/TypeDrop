// ============================================================
// challenge.test.ts
// ============================================================
import {
  makeRequestId,
  makeUserId,
  makeAuthMiddleware,
  makeRateLimitMiddleware,
  makeLoggingMiddleware,
  runPipeline,
  reportOutcome,
  PipelineContext,
  PipelineOutcome,
  Middleware,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function makeBaseContext(
  overrides?: Partial<Pick<PipelineContext, "headers" | "path" | "method">>,
): PipelineContext<Record<never, never>> {
  return {
    requestId: makeRequestId("req-001"),
    method: overrides?.method ?? "GET",
    path: overrides?.path ?? "/api/data",
    headers: overrides?.headers ?? { authorization: "Bearer tok-abc123" },
    receivedAt: new Date("2026-11-07T10:00:00Z"),
    extra: {},
  };
}

// ------------------------------------------------------------------
// Test 1: Full pipeline passes — auth + logging both succeed
// ------------------------------------------------------------------
(async () => {
  const logs: string[] = [];
  const logFn = (entry: { requestId: string; path: string; method: string; timestamp: Date }) => {
    logs.push(`${entry.method} ${entry.path}`);
  };

  const ctx = makeBaseContext();
  const pipeline: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>> = [
    makeAuthMiddleware() as Middleware<Record<string, unknown>, Record<string, unknown>>,
    makeLoggingMiddleware(logFn),
  ];

  const outcome = await runPipeline(ctx, pipeline);

  console.assert(outcome.outcome === "completed", `[Test 1] Expected 'completed', got '${outcome.outcome}'`);
  console.assert(logs.length === 1, `[Test 1] Expected 1 log entry, got ${logs.length}`);
  console.assert(logs[0] === "GET /api/data", `[Test 1] Unexpected log: ${logs[0]}`);

  const report = reportOutcome(outcome);
  console.assert(
    report === "completed: req-001",
    `[Test 1] Unexpected report: "${report}"`,
  );

  console.log("✅ Test 1 passed: full pipeline completed");
})();

// ------------------------------------------------------------------
// Test 2: Auth middleware halts when Authorization header is missing
// ------------------------------------------------------------------
(async () => {
  const ctx = makeBaseContext({ headers: {} }); // no authorization header
  const pipeline: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>> = [
    makeAuthMiddleware() as Middleware<Record<string, unknown>, Record<string, unknown>>,
  ];

  const outcome = await runPipeline(ctx, pipeline);

  console.assert(outcome.outcome === "halted", `[Test 2] Expected 'halted', got '${outcome.outcome}'`);
  if (outcome.outcome === "halted") {
    console.assert(outcome.error.kind === "AuthError", `[Test 2] Expected AuthError, got '${outcome.error.kind}'`);
  }

  const report = reportOutcome(outcome);
  console.assert(
    report.startsWith("halted(AuthError):"),
    `[Test 2] Unexpected report: "${report}"`,
  );

  console.log("✅ Test 2 passed: auth middleware halted correctly");
})();

// ------------------------------------------------------------------
// Test 3: Rate limit middleware halts after exceeding limit
// ------------------------------------------------------------------
(async () => {
  // prefix of "req-" is the first 4 chars of "req-001" → "req-"
  const rateLimiter = makeRateLimitMiddleware(2, 60_000);
  const pipeline: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>> = [rateLimiter];

  const ctx1 = makeBaseContext(); // req-001 → prefix "req-"
  const ctx2 = { ...makeBaseContext(), requestId: makeRequestId("req-002") };
  const ctx3 = { ...makeBaseContext(), requestId: makeRequestId("req-003") }; // should be rate-limited

  const o1 = await runPipeline(ctx1, pipeline);
  const o2 = await runPipeline(ctx2, pipeline);
  const o3 = await runPipeline(ctx3, pipeline);

  console.assert(o1.outcome === "completed", `[Test 3] o1 expected 'completed', got '${o1.outcome}'`);
  console.assert(o2.outcome === "completed", `[Test 3] o2 expected 'completed', got '${o2.outcome}'`);
  console.assert(o3.outcome === "halted", `[Test 3] o3 expected 'halted', got '${o3.outcome}'`);
  if (o3.outcome === "halted") {
    console.assert(o3.error.kind === "RateLimitError", `[Test 3] Expected RateLimitError, got '${o3.error.kind}'`);
    if (o3.error.kind === "RateLimitError") {
      console.assert(o3.error.retryAfterMs === 60_000, `[Test 3] Expected retryAfterMs=60000`);
    }
  }

  console.log("✅ Test 3 passed: rate limiter halts on exceeded limit");
})();

// ------------------------------------------------------------------
// Test 4: Logging middleware halts when logFn throws
// ------------------------------------------------------------------
(async () => {
  const throwingLog = (_entry: unknown) => { throw new Error("disk full"); };
  const ctx = makeBaseContext();
  const pipeline: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>> = [
    makeLoggingMiddleware(throwingLog),
  ];

  const outcome = await runPipeline(ctx, pipeline);

  console.assert(outcome.outcome === "halted", `[Test 4] Expected 'halted', got '${outcome.outcome}'`);
  if (outcome.outcome === "halted") {
    console.assert(outcome.error.kind === "LoggingError", `[Test 4] Expected LoggingError, got '${outcome.error.kind}'`);
  }

  console.log("✅ Test 4 passed: logging middleware halts on logFn throw");
})();

// ------------------------------------------------------------------
// Test 5: Unexpected throw from middleware is captured as "threw"
// ------------------------------------------------------------------
(async () => {
  const bombMiddleware: Middleware<Record<string, unknown>, Record<string, unknown>> = async (_ctx) => {
    throw new TypeError("unexpected explosion");
  };

  const ctx = makeBaseContext();
  const pipeline = [bombMiddleware];
  const outcome = await runPipeline(ctx, pipeline);

  console.assert(outcome.outcome === "threw", `[Test 5] Expected 'threw', got '${outcome.outcome}'`);
  if (outcome.outcome === "threw") {
    console.assert(
      outcome.thrownError instanceof TypeError,
      `[Test 5] Expected TypeError in thrownError`,
    );
  }

  const report = reportOutcome(outcome);
  console.assert(report === "threw: req-001", `[Test 5] Unexpected report: "${report}"`);

  console.log("✅ Test 5 passed: unexpected throw captured as 'threw'");
})();
