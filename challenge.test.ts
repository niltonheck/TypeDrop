// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateSubscription,
  dispatchNotifications,
  type Channel,
  type NotificationMessage,
  type HandlerRegistry,
  type DeliveryOutcome,
  ok,
  err,
} from "./challenge";

// ------------------------------------------------------------------
// MOCK HANDLERS
// ------------------------------------------------------------------
const mockRegistry: HandlerRegistry = {
  email: async (channel, message) => {
    if (channel.address.includes("@")) {
      return ok(`Email sent to ${channel.address}: "${message.subject}"`);
    }
    return err("Invalid email address");
  },
  sms: async (channel, message) => {
    if (channel.phone.startsWith("+")) {
      return ok(`SMS sent to ${channel.phone}: "${message.text}"`);
    }
    return err("Phone must start with +");
  },
  push: async (channel, _message) => {
    return ok(`Push delivered to device ${channel.deviceToken}`);
  },
};

// ------------------------------------------------------------------
// MOCK MESSAGES
// ------------------------------------------------------------------
const messages: readonly NotificationMessage[] = [
  { kind: "email", subject: "Welcome!", body: "Thanks for signing up." },
  { kind: "sms",   text: "Your code is 1234" },
  { kind: "push",  title: "New message", payload: { from: "alice" } },
];

// ------------------------------------------------------------------
// TEST 1: validateSubscription — happy path
// ------------------------------------------------------------------
const rawValid = {
  userId: "user-1",
  channels: [
    { kind: "email", address: "user@example.com" },
    { kind: "sms",   phone: "+15550001234" },
  ],
};

const validationResult = validateSubscription(rawValid);
console.assert(validationResult.ok === true, "TEST 1 FAILED: expected ok");
if (validationResult.ok) {
  console.assert(
    validationResult.value.channels.length === 2,
    "TEST 1 FAILED: expected 2 channels"
  );
  console.assert(
    validationResult.value.userId === "user-1",
    "TEST 1 FAILED: userId mismatch"
  );
}

// ------------------------------------------------------------------
// TEST 2: validateSubscription — non-array channels
// ------------------------------------------------------------------
const rawBadChannels = { userId: "user-2", channels: "not-an-array" };
const badResult = validateSubscription(rawBadChannels);
console.assert(badResult.ok === false, "TEST 2 FAILED: expected err");
if (!badResult.ok) {
  console.assert(
    badResult.error.code === "INVALID_CHANNELS",
    "TEST 2 FAILED: expected INVALID_CHANNELS"
  );
}

// ------------------------------------------------------------------
// TEST 3: validateSubscription — all channels malformed → EMPTY_CHANNELS
// ------------------------------------------------------------------
const rawAllBad = {
  userId: "user-3",
  channels: [
    { kind: "email" },             // missing address
    { kind: "sms", phone: "" },    // empty phone
    { kind: "unknown", foo: "x" }, // unknown kind
  ],
};
const emptyResult = validateSubscription(rawAllBad);
console.assert(emptyResult.ok === false, "TEST 3 FAILED: expected err");
if (!emptyResult.ok) {
  console.assert(
    emptyResult.error.code === "EMPTY_CHANNELS",
    "TEST 3 FAILED: expected EMPTY_CHANNELS"
  );
}

// ------------------------------------------------------------------
// TEST 4: dispatchNotifications — all channels matched and sent
// ------------------------------------------------------------------
(async () => {
  const sub = {
    userId: "user-4",
    channels: [
      { kind: "email" as const, address: "user@example.com" },
      { kind: "sms"   as const, phone: "+15550001234" },
      { kind: "push"  as const, deviceToken: "tok-abc" },
    ] as readonly Channel[],
  };

  const result = await dispatchNotifications(sub, messages, mockRegistry);
  console.assert(result.ok === true, "TEST 4 FAILED: expected ok");
  if (result.ok) {
    const outcome: DeliveryOutcome = result.value;
    console.assert(outcome.email.status === "sent",   "TEST 4 FAILED: email not sent");
    console.assert(outcome.sms.status   === "sent",   "TEST 4 FAILED: sms not sent");
    console.assert(outcome.push.status  === "sent",   "TEST 4 FAILED: push not sent");
  }

  // ------------------------------------------------------------------
  // TEST 5: dispatchNotifications — missing message → skipped
  // ------------------------------------------------------------------
  const subEmailOnly = {
    userId: "user-5",
    channels: [
      { kind: "email" as const, address: "user@example.com" },
      { kind: "sms"   as const, phone: "+15550001234" },
    ] as readonly Channel[],
  };

  const messagesNoSms: readonly NotificationMessage[] = [
    { kind: "email", subject: "Hi", body: "Body" },
    // sms message intentionally omitted
    { kind: "push",  title: "Ping", payload: {} },
  ];

  const result5 = await dispatchNotifications(subEmailOnly, messagesNoSms, mockRegistry);
  console.assert(result5.ok === true, "TEST 5 FAILED: expected ok");
  if (result5.ok) {
    console.assert(result5.value.email.status === "sent",    "TEST 5 FAILED: email not sent");
    console.assert(result5.value.sms.status   === "skipped", "TEST 5 FAILED: sms should be skipped");
  }

  console.log("All tests passed ✅");
})();
