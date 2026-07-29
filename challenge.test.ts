// challenge.test.ts
import {
  OrderStateMachine,
  createOrderMachine,
  type TransitionKey,
  type FromState,
  type ToState,
  type LegalTransitionsFrom,
  type PayloadFor,
  type OrderTransitions,
} from "./challenge";

// ─── Type-level assertions (compile-time checks) ──────────────────────────────

// FromState / ToState inference
type _F1 = FromState<"pending->paid">;          // should be "pending"
type _T1 = ToState<"pending->paid">;            // should be "paid"
type _F2 = FromState<"shipped->delivered">;     // should be "shipped"
type _T2 = ToState<"delivered->refunded">;      // should be "refunded"

// LegalTransitionsFrom narrows correctly
type _LegalFromPaid = LegalTransitionsFrom<"paid">;
// Expected: "paid->processing" | "paid->cancelled"
const _legalCheck: _LegalFromPaid = "paid->processing"; // must compile
// @ts-expect-error — "pending->paid" is NOT legal from "paid"
const _illegalCheck: _LegalFromPaid = "pending->paid";

// PayloadFor carries correct shape
type _PP = PayloadFor<"shipped->delivered">;
const _pp: _PP = { deliveredAt: "2026-07-29T10:00:00Z" }; // must compile
// @ts-expect-error — missing required field
const _ppBad: _PP = {};

// ─── Runtime tests ────────────────────────────────────────────────────────────

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅  ${message}`);
      passed++;
    } else {
      console.error(`  ❌  ${message}`);
      failed++;
    }
  }

  // ── Test 1: Basic happy-path transition ──────────────────────────────────
  console.log("\nTest 1 — happy-path transition (pending → paid)");
  {
    const machine = createOrderMachine("pending", {
      orderId: "ORD-001",
      totalCents: 4999,
      customerId: "USR-42",
    });

    assert(machine.getState() === "pending", "initial state is 'pending'");

    const result = await machine.transition("pending->paid", {
      paymentRef: "PAY-XYZ",
    });

    assert(result.ok === true, "transition returns ok:true");
    if (result.ok) {
      assert(result.from === "pending", "result.from is 'pending'");
      assert(result.to === "paid", "result.to is 'paid'");
    }
    assert(machine.getState() === "paid", "machine state updated to 'paid'");
  }

  // ── Test 2: Guard rejection ──────────────────────────────────────────────
  console.log("\nTest 2 — guard rejection");
  {
    const machine = createOrderMachine(
      "pending",
      { orderId: "ORD-002", totalCents: 100, customerId: "USR-7" },
      {
        "pending->paid": {
          guard: ({ payload }) => payload.paymentRef.startsWith("PAY-"),
        },
      }
    );

    const rejected = await machine.transition("pending->paid", {
      paymentRef: "INVALID-REF",
    });

    assert(rejected.ok === false, "guard-rejected transition returns ok:false");
    if (!rejected.ok) {
      assert(
        rejected.reason === "guard_rejected",
        "reason is 'guard_rejected'"
      );
    }
    assert(
      machine.getState() === "pending",
      "state unchanged after guard rejection"
    );
  }

  // ── Test 3: Wrong current state ──────────────────────────────────────────
  console.log("\nTest 3 — wrong current state");
  {
    const machine = createOrderMachine("processing", {
      orderId: "ORD-003",
      totalCents: 2000,
      customerId: "USR-9",
    });

    // Machine is in "processing" but we attempt a "pending->paid" transition
    const result = await machine.transition("pending->paid", {
      paymentRef: "PAY-ABC",
    });

    assert(result.ok === false, "wrong-state transition returns ok:false");
    if (!result.ok) {
      assert(result.reason === "wrong_state", "reason is 'wrong_state'");
    }
  }

  // ── Test 4: Effects fire in order ────────────────────────────────────────
  console.log("\nTest 4 — effects fire in order");
  {
    const log: string[] = [];

    const machine = createOrderMachine(
      "paid",
      { orderId: "ORD-004", totalCents: 7500, customerId: "USR-55" },
      {
        "paid->processing": {
          effects: [
            async () => { log.push("effect-1"); },
            async () => { log.push("effect-2"); },
          ],
        },
      }
    );

    await machine.transition("paid->processing", {});

    assert(
      log.join(",") === "effect-1,effect-2",
      "effects fired in declaration order"
    );
  }

  // ── Test 5: availableTransitions & canTransition ─────────────────────────
  console.log("\nTest 5 — availableTransitions & canTransition");
  {
    const machine = createOrderMachine("shipped", {
      orderId: "ORD-005",
      totalCents: 3300,
      customerId: "USR-99",
    });

    const available = machine.availableTransitions();
    assert(
      available.includes("shipped->delivered") &&
        available.includes("shipped->cancelled"),
      "availableTransitions returns correct keys for 'shipped'"
    );
    assert(
      !available.includes("pending->paid" as TransitionKey),
      "availableTransitions excludes keys from other states"
    );

    const canDeliver = machine.canTransition("shipped->delivered", {
      deliveredAt: "2026-07-29T12:00:00Z",
    });
    assert(canDeliver === true, "canTransition returns true for legal transition");

    const canPay = machine.canTransition("pending->paid", {
      paymentRef: "PAY-ZZZ",
    });
    assert(canPay === false, "canTransition returns false for wrong-state key");
  }

  // ── Test 6: Full lifecycle with context mutation ──────────────────────────
  console.log("\nTest 6 — full lifecycle pending→paid→processing→shipped→delivered");
  {
    const machine = createOrderMachine("pending", {
      orderId: "ORD-006",
      totalCents: 9999,
      customerId: "USR-1",
    });

    await machine.transition("pending->paid", { paymentRef: "PAY-1" });
    await machine.transition("paid->processing", {});
    await machine.transition("processing->shipped", {
      trackingNumber: "TRACK-001",
      carrier: "FedEx",
    });
    const final = await machine.transition("shipped->delivered", {
      deliveredAt: "2026-07-29T18:00:00Z",
    });

    assert(machine.getState() === "delivered", "reached 'delivered' state");
    assert(
      machine.getContext().lastTransitionAt !== "",
      "lastTransitionAt is populated"
    );
    assert(final.ok === true, "final transition ok:true");
  }

  console.log(`\n${passed} passed, ${failed} failed.\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
