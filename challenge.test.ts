// challenge.test.ts
import { createEventBus, type SubscriptionToken, type EventName } from "./challenge";

const bus = createEventBus();
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

// ── Test 1: basic on + emit ───────────────────────────────────────────────────
{
  const received: { userId: string; x: number; y: number }[] = [];
  bus.on("cursor:move", (p) => received.push(p));
  const count = bus.emit("cursor:move", { userId: "u1", x: 10, y: 20 });

  assert("emit returns handler count (1)", count === 1);
  assert("handler receives correct payload", received.length === 1 &&
    received[0].userId === "u1" && received[0].x === 10 && received[0].y === 20);
}

// ── Test 2: listenerCount ─────────────────────────────────────────────────────
{
  const bus2 = createEventBus();
  assert("listenerCount is 0 before any subscription", bus2.listenerCount("user:join") === 0);
  bus2.on("user:join", (_p) => {});
  bus2.on("user:join", (_p) => {});
  assert("listenerCount reflects two subscriptions", bus2.listenerCount("user:join") === 2);
}

// ── Test 3: off removes handler ───────────────────────────────────────────────
{
  const bus3 = createEventBus();
  const calls: string[] = [];
  const token = bus3.on("user:leave", (p) => calls.push(p.userId));
  bus3.emit("user:leave", { userId: "u2" });
  const removed = bus3.off(token);
  bus3.emit("user:leave", { userId: "u3" });

  assert("off returns true for valid token", removed === true);
  assert("handler not called after off", calls.length === 1 && calls[0] === "u2");
  assert("listenerCount drops to 0 after off", bus3.listenerCount("user:leave") === 0);
}

// ── Test 4: off with unknown token returns false ───────────────────────────────
{
  const bus4 = createEventBus();
  const fakeToken = "not-a-real-token" as SubscriptionToken;
  assert("off returns false for unknown token", bus4.off(fakeToken) === false);
}

// ── Test 5: once fires exactly once ───────────────────────────────────────────
{
  const bus5 = createEventBus();
  let fireCount = 0;
  bus5.once("doc:save", (_p) => { fireCount++; });
  bus5.emit("doc:save", { docId: "d1", savedBy: "u1", version: 1 });
  bus5.emit("doc:save", { docId: "d1", savedBy: "u1", version: 2 });
  bus5.emit("doc:save", { docId: "d1", savedBy: "u1", version: 3 });

  assert("once handler fires exactly once across multiple emits", fireCount === 1);
  assert("listenerCount is 0 after once fires", bus5.listenerCount("doc:save") === 0);
}

// ── Test 6: once token can be cancelled before firing ─────────────────────────
{
  const bus6 = createEventBus();
  let fireCount = 0;
  const token = bus6.once("doc:edit", (_p) => { fireCount++; });
  bus6.off(token);
  bus6.emit("doc:edit", { userId: "u1", delta: "+hello", timestamp: 1000 });

  assert("once handler not called after off before first fire", fireCount === 0);
}

// ── Test 7: multiple handlers for same event, invocation order ────────────────
{
  const bus7 = createEventBus();
  const order: number[] = [];
  bus7.on("user:join", (_p) => order.push(1));
  bus7.on("user:join", (_p) => order.push(2));
  bus7.on("user:join", (_p) => order.push(3));
  const count = bus7.emit("user:join", { userId: "u4", displayName: "Alice" });

  assert("all handlers invoked", count === 3);
  assert("handlers invoked in subscription order", JSON.stringify(order) === "[1,2,3]");
}

// ── Test 8: tokens are unique ─────────────────────────────────────────────────
{
  const bus8 = createEventBus();
  const tokens = new Set<string>();
  for (let i = 0; i < 20; i++) {
    tokens.add(bus8.on("cursor:move", (_p) => {}));
  }
  assert("all 20 subscription tokens are unique", tokens.size === 20);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} assertions.`);
if (failed > 0) process.exit(1);
