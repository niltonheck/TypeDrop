// challenge.test.ts
import {
  validateJob,
  buildDispatchPlan,
  getInitialDelayMs,
  isPayloadOfKind,
  filterByKind,
  RetryPolicyMap,
} from "./challenge";

// -------------------------------------------------------------------
// Mock retry policy map (satisfies RetryPolicyMap for completeness)
// -------------------------------------------------------------------
const retryPolicies = {
  email:   { maxAttempts: 5, backoffStrategy: "exponential", baseDelayMs: 200  },
  report:  { maxAttempts: 3, backoffStrategy: "fixed",       baseDelayMs: 1000 },
  export:  { maxAttempts: 3, backoffStrategy: "fixed",       baseDelayMs: 1000 },
  webhook: { maxAttempts: 10, backoffStrategy: "none",       baseDelayMs: 0    },
} satisfies RetryPolicyMap;

// -------------------------------------------------------------------
// Mock raw job inputs
// -------------------------------------------------------------------
const rawJobs: unknown[] = [
  // index 0 — valid email, priority 2
  {
    id: "job-001",
    priority: 2,
    enqueuedAt: "2026-07-03T08:00:00Z",
    payload: { kind: "email", to: "alice@example.com", subject: "Hello", body: "Hi!" },
  },
  // index 1 — valid webhook, priority 3 (highest)
  {
    id: "job-002",
    priority: 3,
    enqueuedAt: "2026-07-03T08:01:00Z",
    payload: { kind: "webhook", url: "https://hooks.example.com/abc", secret: "s3cr3t" },
  },
  // index 2 — valid report, priority 1 (lowest)
  {
    id: "job-003",
    priority: 1,
    enqueuedAt: "2026-07-03T07:59:00Z",
    payload: { kind: "report", reportId: "rpt-42", format: "pdf" },
  },
  // index 3 — INVALID: priority out of range + missing payload fields
  {
    id: "job-004",
    priority: 5,
    enqueuedAt: "2026-07-03T08:02:00Z",
    payload: { kind: "email", subject: "No recipient" },
  },
  // index 4 — INVALID: missing id
  {
    priority: 2,
    enqueuedAt: "2026-07-03T08:03:00Z",
    payload: { kind: "export", resourceType: "orders", filters: { status: "pending" } },
  },
  // index 5 — valid export, priority 3
  {
    id: "job-005",
    priority: 3,
    enqueuedAt: "2026-07-03T08:00:30Z",
    payload: { kind: "export", resourceType: "invoices", filters: { month: "2026-06" } },
  },
];

// -------------------------------------------------------------------
// TEST 1 — validateJob: valid input produces a Job with correct maxAttempts
// -------------------------------------------------------------------
const validRaw = rawJobs[0];
const result = validateJob(validRaw, retryPolicies);
console.assert(result.ok === true, "TEST 1a FAILED: valid job should parse ok");
if (result.ok) {
  console.assert(result.value.id === "job-001",    "TEST 1b FAILED: id mismatch");
  console.assert(result.value.maxAttempts === 5,   "TEST 1c FAILED: maxAttempts should come from email retry policy");
  console.assert(result.value.priority === 2,      "TEST 1d FAILED: priority mismatch");
}

// -------------------------------------------------------------------
// TEST 2 — validateJob: invalid input collects all errors
// -------------------------------------------------------------------
const invalidRaw = rawJobs[3];
const badResult = validateJob(invalidRaw, retryPolicies);
console.assert(badResult.ok === false, "TEST 2a FAILED: invalid job should fail");
if (!badResult.ok) {
  console.assert(
    badResult.error.length >= 2,
    `TEST 2b FAILED: expected ≥2 errors, got ${badResult.error.length}`
  );
}

// -------------------------------------------------------------------
// TEST 3 — getInitialDelayMs: correct delays per priority
// -------------------------------------------------------------------
console.assert(getInitialDelayMs(3) === 0,    "TEST 3a FAILED: priority 3 should be 0 ms");
console.assert(getInitialDelayMs(2) === 500,  "TEST 3b FAILED: priority 2 should be 500 ms");
console.assert(getInitialDelayMs(1) === 2000, "TEST 3c FAILED: priority 1 should be 2000 ms");

// -------------------------------------------------------------------
// TEST 4 — buildDispatchPlan: sorting, rejection, and totalProcessed
// -------------------------------------------------------------------
const plan = buildDispatchPlan(rawJobs, retryPolicies);

console.assert(plan.totalProcessed === 6, "TEST 4a FAILED: totalProcessed should be 6");
console.assert(plan.scheduled.length === 4, `TEST 4b FAILED: expected 4 scheduled, got ${plan.scheduled.length}`);
console.assert(Object.keys(plan.rejected).length === 2, "TEST 4c FAILED: expected 2 rejected");
console.assert(3 in plan.rejected, "TEST 4d FAILED: index 3 should be rejected");
console.assert(4 in plan.rejected, "TEST 4e FAILED: index 4 should be rejected");

// Priority 3 jobs come first; among them, earlier enqueuedAt first
console.assert(
  plan.scheduled[0].job.id === "job-002" || plan.scheduled[0].job.id === "job-005",
  "TEST 4f FAILED: first scheduled entry should be a priority-3 job"
);
// The priority-3 job with earlier enqueuedAt (job-005 at :00:30 vs job-002 at :01:00)
// Wait — job-002 is 08:01:00 and job-005 is 08:00:30, so job-005 comes first
console.assert(
  plan.scheduled[0].job.id === "job-005",
  "TEST 4g FAILED: earliest priority-3 job (job-005 at 08:00:30) should be first"
);
// Last scheduled entry should be the priority-1 report
console.assert(
  plan.scheduled[plan.scheduled.length - 1].job.id === "job-003",
  "TEST 4h FAILED: priority-1 job should be last"
);

// delayMs for priority-3 entries should be 0
console.assert(plan.scheduled[0].delayMs === 0,   "TEST 4i FAILED: priority-3 delay should be 0");
// delayMs for priority-1 entry should be 2000
console.assert(plan.scheduled[plan.scheduled.length - 1].delayMs === 2000, "TEST 4j FAILED: priority-1 delay should be 2000");

// -------------------------------------------------------------------
// TEST 5 — filterByKind: narrows payload type and filters correctly
// -------------------------------------------------------------------
const emailEntries = filterByKind(plan, "email");
console.assert(emailEntries.length === 1, `TEST 5a FAILED: expected 1 email entry, got ${emailEntries.length}`);
// TypeScript should narrow: emailEntries[0].job.payload.to should be accessible
const emailPayload = emailEntries[0].job.payload;
console.assert(emailPayload.to === "alice@example.com", "TEST 5b FAILED: email payload.to mismatch");

const webhookEntries = filterByKind(plan, "webhook");
console.assert(webhookEntries.length === 1, `TEST 5c FAILED: expected 1 webhook entry, got ${webhookEntries.length}`);

const reportEntries = filterByKind(plan, "report");
console.assert(reportEntries.length === 1, `TEST 5d FAILED: expected 1 report entry, got ${reportEntries.length}`);

// isPayloadOfKind sanity check
console.assert(
  isPayloadOfKind({ kind: "email", to: "x@x.com", subject: "s", body: "b" }, "email") === true,
  "TEST 5e FAILED: isPayloadOfKind should return true for matching email payload"
);
console.assert(
  isPayloadOfKind({ kind: "webhook", url: "https://x.com", secret: "abc" }, "email") === false,
  "TEST 5f FAILED: isPayloadOfKind should return false for mismatched kind"
);

console.log("All tests passed! ✅");
