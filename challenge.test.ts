// ─── challenge.test.ts ───────────────────────────────────────────────────────
import { TypedEmitter, type DocEventMap, type Unsubscribe } from "./challenge";

const emitter = new TypedEmitter<DocEventMap>();

// ── Test 1: on() delivers the correct payload to the listener ─────────────────
{
  let received: { userId: string; x: number; y: number } | null = null;

  const unsub = emitter.on("cursor:move", (payload) => {
    received = payload;
  });

  emitter.emit("cursor:move", { userId: "u1", x: 10, y: 20 });

  console.assert(received !== null, "Test 1a FAILED: listener was not called");
  console.assert(
    (received as { userId: string; x: number; y: number }).x === 10,
    "Test 1b FAILED: x should be 10"
  );
  console.assert(
    (received as { userId: string; x: number; y: number }).userId === "u1",
    "Test 1c FAILED: userId should be 'u1'"
  );

  unsub();

  // After unsubscribing, listener should NOT fire again
  emitter.emit("cursor:move", { userId: "u2", x: 99, y: 99 });
  console.assert(
    (received as { userId: string; x: number; y: number }).userId === "u1",
    "Test 1d FAILED: unsubscribed listener should not fire"
  );

  console.log("✅ Test 1 passed: on() and Unsubscribe work correctly");
}

// ── Test 2: once() fires exactly once ─────────────────────────────────────────
{
  let callCount = 0;

  emitter.once("doc:save", (_payload) => {
    callCount++;
  });

  emitter.emit("doc:save", { docId: "doc-42", revision: 1 });
  emitter.emit("doc:save", { docId: "doc-42", revision: 2 });
  emitter.emit("doc:save", { docId: "doc-42", revision: 3 });

  console.assert(callCount === 1, `Test 2 FAILED: once() listener fired ${callCount} times, expected 1`);
  console.log("✅ Test 2 passed: once() fires exactly once");
}

// ── Test 3: listenerCount() tracks active listeners accurately ────────────────
{
  const unsub1 = emitter.on("presence:join", () => {});
  const unsub2 = emitter.on("presence:join", () => {});

  console.assert(
    emitter.listenerCount("presence:join") === 2,
    `Test 3a FAILED: expected 2 listeners, got ${emitter.listenerCount("presence:join")}`
  );

  unsub1();

  console.assert(
    emitter.listenerCount("presence:join") === 1,
    `Test 3b FAILED: expected 1 listener after unsub, got ${emitter.listenerCount("presence:join")}`
  );

  unsub2();

  console.assert(
    emitter.listenerCount("presence:join") === 0,
    `Test 3c FAILED: expected 0 listeners after both unsub, got ${emitter.listenerCount("presence:join")}`
  );

  console.log("✅ Test 3 passed: listenerCount() is accurate");
}

// ── Test 4: onAny() receives every emitted event as an envelope ───────────────
{
  const envelopes: Array<{ event: string; payload: unknown }> = [];

  const unsub = emitter.onAny((envelope) => {
    // TypeScript must allow narrowing by `envelope.event` here
    envelopes.push({ event: envelope.event as string, payload: envelope.payload });
  });

  emitter.emit("doc:edit", { userId: "u3", delta: "+hello", timestamp: 1000 });
  emitter.emit("presence:leave", { userId: "u3" });

  console.assert(envelopes.length === 2, `Test 4a FAILED: expected 2 envelopes, got ${envelopes.length}`);
  console.assert(envelopes[0].event === "doc:edit", `Test 4b FAILED: first envelope event should be 'doc:edit'`);
  console.assert(envelopes[1].event === "presence:leave", `Test 4c FAILED: second envelope event should be 'presence:leave'`);

  unsub();

  emitter.emit("doc:edit", { userId: "u3", delta: "+world", timestamp: 2000 });
  console.assert(envelopes.length === 2, "Test 4d FAILED: wildcard listener should be unsubscribed");

  console.log("✅ Test 4 passed: onAny() receives all events and Unsubscribe works");
}

// ── Test 5: Unsubscribe is a branded type (compile-time check) ────────────────
// This function only accepts a genuine `Unsubscribe`, not a plain `() => void`.
// If your branding is correct, passing `() => {}` directly below should be a TS error.
{
  function runCleanup(fn: Unsubscribe): void {
    fn();
  }

  const unsub = emitter.on("doc:save", () => {});
  runCleanup(unsub); // ✅ must compile

  // The line below should be a TYPE ERROR — uncomment to verify branding works:
  // runCleanup(() => {}); // ❌ should not compile if Unsubscribe is properly branded

  console.log("✅ Test 5 passed: Unsubscribe brand is accepted by runCleanup()");
}

console.log("\n🎉 All tests passed!");
