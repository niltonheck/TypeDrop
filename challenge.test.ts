// =============================================================
// challenge.test.ts — Test Harness
// =============================================================
import {
  validateJob,
  enqueueByPriority,
  runScheduler,
  buildReport,
  type Job,
  type HandlerRegistry,
  type SchedulerConfig,
  type JobOutcome,
} from "./challenge";

// ─── Mock Data ───────────────────────────────────────────────

const rawValid_email = {
  id: "j1",
  kind: "email",
  priority: "high",
  retries: 0,
  payload: { to: "alice@example.com", subject: "Welcome!" },
};

const rawValid_report = {
  id: "j2",
  kind: "report",
  priority: "low",
  retries: 2,
  payload: { reportId: "r-99", format: "pdf" },
};

const rawValid_export = {
  id: "j3",
  kind: "export",
  priority: "normal",
  retries: 1,
  payload: { datasetId: "ds-7", destination: "s3://bucket/path" },
};

const rawInvalid_badKind   = { id: "j4", kind: "sms",    priority: "high",   retries: 0, payload: {} };
const rawInvalid_noId      = {            kind: "email",  priority: "normal", retries: 0, payload: { to: "x@x.com", subject: "Hi" } };
const rawInvalid_badPrio   = { id: "j5", kind: "report", priority: "urgent", retries: 0, payload: { reportId: "r-1", format: "pdf" } };
const rawInvalid_badFormat = { id: "j6", kind: "report", priority: "normal", retries: 0, payload: { reportId: "r-2", format: "xml" } };

// ─── Test 1: validateJob — valid inputs ───────────────────────
{
  const r1 = validateJob(rawValid_email);
  console.assert(r1.ok === true, "T1a: valid email job should parse ok");
  if (r1.ok) {
    console.assert(r1.value.id === "j1",    "T1b: id should be j1");
    console.assert(r1.value.kind === "email", "T1c: kind should be email");
    console.assert(r1.value.priority === "high", "T1d: priority should be high");
  }

  const r2 = validateJob(rawValid_report);
  console.assert(r2.ok === true, "T1e: valid report job should parse ok");

  const r3 = validateJob(rawValid_export);
  console.assert(r3.ok === true, "T1f: valid export job should parse ok");
}

// ─── Test 2: validateJob — invalid inputs ─────────────────────
{
  const e1 = validateJob(rawInvalid_badKind);
  console.assert(e1.ok === false, "T2a: bad kind should fail");
  if (!e1.ok) console.assert(e1.error.tag === "unknown_kind", "T2b: error tag should be unknown_kind");

  const e2 = validateJob(rawInvalid_noId);
  console.assert(e2.ok === false, "T2c: missing id should fail");
  if (!e2.ok) console.assert(e2.error.tag === "missing_field", "T2d: error tag should be missing_field");

  const e3 = validateJob(rawInvalid_badPrio);
  console.assert(e3.ok === false, "T2e: bad priority should fail");

  const e4 = validateJob(rawInvalid_badFormat);
  console.assert(e4.ok === false, "T2f: bad report format should fail");
  if (!e4.ok) console.assert(e4.error.tag === "invalid_value", "T2g: error tag should be invalid_value");
}

// ─── Test 3: enqueueByPriority ────────────────────────────────
{
  const j1 = (validateJob(rawValid_email)  as { ok: true; value: Job }).value; // high
  const j2 = (validateJob(rawValid_report) as { ok: true; value: Job }).value; // low
  const j3 = (validateJob(rawValid_export) as { ok: true; value: Job }).value; // normal

  const sorted = enqueueByPriority([j2, j3, j1]); // low, normal, high → should become high, normal, low
  console.assert(sorted[0].id === "j1", "T3a: first job should be high-priority j1");
  console.assert(sorted[1].id === "j3", "T3b: second job should be normal-priority j3");
  console.assert(sorted[2].id === "j2", "T3c: third job should be low-priority j2");

  // Original array must not be mutated
  console.assert(sorted !== [j2, j3, j1], "T3d: enqueueByPriority must return a new array");
}

// ─── Test 4: buildReport — single-pass tally ─────────────────
{
  const outcomes: JobOutcome[] = [
    { jobId: "j1", kind: "email",  priority: "high",   status: "succeeded", attempts: 1, finishedAt: new Date().toISOString() },
    { jobId: "j2", kind: "report", priority: "low",    status: "exhausted", attempts: 3, finishedAt: new Date().toISOString() },
    { jobId: "j3", kind: "export", priority: "normal", status: "failed",    attempts: 2, finishedAt: new Date().toISOString() },
    { jobId: "j4", kind: "email",  priority: "normal", status: "succeeded", attempts: 1, finishedAt: new Date().toISOString() },
  ];

  const report = buildReport(outcomes);
  console.assert(report.succeeded === 2, "T4a: succeeded count should be 2");
  console.assert(report.failed    === 1, "T4b: failed count should be 1");
  console.assert(report.exhausted === 1, "T4c: exhausted count should be 1");
  console.assert(report.outcomes === outcomes, "T4d: outcomes array must be the same reference");
}

// ─── Test 5: runScheduler — end-to-end ───────────────────────
{
  const j1 = (validateJob(rawValid_email)  as { ok: true; value: Job }).value;
  const j2 = (validateJob(rawValid_report) as { ok: true; value: Job }).value;
  const j3 = (validateJob(rawValid_export) as { ok: true; value: Job }).value;

  // email handler always succeeds
  // report handler always returns false (exhausted after maxAttempts)
  // export handler throws on first attempt, succeeds on second
  let exportAttempts = 0;

  const registry: HandlerRegistry = {
    email:  async (_job) => true,
    report: async (_job) => false,
    export: async (_job) => {
      exportAttempts += 1;
      if (exportAttempts === 1) throw new Error("Transient network error");
      return true;
    },
  };

  const config: SchedulerConfig = { concurrency: 2, maxAttempts: 3 };

  runScheduler([j1, j2, j3], registry, config).then((report) => {
    console.assert(report.succeeded === 2, "T5a: 2 jobs should succeed (email + export)");
    console.assert(report.exhausted === 1, "T5b: 1 job should be exhausted (report)");
    console.assert(report.failed    === 0, "T5c: 0 jobs should be failed");
    console.assert(report.outcomes.length === 3, "T5d: outcomes should have 3 entries");

    const exportOutcome = report.outcomes.find(o => o.kind === "export");
    console.assert(exportOutcome !== undefined,      "T5e: export outcome should exist");
    console.assert(exportOutcome?.attempts === 2,    "T5f: export should have taken 2 attempts");
    console.assert(exportOutcome?.status === "succeeded", "T5g: export should ultimately succeed");
  }).catch((err: unknown) => {
    console.error("T5 runScheduler threw unexpectedly:", err);
  });
}

console.log("All synchronous assertions evaluated. Check async T5 output above.");
