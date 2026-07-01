// challenge.test.ts
import {
  validateRequest,
  lookupPolicy,
  evaluateRateLimit,
  processRequest,
  isAllowed,
  type PolicyRegistry,
  type WindowStore,
  type RateLimitDecision,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const registry: PolicyRegistry = {
  "client-free-1": {
    clientId: "client-free-1",
    tier: "free",
    windowMs: 60_000,   // 1 minute
    maxRequests: 3,
  },
  "client-pro-1": {
    clientId: "client-pro-1",
    tier: "pro",
    windowMs: 60_000,
    maxRequests: 10,
  },
};

function freshStore(): WindowStore {
  return new Map();
}

// ------------------------------------------------------------------
// [R1] validateRequest rejects non-objects
// ------------------------------------------------------------------
{
  const result = validateRequest(null);
  console.assert(
    result.ok === false && result.error.kind === "missing_field",
    "[R1] null input should yield MissingFieldError for 'request'"
  );
}

// ------------------------------------------------------------------
// [R3] validateRequest rejects invalid HTTP method
// ------------------------------------------------------------------
{
  const result = validateRequest({
    clientId: "client-free-1",
    method: "CONNECT",         // not a valid HttpMethod
    path: "/api/data",
    receivedAt: Date.now(),
  });
  console.assert(
    result.ok === false && result.error.kind === "invalid_field",
    "[R3] Invalid method should yield InvalidFieldError"
  );
}

// ------------------------------------------------------------------
// [R5] validateRequest defaults receivedAt when absent
// ------------------------------------------------------------------
{
  const before = Date.now();
  const result = validateRequest({
    clientId: "client-free-1",
    method: "GET",
    path: "/ping",
  });
  const after = Date.now();
  console.assert(
    result.ok === true &&
      result.value.receivedAt >= before &&
      result.value.receivedAt <= after,
    "[R5] Missing receivedAt should default to Date.now()"
  );
}

// ------------------------------------------------------------------
// [R6] lookupPolicy returns UnknownClientError for missing client
// ------------------------------------------------------------------
{
  const result = lookupPolicy("ghost-client", registry);
  console.assert(
    result.ok === false && result.error.kind === "unknown_client",
    "[R6] Unknown clientId should yield UnknownClientError"
  );
}

// ------------------------------------------------------------------
// [R9] evaluateRateLimit allows requests under the limit
// ------------------------------------------------------------------
{
  const store = freshStore();
  const policy = registry["client-free-1"]!;
  const now = Date.now();

  const req1 = { clientId: "client-free-1", method: "GET" as const, path: "/a", receivedAt: now };
  const req2 = { clientId: "client-free-1", method: "GET" as const, path: "/b", receivedAt: now + 100 };

  const d1 = evaluateRateLimit(req1, policy, store);
  const d2 = evaluateRateLimit(req2, policy, store);

  console.assert(
    d1.status === "allowed" && isAllowed(d1) && d1.remaining === 2,
    "[R9] First request should be allowed with remaining=2"
  );
  console.assert(
    d2.status === "allowed" && isAllowed(d2) && d2.remaining === 1,
    "[R9] Second request should be allowed with remaining=1"
  );
}

// ------------------------------------------------------------------
// [R10] evaluateRateLimit denies requests at/over the limit
// ------------------------------------------------------------------
{
  const store = freshStore();
  const policy = registry["client-free-1"]!; // maxRequests = 3
  const now = 1_000_000;

  for (let i = 0; i < 3; i++) {
    evaluateRateLimit(
      { clientId: "client-free-1", method: "POST" as const, path: "/x", receivedAt: now + i * 10 },
      policy,
      store
    );
  }

  const overflow = evaluateRateLimit(
    { clientId: "client-free-1", method: "POST" as const, path: "/x", receivedAt: now + 50 },
    policy,
    store
  );

  console.assert(
    overflow.status === "denied" && !isAllowed(overflow),
    "[R10] 4th request within window should be denied"
  );

  // retryAfterMs must be positive
  if (overflow.status === "denied") {
    console.assert(
      overflow.retryAfterMs > 0,
      "[R10] retryAfterMs should be positive"
    );
  }
}

// ------------------------------------------------------------------
// [R8] Sliding window prunes old timestamps
// ------------------------------------------------------------------
{
  const store = freshStore();
  const policy = registry["client-free-1"]!; // windowMs=60_000, max=3
  const base = 2_000_000;

  // Fill the window
  for (let i = 0; i < 3; i++) {
    evaluateRateLimit(
      { clientId: "client-free-1", method: "GET" as const, path: "/old", receivedAt: base + i },
      policy,
      store
    );
  }

  // A new request far in the future — old entries should be pruned
  const future = base + 70_000; // 70 s later, outside the 60 s window
  const decision = evaluateRateLimit(
    { clientId: "client-free-1", method: "GET" as const, path: "/new", receivedAt: future },
    policy,
    store
  );

  console.assert(
    decision.status === "allowed",
    "[R8] After window expires, request should be allowed again"
  );
}

// ------------------------------------------------------------------
// [R12-R14] processRequest full pipeline — unknown client
// ------------------------------------------------------------------
{
  const store = freshStore();
  const result = processRequest(
    { clientId: "nobody", method: "GET", path: "/test", receivedAt: Date.now() },
    registry,
    store
  );
  console.assert(
    result.ok === false && result.error.kind === "unknown_client",
    "[R13] processRequest should propagate UnknownClientError"
  );
}

// ------------------------------------------------------------------
// [R14] processRequest full pipeline — happy path
// ------------------------------------------------------------------
{
  const store = freshStore();
  const result = processRequest(
    { clientId: "client-pro-1", method: "DELETE", path: "/resource/42", receivedAt: Date.now() },
    registry,
    store
  );
  console.assert(
    result.ok === true && result.value.status === "allowed",
    "[R14] processRequest should return allowed decision for valid pro client"
  );
}

console.log("All assertions passed (or threw on unimplemented stubs).");
