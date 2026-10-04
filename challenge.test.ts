// =============================================================================
// challenge.test.ts
// =============================================================================
import {
  definePlugin,
  buildPipeline,
  composePlugins,
  type MergeCtx,
  type SatisfiedBy,
  type PipelineErrors,
  type PipelineFinalCtx,
} from "./challenge";

// ---------------------------------------------------------------------------
// Type-level tests (these must compile — if they don't, your types are wrong)
// ---------------------------------------------------------------------------

// MergeCtx: keys from Writes override Acc
type _MergeTest = MergeCtx<{ a: number; b: string }, { b: boolean; c: Date }>;
// Expected shape: { a: number; b: boolean; c: Date }
const _mergeCheck: _MergeTest = { a: 1, b: true, c: new Date() };
console.assert(typeof _mergeCheck.a === "number", "MergeCtx: a should be number");
console.assert(typeof _mergeCheck.b === "boolean", "MergeCtx: b should be boolean (overridden)");

// SatisfiedBy: positive case
type _SatOk = SatisfiedBy<{ userId: string }, { userId: string; role: string }>;
const _satOkCheck: _SatOk = true; // must compile
console.assert(_satOkCheck === true, "SatisfiedBy: should be true when keys present");

// SatisfiedBy: negative case
type _SatFail = SatisfiedBy<{ missingKey: number }, { userId: string }>;
const _satFailCheck: _SatFail = false; // must compile
console.assert(_satFailCheck === false, "SatisfiedBy: should be false when key missing");

// ---------------------------------------------------------------------------
// Runtime tests
// ---------------------------------------------------------------------------

// --- Plugin definitions ---

const authPlugin = definePlugin({
  name: "auth",
  run: async (_ctx: Record<never, never>) => ({
    userId: "user-42",
    role: "admin" as const,
  }),
});

const enrichPlugin = definePlugin({
  name: "enrich",
  run: async (ctx: { userId: string }) => ({
    displayName: `User #${ctx.userId}`,
    joinedAt: new Date("2024-01-01"),
  }),
});

const auditPlugin = definePlugin({
  name: "audit",
  run: async (ctx: { userId: string; displayName: string }) => ({
    auditLog: `${ctx.displayName} (${ctx.userId}) accessed at ${Date.now()}`,
  }),
});

const flakyPlugin = definePlugin({
  name: "flaky",
  run: async (_ctx: { userId: string }): Promise<{ extra: boolean }> => {
    throw { brand: "flaky", message: "Simulated failure", cause: new Error("boom") };
  },
});

// --- Test 1: Basic sequential pipeline ---
async function testBasicPipeline() {
  const pipeline = buildPipeline([authPlugin, enrichPlugin, auditPlugin]);

  console.assert(
    pipeline.pluginNames.join(",") === "auth,enrich,audit",
    "Test 1a: pluginNames should be in registration order"
  );

  const result = await pipeline.execute({});

  console.assert(
    result.ctx.userId === "user-42",
    "Test 1b: userId should be written by authPlugin"
  );
  console.assert(
    result.ctx.displayName === "User #user-42",
    "Test 1c: displayName should be written by enrichPlugin"
  );
  console.assert(
    typeof result.ctx.auditLog === "string" && result.ctx.auditLog.includes("user-42"),
    "Test 1d: auditLog should reference userId"
  );
  console.assert(
    typeof result.timings["auth"] === "number" && result.timings["auth"] >= 0,
    "Test 1e: timings should record auth plugin ms"
  );
  console.assert(
    typeof result.timings["enrich"] === "number",
    "Test 1f: timings should record enrich plugin ms"
  );

  console.log("✅ Test 1 passed: basic sequential pipeline");
}

// --- Test 2: Error wrapping ---
async function testErrorWrapping() {
  const pipeline = buildPipeline([authPlugin, flakyPlugin]);

  try {
    await pipeline.execute({});
    console.assert(false, "Test 2: should have thrown");
  } catch (err: unknown) {
    const e = err as { brand: string; message: string };
    console.assert(e.brand === "flaky", "Test 2a: error brand should be 'flaky'");
    console.assert(
      typeof e.message === "string",
      "Test 2b: error should have a message"
    );
    console.log("✅ Test 2 passed: error wrapping");
  }
}

// --- Test 3: composePlugins ---
async function testComposePlugins() {
  const composed = composePlugins(authPlugin, enrichPlugin);

  console.assert(
    composed.name === "auth+enrich",
    "Test 3a: composed name should be 'auth+enrich'"
  );

  const writes = await composed.run({});
  console.assert(
    writes.userId === "user-42",
    "Test 3b: composed plugin should expose userId from auth"
  );
  console.assert(
    writes.displayName === "User #user-42",
    "Test 3c: composed plugin should expose displayName from enrich"
  );

  console.log("✅ Test 3 passed: composePlugins");
}

// --- Test 4: PipelineFinalCtx type-level check ---
// (Compile-time only — if this block compiles, the type is correct.)
type FinalCtx = PipelineFinalCtx<
  [typeof authPlugin, typeof enrichPlugin, typeof auditPlugin],
  Record<never, never>
>;
// FinalCtx must have userId, role, displayName, joinedAt, auditLog
const _finalCtxCheck: FinalCtx = {
  userId: "x",
  role: "admin",
  displayName: "y",
  joinedAt: new Date(),
  auditLog: "z",
};
console.assert(typeof _finalCtxCheck.userId === "string", "Test 4: PipelineFinalCtx type check");
console.log("✅ Test 4 passed: PipelineFinalCtx type-level check");

// --- Test 5: PipelineErrors type-level check ---
type Errs = PipelineErrors<[typeof authPlugin, typeof flakyPlugin]>;
// Errs should be PluginError<"flaky">
const _errsCheck: Errs = { brand: "flaky", message: "oops" };
console.assert(_errsCheck.brand === "flaky", "Test 5: PipelineErrors brand check");
console.log("✅ Test 5 passed: PipelineErrors type-level check");

// --- Run all ---
(async () => {
  await testBasicPipeline();
  await testErrorWrapping();
  await testComposePlugins();
})();
