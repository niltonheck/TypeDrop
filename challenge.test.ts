// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// Run with: npx ts-node --esm challenge.test.ts   OR   npx tsx challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  TypedEventEmitter,
  type AppEvent,
  type EventMap,
  type Listener,
} from "./challenge";

// ─── Mock data ───────────────────────────────────────────────────────────────

const assignedEvent = {
  type: "task:assigned" as const,
  taskId: "task-1",
  assigneeId: "user-42",
  dueDate: "2026-09-01",
} satisfies AppEvent;

const commentEvent = {
  type: "comment:posted" as const,
  taskId: "task-1",
  authorId: "user-7",
  body: "Looks good to me!",
} satisfies AppEvent;

const statusEvent = {
  type: "status:changed" as const,
  taskId: "task-1",
  from: "todo",
  to: "in-progress",
} satisfies AppEvent;

// ─── Tests ───────────────────────────────────────────────────────────────────

const emitter = new TypedEventEmitter();

// Test 1 — on() registers a listener and emit() calls it with the correct payload
let receivedAssignee = "";
const onAssigned: Listener<"task:assigned"> = (e) => {
  receivedAssignee = e.assigneeId; // TypeScript must know e is TaskAssignedEvent
};
emitter.on("task:assigned", onAssigned);
emitter.emit(assignedEvent);
console.assert(
  receivedAssignee === "user-42",
  `Test 1 FAILED: expected "user-42", got "${receivedAssignee}"`
);
console.log("Test 1 passed — emit delivers payload to correct listener");

// Test 2 — listeners for different event types are independent
let commentCount = 0;
emitter.on("comment:posted", (e) => {
  commentCount++;
  console.assert(
    e.body === "Looks good to me!",
    "Test 2a FAILED: wrong comment body"
  );
});
emitter.emit(commentEvent);
emitter.emit(assignedEvent); // should NOT trigger comment listener
console.assert(
  commentCount === 1,
  `Test 2 FAILED: expected commentCount 1, got ${commentCount}`
);
console.log("Test 2 passed — event isolation between different types");

// Test 3 — off() removes the listener; subsequent emit does NOT call it
emitter.off("task:assigned", onAssigned);
receivedAssignee = ""; // reset
emitter.emit(assignedEvent);
console.assert(
  receivedAssignee === "",
  `Test 3 FAILED: listener should have been removed, but receivedAssignee="${receivedAssignee}"`
);
console.log("Test 3 passed — off() correctly removes listener");

// Test 4 — listenerCount() reflects current registrations accurately
const emitter2 = new TypedEventEmitter();
console.assert(
  emitter2.listenerCount("status:changed") === 0,
  "Test 4a FAILED: expected 0 listeners on fresh emitter"
);
emitter2.on("status:changed", (e) => void e.to);
emitter2.on("status:changed", (e) => void e.from);
console.assert(
  emitter2.listenerCount("status:changed") === 2,
  `Test 4b FAILED: expected 2, got ${emitter2.listenerCount("status:changed")}`
);
console.log("Test 4 passed — listenerCount() is accurate");

// Test 5 — multiple listeners for the same event all fire
const emitter3 = new TypedEventEmitter();
let fireCount = 0;
emitter3.on("status:changed", () => fireCount++);
emitter3.on("status:changed", () => fireCount++);
emitter3.on("status:changed", () => fireCount++);
emitter3.emit(statusEvent);
console.assert(
  fireCount === 3,
  `Test 5 FAILED: expected 3 fires, got ${fireCount}`
);
console.log("Test 5 passed — all registered listeners fire on emit()");

console.log("\n✅ All tests passed!");
