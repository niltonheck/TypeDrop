// challenge.test.ts
import {
  fetchWithRetry,
  fetchAll,
  isOk,
  unwrapOr,
  mapResult,
  defaultRetryConfig,
  type Result,
  type FetchError,
  type Endpoint,
  type EndpointMap,
  type AggregatedResults,
  type EndpointResponse,
} from "./challenge";

// ─── Mock Endpoints ────────────────────────────────────────────────────────────

interface UserPayload  { id: number; name: string }
interface StatsPayload { views: number; clicks: number }

const userEndpoint: Endpoint<UserPayload> = {
  url: "/api/user/1",
  timeoutMs: 3000,
  parse: (raw) => {
    if (
      raw !== null &&
      typeof raw === "object" &&
      "id" in raw &&
      "name" in raw &&
      typeof (raw as Record<string, unknown>).id === "number" &&
      typeof (raw as Record<string, unknown>).name === "string"
    ) {
      const r = raw as Record<string, unknown>;
      return { status: "ok", value: { id: r.id as number, name: r.name as string } };
    }
    return { status: "err", error: { kind: "parse", raw: JSON.stringify(raw), cause: "missing fields" } };
  },
};

const statsEndpoint: Endpoint<StatsPayload> = {
  url: "/api/stats",
  timeoutMs: 2000,
  parse: (raw) => {
    if (
      raw !== null &&
      typeof raw === "object" &&
      "views" in raw &&
      "clicks" in raw
    ) {
      const r = raw as Record<string, unknown>;
      return { status: "ok", value: { views: r.views as number, clicks: r.clicks as number } };
    }
    return { status: "err", error: { kind: "parse", raw: JSON.stringify(raw), cause: "missing fields" } };
  },
};

// ─── Test 1: isOk type-guard ───────────────────────────────────────────────────

const okResult: Result<number, FetchError> = { status: "ok", value: 42 };
const errResult: Result<number, FetchError> = { status: "err", error: { kind: "network", message: "ECONNREFUSED" } };

console.assert(isOk(okResult)  === true,  "TEST 1a FAILED: isOk should return true for ok result");
console.assert(isOk(errResult) === false, "TEST 1b FAILED: isOk should return false for err result");
console.log("TEST 1 passed: isOk");

// ─── Test 2: unwrapOr ──────────────────────────────────────────────────────────

const val = unwrapOr(okResult, 0);
console.assert(val === 42, "TEST 2a FAILED: unwrapOr should return value when ok");

const fallback = unwrapOr(errResult, -1);
console.assert(fallback === -1, "TEST 2b FAILED: unwrapOr should return fallback when err");
console.log("TEST 2 passed: unwrapOr");

// ─── Test 3: mapResult ─────────────────────────────────────────────────────────

const doubled = mapResult(okResult, (n) => n * 2);
console.assert(isOk(doubled) && doubled.value === 84, "TEST 3a FAILED: mapResult should transform ok value");

const mappedErr = mapResult(errResult, (n) => n * 2);
console.assert(!isOk(mappedErr), "TEST 3b FAILED: mapResult should pass through err unchanged");
console.log("TEST 3 passed: mapResult");

// ─── Test 4: fetchWithRetry — happy path ──────────────────────────────────────

(async () => {
  const controller = new AbortController();
  const raw = { id: 1, name: "Alice" };
  const result = await fetchWithRetry(userEndpoint, raw, defaultRetryConfig, controller.signal);

  console.assert(isOk(result), "TEST 4a FAILED: fetchWithRetry should succeed with valid raw JSON");
  if (isOk(result)) {
    console.assert(result.value.name === "Alice", "TEST 4b FAILED: fetchWithRetry value.name should be 'Alice'");
  }
  console.log("TEST 4 passed: fetchWithRetry happy path");

  // ─── Test 5: fetchWithRetry — parse error, no retry ─────────────────────────

  let retryCount = 0;
  const countingEndpoint: Endpoint<UserPayload> = {
    ...userEndpoint,
    parse: (raw) => {
      retryCount++;
      return { status: "err", error: { kind: "parse", raw: String(raw), cause: "always fails" } };
    },
  };

  const parseResult = await fetchWithRetry(
    countingEndpoint,
    { bad: true },
    { ...defaultRetryConfig, maxRetries: 3 },
    new AbortController().signal
  );

  console.assert(!isOk(parseResult), "TEST 5a FAILED: parse error should yield err result");
  console.assert(retryCount === 1, `TEST 5b FAILED: parse error must NOT retry (called ${retryCount} times)`);
  console.log("TEST 5 passed: fetchWithRetry — no retry on parse error");

  // ─── Test 6: fetchWithRetry — aborted signal ─────────────────────────────────

  const abortedController = new AbortController();
  abortedController.abort();
  const abortedResult = await fetchWithRetry(userEndpoint, { id: 1, name: "Bob" }, defaultRetryConfig, abortedController.signal);

  console.assert(!isOk(abortedResult), "TEST 6a FAILED: aborted signal should yield err");
  if (!isOk(abortedResult)) {
    console.assert(abortedResult.error.kind === "timeout", `TEST 6b FAILED: aborted error.kind should be 'timeout', got '${abortedResult.error.kind}'`);
  }
  console.log("TEST 6 passed: fetchWithRetry — aborted signal");

  // ─── Test 7: fetchAll — concurrent fan-out ────────────────────────────────────

  const endpoints = {
    user:  userEndpoint,
    stats: statsEndpoint,
  } satisfies EndpointMap;

  const rawResponses = {
    user:  { id: 99, name: "Carol" },
    stats: { views: 1000, clicks: 42 },
  };

  const aggregated = await fetchAll(endpoints, rawResponses, defaultRetryConfig, 5000);

  // Compiler should know aggregated.user is Result<UserPayload, FetchError>
  const userResult = aggregated.user;
  console.assert(isOk(userResult) && userResult.value.id === 99, "TEST 7a FAILED: fetchAll user result should be ok with id 99");

  const statsResult = aggregated.stats;
  console.assert(isOk(statsResult) && statsResult.value.views === 1000, "TEST 7b FAILED: fetchAll stats result should be ok with views 1000");
  console.log("TEST 7 passed: fetchAll concurrent fan-out");

  console.log("\n✅ All tests passed!");
})().catch((err) => {
  console.error("Unhandled error in async tests:", err);
  process.exit(1);
});
