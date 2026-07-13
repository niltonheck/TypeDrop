// challenge.test.ts
import {
  classifyError,
  computeDelay,
  fetchWithRetry,
  isExhausted,
  isFatal,
  isSuccess,
  type FetchAdapter,
  type FetchResult,
  type RetryConfig,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 0,       // 0ms so tests run instantly
  backoffMultiplier: 2,
  maxDelayMs: 1000,
};

/** A validator that expects `{ id: number; name: string }` */
function validateUser(body: unknown): { id: number; name: string } {
  if (
    typeof body === "object" &&
    body !== null &&
    "id" in body &&
    "name" in body &&
    typeof (body as Record<string, unknown>).id === "number" &&
    typeof (body as Record<string, unknown>).name === "string"
  ) {
    return body as { id: number; name: string };
  }
  throw new TypeError("Invalid user body");
}

// ── Test 1: classifyError ─────────────────────────────────────────────────

const noStatus = classifyError(undefined, "network timeout");
console.assert(noStatus.kind === "retryable", "T1a: no status → retryable");
console.assert(noStatus.status === undefined, "T1b: no status field");

const err429 = classifyError(429, "Too Many Requests");
console.assert(err429.kind === "retryable", "T1c: 429 → retryable");

const err503 = classifyError(503, "Service Unavailable");
console.assert(err503.kind === "retryable", "T1d: 503 → retryable");

const err401 = classifyError(401, "Unauthorized");
console.assert(err401.kind === "fatal", "T1e: 401 → fatal");

const err404 = classifyError(404, "Not Found");
console.assert(err404.kind === "fatal", "T1f: 404 → fatal");

// ── Test 2: computeDelay ──────────────────────────────────────────────────

const cfg: RetryConfig = { maxAttempts: 5, baseDelayMs: 100, backoffMultiplier: 2, maxDelayMs: 500 };
console.assert(computeDelay(0, cfg) === 100, "T2a: attempt 0 → 100ms");
console.assert(computeDelay(1, cfg) === 200, "T2b: attempt 1 → 200ms");
console.assert(computeDelay(2, cfg) === 400, "T2c: attempt 2 → 400ms");
console.assert(computeDelay(3, cfg) === 500, "T2d: attempt 3 → capped at 500ms");
console.assert(computeDelay(4, cfg) === 500, "T2e: attempt 4 → still capped at 500ms");

// No cap
const noCap: RetryConfig = { maxAttempts: 3, baseDelayMs: 50, backoffMultiplier: 3 };
console.assert(computeDelay(2, noCap) === 450, "T2f: no cap → 50 * 3^2 = 450ms");

// ── Test 3: fetchWithRetry — success on first try ─────────────────────────

(async () => {
  const successAdapter: FetchAdapter = async (_url) => ({
    status: 200,
    body: { id: 1, name: "Alice" },
  });

  const result = await fetchWithRetry("/users/1", successAdapter, validateUser, DEFAULT_CONFIG);

  console.assert(isSuccess(result), "T3a: success on first try");
  if (isSuccess(result)) {
    console.assert(result.data.name === "Alice", "T3b: data.name is Alice");
    console.assert(result.attempts === 1, "T3c: only 1 attempt");
  }

  // ── Test 4: fetchWithRetry — retryable then success ───────────────────────

  let callCount = 0;
  const flakyAdapter: FetchAdapter = async (_url) => {
    callCount++;
    if (callCount < 3) return { status: 503, body: null };
    return { status: 200, body: { id: 2, name: "Bob" } };
  };

  const flakyResult = await fetchWithRetry("/users/2", flakyAdapter, validateUser, DEFAULT_CONFIG);

  console.assert(isSuccess(flakyResult), "T4a: flaky adapter eventually succeeds");
  if (isSuccess(flakyResult)) {
    console.assert(flakyResult.attempts === 3, "T4b: took 3 attempts");
    console.assert(flakyResult.data.name === "Bob", "T4c: data.name is Bob");
  }

  // ── Test 5: fetchWithRetry — exhausted retries ────────────────────────────

  const alwaysFail: FetchAdapter = async (_url) => ({ status: 503, body: null });

  const exhausted = await fetchWithRetry("/fail", alwaysFail, validateUser, DEFAULT_CONFIG);

  console.assert(isExhausted(exhausted), "T5a: exhausted after maxAttempts");
  if (isExhausted(exhausted)) {
    console.assert(exhausted.attempts === DEFAULT_CONFIG.maxAttempts, "T5b: attempts === maxAttempts");
    console.assert(exhausted.lastError.kind === "retryable", "T5c: lastError is retryable");
  }

  // ── Test 6: fetchWithRetry — fatal error stops immediately ────────────────

  let fatalCalls = 0;
  const fatalAdapter: FetchAdapter = async (_url) => {
    fatalCalls++;
    return { status: 401, body: null };
  };

  const fatal = await fetchWithRetry("/secret", fatalAdapter, validateUser, DEFAULT_CONFIG);

  console.assert(isFatal(fatal), "T6a: 401 → fatal result");
  if (isFatal(fatal)) {
    console.assert(fatal.error.kind === "fatal", "T6b: error.kind is fatal");
    console.assert(fatal.attempts === 1, "T6c: only 1 attempt before giving up");
  }
  console.assert(fatalCalls === 1, "T6d: adapter called exactly once for fatal");

  // ── Test 7: fetchWithRetry — invalid body → fatal ─────────────────────────

  const badBodyAdapter: FetchAdapter = async (_url) => ({
    status: 200,
    body: { unexpected: true },
  });

  const badBody = await fetchWithRetry("/bad", badBodyAdapter, validateUser, DEFAULT_CONFIG);

  console.assert(isFatal(badBody), "T7a: invalid body → fatal");
  if (isFatal(badBody)) {
    console.assert(badBody.error.kind === "fatal", "T7b: body error classified as fatal");
  }

  console.log("All tests passed ✅");
})();
