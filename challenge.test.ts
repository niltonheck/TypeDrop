// ─── challenge.test.ts ───────────────────────────────────────────────────────
import {
  validateNotification,
  dispatch,
  fanOutDispatch,
  type Notification,
  type ChannelSenders,
  type DispatchReceipt,
  type DispatchError,
  type Result,
  type RecipientId,
  type NotificationId,
  type DispatchConfig,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────
function rid(s: string): RecipientId {
  return s as RecipientId;
}
function nid(s: string): NotificationId {
  return s as NotificationId;
}
function ok<T>(r: Result<T, unknown>, label: string): void {
  console.assert(r.ok === true, `[FAIL] ${label} — expected ok:true, got ok:false`);
}
function fail<E>(r: Result<unknown, E>, label: string): void {
  console.assert(r.ok === false, `[FAIL] ${label} — expected ok:false, got ok:true`);
}

// ── Mock senders ──────────────────────────────────────────────────────────────
const makeSender = <N extends Notification>(
  succeed: boolean
): ((n: N) => Promise<Result<DispatchReceipt, DispatchError>>) =>
  async (n) => {
    if (succeed) {
      return {
        ok: true,
        value: {
          notificationId: n.id,
          recipientId: n.recipientId,
          channel: n.channel,
          dispatchedAt: new Date(),
        },
      };
    }
    return {
      ok: false,
      error: { kind: "DispatchError", channel: n.channel, reason: "mock failure" },
    };
  };

const successSenders: ChannelSenders = {
  email: makeSender(true),
  sms: makeSender(true),
  push: makeSender(true),
};

const failSenders: ChannelSenders = {
  email: makeSender(false),
  sms: makeSender(false),
  push: makeSender(false),
};

// ── Test 1: validateNotification — valid email ────────────────────────────────
const rawEmail = {
  id: "n-001",
  channel: "email",
  recipientId: "r-001",
  toAddress: "alice@example.com",
  subject: "Hello",
  body: "Welcome!",
};
ok(validateNotification(rawEmail), "Test 1: valid email notification");

// ── Test 2: validateNotification — missing field ──────────────────────────────
const rawBadSms = {
  id: "n-002",
  channel: "sms",
  recipientId: "r-002",
  // missing phoneNumber and text
};
fail(validateNotification(rawBadSms), "Test 2: sms missing phoneNumber");

// ── Test 3: dispatch — success path ──────────────────────────────────────────
(async () => {
  const notification: Notification = {
    id: nid("n-003"),
    channel: "push",
    recipientId: rid("r-003"),
    deviceToken: "tok-abc",
    title: "New message",
    payload: { from: "bob" },
  };
  const result = await dispatch(notification, successSenders);
  ok(result, "Test 3: dispatch push notification succeeds");
  if (result.ok) {
    console.assert(
      result.value.channel === "push",
      "[FAIL] Test 3: receipt channel should be 'push'"
    );
  }
})();

// ── Test 4: fanOutDispatch — mixed valid/invalid payloads ─────────────────────
(async () => {
  const payloads: unknown[] = [
    { id: "n-010", channel: "email", recipientId: "r-010", toAddress: "a@b.com", subject: "Hi", body: "Body" },
    { id: "n-011", channel: "sms",   recipientId: "r-011", phoneNumber: "+15550001111", text: "Ping" },
    { id: "n-012", channel: "push",  recipientId: "r-012", deviceToken: "tok-xyz", title: "Alert", payload: { key: "val" } },
    { channel: "email" }, // invalid — missing id
  ];

  const config: DispatchConfig = { concurrencyLimit: 2, senders: successSenders };
  const summary = await fanOutDispatch(payloads, config);

  console.assert(summary.results.length === 4, "[FAIL] Test 4: should have 4 results");
  console.assert(summary.succeeded === 3, `[FAIL] Test 4: expected 3 succeeded, got ${summary.succeeded}`);
  console.assert(summary.failed === 1, `[FAIL] Test 4: expected 1 failed, got ${summary.failed}`);
})();

// ── Test 5: fanOutDispatch — all fail at dispatch layer ───────────────────────
(async () => {
  const payloads: unknown[] = [
    { id: "n-020", channel: "sms", recipientId: "r-020", phoneNumber: "+15559990000", text: "Fail me" },
    { id: "n-021", channel: "sms", recipientId: "r-021", phoneNumber: "+15559990001", text: "Fail me too" },
  ];
  const config: DispatchConfig = { concurrencyLimit: 1, senders: failSenders };
  const summary = await fanOutDispatch(payloads, config);

  console.assert(summary.succeeded === 0, "[FAIL] Test 5: expected 0 succeeded");
  console.assert(summary.failed === 2, `[FAIL] Test 5: expected 2 failed, got ${summary.failed}`);
})();
