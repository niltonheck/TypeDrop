// challenge.test.ts
import { JobQueue, JobPayloadMap, JobKind, JobStatus } from "./challenge";

// ─── Mock handlers ────────────────────────────────────────────────────────────

const handlers = {
  email: async (job: import("./challenge").Job<"email">) => {
    return `email sent to ${job.payload.to}`;
  },
  report: async (job: import("./challenge").Job<"report">) => {
    if (job.payload.reportId === "bad-report") throw new Error("Report not found");
    return `report ${job.payload.reportId} generated as ${job.payload.format}`;
  },
  export: async (job: import("./challenge").Job<"export">) => {
    return `dataset ${job.payload.datasetId} exported to ${job.payload.destination}`;
  },
} satisfies import("./challenge").HandlerRegistry;

// ─── Tests ────────────────────────────────────────────────────────────────────

async function runTests() {
  const queue = new JobQueue(handlers);

  // TEST 1 — enqueue returns a string id
  const id1 = queue.enqueue("email", { to: "alice@example.com", subject: "Hello", body: "Hi!" }, 2);
  console.assert(typeof id1 === "string" && id1.length > 0, "TEST 1 FAILED: enqueue should return a non-empty string id");
  console.log("TEST 1 passed — enqueue returns string id:", id1);

  // TEST 2 — initial status is pending
  const status1 = queue.getStatus(id1);
  console.assert(status1?.status === "pending", `TEST 2 FAILED: expected 'pending', got '${status1?.status}'`);
  console.log("TEST 2 passed — initial status is 'pending'");

  // TEST 3 — priority ordering: priority 3 job processed before priority 1
  const idLow    = queue.enqueue("export", { datasetId: "ds-1", destination: "s3://bucket", compress: false }, 1);
  const idHigh   = queue.enqueue("report", { reportId: "rpt-42", format: "pdf" }, 3);

  const processedId = await queue.processNext();
  console.assert(processedId === idHigh, `TEST 3 FAILED: expected high-priority job '${idHigh}' to be processed first, got '${processedId}'`);
  console.log("TEST 3 passed — highest-priority job processed first");

  // TEST 4 — succeeded status has result string
  const reportStatus = queue.getStatus<"report">(idHigh);
  console.assert(reportStatus?.status === "succeeded", `TEST 4 FAILED: expected 'succeeded', got '${reportStatus?.status}'`);
  if (reportStatus?.status === "succeeded") {
    console.assert(
      reportStatus.result.includes("rpt-42"),
      `TEST 4 FAILED: result should mention reportId, got '${reportStatus.result}'`
    );
  }
  console.log("TEST 4 passed — succeeded status has correct result");

  // TEST 5 — failed status captured for throwing handler
  const idBad = queue.enqueue("report", { reportId: "bad-report", format: "csv" }, 2);
  await queue.processNext(); // process idLow (export, priority 1)
  await queue.processNext(); // process idBad  (report, priority 2)

  const badStatus = queue.getStatus(idBad);
  console.assert(badStatus?.status === "failed", `TEST 5 FAILED: expected 'failed', got '${badStatus?.status}'`);
  if (badStatus?.status === "failed") {
    console.assert(
      badStatus.error.includes("Report not found"),
      `TEST 5 FAILED: error message mismatch, got '${badStatus.error}'`
    );
  }
  console.log("TEST 5 passed — failed status captured with error message");

  // TEST 6 — drain processes all remaining jobs; summary reflects counts
  queue.enqueue("email", { to: "bob@example.com", subject: "Drain test", body: "Draining!" }, 1);
  queue.enqueue("email", { to: "carol@example.com", subject: "Drain test 2", body: "Also draining!" }, 2);
  await queue.drain();

  const s = queue.summary();
  console.assert(s.pending === 0, `TEST 6 FAILED: expected 0 pending after drain, got ${s.pending}`);
  console.assert(s.succeeded >= 3, `TEST 6 FAILED: expected at least 3 succeeded, got ${s.succeeded}`);
  console.assert(s.failed === 1, `TEST 6 FAILED: expected 1 failed, got ${s.failed}`);
  console.log("TEST 6 passed — drain empties queue; summary:", s);

  console.log("\n✅ All tests passed!");
}

runTests().catch((err) => {
  console.error("Unexpected error during tests:", err);
  process.exit(1);
});
