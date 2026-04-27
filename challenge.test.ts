// challenge.test.ts
import {
  parseNotification,
  routeNotification,
  processAll,
  ValidationError,
  type Notification,
  type DeliveryReport,
} from "./challenge";

// ── Mock payloads ─────────────────────────────────────────────────────────────

const validEmail = {
  channel: "email",
  to: "alice@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
};

const validSms = {
  channel: "sms",
  to: "+15550001234",
  message: "Your OTP is 9876.",
};

const validPush = {
  channel: "push",
  deviceToken: "tok_abc123",
  title: "New message",
  body: "Bob sent you a file.",
};

const invalidMissingChannel = {
  to: "bob@example.com",
};

const invalidBadChannel = {
  channel: "fax",
  to: "+15550009999",
};

const invalidEmailMissingField = {
  channel: "email",
  to: "charlie@example.com",
  // missing subject and body
};

// ── Test 1: parseNotification returns correct variant ─────────────────────────
const parsedEmail = parseNotification(validEmail);
console.assert(
  parsedEmail.channel === "email",
  "T1 FAIL: expected channel 'email'"
);
console.log("T1 passed: parseNotification identifies email channel");

// ── Test 2: parseNotification throws ValidationError on bad payload ────────────
let caughtValidation = false;
try {
  parseNotification(invalidMissingChannel);
} catch (e) {
  caughtValidation = e instanceof ValidationError;
}
console.assert(caughtValidation, "T2 FAIL: expected ValidationError for missing channel");
console.log("T2 passed: ValidationError thrown for missing channel");

let caughtBadChannel = false;
try {
  parseNotification(invalidBadChannel);
} catch (e) {
  caughtBadChannel = e instanceof ValidationError;
}
console.assert(caughtBadChannel, "T2b FAIL: expected ValidationError for unknown channel 'fax'");
console.log("T2b passed: ValidationError thrown for unknown channel");

// ── Test 3: routeNotification returns a DeliveryReport ────────────────────────
const parsedSms = parseNotification(validSms);
const smsReport = routeNotification(parsedSms);
console.assert(
  smsReport.status === "delivered" || smsReport.status === "failed",
  "T3 FAIL: report must have status 'delivered' or 'failed'"
);
console.assert(
  smsReport.channel === "sms",
  "T3 FAIL: report channel must match notification channel"
);
console.log("T3 passed: routeNotification returns a valid DeliveryReport for sms");

// ── Test 4: processAll handles mixed valid and invalid payloads ───────────────
const raws: unknown[] = [
  validEmail,
  validSms,
  validPush,
  invalidMissingChannel,
  invalidEmailMissingField,
];
const reports = processAll(raws);

console.assert(
  reports.length === 5,
  `T4 FAIL: expected 5 reports, got ${reports.length}`
);
console.assert(
  reports[3].status === "failed" && reports[3].channel === "unknown",
  "T4 FAIL: invalid payload should produce failed report with channel 'unknown'"
);
console.assert(
  reports[4].status === "failed" && reports[4].channel === "unknown",
  "T4 FAIL: incomplete email payload should produce failed report with channel 'unknown'"
);
console.log("T4 passed: processAll returns one report per input, failures use channel 'unknown'");

// ── Test 5: delivered reports carry sentAt timestamp ─────────────────────────
const parsedPush = parseNotification(validPush);
const pushReport = routeNotification(parsedPush);
if (pushReport.status === "delivered") {
  console.assert(
    typeof pushReport.sentAt === "number",
    "T5 FAIL: delivered report must have numeric sentAt"
  );
  console.log("T5 passed: delivered report has numeric sentAt");
} else {
  // push uses deviceToken length as seed; tok_abc123 length = 11 (odd) → failed
  console.assert(
    typeof pushReport.reason === "string",
    "T5 FAIL: failed report must have string reason"
  );
  console.log("T5 passed: failed push report has string reason");
}
