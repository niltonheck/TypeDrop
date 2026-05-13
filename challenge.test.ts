// ============================================================
// challenge.test.ts
// Run: npx ts-node --transpile-only challenge.test.ts
// ============================================================
import {
  validateJob,
  buildPriorityQueue,
  executeJob,
  runScheduler,
  makeJobId,
  makeQueueId,
  type Job,
  type JobOutcome,
  type SchedulerReport,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// -----------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------

const validRaw = {
  id:         "job-001",
  queueId:    "q-alpha",
  priority:   "high",
  timeoutMs:  2000,
  payload:    { task: "send-email", to: "user@example.com" },
  maxRetries: 2,
};

const invalidRaw1 = {
  // missing id
  queueId:    "q-beta",
  priority:   "urgent",     // invalid priority
  timeoutMs:  50,           // out of range
  payload:    null,         // must be object
  maxRetries: 10,           // out of range
};

const invalidRaw2 = "not an object";

// -----------------------------------------------------------
// TEST SUITE 1 — validateJob
// -----------------------------------------------------------
console.log("\n── validateJob ──");

const r1 = validateJob(validRaw);
assert(r1.ok === true, "Valid raw job parses successfully");
if (r1.ok) {
  assert(r1.value.id === "job-001", "Parsed id matches");
  assert(r1.value.priority === "high", "Parsed priority matches");
}

const r2 = validateJob(invalidRaw1);
assert(r2.ok === false, "Invalid raw job returns ok=false");
if (!r2.ok) {
  const kinds = r2.error.map((e) => e.kind);
  assert(kinds.includes("missing_field"),  "Detects missing 'id' field");
  assert(kinds.includes("invalid_value"),  "Detects invalid priority value");
  assert(kinds.includes("out_of_range"),   "Detects timeoutMs out of range");
  assert(
    r2.error.filter((e) => e.kind === "out_of_range").length >= 2,
    "Detects BOTH timeoutMs and maxRetries out of range"
  );
}

const r3 = validateJob(invalidRaw2);
assert(r3.ok === false, "Non-object input returns ok=false");

// -----------------------------------------------------------
// TEST SUITE 2 — buildPriorityQueue
// -----------------------------------------------------------
console.log("\n── buildPriorityQueue ──");

const jobs: Job[] = [
  { id: makeJobId("j1"), queueId: makeQueueId("q1"), priority: "low",      timeoutMs: 1000, payload: {}, maxRetries: 0 },
  { id: makeJobId("j2"), queueId: makeQueueId("q1"), priority: "critical",  timeoutMs: 1000, payload: {}, maxRetries: 0 },
  { id: makeJobId("j3"), queueId: makeQueueId("q1"), priority: "normal",    timeoutMs: 1000, payload: {}, maxRetries: 0 },
  { id: makeJobId("j4"), queueId: makeQueueId("q1"), priority: "high",      timeoutMs: 1000, payload: {}, maxRetries: 0 },
  { id: makeJobId("j5"), queueId: makeQueueId("q1"), priority: "critical",  timeoutMs: 1000, payload: {}, maxRetries: 0 },
];

const sorted = buildPriorityQueue(jobs);
assert(sorted[0].id === "j2" || sorted[0].id === "j5", "First job is a 'critical' job");
assert(sorted[1].id === "j2" || sorted[1].id === "j5", "Second job is also a 'critical' job");
assert(sorted[2].id === "j4", "Third job is 'high' priority");
assert(sorted[3].id === "j3", "Fourth job is 'normal' priority");
assert(sorted[4].id === "j1", "Last job is 'low' priority");
// Stable sort: j2 inserted before j5, so j2 comes first among criticals
assert(sorted[0].id === "j2", "Stable sort: j2 before j5 among criticals");

// -----------------------------------------------------------
// TEST SUITE 3 — executeJob
// -----------------------------------------------------------
console.log("\n── executeJob ──");

const baseJob: Job = {
  id:         makeJobId("exec-001"),
  queueId:    makeQueueId("q-exec"),
  priority:   "normal",
  timeoutMs:  500,
  payload:    { x: 1 },
  maxRetries: 1,
};

(async () => {
  // Succeeds immediately
  const successOutcome = await executeJob(baseJob, async (_p) => "done");
  assert(successOutcome.status === "succeeded", "Handler that resolves → succeeded");
  assert(
    (successOutcome as Extract<typeof successOutcome, { status: "succeeded" }>).durationMs >= 0,
    "durationMs is non-negative"
  );

  // Times out
  const slowJob: Job = { ...baseJob, id: makeJobId("exec-002"), timeoutMs: 100 };
  const timeoutOutcome = await executeJob(slowJob, async (_p) => {
    await new Promise<void>((res) => setTimeout(res, 500));
    return "too late";
  });
  assert(timeoutOutcome.status === "timed_out", "Slow handler → timed_out");

  // Fails after retries
  let callCount = 0;
  const failJob: Job = { ...baseJob, id: makeJobId("exec-003"), maxRetries: 2 };
  const failOutcome = await executeJob(failJob, async (_p) => {
    callCount++;
    throw new Error("boom");
  });
  assert(failOutcome.status === "failed", "Always-failing handler → failed");
  assert(callCount === 3, "Handler called 1 + maxRetries (3) times total");
  assert(
    (failOutcome as Extract<typeof failOutcome, { status: "failed" }>).attempts === 3,
    "attempts field equals total call count"
  );

  // -----------------------------------------------------------
  // TEST SUITE 4 — runScheduler
  // -----------------------------------------------------------
  console.log("\n── runScheduler ──");

  const rawJobs: unknown[] = [
    { id: "sched-001", queueId: "q-main", priority: "high",   timeoutMs: 500,  payload: { n: 1 }, maxRetries: 0 },
    { id: "sched-002", queueId: "q-main", priority: "normal", timeoutMs: 500,  payload: { n: 2 }, maxRetries: 0 },
    { id: "sched-003", queueId: "q-bg",   priority: "low",    timeoutMs: 500,  payload: { n: 3 }, maxRetries: 0 },
    { id: "sched-004", queueId: "q-bg",   priority: "low",    timeoutMs: 500,  payload: { n: 4 }, maxRetries: 0 },
    { priority: "high" },                 // invalid — missing fields
    42,                                   // invalid — not an object
  ];

  const report: SchedulerReport = await runScheduler(
    rawJobs,
    async (_p) => "ok",
    { concurrencyLimit: 2 }
  );

  assert(report.totalJobs === 6,   "totalJobs counts all raw entries");
  assert(report.validJobs === 4,   "validJobs counts only valid entries");
  assert(report.invalidJobs === 2, "invalidJobs counts invalid entries");
  assert(report.validationErrors.length === 2, "validationErrors has 2 entries");

  const qMain = report.queues.get(makeQueueId("q-main"));
  assert(qMain !== undefined,      "q-main queue present in report");
  assert(qMain?.succeeded === 2,   "q-main has 2 succeeded jobs");

  const qBg = report.queues.get(makeQueueId("q-bg"));
  assert(qBg !== undefined,        "q-bg queue present in report");
  assert(qBg?.succeeded === 2,     "q-bg has 2 succeeded jobs");

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
