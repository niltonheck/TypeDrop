// ============================================================
// challenge.test.ts — verify your TypedEmitter implementation
// ============================================================
import { createRoomEmitter, TypedEmitter, EventMap } from "./challenge";

// ── Test 1: on / emit — listener receives correct payload ────
const emitter = createRoomEmitter();
let joinedUserId = "";

emitter.on("user:joined", ({ userId, roomId, timestamp }) => {
  joinedUserId = userId;
  console.assert(roomId === "room-42", `Test 1a FAIL: expected roomId 'room-42', got '${roomId}'`);
  console.assert(typeof timestamp === "number", "Test 1b FAIL: timestamp should be a number");
});

emitter.emit("user:joined", { userId: "alice", roomId: "room-42", timestamp: Date.now() });
console.assert(joinedUserId === "alice", `Test 1c FAIL: expected 'alice', got '${joinedUserId}'`);
console.log("Test 1 PASSED: on/emit delivers correct payload");

// ── Test 2: off — listener is not called after removal ───────
const emitter2 = createRoomEmitter();
let editCount = 0;

const onEdit = (_payload: EventMap["doc:edited"]) => { editCount++; };

emitter2.on("doc:edited", onEdit);
emitter2.emit("doc:edited", { docId: "d1", delta: "+hello", authorId: "bob" });
emitter2.off("doc:edited", onEdit);
emitter2.emit("doc:edited", { docId: "d1", delta: "+world", authorId: "bob" });

console.assert(editCount === 1, `Test 2 FAIL: expected 1 call after off, got ${editCount}`);
console.log("Test 2 PASSED: off correctly removes listener");

// ── Test 3: once — fires exactly one time ────────────────────
const emitter3 = createRoomEmitter();
let cursorMoveCount = 0;

emitter3.once("cursor:moved", (_p) => { cursorMoveCount++; });
emitter3.emit("cursor:moved", { userId: "carol", x: 10, y: 20 });
emitter3.emit("cursor:moved", { userId: "carol", x: 30, y: 40 });
emitter3.emit("cursor:moved", { userId: "carol", x: 50, y: 60 });

console.assert(cursorMoveCount === 1, `Test 3 FAIL: once fired ${cursorMoveCount} times, expected 1`);
console.log("Test 3 PASSED: once fires exactly once");

// ── Test 4: multiple listeners on same event ─────────────────
const emitter4 = createRoomEmitter();
const results: string[] = [];

emitter4.on("user:joined", ({ userId }) => results.push(`A:${userId}`));
emitter4.on("user:joined", ({ userId }) => results.push(`B:${userId}`));
emitter4.emit("user:joined", { userId: "dave", roomId: "room-1", timestamp: 0 });

console.assert(results.length === 2, `Test 4a FAIL: expected 2 listeners called, got ${results.length}`);
console.assert(results.includes("A:dave") && results.includes("B:dave"), "Test 4b FAIL: wrong listener output");
console.log("Test 4 PASSED: multiple listeners on same event all fire");

// ── Test 5 (stretch): listenerCount ──────────────────────────
const emitter5 = createRoomEmitter();
const noop = (_p: EventMap["doc:edited"]) => {};

emitter5.on("doc:edited", noop);
emitter5.on("doc:edited", noop); // same ref — count depends on impl; both valid
// At minimum, at least one listener must be registered
if (typeof (emitter5 as unknown as { listenerCount: Function }).listenerCount === "function") {
  const count = (emitter5 as unknown as { listenerCount: (e: keyof EventMap) => number }).listenerCount("doc:edited");
  console.assert(count >= 1, `Test 5 FAIL: expected >= 1 listener, got ${count}`);
  console.log("Test 5 PASSED: listenerCount works");
} else {
  console.log("Test 5 SKIPPED: listenerCount not implemented (stretch goal)");
}

console.log("\nAll required tests complete!");
