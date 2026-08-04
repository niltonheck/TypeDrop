// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  BaseContext,
  AuthContext,
  ParsedBodyContext,
  createPipeline,
  makeAuthMiddleware,
  makeBodyParserMiddleware,
  makeBodyValidatorMiddleware,
  makeRateLimitMiddleware,
  makeHandler,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function makeBaseCtx(overrides?: Partial<BaseContext>): BaseContext {
  return {
    requestId: "req-001",
    method: "POST",
    path: "/api/orders",
    headers: { "content-type": "application/json" },
    startedAt: Date.now(),
    ...overrides,
  };
}

async function run() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // ── Mock data & helpers ──────────────────────────────────
  const VALID_TOKEN = "tok_admin_123";
  const fakeVerify = (token: string): AuthContext["auth"] | null =>
    token === VALID_TOKEN
      ? { userId: "u1", role: "admin", scopes: ["orders:write"] }
      : null;

  const fakeReadBody =
    (raw: string) =>
    async (_ctx: BaseContext): Promise<string> =>
      raw;

  interface OrderBody {
    productId: string;
    qty: number;
  }

  const validateOrder = (raw: unknown): OrderBody | null => {
    if (
      raw !== null &&
      typeof raw === "object" &&
      "productId" in raw &&
      "qty" in raw &&
      typeof (raw as Record<string, unknown>).productId === "string" &&
      typeof (raw as Record<string, unknown>).qty === "number"
    ) {
      return raw as OrderBody;
    }
    return null;
  };

  const fakeCheckLimit = async (
    userId: string
  ): Promise<{ limit: number; remaining: number; resetAt: number }> => ({
    limit: 100,
    remaining: userId === "u1" ? 42 : 0,
    resetAt: Date.now() + 60_000,
  });

  // ── Test 1: Auth middleware — missing header → 401 ────────
  console.log("\nTest 1: Auth middleware rejects missing token");
  {
    const auth = makeAuthMiddleware(fakeVerify);
    const result = await auth(makeBaseCtx()); // no authorization header
    assert(result.ok === false, "result.ok is false");
    assert(!result.ok && result.status === 401, "status is 401");
    assert(!result.ok && result.message === "Unauthorized", "message is Unauthorized");
  }

  // ── Test 2: Auth middleware — bad token → 401 ─────────────
  console.log("\nTest 2: Auth middleware rejects invalid token");
  {
    const auth = makeAuthMiddleware(fakeVerify);
    const result = await auth(
      makeBaseCtx({ headers: { authorization: "Bearer bad_token" } })
    );
    assert(result.ok === false, "result.ok is false");
    assert(!result.ok && result.status === 401, "status is 401");
  }

  // ── Test 3: Full pipeline — happy path ────────────────────
  console.log("\nTest 3: Full pipeline succeeds with all valid inputs");
  {
    const bodyJson = JSON.stringify({ productId: "p99", qty: 3 });

    const pipeline = createPipeline(
      makeAuthMiddleware<BaseContext>(fakeVerify),
      makeBodyParserMiddleware<BaseContext & AuthContext>(fakeReadBody(bodyJson)),
      makeBodyValidatorMiddleware<BaseContext & AuthContext & ParsedBodyContext, OrderBody>(
        validateOrder
      ),
      makeRateLimitMiddleware(fakeCheckLimit)
    );

    const result = await pipeline.run(
      makeBaseCtx({ headers: { authorization: `Bearer ${VALID_TOKEN}` } })
    );

    assert(result.ok === true, "pipeline result.ok is true");
    if (result.ok) {
      assert(result.ctx.auth.userId === "u1", "auth.userId is u1");
      assert(result.ctx.validatedBody.productId === "p99", "validatedBody.productId is p99");
      assert(result.ctx.validatedBody.qty === 3, "validatedBody.qty is 3");
      assert(result.ctx.rateLimit.remaining === 42, "rateLimit.remaining is 42");
    }
  }

  // ── Test 4: Pipeline short-circuits on invalid JSON ───────
  console.log("\nTest 4: Pipeline short-circuits on invalid JSON body");
  {
    const pipeline = createPipeline(
      makeAuthMiddleware<BaseContext>(fakeVerify),
      makeBodyParserMiddleware<BaseContext & AuthContext>(fakeReadBody("NOT JSON {{{"))
    );

    const result = await pipeline.run(
      makeBaseCtx({ headers: { authorization: `Bearer ${VALID_TOKEN}` } })
    );

    assert(result.ok === false, "result.ok is false");
    assert(!result.ok && result.status === 400, "status is 400");
    assert(!result.ok && result.message === "Invalid JSON body", "message is Invalid JSON body");
  }

  // ── Test 5: makeHandler — wraps pipeline + handler ────────
  console.log("\nTest 5: makeHandler returns ok:true data on success");
  {
    const bodyJson = JSON.stringify({ productId: "p42", qty: 1 });

    const pipeline = createPipeline(
      makeAuthMiddleware<BaseContext>(fakeVerify),
      makeBodyParserMiddleware<BaseContext & AuthContext>(fakeReadBody(bodyJson)),
      makeBodyValidatorMiddleware<BaseContext & AuthContext & ParsedBodyContext, OrderBody>(
        validateOrder
      )
    );

    const handle = makeHandler(pipeline, async (ctx) => ({
      orderId: `ord-${ctx.validatedBody.productId}`,
      userId: ctx.auth.userId,
    }));

    const response = await handle(
      makeBaseCtx({ headers: { authorization: `Bearer ${VALID_TOKEN}` } })
    );

    assert(response.ok === true, "handler response.ok is true");
    if (response.ok) {
      assert(response.data.orderId === "ord-p42", "orderId is ord-p42");
      assert(response.data.userId === "u1", "userId is u1");
    }
  }

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
