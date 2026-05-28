// ============================================================
// challenge.test.ts
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// (tsconfig must have strict: true)
// ============================================================

import {
  BaseContext,
  Pipeline,
  authMiddleware,
  roleMiddleware,
  rateLimitMiddleware,
  describeError,
  MiddlewareError,
} from "./challenge";

// ─── Helpers ────────────────────────────────────────────────

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  PASS — ${label}`);
  } else {
    console.error(`  ❌  FAIL — ${label}`);
    process.exitCode = 1;
  }
}

function makeCtx(overrides: Partial<BaseContext> = {}): BaseContext {
  return {
    requestId: "req-001",
    path: "/api/data",
    method: "GET",
    headers: {},
    ...overrides,
  };
}

// ─── Test Suite ─────────────────────────────────────────────

async function main() {
  console.log("\n=== Typed Middleware Pipeline Builder — Tests ===\n");

  // ── Test 1: Auth middleware — missing header → unauthorized ──
  {
    console.log("Test 1: authMiddleware rejects missing token");
    const ctx = makeCtx(); // no authorization header
    const pipeline = new Pipeline(ctx).use(authMiddleware());
    const result = await pipeline.run(async (c) => c);
    assert(result.ok === false, "pipeline result is not ok");
    assert(
      !result.ok && result.error.kind === "unauthorized",
      "error kind is 'unauthorized'"
    );
  }

  // ── Test 2: Auth middleware — valid Bearer token passes ──
  {
    console.log("\nTest 2: authMiddleware accepts valid Bearer token");
    const ctx = makeCtx({ headers: { authorization: "Bearer my-secret" } });
    const pipeline = new Pipeline(ctx).use(authMiddleware());
    const result = await pipeline.run(async (c) => c.auth.token);
    assert(result.ok === true, "pipeline result is ok");
    assert(result.ok && result.value === "my-secret", "token extracted correctly");
  }

  // ── Test 3: Auth + Role — admin token passes admin role check ──
  {
    console.log("\nTest 3: roleMiddleware passes with correct role");
    const ctx = makeCtx({ headers: { authorization: "Bearer admin-token" } });
    const pipeline = new Pipeline(ctx)
      .use(authMiddleware())
      .use(roleMiddleware("admin"));
    const result = await pipeline.run(async (c) => c.user.role);
    assert(result.ok === true, "pipeline result is ok");
    assert(result.ok && result.value === "admin", "role is 'admin'");
  }

  // ── Test 4: Auth + Role — viewer token fails admin role check ──
  {
    console.log("\nTest 4: roleMiddleware short-circuits on wrong role");
    const ctx = makeCtx({ headers: { authorization: "Bearer viewer-token" } });
    const pipeline = new Pipeline(ctx)
      .use(authMiddleware())
      .use(roleMiddleware("admin"));
    const result = await pipeline.run(async (c) => c.user.role);
    assert(result.ok === false, "pipeline result is not ok");
    assert(
      !result.ok && result.error.kind === "forbidden",
      "error kind is 'forbidden'"
    );
    assert(
      !result.ok &&
        result.error.kind === "forbidden" &&
        result.error.requiredRole === "admin",
      "requiredRole is 'admin'"
    );
  }

  // ── Test 5: Rate limit — exceeding limit returns rate_limited ──
  {
    console.log("\nTest 5: rateLimitMiddleware enforces request cap");
    const ctx = makeCtx();
    // maxRequests = 2, so 3rd call should be rate-limited
    const rl = rateLimitMiddleware(2, 3000);
    const makeRlPipeline = () => new Pipeline(ctx).use(rl);

    const r1 = await makeRlPipeline().run(async (c) => c.rateLimit.remaining);
    const r2 = await makeRlPipeline().run(async (c) => c.rateLimit.remaining);
    const r3 = await makeRlPipeline().run(async (c) => c.rateLimit.remaining);

    assert(r1.ok && r1.value === 1, "1st request: remaining = 1");
    assert(r2.ok && r2.value === 0, "2nd request: remaining = 0");
    assert(r3.ok === false, "3rd request is rejected");
    assert(
      !r3.ok && r3.error.kind === "rate_limited",
      "3rd request error kind is 'rate_limited'"
    );
    assert(
      !r3.ok &&
        r3.error.kind === "rate_limited" &&
        r3.error.retryAfterMs === 3000,
      "retryAfterMs is 3000"
    );
  }

  // ── Test 6: describeError — exhaustive formatting ──
  {
    console.log("\nTest 6: describeError formats all variants correctly");
    const errors: Array<[MiddlewareError, string]> = [
      [
        { kind: "unauthorized", message: "No token" },
        "401 Unauthorized: No token",
      ],
      [
        { kind: "forbidden", message: "Access denied", requiredRole: "admin" },
        "403 Forbidden: Access denied (requires role: admin)",
      ],
      [
        {
          kind: "validation_failed",
          message: "Bad input",
          fields: ["email", "age"],
        },
        "400 Validation Failed: Bad input (fields: email, age)",
      ],
      [
        { kind: "rate_limited", message: "Slow down", retryAfterMs: 5000 },
        "429 Rate Limited: Slow down (retry after 5000ms)",
      ],
      [{ kind: "internal", message: "Boom" }, "500 Internal Error: Boom"],
    ];
    for (const [err, expected] of errors) {
      const got = describeError(err);
      assert(got === expected, `describeError("${err.kind}") → "${expected}"`);
    }
  }

  console.log("\n=== Done ===\n");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
