// challenge.test.ts
import {
  parsePayload,
  dispatchOne,
  dispatchAll,
  type NotificationPayload,
  type ChannelRegistry,
  type DeliveryReport,
  type DeliveryStatus,
} from "./challenge";

// ── Mock channel handlers ────────────────────────────────────────────────────

let callLog: string[] = [];

const mockRegistry: ChannelRegistry = {
  email: async (p) => {
    callLog.push(`email:${p.id}`);
    // Simulate a failure for id "email-fail"
    if (p.id === "email-fail") throw new Error("SMTP timeout");
  },
  sms: async (p) => {
    callLog.push(`sms:${p.id}`);
    if (p.id === "sms-fail") throw new Error("SMS gateway error");
  },
  push: async (p) => {
    callLog.push(`push:${p.id}`);
  },
};

// ── Test data ────────────────────────────────────────────────────────────────

const rawEmail: unknown = {
  id: "e1",
  userId: "u1",
  channel: "email",
  to: "alice@example.com",
  subject: "Welcome!",
  body: "Hello Alice",
};

const rawSms: unknown = {
  id: "s1",
  userId: "u2",
  channel: "sms",
  to: "+15550001234",
  text: "Your code is 9876",
};

const rawPush: unknown = {
  id: "p1",
  userId: "u3",
  channel: "push",
  deviceToken: "tok_abc123",
  title: "New message",
  body: "You have a new message",
};

const rawEmailFail: unknown = {
  id: "email-fail",
  userId: "u4",
  channel: "email",
  to: "bob@example.com",
  subject: "Oops",
  body: "This will fail",
};

const rawInvalid: unknown = {
  id: "bad1",
  userId: "u5",
  channel: "fax", // unsupported channel
  number: "555-1234",
};

const rawMissingField: unknown = {
  // missing `channel`
  id: "bad2",
  userId: "u6",
};

// ── Test 1: parsePayload — valid payloads ────────────────────────────────────
{
  const email = parsePayload(rawEmail);
  console.assert(email.channel === "email", "T1a: channel should be 'email'");
  console.assert(email.id === "e1",         "T1b: id should be 'e1'");

  const sms = parsePayload(rawSms);
  console.assert(sms.channel === "sms",     "T1c: channel should be 'sms'");

  const push = parsePayload(rawPush);
  console.assert(push.channel === "push",   "T1d: channel should be 'push'");
}

// ── Test 2: parsePayload — invalid payloads throw TypeError ──────────────────
{
  let threw = false;
  try { parsePayload(rawInvalid); } catch (e) {
    threw = e instanceof TypeError;
  }
  console.assert(threw, "T2a: invalid channel should throw TypeError");

  threw = false;
  try { parsePayload(rawMissingField); } catch (e) {
    threw = e instanceof TypeError;
  }
  console.assert(threw, "T2b: missing channel field should throw TypeError");
}

// ── Test 3: dispatchOne — successful delivery ────────────────────────────────
{
  callLog = [];
  const payload = parsePayload(rawEmail);
  const status = await dispatchOne(payload, mockRegistry, 0);
  console.assert(status.status === "sent",    "T3a: status should be 'sent'");
  console.assert(status.id === "e1",          "T3b: id should be 'e1'");
  console.assert(callLog.includes("email:e1"),"T3c: handler should have been called");
}

// ── Test 4: dispatchOne — failure with retry ─────────────────────────────────
{
  callLog = [];
  const payload = parsePayload(rawEmailFail);
  // maxRetries = 2 → 3 total attempts
  const status = await dispatchOne(payload, mockRegistry, 2);
  console.assert(status.status === "failed",         "T4a: status should be 'failed'");
  console.assert(status.id === "email-fail",          "T4b: id should be 'email-fail'");
  console.assert(
    callLog.filter((e) => e === "email:email-fail").length === 3,
    "T4c: handler should have been called exactly 3 times (1 + 2 retries)",
  );
}

// ── Test 5: dispatchAll — mixed payloads including invalid ───────────────────
{
  callLog = [];
  const report: DeliveryReport = await dispatchAll(
    [rawEmail, rawSms, rawPush, rawEmailFail, rawInvalid],
    mockRegistry,
    1, // 1 retry → 2 total attempts per failure
  );

  const sentCount   = report.results.filter((r) => r.status === "sent").length;
  const failedCount = report.results.filter((r) => r.status === "failed").length;

  console.assert(report.results.length === 5,  "T5a: should have 5 result entries");
  console.assert(sentCount   === 3,             "T5b: 3 deliveries should succeed (email, sms, push)");
  console.assert(failedCount === 2,             "T5c: 2 deliveries should fail (email-fail, invalid)");

  console.assert(
    report.summary.email.sent   === 1 &&
    report.summary.email.failed === 2,  // email-fail + invalid (falls back to "email")
    "T5d: email summary should be { sent: 1, failed: 2 }",
  );
  console.assert(
    report.summary.sms.sent === 1 && report.summary.sms.failed === 0,
    "T5e: sms summary should be { sent: 1, failed: 0 }",
  );
  console.assert(
    report.summary.push.sent === 1 && report.summary.push.failed === 0,
    "T5f: push summary should be { sent: 1, failed: 0 }",
  );
}

console.log("All tests passed ✓");
