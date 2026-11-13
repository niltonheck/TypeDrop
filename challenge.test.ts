// challenge.test.ts
import {
  parseLogEntry,
  buildPipeline,
  severityFilter,
  serviceRedactor,
  drainPipeline,
  groupBySeverity,
  makeTimestamp,
  makeServiceName,
  type LogEntry,
  type LogSink,
  type SeverityEntries,
} from "./challenge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  console.assert(condition, `❌ ${message}`);
  if (condition) console.log(`✅ ${message}`);
}

// ─── Mock raw entries ──────────────────────────────────────────────────────────

const RAW_VALID_DEBUG = {
  severity: "debug",
  service: "auth-service",
  timestamp: "2026-11-13T10:00:00Z",
  payload: { message: "Token validated", context: { userId: "u42" } },
};

const RAW_VALID_ERROR = {
  severity: "error",
  service: "payment-service",
  timestamp: "2026-11-13T10:01:00Z",
  payload: { message: "Charge failed", stack: "Error\n  at ...", code: "CARD_DECLINED" },
};

const RAW_VALID_FATAL = {
  severity: "fatal",
  service: "core",
  timestamp: "2026-11-13T10:02:00Z",
  payload: { message: "OOM", stack: "Error\n  at ...", code: "OOM", triggeredShutdown: true },
};

const RAW_INVALID_SEVERITY   = { severity: "verbose", service: "svc", timestamp: "2026-11-13T00:00:00Z", payload: {} };
const RAW_INVALID_TIMESTAMP  = { severity: "info", service: "svc", timestamp: "not-a-date", payload: { message: "hi" } };
const RAW_MISSING_FIELD      = { severity: "warn", service: "", timestamp: "2026-11-13T00:00:00Z", payload: {} };

// ─── Test 1: parseLogEntry ─────────────────────────────────────────────────────

const r1 = parseLogEntry(RAW_VALID_DEBUG);
assert(r1.ok === true, "parseLogEntry: valid debug entry returns Ok");

const r2 = parseLogEntry(RAW_INVALID_SEVERITY);
assert(r2.ok === false && !r2.ok && r2.error.kind === "INVALID_SEVERITY",
  "parseLogEntry: unknown severity returns Err INVALID_SEVERITY");

const r3 = parseLogEntry(RAW_INVALID_TIMESTAMP);
assert(r3.ok === false && !r3.ok && r3.error.kind === "INVALID_TIMESTAMP",
  "parseLogEntry: bad timestamp returns Err INVALID_TIMESTAMP");

const r4 = parseLogEntry(RAW_MISSING_FIELD);
assert(r4.ok === false && !r4.ok && r4.error.kind === "MISSING_FIELD",
  "parseLogEntry: empty service name returns Err MISSING_FIELD");

// ─── Test 2: severityFilter middleware ────────────────────────────────────────

const debugEntry = (parseLogEntry(RAW_VALID_DEBUG) as { ok: true; value: LogEntry }).value;
const errorEntry = (parseLogEntry(RAW_VALID_ERROR) as { ok: true; value: LogEntry }).value;

const filterWarnAndAbove = severityFilter("warn");
assert(filterWarnAndAbove(debugEntry) === null,
  "severityFilter: debug entry dropped when min=warn");
assert(filterWarnAndAbove(errorEntry) !== null,
  "severityFilter: error entry passes when min=warn");

// ─── Test 3: serviceRedactor middleware ───────────────────────────────────────

const redactor = serviceRedactor(["code"]);
const redacted = redactor(errorEntry);
assert(
  redacted !== null &&
  (redacted.payload as { code?: string }).code === "[REDACTED]",
  "serviceRedactor: 'code' field in error payload is redacted",
);
assert(
  redacted !== null && redacted !== errorEntry,
  "serviceRedactor: returns a new object (no mutation)",
);

// ─── Test 4: buildPipeline composition ───────────────────────────────────────

const pipeline = buildPipeline([severityFilter("error"), serviceRedactor(["stack"])]);
const fatalEntry = (parseLogEntry(RAW_VALID_FATAL) as { ok: true; value: LogEntry }).value;

assert(pipeline(debugEntry) === null,
  "buildPipeline: debug entry dropped by composed pipeline (min=error)");
assert(
  pipeline(fatalEntry) !== null &&
  (pipeline(fatalEntry)?.payload as { stack?: string })?.stack === "[REDACTED]",
  "buildPipeline: fatal entry passes filter and stack is redacted",
);

// ─── Test 5: drainPipeline full run ───────────────────────────────────────────

async function runDrainTest(): Promise<void> {
  const rawEntries = [RAW_VALID_DEBUG, RAW_VALID_ERROR, RAW_VALID_FATAL, RAW_INVALID_SEVERITY];
  const composed   = buildPipeline([severityFilter("error")]);

  const captured: LogEntry[] = [];
  const consoleSink: LogSink = async (entry) => { captured.push(entry); };

  // This sink always rejects
  const brokenSink: LogSink = async (_entry) => { throw new Error("Disk full"); };

  const report = await drainPipeline(rawEntries, composed, {
    console: consoleSink,
    broken:  brokenSink,
  });

  assert(report.totalInvalid === 1,  "drainPipeline: 1 invalid entry counted");
  assert(report.totalDropped === 1,  "drainPipeline: 1 debug entry dropped by filter");
  assert(report.totalParsed  === 3,  "drainPipeline: 3 entries successfully parsed");

  assert(
    report.sinkReports["console"]?.kind === "flushed",
    "drainPipeline: console sink reports 'flushed'",
  );
  assert(
    report.sinkReports["broken"]?.kind === "failed",
    "drainPipeline: broken sink reports 'failed'",
  );
}

// ─── Test 6: groupBySeverity ──────────────────────────────────────────────────

const allEntries: LogEntry[] = [debugEntry, errorEntry, fatalEntry];
const grouped = groupBySeverity(allEntries);

assert(grouped.debug?.length === 1, "groupBySeverity: one debug entry grouped");
assert(grouped.error?.length === 1, "groupBySeverity: one error entry grouped");
assert(grouped.info === undefined,   "groupBySeverity: info key absent when no info entries");

// Compile-time check: the type of grouped.error elements should be SeverityEntries<"error">
// If this line compiles, the conditional type is correct.
const _typeCheck: SeverityEntries<"error"> | undefined = grouped.error?.[0];
void _typeCheck;

// ─── Run async tests ──────────────────────────────────────────────────────────

runDrainTest().catch(console.error);
