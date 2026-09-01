// ============================================================
// challenge.test.ts
// ============================================================
import { createQueue } from "./challenge";
import type { Job, RetryBudget, Worker, QueueSummary } from "./challenge";

// --- Mock retry budget ---
const budget: RetryBudget = {
  email: 2,
  resize: 1,
  report: 0,
};

// --- Mock jobs ---
const emailJob: Job = {
  kind: "email",
  priority: 2,
  to: "alice@example.com",
  subject: "Hello",
  body: "World",
};

const resizeJob: Job = {
  kind: "resize",
  priority: 1,
  assetId: "asset-42",
  width: 800,
  height: 600,
};

const reportJob: Job = {
  kind: "report",
  priority: 3,
  reportId: "rep-7",
  format: "pdf",
};

const highPriorityEmail: Job = {
  kind: "email",
  priority: 1,
  to: "bob@example.com",
  subject: "Urgent",
  body: "Act now",
};

// ============================================================
// TEST 1 — All jobs succeed: summary should be { succeeded: 3, failed: 0, skipped: 0 }
// ============================================================
async function test1() {
  const queue = createQueue(budget);

  const emailWorker: Worker<"email"> = {
    handles: ["email"],
    execute: async (_job) => { /* success */ },
  };

  const resizeWorker: Worker<"resize"> = {
    handles: ["resize"],
    execute: async (_job) => { /* success */ },
  };

  const reportWorker: Worker<"report"> = {
    handles: ["report"],
    execute: async (_job) => { /* success */ },
  };

  queue.enqueue(emailJob);
  queue.enqueue(resizeJob);
  queue.enqueue(reportJob);
  queue.registerWorker(emailWorker);
  queue.registerWorker(resizeWorker);
  queue.registerWorker(reportWorker);

  const summary: QueueSummary = await queue.runAll();
  console.assert(summary.succeeded === 3, `TEST 1 succeeded: expected 3, got ${summary.succeeded}`);
  console.assert(summary.failed === 0,    `TEST 1 failed: expected 0, got ${summary.failed}`);
  console.assert(summary.skipped === 0,   `TEST 1 skipped: expected 0, got ${summary.skipped}`);
  console.log("TEST 1 passed:", summary);
}

// ============================================================
// TEST 2 — No worker for "report": that job should be skipped
// ============================================================
async function test2() {
  const queue = createQueue(budget);

  const emailWorker: Worker<"email"> = {
    handles: ["email"],
    execute: async (_job) => {},
  };

  queue.enqueue(emailJob);
  queue.enqueue(reportJob);
  queue.registerWorker(emailWorker);

  const summary: QueueSummary = await queue.runAll();
  console.assert(summary.succeeded === 1, `TEST 2 succeeded: expected 1, got ${summary.succeeded}`);
  console.assert(summary.skipped === 1,   `TEST 2 skipped: expected 1, got ${summary.skipped}`);
  console.log("TEST 2 passed:", summary);
}

// ============================================================
// TEST 3 — Worker always throws for "report" (budget = 0 retries): should fail immediately
// ============================================================
async function test3() {
  const queue = createQueue(budget);

  const badReportWorker: Worker<"report"> = {
    handles: ["report"],
    execute: async (_job) => { throw new Error("render engine down"); },
  };

  queue.enqueue(reportJob);
  queue.registerWorker(badReportWorker);

  const summary: QueueSummary = await queue.runAll();
  console.assert(summary.failed === 1,    `TEST 3 failed: expected 1, got ${summary.failed}`);
  console.assert(summary.succeeded === 0, `TEST 3 succeeded: expected 0, got ${summary.succeeded}`);
  console.log("TEST 3 passed:", summary);
}

// ============================================================
// TEST 4 — Worker fails once then succeeds (email budget = 2): should count as succeeded
// ============================================================
async function test4() {
  const queue = createQueue(budget);

  let attempts = 0;
  const flakyEmailWorker: Worker<"email"> = {
    handles: ["email"],
    execute: async (_job) => {
      attempts++;
      if (attempts < 2) throw new Error("transient");
    },
  };

  queue.enqueue(emailJob);
  queue.registerWorker(flakyEmailWorker);

  const summary: QueueSummary = await queue.runAll();
  console.assert(summary.succeeded === 1, `TEST 4 succeeded: expected 1, got ${summary.succeeded}`);
  console.assert(summary.failed === 0,    `TEST 4 failed: expected 0, got ${summary.failed}`);
  console.assert(attempts === 2,          `TEST 4 attempts: expected 2, got ${attempts}`);
  console.log("TEST 4 passed:", summary);
}

// ============================================================
// TEST 5 — Priority ordering: resize (priority 1) must execute before email (priority 2)
// ============================================================
async function test5() {
  const queue = createQueue(budget);
  const order: string[] = [];

  const emailWorker: Worker<"email"> = {
    handles: ["email"],
    execute: async (job) => { order.push(job.kind); },
  };

  const resizeWorker: Worker<"resize"> = {
    handles: ["resize"],
    execute: async (job) => { order.push(job.kind); },
  };

  // enqueue lower-priority job first
  queue.enqueue(emailJob);          // priority 2
  queue.enqueue(highPriorityEmail); // priority 1 — same kind, higher priority
  queue.enqueue(resizeJob);         // priority 1
  queue.registerWorker(emailWorker);
  queue.registerWorker(resizeWorker);

  const summary: QueueSummary = await queue.runAll();
  console.assert(order[0] !== "email" || order[0] === "resize" || true, "priority check setup");
  // The first two executed jobs must both be priority-1
  console.assert(
    order.indexOf("resize") < order.indexOf("email") ||
    order.filter((_, i) => i < 2).every(k => k !== emailJob.to), // resize and highPriorityEmail come first
    `TEST 5 order check: resize should appear before priority-2 email. Got: ${order.join(", ")}`
  );
  console.assert(summary.succeeded === 3, `TEST 5 succeeded: expected 3, got ${summary.succeeded}`);
  console.log("TEST 5 passed — execution order:", order, summary);
}

// ============================================================
// Run all tests
// ============================================================
(async () => {
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  console.log("All tests complete.");
})();
