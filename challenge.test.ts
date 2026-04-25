// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseJob,
  processJob,
  dispatch,
  sleep,
  JOB_RETRY_POLICIES,
  type Job,
  type JobResult,
  type HandlerMap,
  type RetryPolicy,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label}`);
    failed++;
  }
}

function assertThrows(label: string, fn: () => unknown): void {
  try {
    fn();
    console.error(`  ❌ FAIL  ${label} — expected an error but none was thrown`);
    failed++;
  } catch {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  }
}

// ── Mock handlers ─────────────────────────────────────────────
let emailCallCount = 0;
let resizeCallCount = 0;

const handlers: HandlerMap = {
  send_email: async (job) => {
    emailCallCount++;
    // Fail first two calls, succeed on third
    if (emailCallCount < 3) throw new Error("SMTP timeout");
  },
  resize_image: async (job) => {
    resizeCallCount++;
    // Always succeeds
  },
  generate_report: async (job) => {
    throw new Error("Report service unavailable");
  },
};

// ── Tests ─────────────────────────────────────────────────────
async function main() {
  console.log("\n── parseJob ─────────────────────────────────────────");

  assertThrows("rejects null", () => parseJob(null));
  assertThrows("rejects string", () => parseJob("hello"));
  assertThrows("rejects unknown kind", () =>
    parseJob({ kind: "unknown_job" })
  );
  assertThrows("rejects send_email missing fields", () =>
    parseJob({ kind: "send_email", to: "a@b.com" })
  );

  const emailRaw = {
    kind: "send_email",
    to: "user@example.com",
    subject: "Hello",
    body: "World",
  };
  const parsed = parseJob(emailRaw);
  assert("parses valid send_email job", parsed.kind === "send_email");

  const imageRaw = {
    kind: "resize_image",
    imageUrl: "https://cdn.example.com/img.png",
    width: 800,
    height: 600,
  };
  const parsedImage = parseJob(imageRaw);
  assert("parses valid resize_image job", parsedImage.kind === "resize_image");

  const reportRaw = {
    kind: "generate_report",
    reportType: "pdf",
    filters: { region: "us-east" },
  };
  const parsedReport = parseJob(reportRaw);
  assert(
    "parses valid generate_report job",
    parsedReport.kind === "generate_report"
  );

  console.log("\n── JOB_RETRY_POLICIES ───────────────────────────────");
  assert(
    "send_email policy exists",
    typeof JOB_RETRY_POLICIES["send_email"]?.maxAttempts === "number"
  );
  assert(
    "resize_image policy exists",
    typeof JOB_RETRY_POLICIES["resize_image"]?.backoffMs === "number"
  );
  assert(
    "generate_report policy exists",
    typeof JOB_RETRY_POLICIES["generate_report"]?.maxAttempts === "number"
  );

  console.log("\n── processJob ───────────────────────────────────────");

  // send_email: fails twice, succeeds on 3rd attempt
  emailCallCount = 0;
  const emailJob: Job = {
    kind: "send_email",
    to: "user@example.com",
    subject: "Hello",
    body: "World",
  };
  const fastPolicy: RetryPolicy = { maxAttempts: 3, backoffMs: 10 };
  const emailResult = await processJob(emailJob, handlers.send_email, fastPolicy);
  assert("send_email eventually succeeds", emailResult.status === "success");
  assert("send_email used 3 attempts", emailResult.attempts === 3);

  // resize_image: succeeds on first attempt
  resizeCallCount = 0;
  const imageJob: Job = {
    kind: "resize_image",
    imageUrl: "https://cdn.example.com/img.png",
    width: 800,
    height: 600,
  };
  const imageResult = await processJob(imageJob, handlers.resize_image, fastPolicy);
  assert("resize_image succeeds on first attempt", imageResult.status === "success");
  assert("resize_image used 1 attempt", imageResult.attempts === 1);

  // generate_report: always fails, exhausts retries
  const reportJob: Job = {
    kind: "generate_report",
    reportType: "csv",
    filters: {},
  };
  const tightPolicy: RetryPolicy = { maxAttempts: 2, backoffMs: 10 };
  const reportResult = await processJob(reportJob, handlers.generate_report, tightPolicy);
  assert("generate_report fails after exhausting retries", reportResult.status === "failure");
  assert("generate_report used 2 attempts", reportResult.attempts === 2);
  assert(
    "generate_report captures error message",
    reportResult.status === "failure" && reportResult.lastError.length > 0
  );

  console.log("\n── dispatch ─────────────────────────────────────────");

  // Invalid raw → parse failure
  const badResult = await dispatch({ kind: "nope" }, handlers);
  assert("dispatch returns failure for invalid job", badResult.status === "failure");

  // Valid raw → success
  emailCallCount = 0; // reset so it can succeed within JOB_RETRY_POLICIES.send_email.maxAttempts
  // Override to always-succeed handler for dispatch test
  const successHandlers: HandlerMap = {
    ...handlers,
    send_email: async (_job) => { /* always succeeds */ },
  };
  const dispatchResult = await dispatch(emailRaw, successHandlers);
  assert("dispatch succeeds for valid send_email", dispatchResult.status === "success");

  // Summary
  console.log(`\n── Results: ${passed} passed, ${failed} failed ─────────────`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
