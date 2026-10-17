// challenge.test.ts
import {
  ms,
  calcDelay,
  withRetry,
  RetryPolicy,
  AttemptRecord,
  SchedulerResult,
  ExtractSuccess,
  Milliseconds,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

/** Instant no-op sleep so tests don't actually wait. */
const noSleep = (_delayMs: Milliseconds): Promise<void> => Promise.resolve();

/** Build a policy with sensible defaults, override as needed. */
function makePolicy(overrides: Partial<RetryPolicy> = {}): RetryPolicy {
  return {
    maxAttempts: 3,
    baseDelay: ms(100),
    maxDelay: ms(1000),
    backoffFactor: 2,
    shouldRetry: () => true,
    ...overrides,
  };
}

// ── Test 1: ms() branding ────────────────────────────────────
{
  const delay = ms(500);
  console.assert(delay === 500, "Test 1 FAILED: ms() should return the numeric value");
  console.log("Test 1 passed: ms() returns correct numeric value");
}

// ── Test 2: calcDelay clamping and backoff ───────────────────
{
  const policy = makePolicy({ baseDelay: ms(100), maxDelay: ms(300), backoffFactor: 2 });

  const d0 = calcDelay(policy, 0); // 100 * 2^0 = 100
  const d1 = calcDelay(policy, 1); // 100 * 2^1 = 200
  const d2 = calcDelay(policy, 2); // 100 * 2^2 = 400 → clamped to 300

  console.assert(d0 === 100, `Test 2a FAILED: expected 100, got ${d0}`);
  console.assert(d1 === 200, `Test 2b FAILED: expected 200, got ${d1}`);
  console.assert(d2 === 300, `Test 2c FAILED: expected 300 (clamped), got ${d2}`);
  console.log("Test 2 passed: calcDelay applies backoff and clamps correctly");
}

// ── Test 3: withRetry — succeeds on first attempt ────────────
{
  const policy = makePolicy({ maxAttempts: 3 });
  const op = (): Promise<string> => Promise.resolve("hello");

  withRetry(op, policy, noSleep).then((result) => {
    console.assert(result.outcome === "succeeded", "Test 3a FAILED: expected succeeded");
    if (result.outcome === "succeeded") {
      console.assert(result.value === "hello", "Test 3b FAILED: wrong value");
      console.assert(result.attempts.length === 1, "Test 3c FAILED: expected 1 attempt");
      console.assert(
        result.attempts[0].status === "success",
        "Test 3d FAILED: attempt should be success"
      );
    }
    console.log("Test 3 passed: withRetry resolves immediately on first success");
  });
}

// ── Test 4: withRetry — fails then succeeds ──────────────────
{
  let callCount = 0;
  const op = (): Promise<number> => {
    callCount++;
    if (callCount < 3) return Promise.reject(new Error(`fail #${callCount}`));
    return Promise.resolve(42);
  };

  const policy = makePolicy({ maxAttempts: 5 });

  withRetry(op, policy, noSleep).then((result) => {
    console.assert(result.outcome === "succeeded", "Test 4a FAILED: expected succeeded");
    if (result.outcome === "succeeded") {
      console.assert(result.value === 42, "Test 4b FAILED: wrong value");
      console.assert(result.attempts.length === 3, `Test 4c FAILED: expected 3 attempts, got ${result.attempts.length}`);
      const failures = result.attempts.filter((a): a is AttemptRecord<number> & { status: "failure" } => a.status === "failure");
      console.assert(failures.length === 2, "Test 4d FAILED: expected 2 failure records");
    }
    console.log("Test 4 passed: withRetry retries and eventually succeeds");
  });
}

// ── Test 5: withRetry — exhausts all attempts ────────────────
{
  const err = new Error("always fails");
  const op = (): Promise<boolean> => Promise.reject(err);
  const policy = makePolicy({ maxAttempts: 3 });

  withRetry(op, policy, noSleep).then((result) => {
    console.assert(result.outcome === "failed", "Test 5a FAILED: expected failed");
    if (result.outcome === "failed") {
      console.assert(result.lastError === err, "Test 5b FAILED: wrong lastError");
      console.assert(result.attempts.length === 3, `Test 5c FAILED: expected 3 attempts, got ${result.attempts.length}`);
    }
    console.log("Test 5 passed: withRetry exhausts maxAttempts and resolves as failed");
  });
}

// ── Test 6: shouldRetry === false aborts early ───────────────
{
  let callCount = 0;
  const op = (): Promise<string> => {
    callCount++;
    return Promise.reject(new Error("nope"));
  };
  const policy = makePolicy({ maxAttempts: 10, shouldRetry: () => false });

  withRetry(op, policy, noSleep).then((result) => {
    console.assert(result.outcome === "failed", "Test 6a FAILED: expected failed");
    console.assert(callCount === 1, `Test 6b FAILED: shouldRetry=false should stop after 1 attempt, got ${callCount}`);
    console.log("Test 6 passed: shouldRetry=false aborts after first failure");
  });
}

// ── Test 7: ExtractSuccess type-level check ──────────────────
{
  // This is a compile-time test. If it compiles, the type is correct.
  type T = ExtractSuccess<SchedulerResult<string>>;
  const _check: T = "compile-time check" as T;
  // ExtractSuccess<SchedulerResult<number>> should be number
  type N = ExtractSuccess<SchedulerResult<number>>;
  const _n: N = 0 as N;
  // ExtractSuccess<never> should be never
  type Nv = ExtractSuccess<never>;
  console.log("Test 7 passed: ExtractSuccess resolves correctly at the type level");
}
