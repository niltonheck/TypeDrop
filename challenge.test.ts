// ============================================================
// Typed Event RSVP Aggregator — challenge.test.ts
// ============================================================
import { parseRsvp, aggregateRsvps } from "./challenge";
import type { Result, Rsvp, RsvpSummary } from "./challenge";

// ------------------------------------------------------------------
// Mock raw payloads
// ------------------------------------------------------------------
const validAttending = {
  id: "rsvp-1",
  eventId: "evt-abc",
  name: "Alice Smith",
  email: "alice@example.com",
  status: "attending",
  guests: 2,
};

const validDeclined = {
  id: "rsvp-2",
  eventId: "evt-abc",
  name: "Bob Jones",
  email: "bob@example.com",
  status: "declined",
  guests: 0,
};

const validMaybe = {
  id: "rsvp-3",
  eventId: "evt-abc",
  name: "Carol White",
  email: "carol@example.com",
  status: "maybe",
  guests: 1,
};

const wrongEvent = {
  id: "rsvp-4",
  eventId: "evt-other",
  name: "Dave Brown",
  email: "dave@example.com",
  status: "attending",
  guests: 3,
};

const missingStatus = {
  id: "rsvp-5",
  eventId: "evt-abc",
  name: "Eve Green",
  email: "eve@example.com",
  // status intentionally omitted
  guests: 0,
};

const badGuests = {
  id: "rsvp-6",
  eventId: "evt-abc",
  name: "Frank Black",
  email: "frank@example.com",
  status: "attending",
  guests: -1, // negative — invalid
};

const notAnObject = "I am not an object";

// ------------------------------------------------------------------
// Test 1: parseRsvp returns success for a valid payload
// ------------------------------------------------------------------
const parsed: Result<Rsvp> = parseRsvp(validAttending);
console.assert(
  parsed.ok === true,
  "Test 1 FAILED: expected ok=true for a valid RSVP payload"
);
if (parsed.ok) {
  console.assert(
    parsed.value.status === "attending",
    "Test 1b FAILED: expected status 'attending'"
  );
  console.assert(
    parsed.value.guests === 2,
    "Test 1c FAILED: expected guests=2"
  );
}

// ------------------------------------------------------------------
// Test 2: parseRsvp returns failure for missing status
// ------------------------------------------------------------------
const parsedBadStatus: Result<Rsvp> = parseRsvp(missingStatus);
console.assert(
  parsedBadStatus.ok === false,
  "Test 2 FAILED: expected ok=false when status is missing"
);

// ------------------------------------------------------------------
// Test 3: parseRsvp returns failure for negative guests
// ------------------------------------------------------------------
const parsedBadGuests: Result<Rsvp> = parseRsvp(badGuests);
console.assert(
  parsedBadGuests.ok === false,
  "Test 3 FAILED: expected ok=false when guests is negative"
);

// ------------------------------------------------------------------
// Test 4: parseRsvp returns failure for a non-object input
// ------------------------------------------------------------------
const parsedNonObject: Result<Rsvp> = parseRsvp(notAnObject);
console.assert(
  parsedNonObject.ok === false,
  "Test 4 FAILED: expected ok=false for a non-object input"
);

// ------------------------------------------------------------------
// Test 5: aggregateRsvps produces correct counts and totalGuests
// ------------------------------------------------------------------
const raws: unknown[] = [
  validAttending,  // evt-abc, attending, guests=2  ✓
  validDeclined,   // evt-abc, declined,  guests=0  ✓
  validMaybe,      // evt-abc, maybe,     guests=1  ✓
  wrongEvent,      // evt-other — should be excluded
  missingStatus,   // invalid  — should be skipped
  badGuests,       // invalid  — should be skipped
];

const summary: RsvpSummary = aggregateRsvps("evt-abc", raws);

console.assert(
  summary.eventId === "evt-abc",
  "Test 5a FAILED: eventId should be 'evt-abc'"
);
console.assert(
  summary.counts["attending"] === 1,
  `Test 5b FAILED: attending count should be 1, got ${summary.counts["attending"]}`
);
console.assert(
  summary.counts["declined"] === 1,
  `Test 5c FAILED: declined count should be 1, got ${summary.counts["declined"]}`
);
console.assert(
  summary.counts["maybe"] === 1,
  `Test 5d FAILED: maybe count should be 1, got ${summary.counts["maybe"]}`
);
console.assert(
  summary.totalGuests === 3,
  `Test 5e FAILED: totalGuests should be 3 (2+0+1), got ${summary.totalGuests}`
);

// ------------------------------------------------------------------
// Test 6: aggregateRsvps defaults all counts to 0 for an empty input
// ------------------------------------------------------------------
const emptySummary: RsvpSummary = aggregateRsvps("evt-xyz", []);

console.assert(
  emptySummary.counts["attending"] === 0,
  "Test 6a FAILED: attending count should default to 0"
);
console.assert(
  emptySummary.counts["declined"] === 0,
  "Test 6b FAILED: declined count should default to 0"
);
console.assert(
  emptySummary.counts["maybe"] === 0,
  "Test 6c FAILED: maybe count should default to 0"
);
console.assert(
  emptySummary.totalGuests === 0,
  "Test 6d FAILED: totalGuests should be 0 for empty input"
);

console.log("All tests passed! 🎉");
