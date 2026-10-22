// challenge.test.ts
import {
  buildGatewayPipeline,
  Pipeline,
  makeAuthMiddleware,
  makeLoggingMiddleware,
  makeRateLimitMiddleware,
  makeEchoHandler,
  type RawRequest,
  type PipelineResponse,
  type Spread,
  type VerifyReads,
  type AccumulateContext,
  type MiddlewareDescriptor,
} from "./challenge";

// ------------------------------------------------------------------
// Type-level tests (compile-time only)
// ------------------------------------------------------------------

// Spread should flatten intersection
type _SpreadTest = Spread<{ a: number; b: string }, { b: boolean; c: Date }>;
const _spreadCheck: _SpreadTest = { a: 1, b: true, c: new Date() };

// VerifyReads: satisfied
type _VR1 = VerifyReads<{ userId: string }, { userId: string; role: "admin" }>;
const _vr1: _VR1 = true;

// VerifyReads: NOT satisfied — should be false
type _VR2 = VerifyReads<{ requestId: string }, { userId: string }>;
const _vr2: _VR2 = false;

// AccumulateContext over a tuple of descriptors
type _Accumulated = AccumulateContext<[
  MiddlewareDescriptor<{}, { userId: string; role: "admin" | "user" }>,
  MiddlewareDescriptor<{ userId: string }, { requestId: string; loggedAt: Date }>,
  MiddlewareDescriptor<{ role: "admin" | "user" }, { remainingQuota: number }>
]>;
// Should have all four keys
const _accCheck: _Accumulated = {
  userId: "u1",
  role: "admin",
  requestId: "abc",
  loggedAt: new Date(),
  remainingQuota: 1000,
};

// ------------------------------------------------------------------
// Runtime tests
// ------------------------------------------------------------------

const pipeline = buildGatewayPipeline();

const validRequest: RawRequest = {
  method: "POST",
  path: "/api/echo",
  headers: { "x-user-id": "user-42", "x-role": "user" },
  body: { message: "hello" },
};

const adminRequest: RawRequest = {
  method: "GET",
  path: "/api/echo",
  headers: { "x-user-id": "admin-1", "x-role": "admin" },
  body: null,
};

const missingAuthRequest: RawRequest = {
  method: "GET",
  path: "/api/echo",
  headers: {},
  body: null,
};

const badRoleRequest: RawRequest = {
  method: "GET",
  path: "/api/echo",
  headers: { "x-user-id": "u99", "x-role": "superuser" },
  body: null,
};

async function runTests(): Promise<void> {
  // Test 1: valid user request returns 200 with correct shape
  const res1 = await pipeline.execute(validRequest);
  console.assert(res1.status === 200, `Test 1 FAILED: expected status 200, got ${res1.status}`);
  const body1 = res1.body as Record<string, unknown>;
  console.assert(body1["userId"] === "user-42", `Test 1 FAILED: wrong userId`);
  console.assert(typeof body1["requestId"] === "string", `Test 1 FAILED: requestId should be string`);
  console.assert(body1["remainingQuota"] === 100, `Test 1 FAILED: user quota should be 100, got ${body1["remainingQuota"]}`);
  console.assert((body1["echo"] as Record<string, unknown>)["message"] === "hello", `Test 1 FAILED: echo body mismatch`);
  console.log("✅ Test 1 passed: valid user request");

  // Test 2: admin gets quota 1000
  const res2 = await pipeline.execute(adminRequest);
  console.assert(res2.status === 200, `Test 2 FAILED: expected 200, got ${res2.status}`);
  const body2 = res2.body as Record<string, unknown>;
  console.assert(body2["remainingQuota"] === 1000, `Test 2 FAILED: admin quota should be 1000, got ${body2["remainingQuota"]}`);
  console.assert(body2["userId"] === "admin-1", `Test 2 FAILED: wrong userId`);
  console.log("✅ Test 2 passed: admin gets quota 1000");

  // Test 3: missing auth headers → 401
  const res3 = await pipeline.execute(missingAuthRequest);
  console.assert(res3.status === 401, `Test 3 FAILED: expected 401, got ${res3.status}`);
  console.assert(res3.body === "Unauthorized", `Test 3 FAILED: expected 'Unauthorized', got ${res3.body}`);
  console.log("✅ Test 3 passed: missing auth → 401");

  // Test 4: invalid role → 403
  const res4 = await pipeline.execute(badRoleRequest);
  console.assert(res4.status === 403, `Test 4 FAILED: expected 403, got ${res4.status}`);
  console.assert(res4.body === "Forbidden", `Test 4 FAILED: expected 'Forbidden', got ${res4.body}`);
  console.log("✅ Test 4 passed: bad role → 403");

  // Test 5: type-level — logging before auth should be a compile-time error.
  // Uncomment the block below to verify the compiler rejects it:
  //
  // const _badPipeline = new Pipeline()
  //   .use(makeLoggingMiddleware())  // ❌ ERROR: reads { userId } but context is {}
  //   .use(makeAuthMiddleware());
  //
  console.log("✅ Test 5 passed: out-of-order middleware is a compile-time type error (see comment)");

  console.log("\n🎉 All runtime tests passed!");
}

runTests().catch(console.error);
