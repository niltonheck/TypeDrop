// ============================================================
// challenge.test.ts
// ============================================================
import {
  createOrderMachine,
  OrderContext,
  StateMachine,
  TransitionResult,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock initial context
// ---------------------------------------------------------------------------
const baseContext: OrderContext = {
  orderId: "ORD-2026-001",
  totalAmount: 149.99,
  paymentAttempts: 0,
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function assertOk(result: TransitionResult, label: string): void {
  console.assert(result.ok === true, `[FAIL] ${label} — expected ok:true, got ok:false`);
}

function assertFail(
  result: TransitionResult,
  reason: "NO_TRANSITION" | "GUARD_FAILED",
  label: string
): void {
  console.assert(result.ok === false, `[FAIL] ${label} — expected ok:false`);
  if (!result.ok) {
    console.assert(
      result.reason === reason,
      `[FAIL] ${label} — expected reason "${reason}", got "${result.reason}"`
    );
  }
}

// ---------------------------------------------------------------------------
// Test 1: Happy-path order lifecycle
// ---------------------------------------------------------------------------
(function testHappyPath() {
  const machine = createOrderMachine({ ...baseContext });

  assertOk(machine.send("SUBMIT_PAYMENT"), "T1.1 pending→payment_processing");
  assertOk(machine.send("PAYMENT_SUCCESS"), "T1.2 payment_processing→paid");
  assertOk(machine.send("START_PREPARING"), "T1.3 paid→preparing");
  assertOk(machine.send("SHIP"), "T1.4 preparing→shipped");
  assertOk(machine.send("DELIVER"), "T1.5 shipped→delivered");

  const snap = machine.snapshot();
  console.assert(snap.state === "delivered", `[FAIL] T1.6 final state should be "delivered", got "${snap.state}"`);
  console.assert(
    snap.context.paymentRef === "PAY-OK",
    `[FAIL] T1.7 paymentRef should be "PAY-OK", got "${snap.context.paymentRef}"`
  );
  console.assert(
    snap.context.trackingNumber === "TRACK-001",
    `[FAIL] T1.8 trackingNumber should be "TRACK-001", got "${snap.context.trackingNumber}"`
  );

  console.log("✅ Test 1 passed: happy-path lifecycle");
})();

// ---------------------------------------------------------------------------
// Test 2: Invalid event returns NO_TRANSITION
// ---------------------------------------------------------------------------
(function testNoTransition() {
  const machine = createOrderMachine({ ...baseContext });
  // In "pending" state, SHIP is not valid
  assertFail(machine.send("SHIP"), "NO_TRANSITION", "T2.1 SHIP in pending state");
  // Also DELIVER
  assertFail(machine.send("DELIVER"), "NO_TRANSITION", "T2.2 DELIVER in pending state");

  console.log("✅ Test 2 passed: NO_TRANSITION for invalid events");
})();

// ---------------------------------------------------------------------------
// Test 3: Payment retry cap guard
// ---------------------------------------------------------------------------
(function testPaymentRetryGuard() {
  const machine = createOrderMachine({ ...baseContext });

  machine.send("SUBMIT_PAYMENT"); // → payment_processing

  // Fail once (attempts becomes 1) → allowed
  assertOk(machine.send("PAYMENT_FAILED"), "T3.1 first PAYMENT_FAILED (attempts=0→1)");
  // Back to pending; try again
  machine.send("SUBMIT_PAYMENT");
  // Fail twice (attempts becomes 2) → allowed
  assertOk(machine.send("PAYMENT_FAILED"), "T3.2 second PAYMENT_FAILED (attempts=1→2)");
  machine.send("SUBMIT_PAYMENT");
  // Fail three times (attempts becomes 3) → guard: attempts < 3 → 2 < 3 → allowed
  assertOk(machine.send("PAYMENT_FAILED"), "T3.3 third PAYMENT_FAILED (attempts=2→3)");
  machine.send("SUBMIT_PAYMENT");
  // Now attempts === 3, guard fails → GUARD_FAILED
  assertFail(machine.send("PAYMENT_FAILED"), "GUARD_FAILED", "T3.4 fourth PAYMENT_FAILED blocked by guard");

  console.log("✅ Test 3 passed: payment retry cap guard");
})();

// ---------------------------------------------------------------------------
// Test 4: `can()` reflects valid events from current state
// ---------------------------------------------------------------------------
(function testCanMethod() {
  const machine = createOrderMachine({ ...baseContext });

  const snap = machine.snapshot(); // state = "pending"
  console.assert(snap.can("SUBMIT_PAYMENT") === true, "[FAIL] T4.1 can SUBMIT_PAYMENT in pending");
  console.assert(snap.can("SHIP") === false, "[FAIL] T4.2 cannot SHIP in pending");
  console.assert(snap.can("CANCEL") === true, "[FAIL] T4.3 can CANCEL in pending");

  console.log("✅ Test 4 passed: can() reflects valid transitions");
})();

// ---------------------------------------------------------------------------
// Test 5: Refund guard (totalAmount > 0)
// ---------------------------------------------------------------------------
(function testRefundGuard() {
  // Machine with zero-value order
  const zeroCtx: OrderContext = { ...baseContext, totalAmount: 0 };
  const machine = createOrderMachine(zeroCtx);

  machine.send("SUBMIT_PAYMENT");
  machine.send("PAYMENT_SUCCESS");
  machine.send("START_PREPARING");
  machine.send("SHIP");
  machine.send("DELIVER");

  // totalAmount === 0 → guard fails
  assertFail(machine.send("REFUND"), "GUARD_FAILED", "T5.1 REFUND blocked when totalAmount=0");

  // Machine with positive amount
  const machine2 = createOrderMachine({ ...baseContext });
  machine2.send("SUBMIT_PAYMENT");
  machine2.send("PAYMENT_SUCCESS");
  machine2.send("START_PREPARING");
  machine2.send("SHIP");
  machine2.send("DELIVER");
  assertOk(machine2.send("REFUND"), "T5.2 REFUND allowed when totalAmount>0");

  console.log("✅ Test 5 passed: refund guard");
})();
