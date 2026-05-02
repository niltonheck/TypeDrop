// challenge.test.ts
import {
  validateRsvp,
  buildEventSummary,
  aggregateRsvps,
  type Rsvp,
  type AggregationReport,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const validPayload1 = {
  guestName: "Alice",
  eventId: "evt-001",
  status: "attending",
  plusOnes: 2,
};

const validPayload2 = {
  guestName: "Bob",
  eventId: "evt-001",
  status: "declined",
  plusOnes: 0,
};

const validPayload3 = {
  guestName: "Carol",
  eventId: "evt-002",
  status: "maybe",
  // plusOnes absent — should default to 0
};

const validPayload4 = {
  guestName: "Dave",
  eventId: "evt-001",
  status: "attending",
  plusOnes: 1,
};

const badPayload1 = null;                               // NOT_AN_OBJECT
const badPayload2 = { eventId: "evt-001", status: "attending", plusOnes: 0 }; // MISSING_GUEST_NAME
const badPayload3 = { guestName: "Eve", eventId: "evt-002", status: "nope" }; // INVALID_STATUS
const badPayload4 = { guestName: "Frank", eventId: "evt-003", status: "attending", plusOnes: -1 }; // INVALID_PLUS_ONES

// ── Test 1: validateRsvp — happy path ────────────────────────
const r1 = validateRsvp(validPayload1);
console.assert(r1.ok === true, "Test 1a: valid payload should succeed");
if (r1.ok) {
  console.assert(r1.value.guestName === "Alice",  "Test 1b: guestName");
  console.assert(r1.value.plusOnes  === 2,        "Test 1c: plusOnes");
  console.assert(r1.value.status    === "attending", "Test 1d: status");
}

// ── Test 2: validateRsvp — missing plusOnes defaults to 0 ────
const r2 = validateRsvp(validPayload3);
console.assert(r2.ok === true, "Test 2a: absent plusOnes should succeed");
if (r2.ok) {
  console.assert(r2.value.plusOnes === 0, "Test 2b: plusOnes defaults to 0");
}

// ── Test 3: validateRsvp — error codes ──────────────────────
const e1 = validateRsvp(badPayload1);
console.assert(e1.ok === false && !e1.ok && e1.error === "NOT_AN_OBJECT",    "Test 3a: null → NOT_AN_OBJECT");

const e2 = validateRsvp(badPayload2);
console.assert(e2.ok === false && !e2.ok && e2.error === "MISSING_GUEST_NAME", "Test 3b: missing guestName");

const e3 = validateRsvp(badPayload3);
console.assert(e3.ok === false && !e3.ok && e3.error === "INVALID_STATUS",   "Test 3c: bad status");

const e4 = validateRsvp(badPayload4);
console.assert(e4.ok === false && !e4.ok && e4.error === "INVALID_PLUS_ONES", "Test 3d: negative plusOnes");

// ── Test 4: buildEventSummary ────────────────────────────────
const rsvps: Rsvp[] = [
  { guestName: "Alice", eventId: "evt-001", status: "attending", plusOnes: 2 },
  { guestName: "Bob",   eventId: "evt-001", status: "declined",  plusOnes: 0 },
  { guestName: "Dave",  eventId: "evt-001", status: "attending", plusOnes: 1 },
];
const summary = buildEventSummary("evt-001", rsvps);
console.assert(summary.attendingCount  === 2,  "Test 4a: attendingCount");
console.assert(summary.declinedCount   === 1,  "Test 4b: declinedCount");
console.assert(summary.maybeCount      === 0,  "Test 4c: maybeCount");
// Alice: 1+2=3, Dave: 1+1=2 → totalAttending = 5
console.assert(summary.totalAttending  === 5,  "Test 4d: totalAttending");

// ── Test 5: aggregateRsvps — end-to-end ──────────────────────
const allPayloads: unknown[] = [
  validPayload1, validPayload2, validPayload3, validPayload4,
  badPayload1, badPayload2, badPayload3,
];
const report: AggregationReport = aggregateRsvps(allPayloads);

console.assert(Object.keys(report.summaries).length === 2,         "Test 5a: two distinct events");
console.assert(report.failures.length === 3,                        "Test 5b: three failures");
console.assert(report.summaries["evt-001"].attendingCount === 2,    "Test 5c: evt-001 attendingCount");
console.assert(report.summaries["evt-002"].maybeCount     === 1,    "Test 5d: evt-002 maybeCount");
console.assert(report.summaries["evt-001"].totalAttending === 5,    "Test 5e: evt-001 totalAttending");

console.log("All tests passed! ✅");
