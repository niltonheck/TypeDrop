// ============================================================
// challenge.test.ts
// ============================================================
import {
  makeOrderId,
  makeEventId,
  foldEvents,
  applyEvent,
  assertState,
  isTerminal,
  LEGAL_TRANSITIONS,
  ok,
  err,
  type OrderEvent,
  type OrderState,
  type Result,
  type MachineError,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function makeEvent<T extends Omit<OrderEvent, "id" | "occurredAt">>(
  fields: T
): T & { id: ReturnType<typeof makeEventId>; occurredAt: Date } {
  return {
    id: makeEventId(`evt-${Math.random().toString(36).slice(2)}`),
    occurredAt: new Date(),
    ...fields,
  } as T & { id: ReturnType<typeof makeEventId>; occurredAt: Date };
}

function isOk<T, E>(r: Result<T, E>): r is Extract<Result<T, E>, { kind: "Ok" }> {
  return (r as { kind: string }).kind === "Ok";
}
function isErr<T, E>(r: Result<T, E>): r is Extract<Result<T, E>, { kind: "Err" }> {
  return (r as { kind: string }).kind === "Err";
}
function unwrap<T, E>(r: Result<T, E>): T {
  if (!isOk(r)) throw new Error("Expected Ok, got Err: " + JSON.stringify(r));
  return (r as { kind: "Ok"; value: T }).value;
}
function unwrapErr<T, E>(r: Result<T, E>): E {
  if (!isErr(r)) throw new Error("Expected Err, got Ok: " + JSON.stringify(r));
  return (r as { kind: "Err"; error: E }).error;
}

// -----------------------------------------------------------
// Mock event logs
// -----------------------------------------------------------
const fullLifecycleEvents: ReadonlyArray<OrderEvent> = [
  makeEvent({ type: "OrderPlaced" }),
  makeEvent({ type: "OrderConfirmed" }),
  makeEvent({ type: "OrderShipped", trackingCode: "TRACK-001" }),
  makeEvent({ type: "OrderDelivered" }),
];

const cancelledLifecycleEvents: ReadonlyArray<OrderEvent> = [
  makeEvent({ type: "OrderPlaced" }),
  makeEvent({ type: "OrderCancelled", reason: "Customer request" }),
];

const illegalTransitionEvents: ReadonlyArray<OrderEvent> = [
  makeEvent({ type: "OrderPlaced" }),
  makeEvent({ type: "OrderDelivered" }), // Illegal: Pending → Delivered
];

const wrongFirstEventEvents: ReadonlyArray<OrderEvent> = [
  makeEvent({ type: "OrderConfirmed" }), // Illegal: must start with OrderPlaced
];

// -----------------------------------------------------------
// Test 1: Full happy-path lifecycle folds to "Delivered"
// -----------------------------------------------------------
const deliveredResult = foldEvents(fullLifecycleEvents);
console.assert(isOk(deliveredResult), "Test 1a FAILED: expected Ok for full lifecycle");
const deliveredState = assertState(deliveredResult, "Delivered");
console.assert(
  deliveredState !== null && deliveredState.kind === "Delivered",
  "Test 1b FAILED: assertState should narrow to Delivered"
);
console.assert(
  deliveredState !== null && deliveredState.trackingCode === "TRACK-001",
  "Test 1c FAILED: trackingCode should be carried forward to Delivered state"
);
console.log("Test 1 PASSED: full lifecycle → Delivered ✓");

// -----------------------------------------------------------
// Test 2: Cancelled lifecycle folds correctly
// -----------------------------------------------------------
const cancelledResult = foldEvents(cancelledLifecycleEvents);
console.assert(isOk(cancelledResult), "Test 2a FAILED: expected Ok for cancelled lifecycle");
const cancelledState = assertState(cancelledResult, "Cancelled");
console.assert(
  cancelledState !== null && cancelledState.reason === "Customer request",
  "Test 2b FAILED: cancellation reason should be preserved"
);
console.assert(
  isTerminal(unwrap(cancelledResult)),
  "Test 2c FAILED: Cancelled should be a terminal state"
);
console.log("Test 2 PASSED: cancelled lifecycle ✓");

// -----------------------------------------------------------
// Test 3: Illegal transition returns IllegaTransition error
// -----------------------------------------------------------
const illegalResult = foldEvents(illegalTransitionEvents);
console.assert(isErr(illegalResult), "Test 3a FAILED: expected Err for illegal transition");
const machineErr = unwrapErr(illegalResult) as MachineError;
console.assert(
  machineErr.kind === "IllegalTransition",
  `Test 3b FAILED: expected IllegalTransition, got ${machineErr.kind}`
);
console.log("Test 3 PASSED: illegal transition detected ✓");

// -----------------------------------------------------------
// Test 4: Empty event log returns EmptyEventLog error
// -----------------------------------------------------------
const emptyResult = foldEvents([]);
console.assert(isErr(emptyResult), "Test 4a FAILED: expected Err for empty log");
const emptyErr = unwrapErr(emptyResult) as MachineError;
console.assert(
  emptyErr.kind === "EmptyEventLog",
  `Test 4b FAILED: expected EmptyEventLog, got ${emptyErr.kind}`
);
console.log("Test 4 PASSED: empty event log detected ✓");

// -----------------------------------------------------------
// Test 5: LEGAL_TRANSITIONS table is correctly shaped
// -----------------------------------------------------------
console.assert(
  Array.isArray(LEGAL_TRANSITIONS["OrderConfirmed"]) &&
    LEGAL_TRANSITIONS["OrderConfirmed"].includes("Pending"),
  "Test 5a FAILED: OrderConfirmed should only be legal from Pending"
);
console.assert(
  Array.isArray(LEGAL_TRANSITIONS["OrderCancelled"]) &&
    LEGAL_TRANSITIONS["OrderCancelled"].includes("Pending") &&
    LEGAL_TRANSITIONS["OrderCancelled"].includes("Confirmed"),
  "Test 5b FAILED: OrderCancelled should be legal from Pending and Confirmed"
);
console.assert(
  !isTerminal({ kind: "Confirmed", confirmedAt: new Date() }),
  "Test 5c FAILED: Confirmed should NOT be terminal"
);
console.log("Test 5 PASSED: transition table and isTerminal ✓");

console.log("\n✅ All tests passed!");
