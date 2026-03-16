// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts — Typed Notification Preference Engine
// ─────────────────────────────────────────────────────────────────────────────
import {
  parsePreferences,
  mergeWithDefaults,
  resolvePreferences,
  describeResolved,
  SYSTEM_DEFAULTS,
  ok,
  err,
} from "./challenge";

// ── Helpers ───────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Test 1: parsePreferences — valid partial payload ─────────────────────────

const rawValid: unknown = {
  email: { enabled: true, frequency: "weekly" },
  push: { enabled: false, badge: false, sound: true },
};

const parsed = parsePreferences(rawValid);
assert(parsed.kind === "ok", "parsePreferences returns Ok for valid input");
if (parsed.kind === "ok") {
  assert(
    parsed.value.email?.frequency === "weekly",
    "email frequency is preserved as 'weekly'"
  );
  assert(
    parsed.value.push?.enabled === false,
    "push.enabled is preserved as false"
  );
  assert(
    parsed.value.sms === undefined,
    "sms is undefined when not provided"
  );
}

// ── Test 2: parsePreferences — unknown channel ────────────────────────────────

const rawUnknownChannel: unknown = {
  email: { enabled: true },
  fax: { enabled: true }, // unknown channel
};

const parsedUnknown = parsePreferences(rawUnknownChannel);
assert(
  parsedUnknown.kind === "err",
  "parsePreferences returns Err for unknown channel"
);
if (parsedUnknown.kind === "err") {
  assert(
    parsedUnknown.error.kind === "unknown_channel",
    "error kind is 'unknown_channel'"
  );
  if (parsedUnknown.error.kind === "unknown_channel") {
    assert(
      parsedUnknown.error.channel === "fax",
      "error reports the offending channel name 'fax'"
    );
  }
}

// ── Test 3: parsePreferences — invalid field value ────────────────────────────

const rawBadFrequency: unknown = {
  email: { enabled: true, frequency: "monthly" }, // "monthly" is not allowed
};

const parsedBad = parsePreferences(rawBadFrequency);
assert(
  parsedBad.kind === "err",
  "parsePreferences returns Err for invalid frequency value"
);
if (parsedBad.kind === "err") {
  assert(
    parsedBad.error.kind === "validation_error",
    "error kind is 'validation_error' for bad frequency"
  );
}

// ── Test 4: mergeWithDefaults — partial prefs fill in defaults ────────────────

const partialPrefs = parsePreferences({ sms: { enabled: true, quietHoursStart: 21, quietHoursEnd: 7 } });
assert(partialPrefs.kind === "ok", "partial sms-only prefs parse successfully");
if (partialPrefs.kind === "ok") {
  const resolved = mergeWithDefaults(partialPrefs.value);
  assert(
    resolved.sms.enabled === true,
    "merged: sms.enabled is overridden to true"
  );
  assert(
    resolved.sms.quietHoursStart === 21,
    "merged: sms.quietHoursStart is overridden to 21"
  );
  // email and push should fall back to SYSTEM_DEFAULTS
  assert(
    resolved.email.frequency === SYSTEM_DEFAULTS.email.frequency,
    "merged: email falls back to system default frequency"
  );
  assert(
    resolved.push.badge === SYSTEM_DEFAULTS.push.badge,
    "merged: push.badge falls back to system default"
  );
}

// ── Test 5: describeResolved — summary keys and content ──────────────────────

const fullResolved = resolvePreferences({
  email: { enabled: true, frequency: "instant" },
});
assert(fullResolved.kind === "ok", "resolvePreferences succeeds for full valid input");
if (fullResolved.kind === "ok") {
  const summary = describeResolved(fullResolved.value);
  assert(
    "email_summary" in summary &&
      "sms_summary" in summary &&
      "push_summary" in summary,
    "describeResolved returns all three summary keys"
  );
  assert(
    summary.email_summary.toLowerCase().includes("enabled"),
    "email_summary mentions enabled state"
  );
  assert(
    summary.email_summary.toLowerCase().includes("instant"),
    "email_summary mentions frequency 'instant'"
  );
  assert(
    summary.sms_summary.toLowerCase().includes("22") ||
      summary.sms_summary.includes(SYSTEM_DEFAULTS.sms.quietHoursStart.toString()),
    "sms_summary mentions quiet hours start"
  );
}

console.log("\nAll tests complete.");
