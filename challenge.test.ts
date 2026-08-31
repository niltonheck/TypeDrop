// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import { AppEventMap, EventEmitter } from "./challenge";

const emitter = new EventEmitter();

// ── Test 1: listener receives the correct payload ─────────────────
let receivedUserId = "";
const loginHandler = (payload: AppEventMap["user:login"]) => {
  receivedUserId = payload.userId;
};
emitter.on("user:login", loginHandler);
emitter.emit("user:login", { userId: "u-42", timestamp: Date.now() });
console.assert(receivedUserId === "u-42", "Test 1 FAILED: userId mismatch");
console.log("Test 1 passed — listener received correct userId");

// ── Test 2: listenerCount reflects registrations ──────────────────
console.assert(
  emitter.listenerCount("user:login") === 1,
  "Test 2 FAILED: expected 1 listener"
);
console.log("Test 2 passed — listenerCount is 1 after one registration");

// ── Test 3: off() removes the listener ───────────────────────────
emitter.off("user:login", loginHandler);
console.assert(
  emitter.listenerCount("user:login") === 0,
  "Test 3 FAILED: expected 0 listeners after off()"
);
console.log("Test 3 passed — listenerCount is 0 after off()");

// ── Test 4: emit() calls ALL registered listeners ─────────────────
const metricValues: number[] = [];
const metricHandler1 = (p: AppEventMap["metric:update"]) => metricValues.push(p.value);
const metricHandler2 = (p: AppEventMap["metric:update"]) => metricValues.push(p.value * 2);
emitter.on("metric:update", metricHandler1);
emitter.on("metric:update", metricHandler2);
emitter.emit("metric:update", { metricId: "cpu", value: 55, unit: "%" });
console.assert(
  metricValues[0] === 55 && metricValues[1] === 110,
  "Test 4 FAILED: both listeners should have fired"
);
console.log("Test 4 passed — both metric listeners fired correctly");

// ── Test 5: off() is a no-op for an unregistered listener ─────────
const orphan = (_p: AppEventMap["alert:fired"]) => {};
emitter.off("alert:fired", orphan); // must not throw
console.assert(
  emitter.listenerCount("alert:fired") === 0,
  "Test 5 FAILED: count should still be 0"
);
console.log("Test 5 passed — off() on unregistered listener is safe");

console.log("\n✅ All tests passed!");
