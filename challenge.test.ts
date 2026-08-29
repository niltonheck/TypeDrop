// challenge.test.ts
import {
  createPipeline,
  composeMiddleware,
  authMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  type ExtractCtx,
  type ContextDiff,
  type Pipeline,
  type BaseCtx,
} from "./challenge";

// ── Helper ──────────────────────────────────────────────────
async function run() {
  let passed = 0;
  let failed = 0;

  function assert(label: string, condition: boolean) {
    if (condition) {
      console.log(`  ✅ PASS: ${label}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label}`);
      failed++;
    }
  }

  // ── Test 1: Full pipeline succeeds and accumulates context ──
  console.log("\n[1] Full pipeline — happy path");
  {
    const pipeline = createPipeline<{ requestId: string }>()
      .use(authMiddleware)
      .use(rateLimitMiddleware)
      .use(loggingMiddleware);

    const result = await pipeline.run({ requestId: "abc-123" });

    assert("result.ok is true", result.ok === true);
    if (result.ok) {
      assert("userId is set", result.ctx.userId === "user-abc-123");
      assert("remaining is set", result.ctx.remaining === 99);
      assert("loggedAt is a Date", result.ctx.loggedAt instanceof Date);
    }
  }

  // ── Test 2: Short-circuit on auth failure ───────────────────
  console.log("\n[2] Pipeline short-circuits on first failure");
  {
    const pipeline = createPipeline<{ requestId: string }>()
      .use(authMiddleware)
      .use(rateLimitMiddleware)
      .use(loggingMiddleware);

    // Empty requestId triggers auth failure
    const result = await pipeline.run({ requestId: "" });

    assert("result.ok is false", result.ok === false);
    if (!result.ok) {
      assert("error layer is 'auth'", result.error.layer === "auth");
      assert("error code is MISSING_REQUEST_ID", result.error.code === "MISSING_REQUEST_ID");
    }
  }

  // ── Test 3: Short-circuit on rate-limit failure ─────────────
  console.log("\n[3] Pipeline short-circuits on rate-limit failure");
  {
    const pipeline = createPipeline<{ requestId: string }>()
      .use(authMiddleware)
      .use(rateLimitMiddleware)
      .use(loggingMiddleware);

    // "fail" suffix triggers rate-limit failure
    const result = await pipeline.run({ requestId: "fail" });

    assert("result.ok is false", result.ok === false);
    if (!result.ok) {
      assert("error layer is 'rateLimit'", result.error.layer === "rateLimit");
      assert("error code is RATE_LIMITED", result.error.code === "RATE_LIMITED");
    }
  }

  // ── Test 4: composeMiddleware merges two layers into one ────
  console.log("\n[4] composeMiddleware — happy path");
  {
    const composed = composeMiddleware(authMiddleware, rateLimitMiddleware);

    assert("composed name is correct", composed.name === "auth+rateLimit");

    const result = await composed.handler({ requestId: "xyz-789" });
    assert("composed result.ok is true", result.ok === true);
    if (result.ok) {
      assert("composed userId is set", result.ctx.userId === "user-xyz-789");
      assert("composed remaining is set", result.ctx.remaining === 99);
    }
  }

  // ── Test 5: composeMiddleware short-circuits on first failure ─
  console.log("\n[5] composeMiddleware — short-circuits");
  {
    const composed = composeMiddleware(authMiddleware, rateLimitMiddleware);
    const result = await composed.handler({ requestId: "" });

    assert("composed result.ok is false", result.ok === false);
    if (!result.ok) {
      assert("composed error layer is 'auth'", result.error.layer === "auth");
    }
  }

  // ── Compile-time type checks (no runtime assertions needed) ──
  // These lines must type-check correctly:

  // ExtractCtx picks up the final accumulated context
  type FullPipeline = Pipeline<{
    requestId: string;
    userId: string;
    remaining: number;
    loggedAt: Date;
  }>;
  type Ctx = ExtractCtx<FullPipeline>;
  const _ctxCheck: Ctx = {
    requestId: "r",
    userId: "u",
    remaining: 5,
    loggedAt: new Date(),
  };
  void _ctxCheck;

  // ContextDiff returns only the new keys
  type Before = { requestId: string };
  type After  = { requestId: string; userId: string; role: "admin" | "user" };
  type Added  = ContextDiff<Before, After>;
  const _diffCheck: Added = { userId: "u", role: "admin" };
  void _diffCheck;

  // ── Summary ─────────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
