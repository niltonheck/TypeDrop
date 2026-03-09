// ============================================================
// challenge.test.ts
// ============================================================
import {
  makeOrderId,
  StateMachine,
  buildTransitionMap,
  replayToState,
  type OrderContext,
  type Guard,
  type TransitionMap,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Fixtures ──────────────────────────────────────────────────

const orderId = makeOrderId("order-001");
const anotherOrderId = makeOrderId("order-002");

const ctx: OrderContext = {
  id: orderId,
  customerId: "cust-42",
  meta: { region: "EU", priority: "high" },
};

const ctx2: OrderContext = {
  id: anotherOrderId,
  customerId: "cust-99",
  meta: { region: "US", priority: "low" },
};

// A guard that only allows EU customers
const euOnlyGuard: Guard = (c) =>
  c.meta["region"] === "EU" ? true : "Only EU region allowed";

// A guard that always denies
const alwaysDenyGuard: Guard = (_c) => "Denied by policy";

const map: TransitionMap = buildTransitionMap({
  pending: {
    CONFIRM: { target: "confirmed", guards: [euOnlyGuard] },
    CANCEL:  { target: "cancelled" },
  },
  confirmed: {
    START_PROCESSING: { target: "processing" },
    CANCEL:           { target: "cancelled" },
  },
  processing: {
    SHIP:   { target: "shipped", guards: [alwaysDenyGuard] },
    CANCEL: { target: "cancelled" },
  },
  shipped: {
    DELIVER: { target: "delivered" },
  },
});

const machine = new StateMachine(map);

// ── Test 1: Successful transition ─────────────────────────────
const r1 = machine.transition(ctx, "pending", "CONFIRM");
assert(r1.ok === true, "T1 – EU order: CONFIRM from pending → confirmed succeeds");
assert(
  r1.ok && r1.newState === "confirmed",
  "T1 – newState is 'confirmed'",
);

// ── Test 2: Guard denial ──────────────────────────────────────
const r2 = machine.transition(ctx2, "pending", "CONFIRM");
assert(r2.ok === false, "T2 – non-EU order: CONFIRM guard should deny");
assert(
  !r2.ok && r2.reason === "guard_denied",
  "T2 – failure reason is 'guard_denied'",
);

// ── Test 3: Invalid transition (no definition) ────────────────
const r3 = machine.transition(ctx, "delivered", "CONFIRM");
assert(r3.ok === false, "T3 – CONFIRM from delivered is invalid");
assert(
  !r3.ok && r3.reason === "invalid_transition",
  "T3 – failure reason is 'invalid_transition'",
);

// ── Test 4: Audit log accumulates correctly ───────────────────
const log = machine.getAuditLog();
assert(log.length === 3, "T4 – audit log has 3 entries after 3 transitions");
assert(log[0].kind === "transition",       "T4 – entry 0 is a successful transition");
assert(log[1].kind === "guard_denied",     "T4 – entry 1 is a guard_denied");
assert(log[2].kind === "invalid_transition","T4 – entry 2 is an invalid_transition");

// ── Test 5: getAuditLogFor filters by orderId ─────────────────
const logForOrder1 = machine.getAuditLogFor(orderId);
const logForOrder2 = machine.getAuditLogFor(anotherOrderId);
assert(logForOrder1.length === 2, "T5 – order-001 has 2 audit entries (T1 + T3)");
assert(logForOrder2.length === 1, "T5 – order-002 has 1 audit entry (T2)");

// ── Test 6: replayToState summary ────────────────────────────
const machine2 = new StateMachine(map);
const summary = replayToState(
  machine2,
  ctx, // EU region — passes euOnlyGuard
  "pending",
  ["CONFIRM", "START_PROCESSING", "SHIP", "DELIVER"], // SHIP will be denied by alwaysDenyGuard
);
assert(summary.finalState === "processing", "T6 – replay stops advancing after SHIP is denied");
assert(summary.succeeded === 2,             "T6 – 2 transitions succeeded (CONFIRM + START_PROCESSING)");
assert(summary.failed.guard_denied === 1,   "T6 – 1 guard_denied failure (SHIP)");
assert(summary.failed.invalid_transition === 0, "T6 – 0 invalid_transition failures");

// ── Test 7: Transition without guards succeeds unconditionally ─
const machine3 = new StateMachine(map);
const r7 = machine3.transition(ctx, "pending", "CANCEL");
assert(r7.ok === true,                     "T7 – CANCEL from pending has no guards, always succeeds");
assert(r7.ok && r7.newState === "cancelled","T7 – newState is 'cancelled'");
