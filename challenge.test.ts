// ============================================================
// Typed API Rate Limiter — challenge.test.ts
// ============================================================
import {
  makeTokenCount,
  makeClientId,
  makeEndpointUrl,
  validateEndpointConfig,
  TokenBucket,
  RateLimiterRegistry,
  dispatchBatch,
  type ApiRequest,
  type EndpointConfig,
  type FetchFn,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function assertThrows(fn: () => unknown, message: string): void {
  try {
    fn();
    console.error(`❌ FAIL (no throw): ${message}`);
    process.exitCode = 1;
  } catch {
    console.log(`✅ PASS (threw): ${message}`);
  }
}

// ── Mock Data ─────────────────────────────────────────────────

const clientA = makeClientId("client-alpha");
const clientB = makeClientId("client-beta");

const rawValidConfig = {
  url: "https://api.example.com/data",
  method: "POST",
  rateLimit: 3,
  windowMs: 5000,
};

const endpointConfig: EndpointConfig = validateEndpointConfig(rawValidConfig);

interface MockPayload {
  query: string;
}
interface MockResponse {
  result: string;
}

const makeRequest = (
  id: string,
  clientId: ReturnType<typeof makeClientId>,
  payload: MockPayload
): ApiRequest<MockPayload> => ({
  requestId: id,
  clientId,
  endpoint: endpointConfig,
  payload,
});

// ── Test 1: Brand constructors ────────────────────────────────

console.log("\n── Brand Constructors ──");

assertThrows(() => makeTokenCount(0), "makeTokenCount rejects 0");
assertThrows(() => makeTokenCount(-5), "makeTokenCount rejects negative");
assertThrows(() => makeTokenCount(1.5), "makeTokenCount rejects float");
assertThrows(() => makeTokenCount("3"), "makeTokenCount rejects string");
assert(makeTokenCount(5) === 5, "makeTokenCount accepts valid integer");

assertThrows(() => makeClientId("  "), "makeClientId rejects blank string");
assertThrows(() => makeClientId(42), "makeClientId rejects non-string");
assert(makeClientId("abc") === "abc", "makeClientId accepts valid string");

assertThrows(
  () => makeEndpointUrl("ftp://bad.com"),
  "makeEndpointUrl rejects ftp"
);
assertThrows(
  () => makeEndpointUrl("not-a-url"),
  "makeEndpointUrl rejects non-url"
);
assert(
  makeEndpointUrl("https://api.example.com") === "https://api.example.com",
  "makeEndpointUrl accepts https"
);

// ── Test 2: validateEndpointConfig ───────────────────────────

console.log("\n── validateEndpointConfig ──");

assertThrows(
  () => validateEndpointConfig(null),
  "rejects null"
);
assertThrows(
  () => validateEndpointConfig({ ...rawValidConfig, method: "CONNECT" }),
  "rejects invalid HTTP method"
);
assertThrows(
  () => validateEndpointConfig({ ...rawValidConfig, rateLimit: 0 }),
  "rejects rateLimit of 0"
);
assertThrows(
  () => validateEndpointConfig({ ...rawValidConfig, windowMs: -1 }),
  "rejects negative windowMs"
);
assert(
  endpointConfig.method === "POST" && endpointConfig.windowMs === 5000,
  "validates correct config"
);

// ── Test 3: TokenBucket ───────────────────────────────────────

console.log("\n── TokenBucket ──");

const bucket = new TokenBucket(makeTokenCount(2), 5000);
assert(bucket.tokensRemaining === 2, "bucket starts full");
assert(bucket.tryConsume() === true, "first consume succeeds");
assert(bucket.tokensRemaining === 1, "tokens decremented after consume");
assert(bucket.tryConsume() === true, "second consume succeeds");
assert(bucket.tryConsume() === false, "third consume fails (exhausted)");
assert(bucket.tokensRemaining === 0, "tokens at zero when exhausted");
assert(bucket.retryAfterMs === 5000, "retryAfterMs equals windowMs");

// ── Test 4: RateLimiterRegistry ───────────────────────────────

console.log("\n── RateLimiterRegistry ──");

const registry = new RateLimiterRegistry();
const b1 = registry.getOrCreate(clientA, endpointConfig);
const b2 = registry.getOrCreate(clientA, endpointConfig); // same key
assert(b1 === b2, "getOrCreate returns same bucket for same key");

const b3 = registry.getOrCreate(clientB, endpointConfig); // different client
assert(b1 !== b3, "getOrCreate creates separate bucket for different client");

assert(
  registry.getBucket(clientA, endpointConfig.url) === b1,
  "getBucket returns existing bucket"
);
assert(
  registry.getBucket(makeClientId("unknown"), endpointConfig.url) === undefined,
  "getBucket returns undefined for missing key"
);

// ── Test 5: dispatchBatch ─────────────────────────────────────

console.log("\n── dispatchBatch ──");

const freshRegistry = new RateLimiterRegistry();

// Mock fetchFn — resolves for "good" payloads, rejects for "fail"
const mockFetch: FetchFn<MockPayload, MockResponse> = async (req) => {
  if (req.payload.query === "fail") throw new Error("upstream error");
  return { result: `ok:${req.payload.query}` };
};

const requests: ReadonlyArray<ApiRequest<MockPayload>> = [
  makeRequest("r1", clientA, { query: "hello" }),   // ✅ fulfilled
  makeRequest("r2", clientA, { query: "world" }),   // ✅ fulfilled
  makeRequest("r3", clientA, { query: "fail" }),    // ❌ rejected (fetch throws)
  makeRequest("r4", clientA, { query: "over" }),    // 🚫 rate_limited (bucket=3, consumed by r1+r2, r3 consumed+threw)
  makeRequest("r5", clientB, { query: "hi" }),      // ✅ fulfilled (different client)
];

const report = await dispatchBatch(requests, mockFetch, freshRegistry);

assert(report.totalRequests === 5, "totalRequests is 5");
assert(report.fulfilled === 3, "3 fulfilled (r1, r2, r5)");
assert(report.rejected === 1, "1 rejected (r3)");
assert(report.rateLimited === 1, "1 rate_limited (r4)");
assert(report.results[0].status === "fulfilled", "r1 is fulfilled");
assert(report.results[2].status === "rejected", "r3 is rejected");
assert(report.results[3].status === "rate_limited", "r4 is rate_limited");
assert(
  (report.clientSummary.get(clientA) ?? 0) === 2,
  "clientA has 2 fulfilled"
);
assert(
  (report.clientSummary.get(clientB) ?? 0) === 1,
  "clientB has 1 fulfilled"
);

console.log("\nAll tests complete.");
