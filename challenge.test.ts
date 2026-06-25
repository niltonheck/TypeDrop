// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  RateLimiter,
  asTenantId,
  asRequestId,
  asEpochMs,
  type AdmissionAllowed,
  type AdmissionDenied,
} from "./challenge";

const limiter = new RateLimiter();
const T1 = asTenantId("tenant-alpha");
const T2 = asTenantId("tenant-beta");
const T3 = asTenantId("tenant-gamma");
const BASE = asEpochMs(1_000_000);

// ── Test 1: registerPolicy rejects an invalid raw object ─────────────────────
{
  const result = limiter.registerPolicy(T1, { kind: "fixed", maxRequests: -5, windowMs: 1000 });
  console.assert(result.ok === false, "Test 1a FAILED: negative maxRequests should be invalid");
  if (!result.ok) {
    console.assert(
      result.error.kind === "negative_value",
      `Test 1a FAILED: expected 'negative_value', got '${result.error.kind}'`
    );
  }

  const result2 = limiter.registerPolicy(T1, { kind: "turbo" });
  console.assert(result2.ok === false, "Test 1b FAILED: unknown kind should be invalid");
  if (!result2.ok) {
    console.assert(
      result2.error.kind === "invalid_kind",
      `Test 1b FAILED: expected 'invalid_kind', got '${result2.error.kind}'`
    );
  }
  console.log("Test 1 passed ✓");
}

// ── Test 2: sliding window — allow up to limit, then deny ────────────────────
{
  const reg = limiter.registerPolicy(T1, { kind: "sliding", maxRequests: 3, windowMs: 10_000 });
  console.assert(reg.ok === true, "Test 2 FAILED: policy registration failed");

  const r1 = limiter.admit(T1, asRequestId("req-1"), BASE) as AdmissionAllowed;
  const r2 = limiter.admit(T1, asRequestId("req-2"), BASE) as AdmissionAllowed;
  const r3 = limiter.admit(T1, asRequestId("req-3"), BASE) as AdmissionAllowed;
  console.assert(r1.decision === "allowed", "Test 2 FAILED: req-1 should be allowed");
  console.assert(r2.decision === "allowed", "Test 2 FAILED: req-2 should be allowed");
  console.assert(r3.decision === "allowed", "Test 2 FAILED: req-3 should be allowed");
  console.assert(r3.remainingRequests === 0, `Test 2 FAILED: remaining should be 0, got ${r3.remainingRequests}`);

  const r4 = limiter.admit(T1, asRequestId("req-4"), BASE) as AdmissionDenied;
  console.assert(r4.decision === "denied", "Test 2 FAILED: req-4 should be denied");
  console.assert(r4.retryAfterMs > 0, "Test 2 FAILED: retryAfterMs should be > 0");
  console.log("Test 2 passed ✓");
}

// ── Test 3: sliding window — requests expire after windowMs ──────────────────
{
  // T1 is at 3/3 requests at BASE; advance time past the window
  const later = asEpochMs(BASE + 10_001);
  const r5 = limiter.admit(T1, asRequestId("req-5"), later) as AdmissionAllowed;
  console.assert(r5.decision === "allowed", `Test 3 FAILED: req-5 should be allowed after window expiry, got '${r5.decision}'`);
  console.log("Test 3 passed ✓");
}

// ── Test 4: fixed window — counter resets at window boundary ─────────────────
{
  const reg = limiter.registerPolicy(T2, { kind: "fixed", maxRequests: 2, windowMs: 5_000 });
  console.assert(reg.ok === true, "Test 4 FAILED: policy registration failed");

  // Both requests land in the same 5-second window
  limiter.admit(T2, asRequestId("f-1"), asEpochMs(5_000));
  limiter.admit(T2, asRequestId("f-2"), asEpochMs(5_001));
  const denied = limiter.admit(T2, asRequestId("f-3"), asEpochMs(5_002)) as AdmissionDenied;
  console.assert(denied.decision === "denied", "Test 4a FAILED: f-3 should be denied");

  // Advance into the next window — counter must reset
  const nextWindow = limiter.admit(T2, asRequestId("f-4"), asEpochMs(10_000)) as AdmissionAllowed;
  console.assert(nextWindow.decision === "allowed", "Test 4b FAILED: f-4 should be allowed in new window");
  console.log("Test 4 passed ✓");
}

// ── Test 5: tiered policy — invalid tier name is rejected ────────────────────
{
  const raw = {
    kind: "tiered",
    tier: "enterprise",          // not in tiers map
    tiers: {
      free:    { maxRequests: 10, windowMs: 60_000 },
      pro:     { maxRequests: 100, windowMs: 60_000 },
    },
  };
  const result = limiter.registerPolicy(T3, raw);
  console.assert(result.ok === false, "Test 5 FAILED: unknown tier should be rejected");
  if (!result.ok) {
    console.assert(
      result.error.kind === "invalid_tier",
      `Test 5 FAILED: expected 'invalid_tier', got '${result.error.kind}'`
    );
  }
  console.log("Test 5 passed ✓");
}

// ── Test 6: snapshot reflects in-window counts ────────────────────────────────
{
  const snap = limiter.snapshot(asEpochMs(BASE + 10_001));
  // T1 had req-5 admitted at BASE+10_001 and all earlier ones expired
  console.assert(
    snap[T1].requestsInWindow === 1,
    `Test 6 FAILED: T1 should have 1 request in window, got ${snap[T1]?.requestsInWindow}`
  );
  console.assert(
    snap[T1].policy.kind === "sliding",
    `Test 6 FAILED: T1 policy kind should be 'sliding', got '${snap[T1]?.policy.kind}'`
  );
  console.log("Test 6 passed ✓");
}

console.log("\nAll tests completed.");
