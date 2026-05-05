// ============================================================
// challenge.test.ts — Typed Notification Dispatcher
// ============================================================
import {
  validatePayload,
  dispatchOne,
  dispatchBatch,
  type HandlerMap,
  type ChannelRegistry,
  type DispatchOutcome,
} from "./challenge";

// ------------------------------------------------------------------
// Mock handlers — succeed immediately
// ------------------------------------------------------------------
const mockHandlers: HandlerMap = {
  email: async (p) => {
    if (!p.to) throw new Error("missing to");
  },
  sms: async (_p) => { /* success */ },
  push: async (_p) => { /* success */ },
  webhook: async (_p) => { /* success */ },
};

// ------------------------------------------------------------------
// Flaky handler factory — fails the first N times, then succeeds
// ------------------------------------------------------------------
function flaky(failTimes: number): () => Promise<void> {
  let calls = 0;
  return async () => {
    calls++;
    if (calls <= failTimes) throw new Error(`attempt ${calls} failed`);
  };
}

const flakyHandlers: HandlerMap = {
  email: flaky(2),  // will succeed on attempt 3
  sms: async (_p) => { /* success */ },
  push: async (_p) => { /* success */ },
  webhook: async (_p) => { /* success */ },
};

// ------------------------------------------------------------------
// Registry
// ------------------------------------------------------------------
const registry: ChannelRegistry = {
  email:   { maxAttempts: 3, delayMs: 0 },
  sms:     { maxAttempts: 2, delayMs: 0 },
  push:    { maxAttempts: 1, delayMs: 0 },
  webhook: { maxAttempts: 2, delayMs: 0 },
};

// ------------------------------------------------------------------
// TEST 1 — validatePayload rejects unknown channel
// ------------------------------------------------------------------
const badChannel = validatePayload({ channel: "fax", number: "123" });
console.assert(
  badChannel.ok === false,
  "TEST 1 FAILED: unknown channel should be invalid"
);
console.log("TEST 1 passed:", !badChannel.ok && badChannel.error);

// ------------------------------------------------------------------
// TEST 2 — validatePayload rejects malformed SMS (bad phone)
// ------------------------------------------------------------------
const badSms = validatePayload({ channel: "sms", phoneNumber: "0000", message: "hi" });
console.assert(
  badSms.ok === false,
  "TEST 2 FAILED: invalid phone number should fail validation"
);
console.log("TEST 2 passed:", !badSms.ok && badSms.error);

// ------------------------------------------------------------------
// TEST 3 — dispatchOne succeeds for a valid email payload
// ------------------------------------------------------------------
(async () => {
  const outcome: DispatchOutcome = await dispatchOne(
    { channel: "email", to: "user@example.com", subject: "Hello", body: "World" },
    mockHandlers,
    registry
  );
  console.assert(outcome.status === "sent", "TEST 3 FAILED: valid email should be sent");
  console.assert(outcome.attempts === 1, "TEST 3 FAILED: should succeed on first attempt");
  console.log("TEST 3 passed:", outcome);

  // ------------------------------------------------------------------
  // TEST 4 — dispatchOne retries and eventually succeeds (flaky handler)
  // ------------------------------------------------------------------
  const flakyOutcome: DispatchOutcome = await dispatchOne(
    { channel: "email", to: "retry@example.com", subject: "Retry", body: "Test" },
    flakyHandlers,
    registry
  );
  console.assert(flakyOutcome.status === "sent", "TEST 4 FAILED: should succeed after retries");
  console.assert(flakyOutcome.attempts === 3, "TEST 4 FAILED: should take exactly 3 attempts");
  console.log("TEST 4 passed:", flakyOutcome);

  // ------------------------------------------------------------------
  // TEST 5 — dispatchBatch handles mixed valid/invalid payloads
  // ------------------------------------------------------------------
  const results = await dispatchBatch(
    [
      { channel: "sms", phoneNumber: "+14155552671", message: "Batch SMS" },
      { channel: "push", deviceToken: "tok_abc", title: "Alert", body: "Check this out" },
      { channel: "webhook", url: "https://hooks.example.com", eventType: "order.placed", data: { orderId: "42" } },
      { channel: "unknown_channel" }, // should become a DispatchFailure
    ],
    mockHandlers,
    registry
  );

  console.assert(results.length === 4, "TEST 5 FAILED: should return 4 outcomes");
  console.assert(results[0].status === "sent",   "TEST 5 FAILED: sms should be sent");
  console.assert(results[1].status === "sent",   "TEST 5 FAILED: push should be sent");
  console.assert(results[2].status === "sent",   "TEST 5 FAILED: webhook should be sent");
  console.assert(results[3].status === "failed", "TEST 5 FAILED: invalid payload should fail");
  console.log("TEST 5 passed:", results);
})();
