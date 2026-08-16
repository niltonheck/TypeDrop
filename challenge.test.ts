// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  TypedEmitter,
  createDocEmitter,
  replayLast,
  mergeEmitters,
  DocEventMap,
  CursorMovedPayload,
  TextEditedPayload,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅  PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌  FAIL — ${label}`);
    failed++;
  }
}

// ─── Test 1: on / emit / off ──────────────────────────────────────────────────
console.log("\nTest 1 — on / emit / off");
{
  const emitter = createDocEmitter();
  const received: CursorMovedPayload[] = [];

  const unsub = emitter.on("cursorMoved", (p) => received.push(p));

  emitter.emit("cursorMoved", { userId: "alice", line: 3, col: 10 });
  emitter.emit("cursorMoved", { userId: "bob", line: 1, col: 0 });

  assert(received.length === 2, "listener receives both emissions");
  assert(received[0].userId === "alice", "first payload is alice");
  assert(received[1].col === 0, "second payload col is 0");

  unsub();
  emitter.emit("cursorMoved", { userId: "carol", line: 5, col: 2 });
  assert(received.length === 2, "listener removed — no third call");
}

// ─── Test 2: once ─────────────────────────────────────────────────────────────
console.log("\nTest 2 — once");
{
  const emitter = createDocEmitter();
  const edits: TextEditedPayload[] = [];

  emitter.once("textEdited", (p) => edits.push(p));

  emitter.emit("textEdited", { userId: "alice", docId: "d1", delta: "+hello", timestamp: 1 });
  emitter.emit("textEdited", { userId: "bob",   docId: "d1", delta: "+world", timestamp: 2 });

  assert(edits.length === 1, "once listener fires exactly once");
  assert(edits[0].delta === "+hello", "once listener received first payload");
}

// ─── Test 3: listenerCount ────────────────────────────────────────────────────
console.log("\nTest 3 — listenerCount");
{
  const emitter = createDocEmitter();
  assert(emitter.listenerCount("presenceChanged") === 0, "starts at 0");

  const l1 = () => {};
  const l2 = () => {};
  emitter.on("presenceChanged", l1);
  emitter.on("presenceChanged", l2);
  assert(emitter.listenerCount("presenceChanged") === 2, "count is 2 after two subscriptions");

  emitter.off("presenceChanged", l1);
  assert(emitter.listenerCount("presenceChanged") === 1, "count is 1 after off");
}

// ─── Test 4: replayLast ───────────────────────────────────────────────────────
console.log("\nTest 4 — replayLast");
{
  const emitter = createDocEmitter();

  // Subscribe before any emission — no immediate call
  const earlyPayloads: CursorMovedPayload[] = [];
  const unsub1 = replayLast(emitter, "cursorMoved", (p) => earlyPayloads.push(p));
  assert(earlyPayloads.length === 0, "no immediate call when nothing emitted yet");

  emitter.emit("cursorMoved", { userId: "alice", line: 1, col: 1 });
  emitter.emit("cursorMoved", { userId: "bob",   line: 2, col: 2 });
  assert(earlyPayloads.length === 2, "early listener receives both live emissions");

  unsub1();

  // Subscribe AFTER two emissions — should replay the LAST one immediately
  const latePayloads: CursorMovedPayload[] = [];
  replayLast(emitter, "cursorMoved", (p) => latePayloads.push(p));
  assert(latePayloads.length === 1,             "late subscriber gets immediate replay");
  assert(latePayloads[0].userId === "bob",      "replayed payload is the most recent one");
}

// ─── Test 5: mergeEmitters ────────────────────────────────────────────────────
console.log("\nTest 5 — mergeEmitters");
{
  const a = createDocEmitter();
  const b = createDocEmitter();
  const merged = mergeEmitters(a, b);

  const errors: string[] = [];
  merged.on("docError", (p) => errors.push(p.code));

  a.emit("docError", { code: "CONFLICT",         message: "conflict from a" });
  b.emit("docError", { code: "PERMISSION_DENIED", message: "denied from b" });
  merged.emit("docError", { code: "NETWORK",      message: "network on merged" });

  assert(errors.length === 3,                  "merged receives events from both sources + self");
  assert(errors[0] === "CONFLICT",             "first error came from emitter a");
  assert(errors[1] === "PERMISSION_DENIED",    "second error came from emitter b");
  assert(errors[2] === "NETWORK",              "third error emitted directly on merged");
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
if (failed > 0) process.exit(1);
