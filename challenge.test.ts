// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  applyEvent,
  runMachine,
  TRANSITIONS,
  type OrderContext,
  type OrderState,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeCtx(orderId: string): OrderContext {
  return { orderId, history: [] };
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

console.log("\n=== Typed FSM Executor — Test Harness ===\n");

// ---------------------------------------------------------------------------
// Test 1: Happy-path full lifecycle
// ---------------------------------------------------------------------------
console.log("Test 1: Full happy-path lifecycle");
{
  const ctx = makeCtx("ORD-001");
  const result = runMachine(
    "Draft",
    [
      { type: "SUBMIT", paymentRef: "PAY-42" },
      { type: "ACCEPT", warehouseId: "WH-07" },
      { type: "SHIP", trackingCode: "TRK-999" },
      { type: "DELIVER", signedBy: "Alice" },
    ],
    ctx
  );

  assert(result.aborted === false, "aborted should be false");
  assert(result.finalState === "Delivered", `finalState should be Delivered, got ${result.finalState}`);
  assert(result.log.length === 4, `log should have 4 entries, got ${result.log.length}`);
  assert(result.context.paymentRef === "PAY-42", "paymentRef stored");
  assert(result.context.warehouseId === "WH-07", "warehouseId stored");
  assert(result.context.trackingCode === "TRK-999", "trackingCode stored");
  assert(result.context.signedBy === "Alice", "signedBy stored");
  assert(result.context.history.length === 4, "history should have 4 entries");
}

// ---------------------------------------------------------------------------
// Test 2: NO_TRANSITION — invalid event for state
// ---------------------------------------------------------------------------
console.log("\nTest 2: NO_TRANSITION error");
{
  const ctx = makeCtx("ORD-002");
  // Trying to SHIP from Draft — no such transition
  const result = applyEvent("Draft", { type: "SHIP", trackingCode: "TRK-X" }, ctx, TRANSITIONS);

  assert(result.ok === false, "result.ok should be false");
  if (!result.ok) {
    assert(result.reason === "NO_TRANSITION", `reason should be NO_TRANSITION, got ${result.reason}`);
    assert(result.currentState === "Draft", "currentState should be Draft");
  }
}

// ---------------------------------------------------------------------------
// Test 3: GUARD_FAILED — cancel from Processing with bad warehouseId
// ---------------------------------------------------------------------------
console.log("\nTest 3: GUARD_FAILED on Processing → Cancel");
{
  const ctx = makeCtx("ORD-003");
  ctx.warehouseId = "STORE-99"; // does NOT start with "WH-"

  const result = applyEvent(
    "Processing",
    { type: "CANCEL", reason: "Customer changed mind" },
    ctx,
    TRANSITIONS
  );

  assert(result.ok === false, "result.ok should be false");
  if (!result.ok) {
    assert(result.reason === "GUARD_FAILED", `reason should be GUARD_FAILED, got ${result.reason}`);
  }
}

// ---------------------------------------------------------------------------
// Test 4: Guard passes — cancel from Processing with valid warehouseId
// ---------------------------------------------------------------------------
console.log("\nTest 4: Guard passes — Processing → Cancelled");
{
  const ctx = makeCtx("ORD-004");
  ctx.warehouseId = "WH-12";

  const result = applyEvent(
    "Processing",
    { type: "CANCEL", reason: "Out of stock" },
    ctx,
    TRANSITIONS
  );

  assert(result.ok === true, "result.ok should be true");
  if (result.ok) {
    assert(result.nextState === "Cancelled", `nextState should be Cancelled, got ${result.nextState}`);
    assert(result.context.cancelReason === "Out of stock", "cancelReason stored");
  }
}

// ---------------------------------------------------------------------------
// Test 5: runMachine aborts on first failure, stops processing
// ---------------------------------------------------------------------------
console.log("\nTest 5: runMachine aborts on first failure");
{
  const ctx = makeCtx("ORD-005");
  const result = runMachine(
    "Draft",
    [
      { type: "SUBMIT", paymentRef: "PAY-77" },
      { type: "SHIP", trackingCode: "TRK-EARLY" }, // invalid from Submitted
      { type: "DELIVER", signedBy: "Bob" },          // should never be reached
    ],
    ctx
  );

  assert(result.aborted === true, "aborted should be true");
  assert(result.log.length === 2, `log should have 2 entries (success + fail), got ${result.log.length}`);
  assert(result.finalState === "Submitted", `finalState should remain Submitted, got ${result.finalState}`);
  assert(result.context.signedBy === undefined, "signedBy should not be set (event was never processed)");
}

console.log("\n=== Done ===\n");
