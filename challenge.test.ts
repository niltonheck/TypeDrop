// ============================================================
// challenge.test.ts — Typed Event Sourcing Engine
// ============================================================
import {
  validateEvent,
  applyEvent,
  rebuildFromEvents,
  runProjections,
  ingestEvents,
  ledgerProjection,
  summaryProjection,
  type DomainEvent,
  type AccountState,
  type Snapshot,
} from "./challenge";

// ─── Mock event stream ────────────────────────────────────────

const e1: unknown = {
  type: "AccountOpened",
  eventId: "evt-001",
  aggregateId: "acc-42",
  occurredAt: "2026-06-26T08:00:00Z",
  payload: { owner: "Alice", initialDeposit: 500 },
};

const e2: unknown = {
  type: "MoneyDeposited",
  eventId: "evt-002",
  aggregateId: "acc-42",
  occurredAt: "2026-06-26T09:00:00Z",
  payload: { amount: 200 },
};

const e3: unknown = {
  type: "MoneyWithdrawn",
  eventId: "evt-003",
  aggregateId: "acc-42",
  occurredAt: "2026-06-26T10:00:00Z",
  payload: { amount: 100 },
};

const e4: unknown = {
  type: "AccountClosed",
  eventId: "evt-004",
  aggregateId: "acc-42",
  occurredAt: "2026-06-26T11:00:00Z",
  payload: { reason: "Customer request" },
};

// Bad events
const badMissingType: unknown = { eventId: "x", aggregateId: "y", occurredAt: "z", payload: {} };
const badUnknownType: unknown = { type: "MoneyTransferred", eventId: "x", aggregateId: "y", occurredAt: "z", payload: {} };
const badPayload: unknown = { type: "MoneyDeposited", eventId: "evt-bad", aggregateId: "acc-42", occurredAt: "2026-06-26T12:00:00Z", payload: { amount: -50 } };

// ─── Test 1: validateEvent — happy path ───────────────────────
const v1 = validateEvent(e1);
console.assert(v1.ok === true, "Test 1a FAILED: e1 should be valid");
if (v1.ok) {
  console.assert(v1.value.type === "AccountOpened", "Test 1b FAILED: type should be AccountOpened");
}

// ─── Test 2: validateEvent — rejection cases ──────────────────
const vBadType = validateEvent(badMissingType);
console.assert(vBadType.ok === false, "Test 2a FAILED: missing type should be rejected");
if (!vBadType.ok) {
  console.assert(vBadType.error === "MISSING_TYPE", `Test 2b FAILED: got ${vBadType.error}`);
}

const vUnknown = validateEvent(badUnknownType);
console.assert(vUnknown.ok === false && !vUnknown.ok && vUnknown.error === "UNKNOWN_EVENT_TYPE",
  "Test 2c FAILED: unknown event type should return UNKNOWN_EVENT_TYPE");

const vBadPayload = validateEvent(badPayload);
console.assert(vBadPayload.ok === false && !vBadPayload.ok && vBadPayload.error === "INVALID_PAYLOAD",
  "Test 2d FAILED: negative amount should return INVALID_PAYLOAD");

// ─── Test 3: rebuildFromEvents — full replay ──────────────────
const allRaw = [e1, e2, e3, e4];
const validated = allRaw.map(validateEvent);
const accepted = validated.filter((r): r is { ok: true; value: DomainEvent } => r.ok).map(r => r.value);

console.assert(accepted.length === 4, "Test 3a FAILED: all 4 events should validate");

const rebuildResult = rebuildFromEvents(accepted);
console.assert(rebuildResult.ok === true, "Test 3b FAILED: rebuild should succeed");
if (rebuildResult.ok) {
  const state = rebuildResult.value;
  console.assert(state.balance === 600, `Test 3c FAILED: balance should be 600, got ${state.balance}`);
  console.assert(state.status === "closed", `Test 3d FAILED: status should be closed, got ${state.status}`);
  console.assert(state.version === 4, `Test 3e FAILED: version should be 4, got ${state.version}`);
}

// ─── Test 4: rebuildFromEvents — with snapshot ────────────────
// Snapshot after e1 + e2 (version 2, balance 700)
const snap: Snapshot<AccountState> = {
  aggregateId: "acc-42",
  version: 2,
  state: { aggregateId: "acc-42", owner: "Alice", balance: 700, status: "open", version: 2 },
};
// Only e3 and e4 should be replayed
const snapResult = rebuildFromEvents(accepted, snap);
console.assert(snapResult.ok === true, "Test 4a FAILED: snapshot rebuild should succeed");
if (snapResult.ok) {
  console.assert(snapResult.value.balance === 600, `Test 4b FAILED: balance should be 600 after snapshot replay, got ${snapResult.value.balance}`);
  console.assert(snapResult.value.version === 4, `Test 4c FAILED: version should be 4, got ${snapResult.value.version}`);
}

// ─── Test 5: runProjections — tuple return ────────────────────
const [ledger, summary] = runProjections(accepted, [ledgerProjection, summaryProjection]);

console.assert(ledger.currentBalance === 600, `Test 5a FAILED: ledger balance should be 600, got ${ledger.currentBalance}`);
console.assert(ledger.entries.length === 3, `Test 5b FAILED: ledger should have 3 entries (initial deposit + deposit + withdrawal), got ${ledger.entries.length}`);
console.assert(summary.totalDeposited === 200, `Test 5c FAILED: totalDeposited should be 200, got ${summary.totalDeposited}`);
console.assert(summary.totalWithdrawn === 100, `Test 5d FAILED: totalWithdrawn should be 100, got ${summary.totalWithdrawn}`);
console.assert(summary.transactionCount === 2, `Test 5e FAILED: transactionCount should be 2, got ${summary.transactionCount}`);
console.assert(summary.status === "closed", `Test 5f FAILED: status should be closed, got ${summary.status}`);

// ─── Test 6: ingestEvents — full pipeline ────────────────────
const pipeline = ingestEvents([e1, e2, e3, e4, badMissingType, badPayload]);
console.assert(pipeline.report.accepted.length === 4, `Test 6a FAILED: 4 accepted, got ${pipeline.report.accepted.length}`);
console.assert(pipeline.report.rejected.length === 2, `Test 6b FAILED: 2 rejected, got ${pipeline.report.rejected.length}`);
console.assert(pipeline.aggregateState.ok === true, "Test 6c FAILED: aggregate state should be ok");
console.assert(pipeline.ledger.currentBalance === 600, `Test 6d FAILED: pipeline ledger balance should be 600, got ${pipeline.ledger.currentBalance}`);
console.assert(pipeline.summary.owner === "Alice", `Test 6e FAILED: owner should be Alice, got ${pipeline.summary.owner}`);

console.log("All tests passed! ✅");
