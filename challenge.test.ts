// challenge.test.ts
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// (strict: true must be set in tsconfig.json)

import {
  endpointId, requestId, ms, tokens,
  createRegistry, computeBackoffMs, tryConsume,
  dispatchWithRetry, buildAuditSummary,
  type EndpointConfig,
  type RateLimiterRegistry,
  type AuditLog,
  type AuditEntry,
  type CallOutcome,
} from "./challenge";

// ─── helpers ────────────────────────────────────────────────
let passed = 0;
let failed = 0;
function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

// ─── Mock configs ───────────────────────────────────────────
const weatherConfig: EndpointConfig<undefined, { temp: number }> = {
  id:       endpointId("weather"),
  url:      "https://api.weather.test/current",
  method:   "GET",
  policy:   { kind: "token-bucket", capacityTokens: tokens(5), refillRateMs: ms(1000) },
  retry:    { kind: "exponential", baseMs: ms(100), maxMs: ms(800), maxRetries: 3 },
  validate: (raw) => {
    if (
      raw !== null &&
      typeof raw === "object" &&
      "temp" in raw &&
      typeof (raw as Record<string, unknown>).temp === "number"
    ) {
      return { temp: (raw as Record<string, unknown>).temp as number };
    }
    throw new Error("Invalid weather response");
  },
};

const stockConfig: EndpointConfig<undefined, { price: number }> = {
  id:       endpointId("stock"),
  url:      "https://api.stock.test/quote",
  method:   "GET",
  policy:   { kind: "fixed-window", windowMs: ms(60_000), maxRequests: tokens(10) },
  retry:    { kind: "linear", stepMs: ms(200), maxRetries: 2 },
  validate: (raw) => {
    if (
      raw !== null &&
      typeof raw === "object" &&
      "price" in raw &&
      typeof (raw as Record<string, unknown>).price === "number"
    ) {
      return { price: (raw as Record<string, unknown>).price as number };
    }
    throw new Error("Invalid stock response");
  },
};

const queueConfig: EndpointConfig<undefined, { queued: boolean }> = {
  id:       endpointId("queue"),
  url:      "https://api.queue.test/push",
  method:   "POST",
  policy:   { kind: "leaky-bucket", capacityTokens: tokens(3), drainRateMs: ms(500) },
  retry:    { kind: "none" },
  validate: (raw) => {
    if (raw !== null && typeof raw === "object" && "queued" in raw) {
      return { queued: Boolean((raw as Record<string, unknown>).queued) };
    }
    throw new Error("Invalid queue response");
  },
};

// ─── TEST 1: createRegistry ──────────────────────────────────
console.log("\n📦 TEST 1 — createRegistry");
{
  const registry = createRegistry([weatherConfig, stockConfig, queueConfig]);

  const weatherBucket = registry.buckets.get(endpointId("weather"));
  assert("weather bucket exists",              weatherBucket !== undefined);
  assert("weather bucket tokens = 5",          weatherBucket?.availableTokens === 5);

  const stockBucket = registry.buckets.get(endpointId("stock"));
  assert("stock bucket tokens = 10 (maxRequests)", stockBucket?.availableTokens === 10);

  const queueBucket = registry.buckets.get(endpointId("queue"));
  assert("leaky-bucket tokens = 3 (capacityTokens)", queueBucket?.availableTokens === 3);
}

// ─── TEST 2: computeBackoffMs ────────────────────────────────
console.log("\n⏱  TEST 2 — computeBackoffMs");
{
  // Exponential: base=100, max=800, maxRetries=3
  const expStrategy = weatherConfig.retry; // exponential
  assert("exp attempt 1 → 100ms",   computeBackoffMs(expStrategy, 1) === 100);
  assert("exp attempt 2 → 200ms",   computeBackoffMs(expStrategy, 2) === 200);
  assert("exp attempt 3 → 400ms",   computeBackoffMs(expStrategy, 3) === 400);
  assert("exp attempt 4 → null (exceeded)", computeBackoffMs(expStrategy, 4) === null);

  // Linear: step=200, maxRetries=2
  const linStrategy = stockConfig.retry; // linear
  assert("linear attempt 1 → 200ms", computeBackoffMs(linStrategy, 1) === 200);
  assert("linear attempt 2 → 400ms", computeBackoffMs(linStrategy, 2) === 400);
  assert("linear attempt 3 → null",  computeBackoffMs(linStrategy, 3) === null);

  // None
  const noneStrategy = queueConfig.retry; // none
  assert("none → always null",        computeBackoffMs(noneStrategy, 1) === null);
}

// ─── TEST 3: tryConsume ──────────────────────────────────────
console.log("\n🪣  TEST 3 — tryConsume");
{
  const registry = createRegistry([weatherConfig]);
  const NOW = Date.now();

  // Drain all 5 tokens
  for (let i = 0; i < 5; i++) {
    const ok = tryConsume(registry, weatherConfig, NOW);
    assert(`consume token ${i + 1} of 5 → true`, ok === true);
  }
  // 6th should fail
  assert("consume token 6 → false (empty)", tryConsume(registry, weatherConfig, NOW) === false);

  // Simulate 2500ms passing → should refill 2 tokens (one per 1000ms)
  const ok = tryConsume(registry, weatherConfig, NOW + 2500);
  assert("after 2500ms, one token refilled → true", ok === true);

  // Unknown endpoint → TypeError
  let threw = false;
  try {
    tryConsume(registry, stockConfig, NOW); // stockConfig not in this registry
  } catch (e) {
    threw = e instanceof TypeError;
  }
  assert("unknown endpoint throws TypeError", threw);
}

