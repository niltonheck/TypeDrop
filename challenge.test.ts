// =============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// =============================================================
import { TypedEventEmitter, AppEventMap, EmitRecord } from "./challenge";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

async function run(): Promise<void> {
  console.log("\n══════════════════════════════════════════");
  console.log("  TypedEventEmitter — Test Harness");
  console.log("══════════════════════════════════════════\n");

  // ── Test 1: basic on/emit/listenerCount ──────────────────
  console.log("Test 1: on() / emit() / listenerCount()");
  {
    const emitter = new TypedEventEmitter();
    const received: AppEventMap["user:joined"][] = [];

    emitter.on("user:joined", (payload) => {
      received.push(payload);
    });

    assert(emitter.listenerCount("user:joined") === 1, "listenerCount is 1 after one on()");

    const record = await emitter.emit("user:joined", {
      userId: "u1",
      roomId: "r1",
      timestamp: 1000,
    });

    assert(received.length === 1, "handler was called once");
    assert(received[0].userId === "u1", "handler received correct userId");
    assert(record.status === "delivered", "record.status is 'delivered'");
    assert(record.listenerCount === 1, "record.listenerCount is 1");
    assert(record.middlewareCount === 0, "record.middlewareCount is 0 (no middleware)");
  }

  // ── Test 2: unsubscribe via returned function ─────────────
  console.log("\nTest 2: unsubscribe function returned by on()");
  {
    const emitter = new TypedEventEmitter();
    let callCount = 0;
    const unsub = emitter.on("message:sent", () => { callCount++; });

    await emitter.emit("message:sent", {
      messageId: "m1",
      authorId: "u1",
      body: "Hello",
      roomId: "r1",
    });
    assert(callCount === 1, "handler called before unsub");

    unsub();
    assert(emitter.listenerCount("message:sent") === 0, "listenerCount is 0 after unsub");

    await emitter.emit("message:sent", {
      messageId: "m2",
      authorId: "u1",
      body: "World",
      roomId: "r1",
    });
    assert(callCount === 1, "handler NOT called after unsub");
  }

  // ── Test 3: once() fires exactly once ────────────────────
  console.log("\nTest 3: once()");
  {
    const emitter = new TypedEventEmitter();
    let callCount = 0;
    emitter.once("room:created", () => { callCount++; });

    assert(emitter.listenerCount("room:created") === 1, "listenerCount is 1 before first emit");

    await emitter.emit("room:created", { roomId: "r1", ownerId: "u1", maxCapacity: 10 });
    assert(callCount === 1, "handler called on first emit");
    assert(emitter.listenerCount("room:created") === 0, "listenerCount is 0 after once fires");

    await emitter.emit("room:created", { roomId: "r2", ownerId: "u2", maxCapacity: 5 });
    assert(callCount === 1, "handler NOT called on second emit");
  }

  // ── Test 4: middleware transforms payload ─────────────────
  console.log("\nTest 4: middleware transforms payload");
  {
    const emitter = new TypedEventEmitter();

    // Middleware: uppercase the body of message:sent events
    emitter.use(<E extends keyof import("./challenge").AppEventMap>(
      event: E,
      payload: import("./challenge").AppEventMap[E]
    ) => {
      if (event === "message:sent") {
        const p = payload as AppEventMap["message:sent"];
        return { ...p, body: p.body.toUpperCase() } as typeof payload;
      }
      return payload;
    });

    let receivedBody = "";
    emitter.on("message:sent", (p) => { receivedBody = p.body; });

    const record = await emitter.emit("message:sent", {
      messageId: "m1",
      authorId: "u1",
      body: "hello world",
      roomId: "r1",
    });

    assert(receivedBody === "HELLO WORLD", "middleware uppercased the body");
    assert(record.middlewareCount === 1, "middlewareCount is 1");
    assert(record.status === "delivered", "status is delivered after transform");
  }

  // ── Test 5: middleware cancels event ──────────────────────
  console.log("\nTest 5: middleware cancels event");
  {
    const emitter = new TypedEventEmitter();

    // Block any user:left event with reason "kicked"
    emitter.use(<E extends keyof import("./challenge").AppEventMap>(
      event: E,
      payload: import("./challenge").AppEventMap[E]
    ) => {
      if (event === "user:left") {
        const p = payload as AppEventMap["user:left"];
        if (p.reason === "kicked") return null;
      }
      return payload;
    });

    let handlerCalled = false;
    emitter.on("user:left", () => { handlerCalled = true; });

    const record = await emitter.emit("user:left", {
      userId: "u1",
      roomId: "r1",
      reason: "kicked",
    });

    assert(!handlerCalled, "handler NOT called when middleware cancels");
    assert(record.status === "cancelled", "record.status is 'cancelled'");
    assert(record.listenerCount === 0, "record.listenerCount is 0 when cancelled");
    assert(record.middlewareCount === 1, "middlewareCount is 1 (ran before cancelling)");
  }

  // ── Test 6: no-listeners status ───────────────────────────
  console.log("\nTest 6: no-listeners status");
  {
    const emitter = new TypedEventEmitter();
    const record = await emitter.emit("message:deleted", {
      messageId: "m99",
      deletedBy: "admin",
    });

    assert(record.status === "no-listeners", "status is 'no-listeners' with no handlers");
    assert(record.listenerCount === 0, "listenerCount is 0");
  }

  // ── Test 7: use() chaining ────────────────────────────────
  console.log("\nTest 7: use() returns this for chaining");
  {
    const emitter = new TypedEventEmitter();
    const log: string[] = [];

    emitter
      .use(<E extends keyof import("./challenge").AppEventMap>(_e: E, p: import("./challenge").AppEventMap[E]) => { log.push("mw1"); return p; })
      .use(<E extends keyof import("./challenge").AppEventMap>(_e: E, p: import("./challenge").AppEventMap[E]) => { log.push("mw2"); return p; });

    await emitter.emit("room:created", { roomId: "r1", ownerId: "u1", maxCapacity: 20 });

    assert(log[0] === "mw1" && log[1] === "mw2", "middleware run in registration order");
  }

  // ── Summary ───────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("══════════════════════════════════════════\n");
  if (failed > 0) process.exit(1);
}

run().catch((err) => { console.error(err); process.exit(1); });
