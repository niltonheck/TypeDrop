// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateManifest,
  compileGraph,
  runEngine,
  assertNever,
  type MigrationId,
  type ExecutorFn,
  type MigrationResult,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function makeid(s: string): MigrationId {
  // Only used in tests to construct known-valid ids for mock data.
  // Your implementation should NOT use casts — use a type guard or
  // branded constructor instead.
  return s as MigrationId;
}

const okExecutor: ExecutorFn = async (_id, _sql, _dir) => ({ ok: true });

const failExecutor: ExecutorFn = async (id, _sql, dir) =>
  dir === "up" && id === makeid("m002")
    ? { ok: false, reason: "syntax error" }
    : { ok: true };

// -----------------------------------------------------------
// Mock manifests
// -----------------------------------------------------------
const validRaw = [
  { id: "m001", dependsOn: [],       up: "CREATE TABLE a(id INT);", down: "DROP TABLE a;", meta: {} },
  { id: "m002", dependsOn: ["m001"], up: "CREATE TABLE b(id INT);", down: "DROP TABLE b;", meta: { author: "alice" } },
  { id: "m003", dependsOn: ["m001"], up: "CREATE TABLE c(id INT);", down: "DROP TABLE c;", meta: {} },
  { id: "m004", dependsOn: ["m002", "m003"], up: "ALTER TABLE b ADD COLUMN x INT;", down: "ALTER TABLE b DROP COLUMN x;", meta: {} },
];

const invalidRaw_fields = [
  { id: "",      dependsOn: [],  up: "SQL", down: "SQL", meta: {} },  // empty id
  { id: "m002",  dependsOn: 42,  up: "SQL", down: "SQL", meta: {} },  // wrong type
  { id: "m003",  dependsOn: [],  up: "",    down: "SQL", meta: {} },  // empty up
];

const cycleRaw = [
  { id: "c001", dependsOn: ["c002"], up: "UP", down: "DOWN", meta: {} },
  { id: "c002", dependsOn: ["c001"], up: "UP", down: "DOWN", meta: {} },
];

const duplicateRaw = [
  { id: "dup", dependsOn: [], up: "UP", down: "DOWN", meta: {} },
  { id: "dup", dependsOn: [], up: "UP", down: "DOWN", meta: {} },
];

// -----------------------------------------------------------
// Test 1 — validateManifest: valid manifest passes
// -----------------------------------------------------------
const v1 = validateManifest(validRaw);
console.assert(v1.ok === true, "Test 1 FAILED: valid manifest should pass validation");
if (v1.ok) {
  console.assert(v1.migrations.length === 4, "Test 1b FAILED: should have 4 migrations");
}

// -----------------------------------------------------------
// Test 2 — validateManifest: field errors are collected
// -----------------------------------------------------------
const v2 = validateManifest(invalidRaw_fields);
console.assert(v2.ok === false, "Test 2 FAILED: invalid manifest should fail validation");
if (!v2.ok) {
  console.assert(
    v2.errors.length >= 3,
    `Test 2b FAILED: expected ≥3 errors, got ${v2.errors.length}`
  );
}

// -----------------------------------------------------------
// Test 3 — compileGraph: waves are topologically ordered
// -----------------------------------------------------------
const v3 = validateManifest(validRaw);
if (v3.ok) {
  const g3 = compileGraph(v3.migrations);
  console.assert(g3.ok === true, "Test 3 FAILED: valid graph should compile");
  if (g3.ok) {
    console.assert(g3.plan.waves.length === 3, `Test 3b FAILED: expected 3 waves, got ${g3.plan.waves.length}`);
    // Wave 0: m001 only
    console.assert(
      g3.plan.waves[0].length === 1 && g3.plan.waves[0][0].id === makeid("m001"),
      "Test 3c FAILED: wave 0 should contain only m001"
    );
    // Wave 1: m002 and m003 (parallel)
    console.assert(
      g3.plan.waves[1].length === 2,
      `Test 3d FAILED: wave 1 should have 2 migrations, got ${g3.plan.waves[1].length}`
    );
  }
}

// -----------------------------------------------------------
// Test 4 — runEngine: cycle detected → graph_error
// -----------------------------------------------------------
(async () => {
  const r4 = await runEngine(cycleRaw, okExecutor);
  console.assert(r4.outcome === "graph_error", `Test 4 FAILED: expected graph_error, got ${r4.outcome}`);
  if (r4.outcome === "graph_error") {
    console.assert(r4.error.kind === "cycle_detected", "Test 4b FAILED: expected cycle_detected");
  }

  // -----------------------------------------------------------
  // Test 5 — runEngine: successful run → all applied
  // -----------------------------------------------------------
  const r5 = await runEngine(validRaw, okExecutor, { concurrency: 2 });
  console.assert(r5.outcome === "success", `Test 5 FAILED: expected success, got ${r5.outcome}`);
  if (r5.outcome === "success") {
    const applied = r5.results.filter((r): r is Extract<MigrationResult, { status: "applied" }> => r.status === "applied");
    console.assert(applied.length === 4, `Test 5b FAILED: expected 4 applied, got ${applied.length}`);
  }

  // -----------------------------------------------------------
  // Test 6 — runEngine: executor failure triggers rollback
  // -----------------------------------------------------------
  const r6 = await runEngine(validRaw, failExecutor, { rollbackOnFailure: true, concurrency: 1 });
  console.assert(
    r6.outcome === "partial_failure",
    `Test 6 FAILED: expected partial_failure, got ${r6.outcome}`
  );
  if (r6.outcome === "partial_failure") {
    console.assert(r6.firstFailure === makeid("m002"), `Test 6b FAILED: firstFailure should be m002`);
    const rolledBack = r6.results.filter(r => r.status === "rolledBack");
    console.assert(rolledBack.length >= 1, "Test 6c FAILED: expected at least 1 rolledBack result");
  }

  // -----------------------------------------------------------
  // Test 7 — duplicate ids → validation_error
  // -----------------------------------------------------------
  const r7 = await runEngine(duplicateRaw, okExecutor);
  console.assert(r7.outcome === "validation_error", `Test 7 FAILED: expected validation_error, got ${r7.outcome}`);
  if (r7.outcome === "validation_error") {
    const dupErr = r7.errors.find(e => e.kind === "duplicate_id");
    console.assert(dupErr !== undefined, "Test 7b FAILED: expected a duplicate_id error");
  }

  console.log("All tests executed — check for assertion failures above.");
})();
