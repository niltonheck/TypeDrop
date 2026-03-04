// ============================================================
// challenge.test.ts — Verification harness
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// ============================================================
import {
  makeRequestId,
  makePluginName,
  runChain,
  renderError,
  summariseAudit,
  type Plugin,
  type RequestContext,
  type PluginError,
  type ChainResult,
  type AuditSummary,
} from "./challenge";

// ─── Helpers ─────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mock context ────────────────────────────────────────────
const baseCtx: RequestContext = {
  id: makeRequestId("req-001"),
  path: "/api/orders",
  method: "GET",
  headers: { "x-api-key": "secret" },
  metadata: {},
};

// ─── Mock plugins ────────────────────────────────────────────

// Passes and writes to metadata
const authPlugin: Plugin = {
  name: makePluginName("auth"),
  async execute(ctx) {
    await sleep(10);
    return {
      ok: true,
      value: { ...ctx, metadata: { ...ctx.metadata, userId: "user-42" } },
    };
  },
};

// Passes and writes to metadata
const rateLimitPlugin: Plugin = {
  name: makePluginName("rate-limit"),
  async execute(ctx) {
    await sleep(5);
    return {
      ok: true,
      value: { ...ctx, metadata: { ...ctx.metadata, rateOk: true } },
    };
  },
};

// Always fails with a ValidationError
const validationPlugin: Plugin = {
  name: makePluginName("validation"),
  async execute(_ctx) {
    await sleep(8);
    const err: PluginError = {
      kind: "validation",
      field: "orderId",
      issue: "must be a UUID",
    };
    return { ok: false, error: err };
  },
};

// Should be skipped when validationPlugin fails
const loggingPlugin: Plugin = {
  name: makePluginName("logging"),
  async execute(ctx) {
    await sleep(2);
    return { ok: true, value: ctx };
  },
};

// ─── Test 1: Full success chain ───────────────────────────────
async function testFullSuccess() {
  const result: ChainResult = await runChain(
    [authPlugin, rateLimitPlugin],
    baseCtx
  );
  assert(result.outcome === "success", "Test 1a: outcome is 'success'");
  if (result.outcome === "success") {
    assert(
      result.audit.length === 2,
      "Test 1b: audit has 2 records"
    );
    assert(
      result.audit.every((r) => r.status === "passed"),
      "Test 1c: all records are 'passed'"
    );
    assert(
      (result.finalContext.metadata as Record<string, unknown>)["userId"] === "user-42",
      "Test 1d: metadata.userId written by authPlugin"
    );
    assert(
      result.audit.every((r) => r.status !== "skipped" && r.durationMs >= 0),
      "Test 1e: durationMs is non-negative for all records"
    );
  }
}

// ─── Test 2: Short-circuit on failure ─────────────────────────
async function testShortCircuit() {
  const result: ChainResult = await runChain(
    [authPlugin, validationPlugin, loggingPlugin],
    baseCtx
  );
  assert(result.outcome === "failure", "Test 2a: outcome is 'failure'");
  if (result.outcome === "failure") {
    assert(
      result.failedPlugin === makePluginName("validation"),
      "Test 2b: failedPlugin is 'validation'"
    );
    assert(
      result.error.kind === "validation",
      "Test 2c: error kind is 'validation'"
    );
    assert(result.audit.length === 3, "Test 2d: audit has 3 records");
    const statuses = result.audit.map((r) => r.status);
    assert(
      JSON.stringify(statuses) === JSON.stringify(["passed", "failed", "skipped"]),
      "Test 2e: audit statuses are [passed, failed, skipped]"
    );
  }
}

// ─── Test 3: renderError exhaustive coverage ─────────────────
function testRenderError() {
  const authErr: PluginError = { kind: "auth", reason: "invalid token" };
  assert(
    renderError(authErr) === "Auth failed: invalid token",
    "Test 3a: renderError auth"
  );

  const rlErr: PluginError = { kind: "rate_limit", retryAfterMs: 3000 };
  assert(
    renderError(rlErr) === "Rate limited — retry after 3000ms",
    "Test 3b: renderError rate_limit"
  );

  const valErr: PluginError = { kind: "validation", field: "email", issue: "invalid format" };
  assert(
    renderError(valErr) === "Validation error on 'email': invalid format",
    "Test 3c: renderError validation"
  );

  const upErr: PluginError = { kind: "upstream", statusCode: 503, body: "service unavailable" };
  assert(
    renderError(upErr) === "Upstream error 503: service unavailable",
    "Test 3d: renderError upstream"
  );
}

// ─── Test 4: summariseAudit ───────────────────────────────────
async function testSummariseAudit() {
  const result: ChainResult = await runChain(
    [authPlugin, validationPlugin, loggingPlugin],
    baseCtx
  );
  if (result.outcome === "failure") {
    const summary: AuditSummary = summariseAudit(result.audit);
    assert(summary.passed === 1, "Test 4a: summarise passed count");
    assert(summary.failed === 1, "Test 4b: summarise failed count");
    assert(summary.skipped === 1, "Test 4c: summarise skipped count");
    assert(summary.errors.length === 1, "Test 4d: summarise errors length");
    assert(
      summary.errors[0].plugin === makePluginName("validation"),
      "Test 4e: summarise error plugin name"
    );
    assert(
      summary.totalDurationMs >= 0,
      "Test 4f: totalDurationMs is non-negative"
    );
  }
}

// ─── Run all tests ────────────────────────────────────────────
(async () => {
  await testFullSuccess();
  await testShortCircuit();
  testRenderError();
  await testSummariseAudit();
  console.log("\nDone.");
})();
