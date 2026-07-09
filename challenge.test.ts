// ============================================================
// challenge.test.ts
// ============================================================
import { buildSchedule, validateTask, PRIORITY_ORDER } from "./challenge";
import type { Task, ScheduleResult } from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const validCritical: unknown = {
  id: "t1",
  name: "Rebuild index",
  priority: "critical",
  submittedAt: "2026-07-09T08:00:00Z",
  timeoutMs: 5000,
  metadata: { region: "us-east-1" },
};

const validNormalOlder: unknown = {
  id: "t2",
  name: "Send digest email",
  priority: "normal",
  submittedAt: "2026-07-09T07:00:00Z",
  timeoutMs: 2000,
  metadata: {},
};

const validNormalNewer: unknown = {
  id: "t3",
  name: "Generate report",
  priority: "normal",
  submittedAt: "2026-07-09T09:00:00Z",
  timeoutMs: 3000,
  metadata: { format: "pdf" },
};

const validLow: unknown = {
  id: "t4",
  name: "Archive logs",
  priority: "low",
  submittedAt: "2026-07-09T06:00:00Z",
  timeoutMs: 1000,
  metadata: {},
};

// Bad: priority is not a valid tier
const badPriority: unknown = {
  id: "t5",
  name: "Ghost task",
  priority: "urgent", // ← invalid
  submittedAt: "2026-07-09T10:00:00Z",
  timeoutMs: 1000,
  metadata: {},
};

// Bad: timeoutMs is 0
const badTimeout: unknown = {
  id: "t6",
  name: "Zero timeout",
  priority: "low",
  submittedAt: "2026-07-09T10:00:00Z",
  timeoutMs: 0, // ← must be > 0
  metadata: {},
};

// Bad: metadata value is not a string
const badMetadata: unknown = {
  id: "t7",
  name: "Bad meta",
  priority: "normal",
  submittedAt: "2026-07-09T10:00:00Z",
  timeoutMs: 500,
  metadata: { retries: 3 }, // ← value is number, not string
};

// ── Tests ────────────────────────────────────────────────────

// Test 1: validateTask returns a string for an invalid priority
const r1 = validateTask(badPriority);
console.assert(
  typeof r1 === "string",
  "TEST 1 FAILED: validateTask should return a string error for invalid priority"
);
console.log("TEST 1:", typeof r1 === "string" ? "PASS" : "FAIL", r1);

// Test 2: validateTask returns a Task for a fully valid input
const r2 = validateTask(validCritical);
console.assert(
  typeof r2 === "object" && r2 !== null && (r2 as Task).id === "t1",
  "TEST 2 FAILED: validateTask should return a Task for valid input"
);
console.log("TEST 2:", typeof r2 === "object" ? "PASS" : "FAIL");

// Test 3: buildSchedule sorts tasks correctly (critical first, then normal by age, then low)
const result: ScheduleResult = buildSchedule([
  validNormalNewer,
  validLow,
  validCritical,
  validNormalOlder,
  badPriority,
  badTimeout,
]);

const expectedOrder = ["t1", "t2", "t3", "t4"];
const actualOrder = result.queue.map((t) => t.id);
console.assert(
  JSON.stringify(actualOrder) === JSON.stringify(expectedOrder),
  `TEST 3 FAILED: queue order should be ${expectedOrder}, got ${actualOrder}`
);
console.log(
  "TEST 3:",
  JSON.stringify(actualOrder) === JSON.stringify(expectedOrder) ? "PASS" : "FAIL",
  actualOrder
);

// Test 4: buildSchedule collects errors for invalid inputs
console.assert(
  result.errors.length === 2,
  `TEST 4 FAILED: expected 2 errors, got ${result.errors.length}`
);
console.assert(
  result.totalReceived === 6,
  `TEST 4b FAILED: expected totalReceived=6, got ${result.totalReceived}`
);
console.log(
  "TEST 4:",
  result.errors.length === 2 && result.totalReceived === 6 ? "PASS" : "FAIL",
  result.errors
);

// Test 5: countByPriority is correct and metadata validation works
const result2: ScheduleResult = buildSchedule([
  validCritical,
  validNormalOlder,
  validNormalNewer,
  validLow,
  badMetadata,
]);
console.assert(
  result2.countByPriority.critical === 1 &&
    result2.countByPriority.normal === 2 &&
    result2.countByPriority.low === 1,
  `TEST 5 FAILED: countByPriority mismatch — got ${JSON.stringify(result2.countByPriority)}`
);
console.assert(
  result2.errors.length === 1,
  `TEST 5b FAILED: badMetadata should produce 1 error, got ${result2.errors.length}`
);
console.log(
  "TEST 5:",
  result2.countByPriority.critical === 1 &&
    result2.countByPriority.normal === 2 &&
    result2.countByPriority.low === 1 &&
    result2.errors.length === 1
    ? "PASS"
    : "FAIL",
  result2.countByPriority
);
