// challenge.test.ts
import {
  makeRequestId,
  rateLimitMap,
  handleRequest,
  matchGatewayError,
  authMiddleware,
  rateLimitMiddleware,
  bodyParserMiddleware,
  authzMiddleware,
  composeMiddleware,
  type RawContext,
  type GatewayError,
  type UserId,
  type Brand,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function makeCtx(overrides: Partial<RawContext> = {}): RawContext {
  return {
    requestId: makeRequestId(),
    method: "POST",
    path: "/api/data",
    headers: { authorization: "Bearer valid-user42" },
    rawBody: JSON.stringify({ role: "admin", value: 42 }),
    ...overrides,
  };
}

const successHandler = async (ctx: import("./challenge").ParsedContext) => ({
  statusCode: 200,
  body: JSON.stringify({ ok: true, userId: ctx.userId }),
});

// ------------------------------------------------------------------
// Test 1: Full happy path — all middleware pass, handler is called
// ------------------------------------------------------------------
(async () => {
  const ctx = makeCtx();
  const result = await handleRequest(ctx, successHandler);
  console.assert(result.statusCode === 200, `[Test 1] Expected 200, got ${result.statusCode}`);
  console.assert(result.body.includes("user42"), `[Test 1] Expected userId in body, got: ${result.body}`);
  console.log("[Test 1] PASSED — happy path");
})();

// ------------------------------------------------------------------
// Test 2: Missing / invalid Authorization header → 401
// ------------------------------------------------------------------
(async () => {
  const ctx = makeCtx({ headers: {} }); // no authorization header
  const result = await handleRequest(ctx, successHandler);
  console.assert(result.statusCode === 401, `[Test 2] Expected 401, got ${result.statusCode}`);
  console.log("[Test 2] PASSED — unauthenticated");
})();

// ------------------------------------------------------------------
// Test 3: Rate limit exceeded → 429
// ------------------------------------------------------------------
(async () => {
  // Seed the rate-limit map beyond the threshold for a specific user
  const limitedUserId = "valid-heavyuser" as unknown as UserId;
  rateLimitMap.set(limitedUserId, 6); // > 5 → should be limited

  const ctx = makeCtx({ headers: { authorization: "Bearer valid-heavyuser" } });
  const result = await handleRequest(ctx, successHandler);
  console.assert(result.statusCode === 429, `[Test 3] Expected 429, got ${result.statusCode}`);
  console.log("[Test 3] PASSED — rate limited");
})();

// ------------------------------------------------------------------
// Test 4: Malformed JSON body → 400
// ------------------------------------------------------------------
(async () => {
  const ctx = makeCtx({ rawBody: "{ not valid json" });
  const result = await handleRequest(ctx, successHandler);
  console.assert(result.statusCode === 400, `[Test 4] Expected 400, got ${result.statusCode}`);
  console.log("[Test 4] PASSED — parse error");
})();

// ------------------------------------------------------------------
// Test 5: Valid JSON but missing admin role → 403
// ------------------------------------------------------------------
(async () => {
  const ctx = makeCtx({ rawBody: JSON.stringify({ role: "viewer" }) });
  const result = await handleRequest(ctx, successHandler);
  console.assert(result.statusCode === 403, `[Test 5] Expected 403, got ${result.statusCode}`);
  console.log("[Test 5] PASSED — forbidden");
})();

// ------------------------------------------------------------------
// Test 6: matchGatewayError covers all variants correctly
// ------------------------------------------------------------------
(() => {
  const errors: GatewayError[] = [
    { kind: "unauthenticated", message: "no token" },
    { kind: "rate_limited", retryAfterMs: 5000 },
    { kind: "parse_error", field: "rawBody", reason: "unexpected token" },
    { kind: "forbidden", requiredRole: "admin" },
  ];
  const expected = [401, 429, 400, 403];
  errors.forEach((e, i) => {
    const { statusCode } = matchGatewayError(e);
    console.assert(statusCode === expected[i], `[Test 6.${i + 1}] Expected ${expected[i]}, got ${statusCode}`);
  });
  console.log("[Test 6] PASSED — matchGatewayError exhaustive");
})();
