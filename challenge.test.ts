// =============================================================================
// challenge.test.ts
// =============================================================================
import {
  createEmitter,
  type DocEditorEvents,
  type AnyEvent,
  type Unsubscribe,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helper: collect emitted values into an array for assertion
// ---------------------------------------------------------------------------
function collect<T>(): { values: T[]; handler: (v: T) => void } {
  const values: T[] = [];
  return { values, handler: (v) => values.push(v) };
}

// ---------------------------------------------------------------------------
// Test 1 — `.on` / `.emit` / `.off` basic round-trip
// ---------------------------------------------------------------------------
(function test_on_emit_off() {
  const emitter = createEmitter<DocEditorEvents>();
  const { values, handler } = collect<{ userId: string; line: number; col: number }>();

  const unsub = emitter.on("cursor:moved", handler);
  emitter.emit("cursor:moved", { userId: "u1", line: 3, col: 7 });
  emitter.emit("cursor:moved", { userId: "u2", line: 5, col: 1 });
  unsub(); // unsubscribe
  emitter.emit("cursor:moved", { userId: "u3", line: 9, col: 0 }); // should NOT reach handler

  console.assert(values.length === 2, `[test_on_emit_off] expected 2 events, got ${values.length}`);
  console.assert(values[0].userId === "u1", `[test_on_emit_off] first userId should be u1`);
  console.assert(values[1].line === 5, `[test_on_emit_off] second line should be 5`);
  console.log("✓ test_on_emit_off");
})();

// ---------------------------------------------------------------------------
// Test 2 — `.once` fires exactly once
// ---------------------------------------------------------------------------
(function test_once() {
  const emitter = createEmitter<DocEditorEvents>();
  const { values, handler } = collect<{ docId: string; version: number }>();

  emitter.once("doc:saved", handler);
  emitter.emit("doc:saved", { docId: "doc-1", version: 1 });
  emitter.emit("doc:saved", { docId: "doc-1", version: 2 }); // should be ignored
  emitter.emit("doc:saved", { docId: "doc-1", version: 3 }); // should be ignored

  console.assert(values.length === 1, `[test_once] expected 1 event, got ${values.length}`);
  console.assert(values[0].version === 1, `[test_once] version should be 1`);
  console.log("✓ test_once");
})();

// ---------------------------------------------------------------------------
// Test 3 — `.onAny` receives a discriminated union with correct shape
// ---------------------------------------------------------------------------
(function test_onAny() {
  const emitter = createEmitter<DocEditorEvents>();
  const received: AnyEvent<DocEditorEvents>[] = [];

  emitter.onAny((e) => received.push(e));

  emitter.emit("user:joined", { userId: "u1", displayName: "Alice" });
  emitter.emit("user:left", { userId: "u1" });
  emitter.emit("doc:saved", { docId: "doc-42", version: 7 });

  console.assert(received.length === 3, `[test_onAny] expected 3 events, got ${received.length}`);

  // Narrow via discriminated union
  const first = received[0];
  console.assert(first.event === "user:joined", `[test_onAny] first event should be user:joined`);
  if (first.event === "user:joined") {
    console.assert(
      first.payload.displayName === "Alice",
      `[test_onAny] displayName should be Alice`
    );
  }

  const third = received[2];
  console.assert(third.event === "doc:saved", `[test_onAny] third event should be doc:saved`);
  if (third.event === "doc:saved") {
    console.assert(third.payload.version === 7, `[test_onAny] version should be 7`);
  }

  console.log("✓ test_onAny");
})();

// ---------------------------------------------------------------------------
// Test 4 — `.history` returns correct typed readonly array
// ---------------------------------------------------------------------------
(function test_history() {
  const emitter = createEmitter<DocEditorEvents>();

  emitter.emit("cursor:moved", { userId: "u1", line: 1, col: 0 });
  emitter.emit("cursor:moved", { userId: "u2", line: 2, col: 4 });
  emitter.emit("doc:saved",   { docId: "d1", version: 1 });

  const cursorHistory = emitter.history("cursor:moved");
  const savedHistory  = emitter.history("doc:saved");

  console.assert(cursorHistory.length === 2, `[test_history] expected 2 cursor events, got ${cursorHistory.length}`);
  console.assert(savedHistory.length  === 1, `[test_history] expected 1 saved event,  got ${savedHistory.length}`);
  // Type narrowing: these properties must exist without casting
  console.assert(cursorHistory[1].col === 4, `[test_history] second cursor col should be 4`);
  console.assert(savedHistory[0].docId === "d1", `[test_history] docId should be d1`);
  console.log("✓ test_history");
})();

// ---------------------------------------------------------------------------
// Test 5 — `.replay` delivers historical payloads then stays subscribed
// ---------------------------------------------------------------------------
(function test_replay() {
  const emitter = createEmitter<DocEditorEvents>();

  // Emit 4 events before subscribing
  emitter.emit("user:joined", { userId: "u1", displayName: "Alice" });
  emitter.emit("user:joined", { userId: "u2", displayName: "Bob" });
  emitter.emit("user:joined", { userId: "u3", displayName: "Carol" });
  emitter.emit("user:joined", { userId: "u4", displayName: "Dave" });

  const { values, handler } = collect<{ userId: string; displayName: string }>();

  // Replay last 2, then subscribe
  const unsub = emitter.replay("user:joined", 2, handler);

  // Should have received the last 2 historical events immediately
  console.assert(values.length === 2, `[test_replay] expected 2 replayed events, got ${values.length}`);
  console.assert(values[0].displayName === "Carol", `[test_replay] first replayed should be Carol`);
  console.assert(values[1].displayName === "Dave",  `[test_replay] second replayed should be Dave`);

  // Now emit a new event — handler should still be active
  emitter.emit("user:joined", { userId: "u5", displayName: "Eve" });
  console.assert(values.length === 3, `[test_replay] expected 3 total events after live emit, got ${values.length}`);
  console.assert(values[2].displayName === "Eve", `[test_replay] live event should be Eve`);

  unsub();
  emitter.emit("user:joined", { userId: "u6", displayName: "Frank" });
  console.assert(values.length === 3, `[test_replay] after unsub, count should still be 3`);
  console.log("✓ test_replay");
})();

console.log("\nAll tests passed! 🎉");
