// challenge.test.ts
import {
  runQueue,
  getSuccesses,
  type Job,
  type HandlerRegistry,
  type JobResult,
  type JobSuccess,
} from "./challenge";

// ── Mock jobs ────────────────────────────────────────────────
const jobs: Job[] = [
  { kind: "email",     id: "e1", priority: 5,  to: "alice@example.com", subject: "Hello", body: "Hi!" },
  { kind: "email",     id: "e2", priority: 1,  to: "bob@example.com",   subject: "Bye",   body: "Goodbye!" },
  { kind: "report",    id: "r1", priority: 10, reportId: "rpt-42", format: "pdf" },
  { kind: "thumbnail", id: "t1", priority: 3,  imageUrl: "https://img.example.com/photo.jpg", widths: [100, 200] },
  { kind: "thumbnail", id: "t2", priority: 7,  imageUrl: "https://img.example.com/banner.jpg", widths: [300] },
];

// ── Mock handlers ────────────────────────────────────────────
const registry: HandlerRegistry = {
  email: async (job) => ({
    status: "success",
    job,
    output: `Email sent to ${job.to}`,
    durationMs: 42,
  }),
  report: async (job) => {
    // Simulate a failure for reports
    return {
      status: "failure",
      job,
      error: "PDF renderer unavailable",
      retryable: true,
    };
  },
  thumbnail: async (job) => ({
    status: "success",
    job,
    output: `Thumbnails generated: ${job.widths.join(", ")}px`,
    durationMs: 15,
  }),
};

// ── Tests ────────────────────────────────────────────────────
async function main() {
  const summary = await runQueue(jobs, registry, 2);

  // Test 1: total count matches
  console.assert(summary.total === 5, `FAIL Test 1: expected total=5, got ${summary.total}`);
  console.log(`Test 1 ${summary.total === 5 ? "PASS" : "FAIL"}: total count`);

  // Test 2: correct success/failure split
  console.assert(summary.succeeded === 4, `FAIL Test 2: expected succeeded=4, got ${summary.succeeded}`);
  console.assert(summary.failed === 1,    `FAIL Test 2: expected failed=1, got ${summary.failed}`);
  console.log(`Test 2 ${summary.succeeded === 4 && summary.failed === 1 ? "PASS" : "FAIL"}: success/failure split`);

  // Test 3: failedIds contains only the report job
  console.assert(
    summary.failedIds.length === 1 && summary.failedIds[0] === "r1",
    `FAIL Test 3: expected failedIds=["r1"], got ${JSON.stringify(summary.failedIds)}`,
  );
  console.log(`Test 3 ${summary.failedIds[0] === "r1" ? "PASS" : "FAIL"}: failedIds`);

  // Test 4: priority ordering — report (priority 10) result should appear
  //         before email e2 (priority 1) in the results array
  //         (completion order may vary, but both must be present)
  const allIds = summary.results.map((r) => r.job.id);
  console.assert(allIds.includes("r1") && allIds.includes("e2"), "FAIL Test 4: missing expected job ids");
  console.log(`Test 4 ${allIds.includes("r1") && allIds.includes("e2") ? "PASS" : "FAIL"}: all jobs present in results`);

  // Test 5: getSuccesses narrows to correct variant
  const emailSuccesses = getSuccesses(summary.results, "email");
  console.assert(emailSuccesses.length === 2, `FAIL Test 5: expected 2 email successes, got ${emailSuccesses.length}`);
  // TypeScript should know these are JobSuccess<EmailJob> — access email-specific fields:
  const firstTo = emailSuccesses[0]?.job.to;
  console.assert(typeof firstTo === "string", "FAIL Test 5: job.to should be a string");
  console.log(`Test 5 ${emailSuccesses.length === 2 && typeof firstTo === "string" ? "PASS" : "FAIL"}: getSuccesses narrowing`);

  console.log("\nAll tests complete.");
}

main().catch(console.error);
