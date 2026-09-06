// challenge.test.ts — run with: npx ts-node challenge.test.ts
import {
  documentReducer,
  replayFromSnapshot,
  takeSnapshot,
  compactLog,
  runProjection,
  collaboratorProjection,
  type EventLog,
  type DomainEvent,
  type DocumentState,
  type CollaboratorSummary,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock event log
// ---------------------------------------------------------------------------
const events: DomainEvent[] = [
  { kind: "DocumentCreated",   aggregateId: "doc-1", title: "Hello World", author: "alice", occurredAt: 1000 },
  { kind: "CollaboratorAdded", aggregateId: "doc-1", userId: "bob",   role: "editor",  occurredAt: 1001 },
  { kind: "CollaboratorAdded", aggregateId: "doc-1", userId: "carol", role: "viewer",  occurredAt: 1002 },
  { kind: "DocumentRenamed",   aggregateId: "doc-1", newTitle: "Hello TypeScript",     occurredAt: 1003 },
  { kind: "CollaboratorRemoved", aggregateId: "doc-1", userId: "carol",               occurredAt: 1004 },
  { kind: "DocumentPublished", aggregateId: "doc-1", publishedUrl: "https://example.com/doc-1", occurredAt: 1005 },
];

const log: EventLog = { aggregateId: "doc-1", events };

// ---------------------------------------------------------------------------
// Test 1 — Full replay produces correct final state
// ---------------------------------------------------------------------------
const finalState: DocumentState = replayFromSnapshot(log, documentReducer);

console.assert(finalState.title === "Hello TypeScript",      "T1a: title after rename");
console.assert(finalState.status === "published",            "T1b: status after publish");
console.assert(finalState.author === "alice",                "T1c: author preserved");
console.assert(finalState.publishedUrl === "https://example.com/doc-1", "T1d: publishedUrl set");
console.assert(finalState.collaborators.size === 1,          "T1e: carol removed, bob remains");
console.assert(finalState.collaborators.get("bob") === "editor", "T1f: bob is editor");

// ---------------------------------------------------------------------------
// Test 2 — Snapshot + partial replay gives same result
// ---------------------------------------------------------------------------
// Compact first 3 events into a snapshot, replay the rest
const [snap, trimmedLog] = compactLog(log, 3, 9999);

console.assert(snap.version === 3,                           "T2a: snapshot version = 3");
console.assert(snap.state.title === "Hello World",           "T2b: snapshot title before rename");
console.assert(trimmedLog.events.length === 3,               "T2c: trimmed log has 3 remaining events");

const stateFromSnap: DocumentState = replayFromSnapshot(trimmedLog, documentReducer, snap);
console.assert(stateFromSnap.title === "Hello TypeScript",   "T2d: title correct after partial replay");
console.assert(stateFromSnap.status === "published",         "T2e: status correct after partial replay");

// ---------------------------------------------------------------------------
// Test 3 — takeSnapshot round-trips through replayFromSnapshot
// ---------------------------------------------------------------------------
const manualSnap = takeSnapshot("doc-1", finalState, events.length, 8888);
console.assert(manualSnap.aggregateId === "doc-1",           "T3a: aggregateId preserved");
console.assert(manualSnap.version === events.length,         "T3b: version equals event count");
console.assert(manualSnap.takenAt === 8888,                  "T3c: takenAt preserved");

// Replaying an empty log from a full snapshot should return snapshot state
const emptyLog: EventLog = { aggregateId: "doc-1", events: [] };
const fromFull: DocumentState = replayFromSnapshot(emptyLog, documentReducer, manualSnap);
console.assert(fromFull.title === "Hello TypeScript",        "T3d: replay from full snapshot returns snap state");

// ---------------------------------------------------------------------------
// Test 4 — collaboratorProjection via runProjection
// ---------------------------------------------------------------------------
const summary: CollaboratorSummary = runProjection(log, collaboratorProjection);

console.assert(summary.totalAdded   === 2, "T4a: 2 collaborators added");
console.assert(summary.totalRemoved === 1, "T4b: 1 collaborator removed");
console.assert(summary.currentCount === 1, "T4c: net 1 collaborator");

// ---------------------------------------------------------------------------
// Test 5 — RangeError on empty log with no snapshot
// ---------------------------------------------------------------------------
let threw = false;
try { replayFromSnapshot(emptyLog, documentReducer); } catch (e) { threw = e instanceof RangeError; }
console.assert(threw, "T5: RangeError on empty log + no snapshot");

console.log("All assertions passed ✓");
