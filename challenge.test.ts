// challenge.test.ts
import {
  Pipeline,
  makeRequestId,
  withAuth,
  withRateLimit,
  withBodyValidation,
  ok,
  err,
  type BaseContext,
  type AuthedContext,
  type ValidatedContext,
  type PipelineError,
  type Result,
  type HttpMethod,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────
const baseCtxFactory = (): BaseContext => ({
  requestId: makeRequestId("req-001"),
  startedAt: Date.now(),
  path: "/api/orders",
  method: "POST" as HttpMethod,
});

type OrderBody = { itemId: string; quantity: number };

const validateOrder = (raw: unknown): OrderBody | null => {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "itemId" in raw &&
    "quantity" in raw &&
    typeof (raw as Record<string, unknown>).itemId === "string" &&
    typeof (raw as Record<string, unknown>).quantity === "number"
  ) {
    return raw as OrderBody;
  }
  return null;
};

const validBody: unknown = { itemId: "SKU-42", quantity: 3 };
const invalidBody: unknown = { itemId: 99 };

// ── Terminal handler (resolves the final output from context) ─
const makeTerminal =
  (ctx: ValidatedContext<OrderBody>) =>
    Promise.resolve(ok<ValidatedContext<OrderBody>, PipelineError>(ctx));

// ── Test 1: Happy path — all middleware pass ──────────────────
async function testHappyPath() {
  const pipeline = new Pipeline(baseCtxFactory)
    .use(withAuth("valid-token"))
    .use(withRateLimit(100))
    .use(withBodyValidation(validateOrder, validBody));

  const result = await pipeline.run(makeTerminal);

  console.assert(result.ok === true, "Test 1 FAILED: expected ok result");
  if (result.ok) {
    console.assert(
      result.value.userId !== undefined,
      "Test 1 FAILED: userId should be present"
    );
    console.assert(
      result.value.body.itemId === "SKU-42",
      "Test 1 FAILED: body.itemId should be SKU-42"
    );
    console.assert(
      result.value.body.quantity === 3,
      "Test 1 FAILED: body.quantity should be 3"
    );
    console.log("Test 1 PASSED: happy path");
  }
}

// ── Test 2: Auth failure short-circuits pipeline ──────────────
async function testAuthFailure() {
  let middlewareAfterAuthCalled = false;

  const pipeline = new Pipeline(baseCtxFactory)
    .use(withAuth("invalid"))
    .use(
      // This middleware must NOT be called
      (_ctx: AuthedContext, next) => {
        middlewareAfterAuthCalled = true;
        return next(_ctx);
      }
    );

  const result = await pipeline.run((ctx) =>
    Promise.resolve(ok<AuthedContext, PipelineError>(ctx))
  );

  console.assert(result.ok === false, "Test 2 FAILED: expected error result");
  if (!result.ok) {
    console.assert(
      result.error.kind === "auth",
      `Test 2 FAILED: expected auth error, got ${result.error.kind}`
    );
  }
  console.assert(
    middlewareAfterAuthCalled === false,
    "Test 2 FAILED: middleware after auth should NOT have been called"
  );
  console.log("Test 2 PASSED: auth short-circuit");
}

// ── Test 3: Rate-limit failure ────────────────────────────────
async function testRateLimitFailure() {
  const pipeline = new Pipeline(baseCtxFactory)
    .use(withAuth("valid-token"))
    .use(withRateLimit(0)); // 0 => always rate-limited

  const result = await pipeline.run((ctx) =>
    Promise.resolve(ok<AuthedContext, PipelineError>(ctx))
  );

  console.assert(result.ok === false, "Test 3 FAILED: expected error result");
  if (!result.ok) {
    console.assert(
      result.error.kind === "rate_limit",
      `Test 3 FAILED: expected rate_limit, got ${result.error.kind}`
    );
    // Exhaustive check — TypeScript should flag unhandled variants
    const e = result.error;
    if (e.kind === "rate_limit") {
      console.assert(
        e.retryAfterMs === 60_000,
        "Test 3 FAILED: retryAfterMs should be 60000"
      );
    }
  }
  console.log("Test 3 PASSED: rate-limit short-circuit");
}

// ── Test 4: Validation failure ────────────────────────────────
async function testValidationFailure() {
  const pipeline = new Pipeline(baseCtxFactory)
    .use(withAuth("valid-token"))
    .use(withRateLimit(100))
    .use(withBodyValidation(validateOrder, invalidBody));

  const result = await pipeline.run(makeTerminal);

  console.assert(result.ok === false, "Test 4 FAILED: expected error result");
  if (!result.ok) {
    console.assert(
      result.error.kind === "validation",
      `Test 4 FAILED: expected validation error, got ${result.error.kind}`
    );
    if (result.error.kind === "validation") {
      console.assert(
        result.error.fields.includes("body"),
        "Test 4 FAILED: fields should include 'body'"
      );
    }
  }
  console.log("Test 4 PASSED: validation short-circuit");
}

// ── Test 5: ok / err helpers return correct shapes ────────────
function testResultHelpers() {
  const success = ok<number, string>(42);
  console.assert(success.ok === true, "Test 5 FAILED: ok() should set ok=true");
  if (success.ok) {
    console.assert(success.value === 42, "Test 5 FAILED: ok() value mismatch");
  }

  const failure = err<number, string>("oops");
  console.assert(failure.ok === false, "Test 5 FAILED: err() should set ok=false");
  if (!failure.ok) {
    console.assert(failure.error === "oops", "Test 5 FAILED: err() error mismatch");
  }
  console.log("Test 5 PASSED: Result helpers");
}

// ── Run all ───────────────────────────────────────────────────
(async () => {
  testResultHelpers();
  await testHappyPath();
  await testAuthFailure();
  await testRateLimitFailure();
  await testValidationFailure();
})();
