// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import { parseEvent, parseEventLog, summariseEvents, AppEvent } from "./challenge";

// ---------- mock data ----------

const validDeploy = {
  kind: "deploy",
  timestamp: 1_700_000_100,
  service: "api-gateway",
  version: "v2.3.1",
};

const validError = {
  kind: "error",
  timestamp: 1_700_000_200,
  service: "auth-service",
  statusCode: 503,
};

const validScale = {
  kind: "scale",
  timestamp: 1_700_000_300,
  service: "worker",
  replicas: 5,
};

const validAlert = {
  kind: "alert",
  timestamp: 1_700_000_400,
  alertName: "HighMemoryUsage",
  severity: "critical",
};

const invalidKind = { kind: "reboot", timestamp: 1_700_000_500, service: "db" };
const missingTimestamp = { kind: "deploy", service: "api", version: "v1" };
const missingField = { kind: "alert", timestamp: 1_700_000_600, alertName: "Disk" }; // no severity
const badSeverity = { kind: "alert", timestamp: 1_700_000_700, alertName: "CPU", severity: "catastrophic" };
const notAnObject = "just a string";

// ---------- parseEvent tests ----------

console.assert(
  parseEvent(validDeploy) !== null &&
    parseEvent(validDeploy)?.kind === "deploy",
  "FAIL: parseEvent should parse a valid deploy event"
);

console.assert(
  parseEvent(validAlert) !== null &&
    parseEvent(validAlert)?.kind === "alert",
  "FAIL: parseEvent should parse a valid alert event"
);

console.assert(
  parseEvent(invalidKind) === null,
  "FAIL: parseEvent should return null for unknown kind"
);

console.assert(
  parseEvent(missingTimestamp) === null,
  "FAIL: parseEvent should return null when timestamp is missing"
);

console.assert(
  parseEvent(missingField) === null,
  "FAIL: parseEvent should return null when severity is missing from alert"
);

console.assert(
  parseEvent(badSeverity) === null,
  "FAIL: parseEvent should return null for invalid severity value"
);

console.assert(
  parseEvent(notAnObject) === null,
  "FAIL: parseEvent should return null for non-object input"
);

// ---------- parseEventLog tests ----------

const rawLog: unknown[] = [validDeploy, validError, validScale, validAlert, invalidKind, missingTimestamp];
const parsed = parseEventLog(rawLog);

console.assert(
  parsed.length === 4,
  `FAIL: parseEventLog should return 4 valid events, got ${parsed.length}`
);

console.assert(
  parseEventLog("not an array").length === 0,
  "FAIL: parseEventLog should return [] for non-array input"
);

// ---------- summariseEvents tests ----------

const summary = summariseEvents(parsed);

console.assert(
  summary.deploy.count === 1 && summary.deploy.latestTimestamp === 1_700_000_100,
  "FAIL: deploy summary should have count=1 and correct latestTimestamp"
);

console.assert(
  summary.error.count === 1 && summary.error.latestTimestamp === 1_700_000_200,
  "FAIL: error summary should have count=1 and correct latestTimestamp"
);

console.assert(
  summary.alert.count === 1 && summary.alert.latestTimestamp === 1_700_000_400,
  "FAIL: alert summary should have count=1 and correct latestTimestamp"
);

// Test with empty events — all counts zero, all timestamps null
const emptySummary = summariseEvents([]);
const allZero = (["deploy", "error", "scale", "alert"] as const).every(
  (k) => emptySummary[k].count === 0 && emptySummary[k].latestTimestamp === null
);
console.assert(allZero, "FAIL: empty summariseEvents should have count=0 and latestTimestamp=null for all kinds");

// Multiple events of the same kind — latestTimestamp should be the max
const twoErrors: AppEvent[] = [
  { kind: "error", timestamp: 1_700_001_000, service: "svc-a", statusCode: 500 },
  { kind: "error", timestamp: 1_700_002_000, service: "svc-b", statusCode: 404 },
];
const twoErrorSummary = summariseEvents(twoErrors);
console.assert(
  twoErrorSummary.error.count === 2 && twoErrorSummary.error.latestTimestamp === 1_700_002_000,
  "FAIL: summariseEvents should track max timestamp across multiple same-kind events"
);

console.log("All assertions passed! ✅");
