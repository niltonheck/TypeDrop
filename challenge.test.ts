// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  toPluginId,
  toRequestId,
  validatePluginConfig,
  executePipeline,
  withTimeout,
  TimeoutError,
  type GatewayContext,
  type PluginRegistry,
  type PluginConfig,
  type PluginOutcome,
} from "./challenge";

// -----------------------------------------------------------
// Mock registry
// -----------------------------------------------------------
const registry: PluginRegistry = {
  auth: async (cfg, ctx) => {
    if (cfg.required) {
      const key = ctx.headers[cfg.apiKeyHeader];
      if (!key) throw new Error("Missing API key");
    }
    ctx.metadata["authenticated"] = true;
  },
  rateLimit: async (cfg, ctx) => {
    ctx.metadata["rateLimit"] = { maxRpm: cfg.maxRpm };
  },
  transform: async (cfg, ctx) => {
    for (const h of cfg.stripHeaders) delete ctx.headers[h];
    Object.assign(ctx.headers, cfg.addHeaders);
  },
  logger: async (_cfg, ctx) => {
    ctx.metadata["logged"] = true;
  },
};

// -----------------------------------------------------------
// Helper
// -----------------------------------------------------------
function makeCtx(): GatewayContext {
  return {
    requestId: toRequestId(1),
    headers: { "x-api-key": "secret", "x-internal": "yes" },
    metadata: {},
  };
}

// -----------------------------------------------------------
// Test 1: validatePluginConfig — happy path for all four types
// -----------------------------------------------------------
(function testValidation() {
  const authRaw = { type: "auth", pluginId: "auth-1", apiKeyHeader: "x-api-key", required: true };
  const rl = validatePluginConfig({ type: "rateLimit", pluginId: "rl-1", maxRpm: 100, burstSize: 10 });
  const tx = validatePluginConfig({ type: "transform", pluginId: "tx-1", stripHeaders: ["x-internal"], addHeaders: { "x-forwarded": "true" } });
  const lg = validatePluginConfig({ type: "logger", pluginId: "log-1", level: "info", destination: "stdout" });
  const auth = validatePluginConfig(authRaw);

  console.assert(auth.type === "auth", "Test 1a: auth type");
  console.assert(rl.type === "rateLimit", "Test 1b: rateLimit type");
  console.assert(tx.type === "transform", "Test 1c: transform type");
  console.assert(lg.type === "logger", "Test 1d: logger type");
  console.log("✅ Test 1 passed: validatePluginConfig happy path");
})();

// -----------------------------------------------------------
// Test 2: validatePluginConfig — rejects invalid config
// -----------------------------------------------------------
(function testValidationRejects() {
  let threw = false;
  try {
    validatePluginConfig({ type: "auth", pluginId: "", apiKeyHeader: "x-api-key", required: true });
  } catch {
    threw = true;
  }
  console.assert(threw, "Test 2a: empty pluginId should throw");

  let threw2 = false;
  try {
    validatePluginConfig({ type: "unknown-type", pluginId: "x" });
  } catch {
    threw2 = true;
  }
  console.assert(threw2, "Test 2b: unknown type should throw");
  console.log("✅ Test 2 passed: validatePluginConfig rejects invalid configs");
})();

// -----------------------------------------------------------
// Test 3: executePipeline — all-ok run
// -----------------------------------------------------------
(async function testAllOk() {
  const rawConfigs = [
    { type: "auth", pluginId: "auth-1", apiKeyHeader: "x-api-key", required: true },
    { type: "rateLimit", pluginId: "rl-1", maxRpm: 60, burstSize: 5 },
    { type: "transform", pluginId: "tx-1", stripHeaders: ["x-internal"], addHeaders: { "x-forwarded": "true" } },
    { type: "logger", pluginId: "log-1", level: "debug", destination: "stdout" },
  ];
  const ctx = makeCtx();
  const trace = await executePipeline(toRequestId(42), rawConfigs, registry, ctx);

  console.assert(trace.overallStatus === "ok", "Test 3a: overallStatus should be ok");
  console.assert(trace.outcomes.length === 4, "Test 3b: four outcomes");
  console.assert(trace.outcomes.every((o: PluginOutcome) => o.status === "ok"), "Test 3c: all outcomes ok");
  console.assert(ctx.metadata["authenticated"] === true, "Test 3d: auth side-effect");
  console.assert(ctx.headers["x-internal"] === undefined, "Test 3e: header stripped");
  console.assert(ctx.headers["x-forwarded"] === "true", "Test 3f: header added");
  console.log("✅ Test 3 passed: all-ok pipeline run");
})();

// -----------------------------------------------------------
// Test 4: executePipeline — error + abortOnError
// -----------------------------------------------------------
(async function testAbortOnError() {
  const rawConfigs = [
    { type: "auth", pluginId: "auth-fail", apiKeyHeader: "x-missing-key", required: true },
    { type: "logger", pluginId: "log-1", level: "info", destination: "stdout" },
  ];
  const ctx = makeCtx(); // no "x-missing-key" header
  const trace = await executePipeline(toRequestId(99), rawConfigs, registry, ctx, { abortOnError: true });

  console.assert(trace.overallStatus === "error", "Test 4a: overallStatus should be error");
  console.assert(trace.outcomes[0].status === "error", "Test 4b: first plugin errored");
  console.assert(trace.outcomes[1].status === "skipped", "Test 4c: second plugin skipped due to abort");
  console.log("✅ Test 4 passed: abortOnError behaviour");
})();

// -----------------------------------------------------------
// Test 5: withTimeout — rejects with TimeoutError
// -----------------------------------------------------------
(async function testWithTimeout() {
  const neverResolves = new Promise<void>(() => { /* intentionally hangs */ });
  const pluginId = toPluginId("slow-plugin");
  let caughtTimeout = false;
  try {
    await withTimeout(neverResolves, 50, pluginId);
  } catch (e) {
    if (e instanceof TimeoutError) {
      caughtTimeout = true;
      console.assert(e.pluginId === pluginId, "Test 5a: TimeoutError carries pluginId");
    }
  }
  console.assert(caughtTimeout, "Test 5b: withTimeout rejects with TimeoutError");
  console.log("✅ Test 5 passed: withTimeout rejects after deadline");
})();
