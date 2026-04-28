// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  processRequest,
  runChain,
  evaluateStrategy,
  releaseSlot,
  lookupChain,
  Ok,
  Err,
  type RateLimiterStrategy,
  type ApiRequest,
  type MiddlewareChain,
  type TenantRegistry,
} from "./challenge";

// ── helpers ────────────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── mock data ──────────────────────────────────────────────────────

const NOW = Date.now() as import("./challenge").TimestampMs extends infer T ? T : never;
// We cast via a helper since branded constructors are user-implemented
// The tests call processRequest with plain objects so validation runs.

const validRaw = {
  tenantId: "tenant-abc",
  route: "POST /payments",
  timestampMs: Date.now(),
  meta: { userId: "u1", plan: "pro" },
};

// ── TEST 1: Validation failure — bad route ─────────────────────────
console.log("\nTEST 1 — Validation: bad route");
{
  const result = processRequest(
    { ...validRaw, route: "BREW /coffee" },
    []
  );
  assert(result.ok === false, "result is Err");
  assert(
    !result.ok && result.error.kind === "VALIDATION_FAILED",
    "error kind is VALIDATION_FAILED"
  );
  assert(
    !result.ok &&
      result.error.kind === "VALIDATION_FAILED" &&
      result.error.inner.kind === "INVALID_ROUTE",
    "inner error is INVALID_ROUTE"
  );
}

// ── TEST 2: Validation failure — non-object ────────────────────────
console.log("\nTEST 2 — Validation: non-object input");
{
  const result = processRequest("not an object", []);
  assert(result.ok === false, "result is Err");
  assert(
    !result.ok && result.error.kind === "VALIDATION_FAILED",
    "error kind is VALIDATION_FAILED"
  );
  assert(
    !result.ok &&
      result.error.kind === "VALIDATION_FAILED" &&
      result.error.inner.kind === "NOT_AN_OBJECT",
    "inner error is NOT_AN_OBJECT"
  );
}

// ── TEST 3: Token bucket — first call allowed, second denied ───────
console.log("\nTEST 3 — Token bucket strategy");
{
  const strategy: RateLimiterStrategy = {
    type: "TOKEN_BUCKET",
    config: { capacity: 1, refillRatePerMs: 0.001 },
    state: { tokens: 1, lastRefillMs: Date.now() as ReturnType<typeof Date.now> & { __brand: "TimestampMs" } },
  };

  // First request — should be allowed (1 token available)
  const r1 = processRequest(validRaw, [strategy]);
  assert(r1.ok === true, "first request allowed (token available)");

  // Second request — token exhausted, no time has passed
  const r2 = processRequest({ ...validRaw, timestampMs: Date.now() }, [strategy]);
  assert(r2.ok === false, "second request denied (token exhausted)");
  assert(
    !r2.ok &&
      r2.error.kind === "RATE_LIMITED" &&
      r2.error.inner.kind === "TOKEN_BUCKET_EXHAUSTED",
    "error is TOKEN_BUCKET_EXHAUSTED"
  );
}

// ── TEST 4: Concurrency cap + releaseSlot ─────────────────────────
console.log("\nTEST 4 — Concurrency cap + releaseSlot");
{
  const cap: RateLimiterStrategy = {
    type: "CONCURRENCY_CAP",
    config: { maxConcurrent: 2 },
    state: { activeRequests: 0 },
  };

  const r1 = processRequest(validRaw, [cap]);
  assert(r1.ok === true, "first concurrent request allowed");
  assert(cap.state.activeRequests === 1, "activeRequests incremented to 1");

  const r2 = processRequest(validRaw, [cap]);
  assert(r2.ok === true, "second concurrent request allowed");
  assert(cap.state.activeRequests === 2, "activeRequests incremented to 2");

  const r3 = processRequest(validRaw, [cap]);
  assert(r3.ok === false, "third concurrent request denied");
  assert(
    !r3.ok &&
      r3.error.kind === "RATE_LIMITED" &&
      r3.error.inner.kind === "CONCURRENCY_CAP_REACHED",
    "error is CONCURRENCY_CAP_REACHED"
  );

  releaseSlot(cap);
  assert(cap.state.activeRequests === 1, "activeRequests decremented after releaseSlot");
}

// ── TEST 5: Sliding window + lookupChain ──────────────────────────
console.log("\nTEST 5 — Sliding window + TenantRegistry lookupChain");
{
  const windowStrategy: RateLimiterStrategy = {
    type: "SLIDING_WINDOW",
    config: { windowMs: 60_000, maxRequests: 2 },
    state: { timestamps: [] },
  };

  // Use lookupChain to retrieve the chain from a registry
  // We need branded TenantId — since constructors are user-implemented,
  // we use a type assertion ONLY in the test harness (not in challenge.ts).
  type BrandedTenant = string & { readonly __brand: "TenantId" };
  type BrandedRoute  = string & { readonly __brand: "RouteKey" };

  const tenantKey = "tenant-xyz" as BrandedTenant;
  const routeKey  = "GET /reports" as BrandedRoute;

  const registry = {
    [tenantKey]: {
      [routeKey]: [windowStrategy],
    },
  } satisfies TenantRegistry<BrandedTenant>;

  const chain = lookupChain(registry, tenantKey, routeKey);
  assert(chain !== undefined, "lookupChain finds the chain");

  if (chain !== undefined) {
    const r1 = runChain(chain, {
      tenantId: tenantKey,
      route: routeKey,
      timestampMs: Date.now() as BrandedTenant & number as never, // harness-only
      meta: {},
    } as ApiRequest);
    assert(r1.ok === true, "first window request allowed");

    const r2 = runChain(chain, {
      tenantId: tenantKey,
      route: routeKey,
      timestampMs: Date.now() as BrandedTenant & number as never,
      meta: {},
    } as ApiRequest);
    assert(r2.ok === true, "second window request allowed");

    const r3 = runChain(chain, {
      tenantId: tenantKey,
      route: routeKey,
      timestampMs: Date.now() as BrandedTenant & number as never,
      meta: {},
    } as ApiRequest);
    assert(r3.ok === false, "third window request denied (quota exceeded)");
    assert(
      !r3.ok &&
        r3.error.kind === "RATE_LIMITED" &&
        r3.error.inner.kind === "WINDOW_QUOTA_EXCEEDED",
      "error is WINDOW_QUOTA_EXCEEDED"
    );
  }
}

console.log("\nAll tests complete.\n");
