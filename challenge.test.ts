
// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseRawEvent,
  applyEvent,
  replayEvents,
  takeSnapshot,
  processRawEventBatch,
  documentProjection,
  toVersion,
  type AggregateId,
  type EventId,
  type DocumentState,
  type ValidationError,
} from "./challenge";

// ─── Helpers ────────────────────────────────────────────────

function aggId(s: string): AggregateId { return s as unknown as AggregateId; }
function evtId(s: string): EventId     { return s as unknown as EventId; }

const BASE_STATE: DocumentState = {
  id:             aggId("doc-1"),
  version:        toVersion(0),
  title:          "",
  content:        "",
  wordCount:      0,
  authorId:       "",
  collaborators:  new Map(),
  archivedAt:     null,
  archivedReason: null,
};

// ─── Raw event fixtures ──────────────────────────────────────

const rawCreated = {
  type:        "DocumentCreated",
  eventId:     evtId("evt-1"),
  aggregateId: aggId("doc-1"),
  version:     1,
  occurredAt:  "2026-06-20T10:00:00Z",
  title:       "Hello World",
  authorId:    "user-42",
};

const rawUpdated = {
  type:        "ContentUpdated",
  eventId:     evtId("evt-2"),
  aggregateId: aggId("doc-1"),
  version:     2,
  occurredAt:  "2026-06-20T10:01:00Z",
  content:     "Hello, world! This is a test.",
  wordCount:   6,
};

const rawCollaborator = {
  type:           "CollaboratorAdded",
  eventId:        evtId("evt-3"),
  aggregateId:    aggId("doc-1"),
  version:        3,
  occurredAt:     "2026-06-20T10:02:00Z",
  collaboratorId: "user-99",
  role:           "editor",
};

const rawArchived = {
  type:        "DocumentArchived",
  eventId:     evtId("evt-4"),
  aggregateId: aggId("doc-1"),
  version:     4,
  occurredAt:  "2026-06-20T10:03:00Z",
  reason:      "Project completed",
};

const rawBadType = {
  type:        "DocumentDeleted",   // unknown event type
  eventId:     evtId("evt-x"),
  aggregateId: aggId("doc-1"),
  version:     5,
  occurredAt:  "2026-06-20T10:04:00Z",
};

const rawMissingField = {
  type:        "DocumentCreated",
  eventId:     evtId("evt-y"),
  aggregateId: aggId("doc-1"),
  version:     5,
  occurredAt:  "2026-06-20T10:05:00Z",
  // title is missing!
  authorId:    "user-42",
};

// ─── Test 1: parseRawEvent — happy path ─────────────────────

const parsed1 = parseRawEvent(rawCreated);
console.assert(parsed1.ok === true, "Test 1a: DocumentCreated should parse successfully");
if (parsed1.ok) {
  console.assert(parsed1.value.type === "DocumentCreated", "Test 1b: type should be DocumentCreated");
  console.assert(parsed1.value.version === 1, "Test 1c: version should be 1");
}

// ─── Test 2: parseRawEvent — unknown event type ──────────────

const parsed2 = parseRawEvent(rawBadType);
console.assert(parsed2.ok === false, "Test 2a: unknown event type should fail");
if (!parsed2.ok) {
  console.assert(parsed2.error.kind === "UnknownEvent", "Test 2b: error kind should be UnknownEvent");
}

// ─── Test 3: parseRawEvent — missing field ───────────────────

const parsed3 = parseRawEvent(rawMissingField);
console.assert(parsed3.ok === false, "Test 3a: missing title should fail");
if (!parsed3.ok) {
  const validKinds: ValidationError["kind"][] = ["MissingField", "InvalidType"];
  console.assert(validKinds.includes(parsed3.error.kind), "Test 3b: error kind should be MissingField or InvalidType");
}

// ─── Test 4: applyEvent + documentProjection ─────────────────

const evt1 = parseRawEvent(rawCreated);
console.assert(evt1.ok, "Test 4 prereq: rawCreated must parse");
if (evt1.ok) {
  const result = applyEvent(BASE_STATE, evt1.value, documentProjection);
  console.assert(result.ok === true, "Test 4a: applyEvent should succeed");
  if (result.ok) {
    console.assert(result.value.title === "Hello World", "Test 4b: title should be set");
    console.assert(result.value.authorId === "user-42",  "Test 4c: authorId should be set");
    console.assert(result.value.version === 1,           "Test 4d: version should advance to 1");
  }
}

// ─── Test 5: replayEvents — full sequence ────────────────────

const allRaw = [rawCreated, rawUpdated, rawCollaborator, rawArchived];
const allParsed = allRaw.map(parseRawEvent);
const allOk = allParsed.every(r => r.ok);
console.assert(allOk, "Test 5 prereq: all four events must parse");

if (allOk) {
  const events = allParsed.map(r => (r as Extract<typeof r, { ok: true }>).value);
  const replayResult = replayEvents(BASE_STATE, events, documentProjection);
  console.assert(replayResult.ok === true, "Test 5a: replay should succeed");
  if (replayResult.ok) {
    const s = replayResult.value;
    console.assert(s.version      === 4,                  "Test 5b: final version should be 4");
    console.assert(s.wordCount    === 6,                   "Test 5c: wordCount should be 6");
    console.assert(s.collaborators.get("user-99") === "editor", "Test 5d: collaborator should be editor");
    console.assert(s.archivedAt   === "2026-06-20T10:03:00Z",   "Test 5e: archivedAt should be set");
    console.assert(s.archivedReason === "Project completed",     "Test 5f: archivedReason should be set");
  }
}

// ─── Test 6: takeSnapshot ────────────────────────────────────

const snapState: DocumentState = { ...BASE_STATE, version: toVersion(3) };
const snap = takeSnapshot(snapState);
console.assert(snap.version === 3,                  "Test 6a: snapshot version should be 3");
console.assert(snap.aggregateId === aggId("doc-1"), "Test 6b: snapshot aggregateId should match");
console.assert(typeof snap.takenAt === "string",    "Test 6c: takenAt should be a string");
console.assert(snap.state === snapState,            "Test 6d: snapshot state should be the same object");

// ─── Test 7: processRawEventBatch — mixed good/bad input ─────

const mixedRaw: unknown[] = [
  rawCreated,
  rawBadType,         // parse error — unknown event
  rawUpdated,
  rawMissingField,    // parse error — missing field
  rawCollaborator,
  rawArchived,
];

const batch = processRawEventBatch(mixedRaw, BASE_STATE, documentProjection);
console.assert(batch.parseErrors.length === 2,      "Test 7a: should have 2 parse errors");
console.assert(batch.replayError === null,           "Test 7b: replay should succeed");
console.assert(batch.finalState !== null,            "Test 7c: finalState should not be null");
console.assert(batch.snapshot   !== null,            "Test 7d: snapshot should not be null");
if (batch.finalState !== null) {
  console.assert(batch.finalState.version === 4,    "Test 7e: final version after batch should be 4");
}

console.log("All tests executed — check assertions above for failures.");
