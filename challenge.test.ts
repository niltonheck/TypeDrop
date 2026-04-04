// ============================================================
// challenge.test.ts
// ============================================================
import {
  applyTransition,
  runWorkflow,
  summariseMachine,
  STATE_NAMES,
  type MachineContext,
  type OrderState,
  type TransitionInput,
  type WorkflowSummary,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Mock data ─────────────────────────────────────────────────
const INITIAL = { orderId: "ORD-001", placedAt: "2026-04-04T08:00:00Z" };

const HAPPY_PATH: readonly TransitionInput[] = [
  {
    targetState: "confirmed",
    payload: { orderId: "ORD-001", confirmedAt: "2026-04-04T08:05:00Z", warehouseId: "WH-7" },
    at: "2026-04-04T08:05:00Z",
  },
  {
    targetState: "picking",
    payload: { orderId: "ORD-001", assignedTo: "alice", startedAt: "2026-04-04T09:00:00Z" },
    at: "2026-04-04T09:00:00Z",
  },
  {
    targetState: "packed",
    payload: { orderId: "ORD-001", packedAt: "2026-04-04T10:00:00Z", boxCount: 3 },
    at: "2026-04-04T10:00:00Z",
  },
  {
    targetState: "shipped",
    payload: { orderId: "ORD-001", trackingCode: "TRK-999", shippedAt: "2026-04-04T11:00:00Z" },
    at: "2026-04-04T11:00:00Z",
  },
  {
    targetState: "delivered",
    payload: { orderId: "ORD-001", deliveredAt: "2026-04-04T15:00:00Z", signature: "Bob" },
    at: "2026-04-04T15:00:00Z",
  },
];

// ── Test 1: Happy-path workflow reaches "delivered" ───────────
const happyResult = runWorkflow(INITIAL, HAPPY_PATH);
assert(happyResult.ok === true, "Happy path: result is ok");
if (happyResult.ok) {
  assert(
    happyResult.value.current.kind === "delivered",
    "Happy path: final state is 'delivered'"
  );
  assert(
    happyResult.value.log.length === 5,
    "Happy path: audit log has 5 entries"
  );
}

// ── Test 2: Illegal transition is rejected ────────────────────
const illegalTransitions: readonly TransitionInput[] = [
  {
    targetState: "shipped", // skips confirmed → picking → packed
    payload: { orderId: "ORD-001", trackingCode: "TRK-X", shippedAt: "2026-04-04T08:10:00Z" },
    at: "2026-04-04T08:10:00Z",
  },
];
const illegalResult = runWorkflow(INITIAL, illegalTransitions);
assert(illegalResult.ok === false, "Illegal transition: result is not ok");
if (!illegalResult.ok) {
  assert(
    illegalResult.error.kind === "illegal_transition",
    "Illegal transition: error kind is 'illegal_transition'"
  );
}

// ── Test 3: Unknown target state is rejected ──────────────────
const unknownTransition: readonly TransitionInput[] = [
  {
    targetState: "exploded", // not a real state
    payload: {},
    at: "2026-04-04T08:01:00Z",
  },
];
const unknownResult = runWorkflow(INITIAL, unknownTransition);
assert(unknownResult.ok === false, "Unknown state: result is not ok");
if (!unknownResult.ok) {
  assert(
    unknownResult.error.kind === "unknown_state",
    "Unknown state: error kind is 'unknown_state'"
  );
}

// ── Test 4: Missing payload fields are reported ───────────────
const missingFieldTransitions: readonly TransitionInput[] = [
  {
    targetState: "confirmed",
    payload: { orderId: "ORD-001" }, // missing confirmedAt and warehouseId
    at: "2026-04-04T08:05:00Z",
  },
];
const missingResult = runWorkflow(INITIAL, missingFieldTransitions);
assert(missingResult.ok === false, "Missing payload: result is not ok");
if (!missingResult.ok) {
  assert(
    missingResult.error.kind === "invalid_payload",
    "Missing payload: error kind is 'invalid_payload'"
  );
  if (missingResult.error.kind === "invalid_payload") {
    assert(
      missingResult.error.missing.length === 2,
      "Missing payload: reports exactly 2 missing fields (confirmedAt, warehouseId)"
    );
  }
}

// ── Test 5: summariseMachine produces correct counts ─────────
if (happyResult.ok) {
  const summary: WorkflowSummary = summariseMachine(happyResult.value);
  assert(
    summary.totalTransitions === 5,
    "Summary: totalTransitions is 5"
  );
  assert(
    summary.finalState === "delivered",
    "Summary: finalState is 'delivered'"
  );
  assert(
    summary.latestTimestamp === "2026-04-04T15:00:00Z",
    "Summary: latestTimestamp is the delivered timestamp"
  );
  // Every state that was entered should have count ≥ 1 in the summary
  const enteredStates: Array<string> = ["confirmed", "picking", "packed", "shipped", "delivered"];
  const allCounted = enteredStates.every(
    (s) => summary.transitionCounts[s as keyof typeof summary.transitionCounts] >= 1
  );
  assert(allCounted, "Summary: all entered states have a transition count ≥ 1");
}
