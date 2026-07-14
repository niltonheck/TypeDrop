// challenge.test.ts
import {
  ok,
  err,
  makePlugin,
  createPipeline,
  type BaseContext,
  type PluginError,
  type Result,
} from "./challenge";

// ─── Mock plugins ─────────────────────────────────────────────────────

const authPlugin = makePlugin(
  "AuthPlugin",
  async (ctx: BaseContext): Promise<Result<{ userId: string; role: "admin" | "user" }, PluginError>> => {
    const token = ctx.headers["authorization"] ?? "";
    if (!token.startsWith("Bearer ")) {
      return err({ pluginName: "AuthPlugin", message: "Missing token", statusCode: 401 });
    }
    return ok({ userId: "user-42", role: "user" as const });
  }
);

const rateLimitPlugin = makePlugin(
  "RateLimitPlugin",
  async (ctx: BaseContext & { userId: string }): Promise<Result<{ requestsRemaining: number }, PluginError>> => {
    // Simulate: user-42 has 99 requests left
    if (ctx.userId === "blocked") {
      return err({ pluginName: "RateLimitPlugin", message: "Rate limit exceeded", statusCode: 429 });
    }
    return ok({ requestsRemaining: 99 });
  }
);

const logPlugin = makePlugin(
  "LogPlugin",
  async (
    ctx: BaseContext & { userId: string; requestsRemaining: number }
  ): Promise<Result<{ logEntryId: string }, PluginError>> => {
    return ok({ logEntryId: `log-${ctx.requestId}-${ctx.userId}` });
  }
);

// ─── Test harness ─────────────────────────────────────────────────────

const baseCtx: BaseContext = {
  requestId: "req-001",
  method: "GET",
  path: "/api/data",
  headers: { authorization: "Bearer secret-token" },
  body: null,
};

const blockedCtx: BaseContext = {
  requestId: "req-002",
  method: "POST",
  path: "/api/data",
  headers: { authorization: "Bearer secret-token" },
  body: null,
};

const unauthCtx: BaseContext = {
  requestId: "req-003",
  method: "GET",
  path: "/api/data",
  headers: {},
  body: null,
};

async function runTests(): Promise<void> {
  // ── Test 1: Full pipeline succeeds and final context has all fields ──
  const pipeline = createPipeline([authPlugin, rateLimitPlugin, logPlugin]);
  const result = await pipeline.run(baseCtx);

  console.assert(result.ok === true, "Test 1a FAILED: pipeline should succeed");
  if (result.ok) {
    console.assert(result.value.userId === "user-42",          "Test 1b FAILED: userId mismatch");
    console.assert(result.value.requestsRemaining === 99,      "Test 1c FAILED: requestsRemaining mismatch");
    console.assert(result.value.logEntryId === "log-req-001-user-42", "Test 1d FAILED: logEntryId mismatch");
    console.assert(result.value.requestId === "req-001",       "Test 1e FAILED: BaseContext field missing");
    console.assert(result.value.method === "GET",              "Test 1f FAILED: method field missing");
    console.log("✅ Test 1 passed: full pipeline success with merged context");
  }

  // ── Test 2: Short-circuit on auth failure ────────────────────────────
  const result2 = await pipeline.run(unauthCtx);
  console.assert(result2.ok === false, "Test 2a FAILED: should fail on missing token");
  if (!result2.ok) {
    console.assert(result2.error.statusCode === 401,           "Test 2b FAILED: statusCode should be 401");
    console.assert(result2.error.pluginName === "AuthPlugin",  "Test 2c FAILED: pluginName should be AuthPlugin");
    console.log("✅ Test 2 passed: pipeline short-circuits on auth error");
  }

  // ── Test 3: Short-circuit on rate-limit failure ───────────────────────
  // Temporarily override userId to "blocked" by using a separate auth plugin
  const blockedAuthPlugin = makePlugin(
    "BlockedAuthPlugin",
    async (_ctx: BaseContext): Promise<Result<{ userId: string; role: "admin" | "user" }, PluginError>> => {
      return ok({ userId: "blocked", role: "user" as const });
    }
  );
  const pipeline2 = createPipeline([blockedAuthPlugin, rateLimitPlugin, logPlugin]);
  const result3 = await pipeline2.run(blockedCtx);
  console.assert(result3.ok === false,                         "Test 3a FAILED: should fail on rate limit");
  if (!result3.ok) {
    console.assert(result3.error.statusCode === 429,           "Test 3b FAILED: statusCode should be 429");
    console.assert(result3.error.pluginName === "RateLimitPlugin", "Test 3c FAILED: pluginName mismatch");
    console.log("✅ Test 3 passed: pipeline short-circuits on rate-limit error");
  }

  // ── Test 4: Single-plugin pipeline works ─────────────────────────────
  const singlePipeline = createPipeline([authPlugin]);
  const result4 = await singlePipeline.run(baseCtx);
  console.assert(result4.ok === true,                          "Test 4a FAILED: single plugin should succeed");
  if (result4.ok) {
    console.assert(result4.value.userId === "user-42",         "Test 4b FAILED: userId missing from single-plugin result");
    console.log("✅ Test 4 passed: single-plugin pipeline works");
  }

  // ── Test 5: makePlugin infers types correctly (compile-time check) ────
  // This is a type-level test. If it compiles, it passes.
  const _typedPlugin: typeof authPlugin = makePlugin(
    "TypeCheck",
    async (ctx: BaseContext): Promise<Result<{ userId: string; role: "admin" | "user" }, PluginError>> => {
      void ctx.headers; // uses a BaseContext field
      return ok({ userId: "x", role: "admin" as const });
    }
  );
  console.log("✅ Test 5 passed: makePlugin infers Plugin<Reads, Writes> correctly");

  console.log("\n🏁 All tests complete.");
}

runTests().catch(console.error);

// ── Compile-time test: invalid pipeline order should be a type error ──
// Uncomment the block below to verify the compile-time guard works.
// It SHOULD produce a TypeScript error because rateLimitPlugin needs
// `userId` which AuthPlugin has not yet provided.
//
// const _invalid = createPipeline([rateLimitPlugin, authPlugin]);
//                                   ^^^^^^^^^^^^^^^^^^^^^^^^^
//                  TS error: Argument of type '...' is not assignable to 'never'
