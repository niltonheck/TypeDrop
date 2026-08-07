// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts  —  Typed Event Emitter State Machine
// Run with:  npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  OrderStateMachine,
  type TransitionEvent,
  type OrderState,
  type EventMap,
} from "./challenge";

// ── helpers ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// ── Test 1: happy-path transition ─────────────────────────────────────────────
console.log("\nTest 1 — legal transition emits correctly");
{
  const machine = new OrderStateMachine("order-001", "pending");

  const received: TransitionEvent<OrderState, OrderState>[] = [];

  machine.on("pending:confirmed", (e) => received.push(e));

  const result = machine.transition("confirmed");

  assert(machine.getState() === "confirmed",       "state updated to confirmed");
  assert(result.kind === "transition",             "returned event kind is 'transition'");
  assert(received.length === 1,                    "listener was called once");
  assert(received[0]?.kind === "transition",       "listener received 'transition' event");
  // @ts-expect-error  — 'to' only exists on the transition variant; narrow first
  // (this line is intentionally left as a type-level breadcrumb for the solver)
}

// ── Test 2: illegal transition emits error, state unchanged ───────────────────
console.log("\nTest 2 — illegal transition emits error event");
{
  const machine = new OrderStateMachine("order-002", "pending");

  const errors: TransitionEvent<OrderState, OrderState>[] = [];
  machine.on("pending:delivered", (e) => errors.push(e));

  const result = machine.transition("delivered");

  assert(machine.getState() === "pending",         "state unchanged after illegal transition");
  assert(result.kind === "error",                  "returned event kind is 'error'");
  assert(errors.length === 1,                      "error listener was called");
  assert(errors[0]?.kind === "error",              "listener received 'error' event");
}

// ── Test 3: noop transition (same state) ──────────────────────────────────────
console.log("\nTest 3 — noop when transitioning to current state");
{
  const machine = new OrderStateMachine("order-003", "shipped");

  const noops: TransitionEvent<OrderState, OrderState>[] = [];
  machine.on("shipped:shipped", (e) => noops.push(e));

  const result = machine.transition("shipped");

  assert(machine.getState() === "shipped",         "state unchanged for noop");
  assert(result.kind === "noop",                   "returned event kind is 'noop'");
  assert(noops.length === 1,                       "noop listener was called");
}

// ── Test 4: chained transitions & multiple listeners ─────────────────────────
console.log("\nTest 4 — chained transitions, multi-listener, off() removal");
{
  const machine = new OrderStateMachine("order-004", "pending");

  const log: string[] = [];

  const listenerA = (e: TransitionEvent<OrderState, OrderState>) =>
    log.push(`A:${e.kind}`);
  const listenerB = (e: TransitionEvent<OrderState, OrderState>) =>
    log.push(`B:${e.kind}`);

  machine
    .on("pending:confirmed", listenerA)
    .on("pending:confirmed", listenerB)
    .off("pending:confirmed", listenerA);  // remove A before firing

  machine.transition("confirmed");

  assert(log.length === 1,                         "only listenerB called after off()");
  assert(log[0] === "B:transition",                "listenerB received transition event");

  // chain to shipped
  machine.transition("shipped");
  assert(machine.getState() === "shipped",         "chained to shipped successfully");
}

// ── Test 5: terminal state rejects further transitions ────────────────────────
console.log("\nTest 5 — terminal state (delivered) rejects all transitions");
{
  const machine = new OrderStateMachine("order-005", "delivered");

  const result = machine.transition("pending");

  assert(machine.getState() === "delivered",       "state stays delivered");
  assert(result.kind === "error",                  "error returned for terminal → pending");
}

// ── Test 6: orderId is threaded through every event ──────────────────────────
console.log("\nTest 6 — orderId is present on all event kinds");
{
  const machine = new OrderStateMachine("order-006", "pending");

  const events: TransitionEvent<OrderState, OrderState>[] = [];

  machine
    .on("pending:confirmed",  (e) => events.push(e))
    .on("pending:delivered",  (e) => events.push(e))
    .on("pending:pending",    (e) => events.push(e));

  machine.transition("confirmed"); // legal   → transition
  const machine2 = new OrderStateMachine("order-006", "pending");
  machine2.on("pending:delivered", (e) => events.push(e));
  machine2.transition("delivered"); // illegal → error
  const machine3 = new OrderStateMachine("order-006", "pending");
  machine3.on("pending:pending", (e) => events.push(e));
  machine3.transition("pending");  // noop    → noop

  assert(events.length === 3,                      "three events total");
  assert(events.every((e) => e.orderId === "order-006"), "orderId present on all events");
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
if (failed > 0) process.exit(1);
