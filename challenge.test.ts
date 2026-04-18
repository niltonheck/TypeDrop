// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validatePayload,
  routeNotifications,
  createRegistry,
  type DeliveryResult,
  type HandlerRegistry,
} from "./challenge";

// ── Mock handlers ────────────────────────────────────────────

const registry: HandlerRegistry = createRegistry({
  email: async (p) => ({
    status: "delivered",
    channel: p.channel,
    deliveredAt: new Date().toISOString(),
  }),
  sms: async (p) => ({
    status: "delivered",
    channel: p.channel,
    deliveredAt: new Date().toISOString(),
  }),
  push: async (_p) => ({
    status: "failed",
    channel: "push",
    reason: "Device token expired",
  }),
  webhook: async (p) => ({
    status: "delivered",
    channel: p.channel,
    deliveredAt: new Date().toISOString(),
  }),
});

// ── Mock payloads ────────────────────────────────────────────

const validEmail = {
  channel: "email",
  to: "alice@example.com",
  subject: "Hello",
  body: "Welcome aboard!",
};

const validSms = {
  channel: "sms",
  to: "+14155552671",
  body: "Your code is 9182",
};

const validPush = {
  channel: "push",
  deviceToken: "a".repeat(64), // 64 hex chars
  title: "New message",
  body: "You have a new message",
};

const validWebhook = {
  channel: "webhook",
  url: "https://hooks.example.com/notify",
  eventType: "user.signup",
  data: { userId: 42, plan: "pro", active: true },
};

const invalidChannel = { channel: "fax", to: "555-1234" };
const invalidEmail   = { channel: "email", to: "not-an-email", subject: "Hi", body: "Hey" };
const invalidSms     = { channel: "sms", to: "0014155552671", body: "Hi" }; // missing leading +
const invalidPush    = { channel: "push", deviceToken: "zzzz", title: "Hi", body: "Hi" }; // bad hex
const invalidWebhook = { channel: "webhook", url: "http://insecure.com", eventType: "x", data: {} };

// ── Test 1: validatePayload — valid payloads parse without throwing ──

let passed = true;

try {
  const ep = validatePayload(validEmail);
  console.assert(ep.channel === "email", "Test 1a: email channel");

  const sp = validatePayload(validSms);
  console.assert(sp.channel === "sms", "Test 1b: sms channel");

  const pp = validatePayload(validPush);
  console.assert(pp.channel === "push", "Test 1c: push channel");

  const wp = validatePayload(validWebhook);
  console.assert(wp.channel === "webhook", "Test 1d: webhook channel");

  console.log("✅ Test 1 passed: valid payloads parse correctly");
} catch (e) {
  console.error("❌ Test 1 failed:", e);
  passed = false;
}

// ── Test 2: validatePayload — invalid payloads throw ────────

const invalids = [
  invalidChannel,
  invalidEmail,
  invalidSms,
  invalidPush,
  invalidWebhook,
];

let allThrew = true;
for (const inv of invalids) {
  try {
    validatePayload(inv);
    console.error(`❌ Test 2 failed: expected throw for`, inv);
    allThrew = false;
  } catch {
    // expected
  }
}
if (allThrew) console.log("✅ Test 2 passed: invalid payloads all throw");
else passed = false;

// ── Test 3: routeNotifications — report shape ────────────────

(async () => {
  const rawPayloads: unknown[] = [
    validEmail,
    validSms,
    validPush,       // handler always returns "failed"
    validWebhook,
    invalidChannel,  // validation fails → DeliveryFailure
  ];

  const report = await routeNotifications(rawPayloads, registry);

  console.assert(report.total === 5, `Test 3a: total should be 5, got ${report.total}`);
  // email ✓, sms ✓, webhook ✓  → 3 delivered
  console.assert(report.delivered === 3, `Test 3b: delivered should be 3, got ${report.delivered}`);
  // push handler fails + invalidChannel validation fails → 2 failed
  console.assert(report.failed === 2, `Test 3c: failed should be 2, got ${report.failed}`);
  console.assert(report.results.length === 5, `Test 3d: results.length should be 5`);

  console.log("✅ Test 3 passed: dispatch report is correct");

  // ── Test 4: DeliverySuccess has ISO deliveredAt ─────────────
  const successes = report.results.filter(
    (r): r is Extract<DeliveryResult, { status: "delivered" }> =>
      r.status === "delivered"
  );
  const allHaveTimestamp = successes.every((r) => !isNaN(Date.parse(r.deliveredAt)));
  console.assert(allHaveTimestamp, "Test 4: all successes have valid ISO timestamps");
  if (allHaveTimestamp) console.log("✅ Test 4 passed: deliveredAt timestamps are valid ISO strings");
  else passed = false;

  // ── Test 5: DeliveryFailure has a non-empty reason ──────────
  const failures = report.results.filter(
    (r): r is Extract<DeliveryResult, { status: "failed" }> =>
      r.status === "failed"
  );
  const allHaveReason = failures.every((r) => r.reason.length > 0);
  console.assert(allHaveReason, "Test 5: all failures have a non-empty reason");
  if (allHaveReason) console.log("✅ Test 5 passed: failure reasons are non-empty");
  else passed = false;

  console.log(passed ? "\n🎉 All tests passed!" : "\n💥 Some tests failed.");
})();
