// ============================================================
// challenge.test.ts
// ============================================================
import {
  authPipeline,
  type BaseCtx,
  type PipelineResult,
  type UserCtx,
  type PipelineError,
} from "./challenge";

// ------------------------------------------------------------------
// Helper
// ------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ------------------------------------------------------------------
// Mock request builders
// ------------------------------------------------------------------
const baseCtx = (authHeader?: string): BaseCtx => ({
  requestId: "req_" + Math.random().toString(36).slice(2),
  headers: authHeader ? { authorization: authHeader } : {},
});

// ------------------------------------------------------------------
// Test 1: Valid token for admin user → success with full UserCtx
// ------------------------------------------------------------------
async function test_validAdminToken() {
  console.log("\nTest 1: Valid admin token");
  const result = await authPipeline.run(baseCtx("Bearer tok_abc123"));

  assert(result.outcome === "success", "outcome is 'success'");
  if (result.outcome === "success") {
    const ctx: UserCtx = result.ctx; // type must be UserCtx — compiler check
    assert(ctx.user.role === "admin", "user role is 'admin'");
    assert(ctx.user.name === "Alice Admin", "user name is 'Alice Admin'");
    assert(ctx.scopes.includes("write"), "scopes include 'write'");
    assert(ctx.token === "tok_abc123", "token is preserved in ctx");
  }
}

// ------------------------------------------------------------------
// Test 2: Valid token for viewer user → success
// ------------------------------------------------------------------
async function test_validViewerToken() {
  console.log("\nTest 2: Valid viewer token");
  const result = await authPipeline.run(baseCtx("Bearer tok_viewer"));

  assert(result.outcome === "success", "outcome is 'success'");
  if (result.outcome === "success") {
    assert(result.ctx.user.role === "viewer", "user role is 'viewer'");
    assert(!result.ctx.scopes.includes("write"), "viewer does not have 'write' scope");
  }
}

// ------------------------------------------------------------------
// Test 3: Missing Authorization header → halted with MISSING_TOKEN
// ------------------------------------------------------------------
async function test_missingToken() {
  console.log("\nTest 3: Missing Authorization header");
  const result = await authPipeline.run(baseCtx());

  assert(result.outcome === "halted", "outcome is 'halted'");
  if (result.outcome === "halted") {
    const error: PipelineError = result.error; // compiler check
    assert(error.code === "MISSING_TOKEN", "error code is MISSING_TOKEN");
  }
}

// ------------------------------------------------------------------
// Test 4: Invalid/unknown token → halted with INVALID_TOKEN
// ------------------------------------------------------------------
async function test_invalidToken() {
  console.log("\nTest 4: Unknown token");
  const result = await authPipeline.run(baseCtx("Bearer tok_bogus"));

  assert(result.outcome === "halted", "outcome is 'halted'");
  if (result.outcome === "halted") {
    assert(result.error.code === "INVALID_TOKEN", "error code is INVALID_TOKEN");
    if (result.error.code === "INVALID_TOKEN") {
      assert(result.error.raw === "tok_bogus", "error.raw contains the bad token");
    }
  }
}

// ------------------------------------------------------------------
// Test 5: Malformed Authorization header (no "Bearer " prefix) → MISSING_TOKEN
// ------------------------------------------------------------------
async function test_malformedHeader() {
  console.log("\nTest 5: Malformed Authorization header");
  const result = await authPipeline.run(baseCtx("Basic dXNlcjpwYXNz"));

  assert(result.outcome === "halted", "outcome is 'halted'");
  if (result.outcome === "halted") {
    assert(result.error.code === "MISSING_TOKEN", "error code is MISSING_TOKEN for non-Bearer scheme");
  }
}

// ------------------------------------------------------------------
// Run all tests
// ------------------------------------------------------------------
(async () => {
  console.log("=== Typed Middleware Pipeline — Test Harness ===");
  await test_validAdminToken();
  await test_validViewerToken();
  await test_missingToken();
  await test_invalidToken();
  await test_malformedHeader();
  console.log("\n=== Done ===");
})();
