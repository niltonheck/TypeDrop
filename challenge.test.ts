// challenge.test.ts — run with: npx ts-node --strict challenge.test.ts
import {
  ok,
  fail,
  handleError,
  mapResult,
  collectResults,
  createPipeline,
  type BaseContext,
  type AppError,
  type Result,
} from "./challenge";

// ---------------------------------------------------------------------------
// Shared mock base context
// ---------------------------------------------------------------------------
const BASE_CTX: BaseContext = {
  requestId: "req-001",
  method: "GET",
  path: "/api/users/42",
  headers: { authorization: "Bearer token123", "x-request-id": "req-001" },
};

// ---------------------------------------------------------------------------
// Mock middleware definitions
// ---------------------------------------------------------------------------

/** Adds `userId: string` by parsing the Authorization header. */
async function authMiddleware(
  ctx: BaseContext
): Promise<Result<BaseContext & { userId: string }, AppError>> {
  const token = ctx.headers["authorization"] ?? "";
  if (!token.startsWith("Bearer ")) {
    return fail({ kind: "AuthError", message: "Missing bearer token" });
  }
  return ok({ ...ctx, userId: "user-42" });
}

/** Adds `parsedId: number` by parsing the last path segment. */
async function parseIdMiddleware(
  ctx: BaseContext & { userId: string }
): Promise<Result<BaseContext & { userId: string; parsedId: number }, AppError>> {
  const segments = ctx.path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const id = last !== undefined ? parseInt(last, 10) : NaN;
  if (isNaN(id)) {
    return fail({ kind: "ValidationError", field: "path", message: "Invalid numeric ID" });
  }
  return ok({ ...ctx, parsedId: id });
}

/** Adds `rateOk: true` — always passes in tests. */
async function rateLimitMiddleware(
  ctx: BaseContext & { userId: string; parsedId: number }
): Promise<Result<BaseContext & { userId: string; parsedId: number; rateOk: true }, AppError>> {
  return ok({ ...ctx, rateOk: true as const });
}

// ---------------------------------------------------------------------------
// Test 1 — ok / fail constructors
// ---------------------------------------------------------------------------
const okResult = ok(42);
console.assert(okResult.ok === true, "Test 1a FAILED: ok() should produce ok:true");
console.assert(
  okResult.ok && okResult.value === 42,
  "Test 1b FAILED: ok() value should be 42"
);

const failResult = fail<AppError>({ kind: "NotFoundError", resource: "User" });
console.assert(failResult.ok === false, "Test 1c FAILED: fail() should produce ok:false");
console.assert(
  !failResult.ok && failResult.error.kind === "NotFoundError",
  "Test 1d FAILED: fail() error.kind should be NotFoundError"
);

// ---------------------------------------------------------------------------
// Test 2 — handleError exhaustiveness
// ---------------------------------------------------------------------------
const authMsg = handleError({ kind: "AuthError", message: "Unauthorized" });
console.assert(typeof authMsg === "string" && authMsg.length > 0, "Test 2a FAILED: handleError(AuthError) must return a non-empty string");

const rateLimitMsg = handleError({ kind: "RateLimitError", retryAfterMs: 5000 });
console.assert(typeof rateLimitMsg === "string" && rateLimitMsg.length > 0, "Test 2b FAILED: handleError(RateLimitError) must return a non-empty string");

// ---------------------------------------------------------------------------
// Test 3 — mapResult
// ---------------------------------------------------------------------------
const mapped = mapResult(ok(10), (n) => n * 2);
console.assert(mapped.ok && mapped.value === 20, "Test 3a FAILED: mapResult should double 10 to 20");

const mappedFail = mapResult(
  fail<AppError>({ kind: "InternalError", cause: "oops" }),
  (n: number) => n * 2
);
console.assert(!mappedFail.ok, "Test 3b FAILED: mapResult on fail should stay fail");

// ---------------------------------------------------------------------------
// Test 4 — collectResults
// ---------------------------------------------------------------------------
const allOk = collectResults([ok(1), ok(2), ok(3)]);
console.assert(allOk.ok && JSON.stringify(allOk.value) === "[1,2,3]", "Test 4a FAILED: collectResults all-ok should return [1,2,3]");

const firstFail = collectResults<number, AppError>([
  ok(1),
  fail({ kind: "ValidationError", field: "x", message: "bad" }),
  ok(3),
]);
console.assert(!firstFail.ok && !firstFail.ok && firstFail.error.kind === "ValidationError", "Test 4b FAILED: collectResults should return first error");

// ---------------------------------------------------------------------------
// Test 5 — Pipeline.run happy path
// ---------------------------------------------------------------------------
(async () => {
  const pipeline = createPipeline()
    .pipe(authMiddleware)
    .pipe(parseIdMiddleware)
    .pipe(rateLimitMiddleware);

  const result = await pipeline.run(BASE_CTX);

  console.assert(result.ok === true, "Test 5a FAILED: pipeline happy path should succeed");
  if (result.ok) {
    console.assert(result.value.userId === "user-42", "Test 5b FAILED: userId should be 'user-42'");
    console.assert(result.value.parsedId === 42, "Test 5c FAILED: parsedId should be 42");
    console.assert(result.value.rateOk === true, "Test 5d FAILED: rateOk should be true");
  }

  // ---------------------------------------------------------------------------
  // Test 6 — Pipeline.run short-circuits on auth failure
  // ---------------------------------------------------------------------------
  const badCtx: BaseContext = { ...BASE_CTX, headers: { authorization: "Basic xyz" } };
  const failedResult = await pipeline.run(badCtx);

  console.assert(failedResult.ok === false, "Test 6a FAILED: bad auth should fail");
  if (!failedResult.ok) {
    console.assert(failedResult.error.kind === "AuthError", "Test 6b FAILED: error should be AuthError");
  }

  console.log("All tests completed — check assertions above for failures.");
})();
