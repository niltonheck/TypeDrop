// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts — run with: npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  createOrderMachine,
  StateMachine,
  StateHooks,
  OrderEvent,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const confirmEvent: OrderEvent = {
  name: "CONFIRM",
  payload: { paymentRef: "PAY-001", totalCents: 4999 },
};
const shipEvent: OrderEvent = {
  name: "SHIP",
  payload: { trackingCode: "TRK-XYZ", carrier: "FedEx" },
};
const deliverEvent: OrderEvent = {
  name: "DELIVER",
  payload: { signedBy: "Alice", deliveredAt: new Date("2026-07-19") },
};
const cancelEligible: OrderEvent = {
  name: "CANCEL",
  payload: { reason: "Changed mind", refundEligible: true },
};
const cancelIneligible: OrderEvent = {
  name: "CANCEL",
  payload: { reason: "Fraud", refundEligible: false },
};

// ── Test Suite 1: Happy path ──────────────────────────────────────────────────
console.log("\n── Suite 1: Happy path ──");
{
  const m = createOrderMachine("ORD-1");

  assert("starts in Pending", m.getState() === "Pending");
  assert("canSend CONFIRM from Pending", m.canSend("CONFIRM") === true);
  assert("canSend SHIP from Pending is false", m.canSend("SHIP") === false);

  const r1 = m.send(confirmEvent);
  assert("CONFIRM transition succeeds", r1.ok === true);
  assert("state is now Confirmed", m.getState() === "Confirmed");

  const r2 = m.send(shipEvent);
  assert("SHIP transition succeeds", r2.ok === true);
  assert("state is now Shipped", m.getState() === "Shipped");

  const r3 = m.send(deliverEvent);
  assert("DELIVER transition succeeds", r3.ok === true);
  assert("state is now Delivered", m.getState() === "Delivered");

  assert("history has 3 entries", m.history().length === 3);
  assert(
    "history[0] records Confirmed + CONFIRM event",
    m.history()[0].state === "Confirmed" &&
      m.history()[0].event.name === "CONFIRM",
  );
}

// ── Test Suite 2: Guard rejection ─────────────────────────────────────────────
console.log("\n── Suite 2: Guard rejection ──");
{
  const m = createOrderMachine("ORD-2");

  const r1 = m.send(cancelIneligible);
  assert(
    "CANCEL from Pending blocked when refundEligible=false",
    r1.ok === false && r1.reason === "GUARD_REJECTED",
  );
  assert("state unchanged after guard rejection", m.getState() === "Pending");

  const r2 = m.send(cancelEligible);
  assert("CANCEL from Pending succeeds when refundEligible=true", r2.ok === true);
  assert("state is now Cancelled", m.getState() === "Cancelled");
}

// ── Test Suite 3: No-transition rejection ─────────────────────────────────────
console.log("\n── Suite 3: No-transition rejection ──");
{
  const m = createOrderMachine("ORD-3");
  m.send(confirmEvent); // Pending → Confirmed

  const r1 = m.send(confirmEvent); // CONFIRM not valid from Confirmed
  assert(
    "CONFIRM from Confirmed returns NO_TRANSITION",
    r1.ok === false && r1.reason === "NO_TRANSITION",
  );

  const r2 = m.send(deliverEvent); // DELIVER not valid from Confirmed
  assert(
    "DELIVER from Confirmed returns NO_TRANSITION",
    r2.ok === false && r2.reason === "NO_TRANSITION",
  );
}

// ── Test Suite 4: Lifecycle hooks ─────────────────────────────────────────────
console.log("\n── Suite 4: Lifecycle hooks ──");
{
  const log: string[] = [];

  const hooks: StateHooks = {
    Pending: {
      onExit: (ctx) => log.push(`exit:${ctx.currentState}:${ctx.event.name}`),
    },
    Confirmed: {
      onEntry: (ctx) => log.push(`entry:${ctx.currentState}:${ctx.event.name}`),
      onExit:  (ctx) => log.push(`exit:${ctx.currentState}:${ctx.event.name}`),
    },
    Shipped: {
      onEntry: (ctx) => log.push(`entry:${ctx.currentState}:${ctx.event.name}`),
    },
  };

  const m = createOrderMachine("ORD-4", hooks);
  m.send(confirmEvent);
  m.send(shipEvent);

  assert(
    "exit:Pending:CONFIRM fired",
    log.includes("exit:Pending:CONFIRM"),
  );
  assert(
    "entry:Confirmed:CONFIRM fired",
    log.includes("entry:Confirmed:CONFIRM"),
  );
  assert(
    "exit:Confirmed:SHIP fired",
    log.includes("exit:Confirmed:SHIP"),
  );
  assert(
    "entry:Shipped:SHIP fired",
    log.includes("entry:Shipped:SHIP"),
  );
  assert("exactly 4 hook calls total", log.length === 4);
}

// ── Test Suite 5: History immutability ────────────────────────────────────────
console.log("\n── Suite 5: History immutability ──");
{
  const m = createOrderMachine("ORD-5");
  m.send(confirmEvent);
  const snap = m.history();
  m.send(shipEvent);
  assert(
    "snapshot length unchanged after further transitions",
    snap.length === 1,
  );
  assert("live history grew to 2", m.history().length === 2);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
if (failed > 0) process.exit(1);
