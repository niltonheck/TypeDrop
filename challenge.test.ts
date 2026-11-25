// challenge.test.ts
import {
  sortByPriority,
  dispatchJob,
  runQueue,
  mockRegistry,
  type Job,
  type EmailJob,
  type ResizeJob,
  type ReportJob,
  type WebhookJob,
  type RunReport,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const emailJob: EmailJob = {
  id: "j1",
  kind: "email",
  priority: 1,
  enqueuedAt: new Date("2026-11-25T08:00:00Z"),
  to: "alice@example.com",
  subject: "Welcome!",
  body: "Hello, Alice.",
};

const resizeJob: ResizeJob = {
  id: "j2",
  kind: "resize",
  priority: 3,
  enqueuedAt: new Date("2026-11-25T08:01:00Z"),
  imageUrl: "https://cdn.example.com/photo.jpg",
  targetWidth: 800,
  targetHeight: 600,
};

const reportJob: ReportJob = {
  id: "j3",
  kind: "report",
  priority: 2,
  enqueuedAt: new Date("2026-11-25T08:02:00Z"),
  reportType: "weekly",
  recipientIds: ["u1", "u2"],
};

const webhookJob: WebhookJob = {
  id: "j4",
  kind: "webhook",
  priority: 2,
  enqueuedAt: new Date("2026-11-25T08:03:00Z"),
  url: "https://hooks.example.com/notify",
  payload: { event: "deploy", version: 42, success: true },
};

const allJobs: Job[] = [emailJob, resizeJob, reportJob, webhookJob];

// ------------------------------------------------------------------
// Test 1 — sortByPriority returns highest-priority jobs first
// ------------------------------------------------------------------
const sorted = sortByPriority(allJobs);
console.assert(
  sorted[0].id === "j2",
  `Test 1a FAILED: expected j2 (priority 3) first, got ${sorted[0].id}`
);
console.assert(
  sorted[1].priority === 2 && sorted[2].priority === 2,
  `Test 1b FAILED: expected two priority-2 jobs at indices 1 & 2`
);
console.assert(
  sorted[3].id === "j1",
  `Test 1c FAILED: expected j1 (priority 1) last, got ${sorted[3].id}`
);
// Stability: j3 was enqueued before j4, so it should remain before j4
console.assert(
  sorted[1].id === "j3" && sorted[2].id === "j4",
  `Test 1d FAILED: stable sort violated — expected j3 before j4 among priority-2 jobs`
);
console.log("Test 1 PASSED — sortByPriority");

// ------------------------------------------------------------------
// Test 2 — dispatchJob routes to the correct worker (email → success)
// ------------------------------------------------------------------
dispatchJob(emailJob, mockRegistry).then((result) => {
  console.assert(
    result.status === "success",
    `Test 2a FAILED: expected status "success", got "${result.status}"`
  );
  if (result.status === "success") {
    console.assert(
      result.output === "sent",
      `Test 2b FAILED: expected output "sent", got "${result.output}"`
    );
  }
  console.log("Test 2 PASSED — dispatchJob (email)");
});

// ------------------------------------------------------------------
// Test 3 — dispatchJob returns a failure result for webhook worker
// ------------------------------------------------------------------
dispatchJob(webhookJob, mockRegistry).then((result) => {
  console.assert(
    result.status === "failure",
    `Test 3 FAILED: expected status "failure", got "${result.status}"`
  );
  console.log("Test 3 PASSED — dispatchJob (webhook failure result)");
});

// ------------------------------------------------------------------
// Test 4 — runQueue catches a rejecting worker and records it as failure
// ------------------------------------------------------------------
runQueue(allJobs, mockRegistry).then((report: RunReport) => {
  // reportJob worker rejects, webhookJob worker returns { status: "failure" }
  console.assert(
    report.total === 4,
    `Test 4a FAILED: expected total 4, got ${report.total}`
  );
  console.assert(
    report.failed === 2,
    `Test 4b FAILED: expected 2 failures (report rejects + webhook failure), got ${report.failed}`
  );
  console.assert(
    report.succeeded === 2,
    `Test 4c FAILED: expected 2 successes (email + resize), got ${report.succeeded}`
  );
  console.assert(
    report.durationMs >= 0,
    `Test 4d FAILED: durationMs should be non-negative, got ${report.durationMs}`
  );
  console.assert(
    report.failures.every((f) => f.status === "failure"),
    `Test 4e FAILED: all entries in failures[] must have status "failure"`
  );
  console.log("Test 4 PASSED — runQueue report");
});
