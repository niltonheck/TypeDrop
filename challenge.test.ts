// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validatePayload,
  dispatchAll,
  createHandlerRegistry,
  type DeliveryResult,
  type ChannelHandlerMap,
  type EmailPayload,
  type SmsPayload,
  type PushPayload,
  type WebhookPayload,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── mock raw payloads ─────────────────────────────────────────
const validEmail = {
  channel: "email",
  to: "alice@example.com",
  subject: "Hello",
  body: "World",
};

const validSms = {
  channel: "sms",
  to: "+15550001234",
  message: "Your code is 9876",
};

const validPush = {
  channel: "push",
  deviceToken: "tok_abc123",
  title: "New message",
  body: "Bob sent you a file",
};

const validWebhook = {
  channel: "webhook",
  url: "https://hooks.example.com/notify",
  event: "user.signup",
  data: { userId: 42, plan: "pro", active: true },
};

const invalidMissingChannel = { to: "bob@example.com" };
const invalidBadChannel     = { channel: "slack", to: "x" };
const invalidSmsNoPlus      = { channel: "sms", to: "5550001234", message: "hi" };
const invalidWebhookHttp    = { channel: "webhook", url: "http://insecure.com", event: "x", data: {} };

// ── TEST 1: validatePayload ───────────────────────────────────
console.log("\nTEST 1 — validatePayload");

assert(validatePayload(validEmail) !== null,       "valid email payload accepted");
assert(validatePayload(validSms) !== null,         "valid sms payload accepted");
assert(validatePayload(validPush) !== null,        "valid push payload accepted");
assert(validatePayload(validWebhook) !== null,     "valid webhook payload accepted");
assert(validatePayload(invalidMissingChannel) === null, "missing channel → null");
assert(validatePayload(invalidBadChannel) === null,     "unknown channel → null");
assert(validatePayload(invalidSmsNoPlus) === null,      "sms without '+' prefix → null");
assert(validatePayload(invalidWebhookHttp) === null,    "http (not https) webhook → null");
assert(validatePayload(null) === null,                  "null input → null");
assert(validatePayload(42) === null,                    "number input → null");

// ── TEST 2: dispatchAll — concurrency & aggregation ──────────
console.log("\nTEST 2 — dispatchAll");

const makeResult = (status: DeliveryResult["status"]): DeliveryResult => ({
  channel: "email",
  status,
  sentAt: new Date().toISOString(),
});

// Handlers: email succeeds, sms fails, push skipped (not registered)
const handlers: ChannelHandlerMap = createHandlerRegistry({
  email: async (_p: EmailPayload) => makeResult("sent"),
  sms:   async (_p: SmsPayload)   => { throw new Error("SMS gateway down"); },
  push:  async (_p: PushPayload)  => makeResult("sent"),
  webhook: async (_p: WebhookPayload) => makeResult("sent"),
});

const rawBatch: unknown[] = [
  validEmail,          // → sent
  validSms,            // → failed (handler throws)
  validPush,           // → sent
  invalidBadChannel,   // → skipped (invalid)
  validWebhook,        // → sent
];

(async () => {
  const report = await dispatchAll(rawBatch, handlers);

  console.log("\nTEST 2 — dispatchAll");
  assert(report.total   === 5, `total === 5 (got ${report.total})`);
  assert(report.sent    === 3, `sent  === 3 (got ${report.sent})`);
  assert(report.failed  === 1, `failed === 1 (got ${report.failed})`);
  assert(report.skipped === 1, `skipped === 1 (got ${report.skipped})`);
  assert(report.results.length === 5, "results array has 5 entries");

  const failedResult = report.results.find(r => r.status === "failed");
  assert(
    failedResult?.error === "SMS gateway down",
    `failed result carries error message (got "${failedResult?.error}")`
  );

  // ── TEST 3: createHandlerRegistry fills missing channels ────
  console.log("\nTEST 3 — createHandlerRegistry default handler");
  const sparseHandlers = createHandlerRegistry({
    email: async (_p: EmailPayload) => makeResult("sent"),
  });

  // Dispatch a push payload through the sparse registry
  const sparseReport = await dispatchAll([validPush], sparseHandlers);
  assert(
    sparseReport.results[0]?.status === "skipped",
    "unregistered channel handler returns 'skipped'"
  );

  console.log("\nAll tests complete.");
})();
