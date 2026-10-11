// challenge.test.ts
import {
  TypedEmitter,
  createEmitter,
  type DashboardEventMap,
  type Listener,
} from "./challenge";

// ─── helpers ─────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

// ─── Test 1: on / emit — listener receives correct payload ────────────────────
{
  const emitter = createEmitter<DashboardEventMap>();
  let captured: { userId: string; timestamp: number } | null = null;

  emitter.on("userLoggedIn", (payload) => {
    captured = payload;
  });

  emitter.emit("userLoggedIn", { userId: "u-42", timestamp: 1728604800000 });

  assert(captured !== null, "Test 1a: listener was called after emit");
  assert(
    (captured as { userId: string; timestamp: number }).userId === "u-42",
    "Test 1b: payload.userId is correct"
  );
}

// ─── Test 2: off — listener is not called after removal ───────────────────────
{
  const emitter = new TypedEmitter<DashboardEventMap>();
  let callCount = 0;

  const listener: Listener<DashboardEventMap["metricUpdated"]> = () => {
    callCount++;
  };

  emitter.on("metricUpdated", listener);
  emitter.emit("metricUpdated", { metricName: "cpu", value: 72, unit: "%" });
  emitter.off("metricUpdated", listener);
  emitter.emit("metricUpdated", { metricName: "cpu", value: 80, unit: "%" });

  assert(callCount === 1, "Test 2: listener not called after off()");
}

// ─── Test 3: once — listener fires exactly once ───────────────────────────────
{
  const emitter = createEmitter<DashboardEventMap>();
  let callCount = 0;

  emitter.once("alertTriggered", () => {
    callCount++;
  });

  emitter.emit("alertTriggered", {
    alertId: "a-1",
    severity: "high",
    message: "Disk full",
  });
  emitter.emit("alertTriggered", {
    alertId: "a-2",
    severity: "low",
    message: "CPU spike",
  });

  assert(callCount === 1, "Test 3: once() listener fires exactly once");
}

// ─── Test 4: listenerCount ────────────────────────────────────────────────────
{
  const emitter = createEmitter<DashboardEventMap>();

  const listenerA: Listener<DashboardEventMap["sessionExpired"]> = () => {};
  const listenerB: Listener<DashboardEventMap["sessionExpired"]> = () => {};

  assert(
    emitter.listenerCount("sessionExpired") === 0,
    "Test 4a: listenerCount is 0 before any on()"
  );

  emitter.on("sessionExpired", listenerA);
  emitter.on("sessionExpired", listenerB);

  assert(
    emitter.listenerCount("sessionExpired") === 2,
    "Test 4b: listenerCount is 2 after two on() calls"
  );

  emitter.off("sessionExpired", listenerA);

  assert(
    emitter.listenerCount("sessionExpired") === 1,
    "Test 4c: listenerCount is 1 after one off() call"
  );
}

// ─── Test 5: once() reduces listenerCount after first emit ────────────────────
{
  const emitter = createEmitter<DashboardEventMap>();

  emitter.once("userLoggedIn", () => {});

  assert(
    emitter.listenerCount("userLoggedIn") === 1,
    "Test 5a: listenerCount is 1 before once() fires"
  );

  emitter.emit("userLoggedIn", { userId: "u-99", timestamp: Date.now() });

  assert(
    emitter.listenerCount("userLoggedIn") === 0,
    "Test 5b: listenerCount is 0 after once() fires"
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed} passed, ${failed} failed out of ${passed + failed} assertions.`);
if (failed > 0) process.exit(1);
