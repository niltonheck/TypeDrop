// ============================================================
// challenge.test.ts — Test harness for Typed User Session Aggregator
// ============================================================
import {
  validateSessionEvent,
  aggregateSessions,
  type SessionEvent,
  type SessionReport,
} from "./challenge";

// ------------------------------------------------------------------
// Helper
// ------------------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const rawEvents: unknown[] = [
  // User alice — 3 valid events
  { userId: "alice", page: "home",      durationSeconds: 120, timestamp: "2026-05-10T08:00:00Z" },
  { userId: "alice", page: "dashboard", durationSeconds: 300, timestamp: "2026-05-10T08:05:00Z" },
  { userId: "alice", page: "home",      durationSeconds: 60,  timestamp: "2026-05-10T08:15:00Z" },

  // User bob — 2 valid events
  { userId: "bob",   page: "billing",   durationSeconds: 90,  timestamp: "2026-05-10T09:00:00Z" },
  { userId: "bob",   page: "settings",  durationSeconds: 45,  timestamp: "2026-05-10T09:10:00Z" },

  // Invalid events
  { userId: "",      page: "home",      durationSeconds: 10,  timestamp: "2026-05-10T10:00:00Z" }, // empty userId
  { userId: "carol", page: "unknown",   durationSeconds: 20,  timestamp: "2026-05-10T10:00:00Z" }, // bad page
  { userId: "dave",  page: "dashboard", durationSeconds: -5,  timestamp: "2026-05-10T10:00:00Z" }, // negative duration
  null,                                                                                              // not an object
  { userId: "eve",   page: "settings"                                                            }, // missing durationSeconds & timestamp
];

// ------------------------------------------------------------------
// Test 1 — validateSessionEvent: valid input returns Ok
// ------------------------------------------------------------------
const validRaw: unknown = {
  userId: "alice",
  page: "dashboard",
  durationSeconds: 200,
  timestamp: "2026-05-10T08:00:00Z",
};
const validResult = validateSessionEvent(validRaw);
assert(validResult.ok === true, "validateSessionEvent returns Ok for a valid event");
if (validResult.ok) {
  const evt: SessionEvent = validResult.value;
  assert(evt.userId === "alice" && evt.page === "dashboard", "Validated event has correct fields");
}

// ------------------------------------------------------------------
// Test 2 — validateSessionEvent: invalid input returns Err
// ------------------------------------------------------------------
const badPage = validateSessionEvent({ userId: "x", page: "unknown", durationSeconds: 5, timestamp: "t" });
assert(badPage.ok === false, "validateSessionEvent returns Err for unknown page");

const negDuration = validateSessionEvent({ userId: "x", page: "home", durationSeconds: -1, timestamp: "t" });
assert(negDuration.ok === false, "validateSessionEvent returns Err for negative durationSeconds");

// ------------------------------------------------------------------
// Test 3 — aggregateSessions: counts
// ------------------------------------------------------------------
const report: SessionReport = aggregateSessions(rawEvents);

assert(report.validCount === 5,   `validCount should be 5 (got ${report.validCount})`);
assert(report.invalidCount === 5, `invalidCount should be 5 (got ${report.invalidCount})`);
assert(report.errors.length === 5, `errors array should have 5 entries (got ${report.errors.length})`);

// ------------------------------------------------------------------
// Test 4 — aggregateSessions: alice's summary
// ------------------------------------------------------------------
const alice = report.summaries.find(s => s.userId === "alice");
assert(alice !== undefined, "alice has a summary");
if (alice) {
  assert(alice.totalSessions === 3,         `alice.totalSessions = 3 (got ${alice.totalSessions})`);
  assert(alice.totalDurationSeconds === 480, `alice.totalDurationSeconds = 480 (got ${alice.totalDurationSeconds})`);
  assert(alice.avgDurationSeconds === 160,   `alice.avgDurationSeconds = 160 (got ${alice.avgDurationSeconds})`);
  assert(alice.mostVisitedPage === "home",   `alice.mostVisitedPage = "home" (got ${alice.mostVisitedPage})`);
  assert(alice.pageVisits["home"] === 2,     `alice pageVisits.home = 2 (got ${alice.pageVisits["home"]})`);
  assert(alice.pageVisits["dashboard"] === 1, `alice pageVisits.dashboard = 1`);
}

// ------------------------------------------------------------------
// Test 5 — aggregateSessions: summaries sorted A→Z by userId
// ------------------------------------------------------------------
const userIds = report.summaries.map(s => s.userId);
const sorted = [...userIds].sort();
assert(
  JSON.stringify(userIds) === JSON.stringify(sorted),
  `summaries are sorted A→Z by userId (got [${userIds.join(", ")}])`
);
