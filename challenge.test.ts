// =============================================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// =============================================================================
import {
  Ok,
  Err,
  OpError,
  Result,
  RetryPolicy,
  Operation,
  runWithRetry,
  classifyError,
  summariseResults,
  sleep,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Test 1 — classifyError exhaustive matching
// ---------------------------------------------------------------------------
const networkErr: OpError = { kind: "network", statusCode: 503, message: "Service Unavailable" };
const timeoutErr: OpError = { kind: "timeout", elapsedMs: 5000, message: "Timed out" };
const validationErr: OpError = { kind: "validation", fields: ["email"], message: "Invalid email" };

assert(classifyError(networkErr) === "retryable", "network error is retryable");
assert(classifyError(timeoutErr) === "retryable", "timeout error is retryable");
assert(classifyError(validationErr) === "fatal", "validation error is fatal");

// ---------------------------------------------------------------------------
// Test 2 — summariseResults aggregation
// ---------------------------------------------------------------------------
const mixedResults: ReadonlyArray<Result<string, OpError>> = [
  Ok("hello"),
  Ok("world"),
  Err(networkErr),
  Err(timeoutErr),
  Err(networkErr),
  Err(validationErr),
];

const summary = summariseResults(mixedResults);
assert(summary.successCount === 2, "summariseResults: successCount = 2");
assert(summary.failureCount === 4, "summariseResults: failureCount = 4");
assert(summary.errorBreakdown.network === 2, "summariseResults: network breakdown = 2");
assert(summary.errorBreakdown.timeout === 1, "summariseResults: timeout breakdown = 1");
assert(summary.errorBreakdown.validation === 1, "summariseResults: validation breakdown = 1");

// ---------------------------------------------------------------------------
// Test 3 — runWithRetry succeeds on second attempt
// ---------------------------------------------------------------------------
async function test3(): Promise<void> {
  let attempts = 0;
  const policy: RetryPolicy = { maxAttempts: 3, delayMs: 10, retryOn: ["network"] };
  const op: Operation<string> = {
    exec: async () => {
      attempts++;
      if (attempts < 2) return Err<OpError>({ kind: "network", statusCode: 500, message: "err" });
      return Ok("recovered");
    },
    policy,
    fallback: { type: "rethrow" },
  };

  const result = await runWithRetry(op);
  assert(result.ok === true, "runWithRetry: succeeds on second attempt");
  assert(result.ok && result.value === "recovered", "runWithRetry: value is 'recovered'");
  assert(attempts === 2, "runWithRetry: exec called exactly twice");
}

// ---------------------------------------------------------------------------
// Test 4 — runWithRetry uses static fallback after exhausting retries
// ---------------------------------------------------------------------------
async function test4(): Promise<void> {
  const policy: RetryPolicy = { maxAttempts: 2, delayMs: 10, retryOn: ["timeout"] };
  const op: Operation<number> = {
    exec: async () => Err<OpError>({ kind: "timeout", elapsedMs: 3000, message: "slow" }),
    policy,
    fallback: { type: "static", value: 42 },
  };

  const result = await runWithRetry(op);
  assert(result.ok === true, "runWithRetry: static fallback returns ok");
  assert(result.ok && result.value === 42, "runWithRetry: static fallback value is 42");
}

// ---------------------------------------------------------------------------
// Test 5 — runWithRetry does NOT retry non-retryable errors
// ---------------------------------------------------------------------------
async function test5(): Promise<void> {
  let attempts = 0;
  const policy: RetryPolicy = { maxAttempts: 5, delayMs: 10, retryOn: ["network"] };
  const op: Operation<boolean> = {
    exec: async () => {
      attempts++;
      return Err<OpError>({ kind: "validation", fields: ["name"], message: "bad" });
    },
    policy,
    fallback: { type: "rethrow" },
  };

  const result = await runWithRetry(op);
  assert(result.ok === false, "runWithRetry: non-retryable error is not retried");
  assert(attempts === 1, "runWithRetry: exec called only once for non-retryable error");
}

// ---------------------------------------------------------------------------
// Run async tests
// ---------------------------------------------------------------------------
(async () => {
  await test3();
  await test4();
  await test5();
  console.log("\nDone.");
})();