// ─── TEST 4: dispatchWithRetry ───────────────────────────────
console.log("\n🚀  TEST 4 — dispatchWithRetry");

async function runDispatchTests(): Promise<void> {
  const noSleep: import("./challenge").Sleeper = () => Promise.resolve();

  // 4a. Success on first attempt
  {
    const registry = createRegistry([weatherConfig]);
    const successFetcher: import("./challenge").Fetcher = async () => ({ temp: 22 });
    const outcome = await dispatchWithRetry(
      weatherConfig,
      requestId("req-001"),
      registry,
      undefined,
      successFetcher,
      noSleep
    );
    assert("4a: success kind",         outcome.kind === "success");
    assert("4a: success data.temp=22", outcome.kind === "success" && outcome.data.temp === 22);
    assert("4a: attempts = 1",         outcome.kind === "success" && outcome.attempts === 1);
  }

  // 4b. Throttled when bucket empty
  {
    const registry = createRegistry([weatherConfig]);
    const NOW = Date.now();
    // Drain all tokens
    for (let i = 0; i < 5; i++) tryConsume(registry, weatherConfig, NOW);

    const fetcher: import("./challenge").Fetcher = async () => ({ temp: 0 });
    const outcome = await dispatchWithRetry(
      weatherConfig,
      requestId("req-002"),
      registry,
      undefined,
      fetcher,
      noSleep
    );
    assert("4b: throttled when empty", outcome.kind === "throttled");
    assert("4b: retryAfterMs = 1000 (refillRateMs)",
      outcome.kind === "throttled" && outcome.retryAfterMs === 1000
    );
  }

  // 4c. Retry on failure then succeed
  {
    const registry = createRegistry([stockConfig]);
    let callCount = 0;
    const flakyFetcher: import("./challenge").Fetcher = async () => {
      callCount++;
      if (callCount < 3) throw new Error("Network error");
      return { price: 99.5 };
    };
    const outcome = await dispatchWithRetry(
      stockConfig,
      requestId("req-003"),
      registry,
      undefined,
      flakyFetcher,
      noSleep
    );
    assert("4c: success after retries",   outcome.kind === "success");
    assert("4c: 3 attempts made",         outcome.kind === "success" && outcome.attempts === 3);
    assert("4c: price = 99.5",            outcome.kind === "success" && outcome.data.price === 99.5);
  }

  // 4d. Exhausted retries → failed
  {
    const registry = createRegistry([stockConfig]);
    const alwaysFail: import("./challenge").Fetcher = async () => {
      throw new Error("Permanent error");
    };
    const outcome = await dispatchWithRetry(
      stockConfig,
      requestId("req-004"),
      registry,
      undefined,
      alwaysFail,
      noSleep
    );
    assert("4d: failed after exhausted retries", outcome.kind === "failed");
    assert("4d: attempts = 3 (maxRetries+1)",    outcome.kind === "failed" && outcome.attempts === 3);
  }
}

// ─── TEST 5: buildAuditSummary ───────────────────────────────
console.log("\n📊  TEST 5 — buildAuditSummary");
{
  const wId = endpointId("weather");
  const sId = endpointId("stock");

  const entries = new Map<ReturnType<typeof requestId>, AuditEntry<unknown>>();

  const makeOutcome = (
    kind: "success" | "failed" | "throttled",
    eId: ReturnType<typeof endpointId>,
    rId: ReturnType<typeof requestId>
  ): CallOutcome<unknown> => {
    if (kind === "success")   return { kind, requestId: rId, endpointId: eId, data: {}, attempts: 1, totalMs: ms(120) };
    if (kind === "failed")    return { kind, requestId: rId, endpointId: eId, error: "err", attempts: 2, totalMs: ms(300) };
    return { kind: "throttled", requestId: rId, endpointId: eId, retryAfterMs: ms(1000) };
  };

  entries.set(requestId("r1"), { timestamp: 1, outcome: makeOutcome("success",   wId, requestId("r1")) });
  entries.set(requestId("r2"), { timestamp: 2, outcome: makeOutcome("success",   wId, requestId("r2")) });
  entries.set(requestId("r3"), { timestamp: 3, outcome: makeOutcome("throttled", wId, requestId("r3")) });
  entries.set(requestId("r4"), { timestamp: 4, outcome: makeOutcome("failed",    sId, requestId("r4")) });
  entries.set(requestId("r5"), { timestamp: 5, outcome: makeOutcome("success",   sId, requestId("r5")) });

  const log: AuditLog = { entries: entries as ReadonlyMap<ReturnType<typeof requestId>, AuditEntry<unknown>> };
  const summary = buildAuditSummary(log);

  const ws = summary.get(wId);
  assert("5a: weather totalCalls = 3",     ws?.totalCalls     === 3);
  assert("5a: weather successCount = 2",   ws?.successCount   === 2);
  assert("5a: weather throttledCount = 1", ws?.throttledCount === 1);
  assert("5a: weather avgSuccessMs = 120", ws?.avgSuccessMs   === 120);

  const ss = summary.get(sId);
  assert("5b: stock totalCalls = 2",       ss?.totalCalls   === 2);
  assert("5b: stock failedCount = 1",      ss?.failedCount  === 1);
  assert("5b: stock successCount = 1",     ss?.successCount === 1);
  assert("5b: stock avgSuccessMs = 120",   ss?.avgSuccessMs === 120);
}

// ─── Run async tests then report ────────────────────────────
runDispatchTests().then(() => {
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
});
