// ============================================================
// challenge.test.ts
// ============================================================
import {
  createRouter,
  summarise,
  type NotificationEvent,
  type DeliveryResult,
  type HandlerMap,
} from "./challenge";

// ── Mock handlers ─────────────────────────────────────────────
const handlers: HandlerMap = {
  email: (event) => ({
    channel: "email",
    status: event.to.includes("@") ? "sent" : "failed",
    message: `Delivered to ${event.to}`,
  }),
  push: (event) => ({
    channel: "push",
    status: event.deviceToken.length > 0 ? "sent" : "skipped",
    message: `Push "${event.title}" dispatched`,
  }),
  sms: (event) => ({
    channel: "sms",
    status: event.phoneNumber.startsWith("+") ? "sent" : "failed",
    message: `SMS to ${event.phoneNumber}`,
  }),
};

const router = createRouter(handlers);

// ── Mock events ───────────────────────────────────────────────
const events: NotificationEvent[] = [
  {
    channel: "email",
    to: "alice@example.com",
    subject: "Welcome!",
    body: "Thanks for signing up.",
  },
  {
    channel: "push",
    deviceToken: "tok_abc123",
    title: "New message",
    payload: { from: "bob" },
  },
  {
    channel: "sms",
    phoneNumber: "+14155552671",
    message: "Your code is 9821",
  },
  {
    channel: "sms",
    phoneNumber: "0800INVALID",   // no leading '+' → should fail
    message: "Bad number test",
  },
  {
    channel: "email",
    to: "not-an-email",           // no '@' → should fail
    subject: "Oops",
    body: "This will fail.",
  },
];

// ── Route each event ──────────────────────────────────────────
const results: DeliveryResult[] = events.map((e) => router.route(e));

// ── Assertions ────────────────────────────────────────────────

// 1. Correct number of results
console.assert(
  results.length === 5,
  `Expected 5 results, got ${results.length}`
);

// 2. Valid email → sent
console.assert(
  results[0].status === "sent",
  `Expected email[0] to be 'sent', got '${results[0].status}'`
);

// 3. Invalid email (no '@') → failed
console.assert(
  results[4].status === "failed",
  `Expected email[4] to be 'failed', got '${results[4].status}'`
);

// 4. SMS with '+' prefix → sent; without → failed
console.assert(
  results[2].status === "sent" && results[3].status === "failed",
  `SMS statuses incorrect: ${results[2].status}, ${results[3].status}`
);

// ── Summarise ─────────────────────────────────────────────────
const summary = summarise(results);

// 5. Counts add up to total
const countSum =
  summary.counts.sent + summary.counts.failed + summary.counts.skipped;

console.assert(
  summary.total === 5 && countSum === 5,
  `Summary totals wrong: total=${summary.total}, countSum=${countSum}`
);

// 6. byChannel grouping — sms should have 2 entries
console.assert(
  (summary.byChannel.sms ?? []).length === 2,
  `Expected 2 SMS results in byChannel, got ${(summary.byChannel.sms ?? []).length}`
);

// 7. sent count should be 3 (email✓, push✓, sms✓)
console.assert(
  summary.counts.sent === 3,
  `Expected 3 'sent', got ${summary.counts.sent}`
);

console.log("All assertions passed ✅");
console.log("Summary:", JSON.stringify(summary, null, 2));
