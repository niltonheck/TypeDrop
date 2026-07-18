// challenge.test.ts
import { EventEmitter, DashboardEventMap } from "./challenge";

const emitter = new EventEmitter<DashboardEventMap>();

// ── Test 1: on() + emit() calls the listener with the correct payload ────────
let lastUserId = "";
const loginHandler = (payload: DashboardEventMap["userLoggedIn"]) => {
  lastUserId = payload.userId;
};
emitter.on("userLoggedIn", loginHandler);
const hadListeners = emitter.emit("userLoggedIn", { userId: "u-42", timestamp: Date.now() });
console.assert(hadListeners === true, "Test 1a FAILED: emit should return true when listeners exist");
console.assert(lastUserId === "u-42", `Test 1b FAILED: expected userId 'u-42', got '${lastUserId}'`);

// ── Test 2: off() removes the listener ──────────────────────────────────────
emitter.off("userLoggedIn", loginHandler);
lastUserId = "";
const noListeners = emitter.emit("userLoggedIn", { userId: "u-99", timestamp: Date.now() });
console.assert(noListeners === false, "Test 2a FAILED: emit should return false when no listeners");
console.assert(lastUserId === "", `Test 2b FAILED: off() did not remove the listener`);

// ── Test 3: once() fires exactly one time ───────────────────────────────────
let onceCallCount = 0;
emitter.once("metricUpdated", (_payload) => { onceCallCount++; });
emitter.emit("metricUpdated", { metricName: "cpu", value: 55 });
emitter.emit("metricUpdated", { metricName: "cpu", value: 60 });
console.assert(onceCallCount === 1, `Test 3 FAILED: once() listener fired ${onceCallCount} times, expected 1`);

// ── Test 4: listenerCount() returns accurate counts ─────────────────────────
const h1 = (_p: DashboardEventMap["alertTriggered"]) => {};
const h2 = (_p: DashboardEventMap["alertTriggered"]) => {};
emitter.on("alertTriggered", h1);
emitter.on("alertTriggered", h2);
console.assert(emitter.listenerCount("alertTriggered") === 2, `Test 4a FAILED: expected 2 listeners, got ${emitter.listenerCount("alertTriggered")}`);
emitter.off("alertTriggered", h1);
console.assert(emitter.listenerCount("alertTriggered") === 1, `Test 4b FAILED: expected 1 listener after off(), got ${emitter.listenerCount("alertTriggered")}`);

// ── Test 5: chaining — on().on().emit() ─────────────────────────────────────
let closeCodes: number[] = [];
emitter
  .on("connectionClosed", (p) => { closeCodes.push(p.code); })
  .on("connectionClosed", (p) => { closeCodes.push(p.code * 2); });
emitter.emit("connectionClosed", { code: 1001 });
console.assert(closeCodes.length === 2, `Test 5a FAILED: expected 2 entries, got ${closeCodes.length}`);
console.assert(closeCodes[0] === 1001 && closeCodes[1] === 2002, `Test 5b FAILED: unexpected closeCodes values: ${JSON.stringify(closeCodes)}`);

console.log("All tests passed! ✅");
