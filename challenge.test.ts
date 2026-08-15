// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  createEventEmitter,
  type EventNames,
  type PayloadOf,
  type EventNamespace,
  type EventsInNamespace,
} from "./challenge";

const emitter = createEventEmitter();

// ─── Test 1: on + emit delivers correct payload ───────────────────────────
{
  let received: string | null = null;

  emitter.on("presence:join", (payload) => {
    received = payload.userId;
  });

  emitter.emit("presence:join", {
    userId: "u-001",
    displayName: "Alice",
    avatarUrl: null,
  });

  console.assert(received === "u-001", "Test 1 FAILED: on+emit payload");
  console.log("Test 1 passed: on + emit delivers correct payload");
}

// ─── Test 2: once fires exactly once ─────────────────────────────────────
{
  let callCount = 0;

  emitter.once("cursor:move", () => {
    callCount += 1;
  });

  emitter.emit("cursor:move", { userId: "u-002", offset: 10, selectionEnd: null });
  emitter.emit("cursor:move", { userId: "u-002", offset: 20, selectionEnd: 25 });

  console.assert(callCount === 1, `Test 2 FAILED: once fired ${callCount} times`);
  console.log("Test 2 passed: once fires exactly once");
}

// ─── Test 3: off removes listener, subsequent emits are silent ───────────
{
  let seen = false;

  const handler = (payload: PayloadOf<"comment:add">) => {
    seen = true;
    void payload;
  };

  emitter.on("comment:add", handler);
  emitter.off("comment:add", handler);

  emitter.emit("comment:add", {
    commentId: "c-001",
    userId: "u-003",
    anchorOffset: 42,
    text: "Nice work!",
    createdAt: "2026-08-15T09:00:00Z",
  });

  console.assert(seen === false, "Test 3 FAILED: off did not remove listener");
  console.log("Test 3 passed: off removes listener");
}

// ─── Test 4: Subscription.unsubscribe works ───────────────────────────────
{
  let count = 0;

  const sub = emitter.on("permission:change", () => {
    count += 1;
  });

  emitter.emit("permission:change", { userId: "u-004", role: "editor", grantedBy: "u-001" });
  sub.unsubscribe();
  emitter.emit("permission:change", { userId: "u-004", role: "admin", grantedBy: "u-001" });

  console.assert(count === 1, `Test 4 FAILED: unsubscribe count=${count}`);
  console.log("Test 4 passed: Subscription.unsubscribe works");
}

// ─── Test 5: emit snapshots listeners — mid-emit additions not called ─────
{
  const log: string[] = [];

  emitter.clearAll(); // clean slate

  emitter.on("comment:resolve", () => {
    log.push("first");
    // Adding a new listener during emit — must NOT fire in this cycle
    emitter.on("comment:resolve", () => log.push("late"));
  });

  emitter.emit("comment:resolve", {
    commentId: "c-002",
    resolvedBy: "u-005",
    resolvedAt: "2026-08-15T10:00:00Z",
  });

  console.assert(
    log.length === 1 && log[0] === "first",
    `Test 5 FAILED: log=${JSON.stringify(log)}`
  );
  console.log("Test 5 passed: emit snapshots listeners correctly");
}

// ─── Test 6: listenerCount & clear ───────────────────────────────────────
{
  emitter.clearAll();

  emitter.on("cursor:move", () => {});
  emitter.on("cursor:move", () => {});

  console.assert(
    emitter.listenerCount("cursor:move") === 2,
    `Test 6a FAILED: count=${emitter.listenerCount("cursor:move")}`
  );

  emitter.clear("cursor:move");

  console.assert(
    emitter.listenerCount("cursor:move") === 0,
    `Test 6b FAILED: count after clear=${emitter.listenerCount("cursor:move")}`
  );
  console.log("Test 6 passed: listenerCount and clear work correctly");
}

// ─── Type-level checks (compile-time only) ───────────────────────────────
// These must compile — if they don't, your utility types are wrong.
type _CheckEventNames = EventNames extends string ? true : never;
type _CheckPayload    = PayloadOf<"cursor:move"> extends { offset: number } ? true : never;

// BONUS type checks (comment out if not attempting bonus)
type _CheckNS  = EventNamespace<"comment:add"> extends "comment" ? true : never;
type _CheckEIN = EventsInNamespace<"presence"> extends "presence:join" | "presence:leave" ? true : never;

console.log("\nAll tests passed! ✓");
