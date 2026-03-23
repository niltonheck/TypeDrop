// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  ok, err,
  executeChain,
  formatPluginError,
  PluginRegistry,
  BaseContext,
  Plugin,
  PluginError,
  ChainResult,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    process.exitCode = 1;
  }
}

// ── mock plugins ─────────────────────────────────────────────

interface AuthContext extends BaseContext {
  userId: string;
}

interface EnrichedContext extends AuthContext {
  userRole: "admin" | "viewer";
}

// Plugin A: injects userId
const authPlugin: Plugin<BaseContext, AuthContext> = {
  id: "auth",
  timeoutMs: 200,
  run: async (ctx) => {
    return ok({ ...ctx, userId: "user-42" });
  },
};

// Plugin B: enriches with role (depends on userId)
const enrichPlugin: Plugin<AuthContext, EnrichedContext> = {
  id: "enrich",
  timeoutMs: 200,
  run: async (ctx) => {
    return ok({ ...ctx, userRole: "admin" });
  },
};

// Plugin C: always returns a validation error
const badPlugin: Plugin<BaseContext, BaseContext> = {
  id: "bad",
  timeoutMs: 200,
  run: async (_ctx) => {
    const e: PluginError = { kind: "validation", pluginId: "bad", message: "bad input" };
    return err(e);
  },
};

// Plugin D: times out (sleeps longer than its timeoutMs)
const slowPlugin: Plugin<BaseContext, BaseContext> = {
  id: "slow",
  timeoutMs: 50,
  run: async (ctx) => {
    await new Promise((res) => setTimeout(res, 500));
    return ok(ctx);
  },
};

// ── tests ─────────────────────────────────────────────────────

(async () => {
  console.log("\n── Test 1: happy-path chain succeeds with full trace ──");
  {
    const registry = new PluginRegistry()
      .register(authPlugin)
      .register(enrichPlugin);

    const initCtx: BaseContext = { requestId: "req-1", meta: {} };
    const result: ChainResult<BaseContext> = await executeChain(initCtx, registry);

    assert(result.ok === true, "result is Ok");
    if (result.ok) {
      assert(result.value.trace.length === 2, "trace has 2 entries");
      assert(result.value.trace[0].pluginId === "auth", "first trace entry is 'auth'");
      assert(result.value.trace[1].pluginId === "enrich", "second trace entry is 'enrich'");
      assert(
        (result.value.finalContext as AuthContext).userId === "user-42",
        "finalContext carries userId"
      );
      assert(result.value.trace[0].mutated === true, "auth plugin marked mutated");
    }
  }

  console.log("\n── Test 2: chain stops on first plugin error ──");
  {
    const registry = new PluginRegistry()
      .register(badPlugin)
      .register(authPlugin); // should never run

    const initCtx: BaseContext = { requestId: "req-2", meta: {} };
    const result = await executeChain(initCtx, registry);

    assert(result.ok === false, "result is Err");
    if (!result.ok) {
      assert(result.error.error.kind === "validation", "error kind is 'validation'");
      assert(result.error.error.pluginId === "bad", "failing pluginId is 'bad'");
      assert(result.error.trace.length === 1, "trace only has 1 entry (bad plugin)");
    }
  }

  console.log("\n── Test 3: timeout plugin produces a timeout error ──");
  {
    const registry = new PluginRegistry().register(slowPlugin);
    const initCtx: BaseContext = { requestId: "req-3", meta: {} };
    const result = await executeChain(initCtx, registry);

    assert(result.ok === false, "result is Err (timeout)");
    if (!result.ok) {
      assert(result.error.error.kind === "timeout", "error kind is 'timeout'");
      assert(result.error.error.pluginId === "slow", "timed-out pluginId is 'slow'");
    }
  }

  console.log("\n── Test 4: formatPluginError produces correct strings ──");
  {
    const ve: PluginError = { kind: "validation", pluginId: "p1", message: "bad value" };
    const te: PluginError = { kind: "timeout",    pluginId: "p2", limitMs: 100 };
    const de: PluginError = { kind: "dependency", pluginId: "p3", missing: ["auth", "db"] };

    assert(
      formatPluginError(ve) === "[validation] p1: bad value",
      "validation error formatted correctly"
    );
    assert(
      formatPluginError(te) === "[timeout] p2 exceeded 100ms",
      "timeout error formatted correctly"
    );
    assert(
      formatPluginError(de) === "[dependency] p3 missing: auth, db",
      "dependency error formatted correctly"
    );
  }

  console.log("\n── Test 5: empty registry returns ok with unchanged context ──");
  {
    const registry = new PluginRegistry();
    const initCtx: BaseContext = { requestId: "req-5", meta: {} };
    const result = await executeChain(initCtx, registry);

    assert(result.ok === true, "empty chain is Ok");
    if (result.ok) {
      assert(result.value.trace.length === 0, "trace is empty");
      assert(result.value.finalContext.requestId === "req-5", "context is unchanged");
    }
  }

  console.log("\nDone.\n");
})();
