// =============================================================
// challenge.test.ts — Typed User Session Aggregator
// =============================================================
import {
  validateSessionEvent,
  aggregateSessions,
  toUserId,
  type SessionEvent,
  type AggregationReport,
} from "./challenge";

// ── Mock Data ─────────────────────────────────────────────────

const validRaw1 = {
  eventId: "e1",
  userId: "user-alice",
  category: "pageview",
  occurredAt: 1_700_000_000_000,
  path: "/home",
};

const validRaw2 = {
  eventId: "e2",
  userId: "user-alice",
  category: "purchase",
  occurredAt: 1_700_000_001_000,
  path: "/checkout",
  revenuecents: 4999,
};

const validRaw3 = {
  eventId: "e3",
  userId: "user-bob",
  category: "click",
  occurredAt: 1_700_000_002_000,
  path: "/dashboard",
};

const validRaw4 = {
  eventId: "e4",
  userId: "user-alice",
  category: "pageview",
  occurredAt: 1_700_000_003_000,
  path: "/home", // duplicate path — should not appear twice in uniquePaths
};

const invalidRaw1 = {
  eventId: "e5",
  userId: "user-charlie",
  category: "hover", // ← invalid category
  occurredAt: 1_700_000_004_000,
  path: "/settings",
};

const invalidRaw2 = null; // ← not an object

const invalidRaw3 = {
  eventId: "e6",
  userId: "user-dave",
  category: "error",
  occurredAt: "not-a-number", // ← wrong type
  path: "/error-page",
};

// ── Test 1: validateSessionEvent — valid input ────────────────
const r1 = validateSessionEvent(validRaw1);
console.assert(r1.ok === true, "Test 1 FAILED: expected ok=true for valid raw event");
if (r1.ok) {
  console.assert(r1.value.userId === "user-alice", "Test 1 FAILED: wrong userId");
  console.assert(r1.value.category === "pageview",  "Test 1 FAILED: wrong category");
}

// ── Test 2: validateSessionEvent — invalid category ───────────
const r2 = validateSessionEvent(invalidRaw1);
console.assert(r2.ok === false, "Test 2 FAILED: expected ok=false for invalid category");
if (!r2.ok) {
  console.assert(typeof r2.error === "string" && r2.error.length > 0,
    "Test 2 FAILED: error should be a non-empty string");
}

// ── Test 3: validateSessionEvent — null input ─────────────────
const r3 = validateSessionEvent(invalidRaw2);
console.assert(r3.ok === false, "Test 3 FAILED: expected ok=false for null input");

// ── Test 4: aggregateSessions — totals ───────────────────────
const rawBatch: unknown[] = [
  validRaw1, validRaw2, validRaw3, validRaw4,
  invalidRaw1, invalidRaw2, invalidRaw3,
];

const report: AggregationReport = aggregateSessions(rawBatch);

console.assert(report.totalRawEvents === 7,  "Test 4 FAILED: totalRawEvents should be 7");
console.assert(report.validEvents    === 4,  "Test 4 FAILED: validEvents should be 4");
console.assert(report.invalidEvents  === 3,  "Test 4 FAILED: invalidEvents should be 3");

// ── Test 5: aggregateSessions — per-user summaries ────────────
console.assert(report.userSummaries.length === 2, "Test 5 FAILED: should have 2 user summaries");

// Sorted ascending: "user-alice" < "user-bob"
const alice = report.userSummaries[0];
const bob   = report.userSummaries[1];

console.assert(alice.userId === "user-alice", "Test 5 FAILED: first summary should be alice");
console.assert(alice.totalEvents === 3,       "Test 5 FAILED: alice totalEvents should be 3");
console.assert(alice.eventCounts.pageview === 2,  "Test 5 FAILED: alice pageview count");
console.assert(alice.eventCounts.purchase === 1,  "Test 5 FAILED: alice purchase count");
console.assert(alice.eventCounts.click    === 0,  "Test 5 FAILED: alice click count");
console.assert(alice.eventCounts.error    === 0,  "Test 5 FAILED: alice error count");
console.assert(alice.totalRevenueCents === 4999,  "Test 5 FAILED: alice revenue");
console.assert(alice.uniquePaths.length === 2,    "Test 5 FAILED: alice should have 2 unique paths");
console.assert(alice.firstSeen === 1_700_000_000_000, "Test 5 FAILED: alice firstSeen");
console.assert(alice.lastSeen  === 1_700_000_003_000, "Test 5 FAILED: alice lastSeen");

console.assert(bob.userId === "user-bob",    "Test 5 FAILED: second summary should be bob");
console.assert(bob.totalEvents === 1,        "Test 5 FAILED: bob totalEvents should be 1");
console.assert(bob.eventCounts.click === 1,  "Test 5 FAILED: bob click count");
console.assert(bob.totalRevenueCents === 0,  "Test 5 FAILED: bob revenue should be 0");

console.log("All tests passed! ✅");
