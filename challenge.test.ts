// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  isFrequency,
  isChannelConfig,
  parsePartialPreferences,
  mergePreferences,
  PLATFORM_DEFAULTS,
  type PreferencesMap,
  type ResolvedPreferences,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const orgDefaults: PreferencesMap = {
  email: { frequency: "immediate", preview: true },
  sms:   { frequency: "digest",    preview: false },
  push:  { frequency: "off",       preview: false },
};

// Valid user blob — overrides email and push, leaves sms alone
const userRawValid: unknown = {
  email: { frequency: "digest", preview: false },
  push:  { frequency: "immediate", preview: true },
  // sms is absent — should fall back to org default
};

// Partially invalid user blob — sms has a bad frequency, push is fine
const userRawPartiallyInvalid: unknown = {
  sms:  { frequency: "weekly", preview: true },  // "weekly" is not a Frequency
  push: { frequency: "off", preview: false },
};

// Completely invalid blob
const userRawGarbage: unknown = "not-an-object";

// ── Tests ─────────────────────────────────────────────────────

// 1. isFrequency correctly identifies valid and invalid values
console.assert(isFrequency("immediate") === true,  "FAIL 1a: 'immediate' should be a Frequency");
console.assert(isFrequency("digest")    === true,  "FAIL 1b: 'digest' should be a Frequency");
console.assert(isFrequency("off")       === true,  "FAIL 1c: 'off' should be a Frequency");
console.assert(isFrequency("weekly")    === false, "FAIL 1d: 'weekly' should NOT be a Frequency");
console.assert(isFrequency(42)          === false, "FAIL 1e: 42 should NOT be a Frequency");
console.assert(isFrequency(null)        === false, "FAIL 1f: null should NOT be a Frequency");

// 2. isChannelConfig validates shape correctly
console.assert(
  isChannelConfig({ frequency: "digest", preview: false }) === true,
  "FAIL 2a: valid ChannelConfig not recognised"
);
console.assert(
  isChannelConfig({ frequency: "weekly", preview: true }) === false,
  "FAIL 2b: invalid frequency should fail ChannelConfig check"
);
console.assert(
  isChannelConfig({ frequency: "off" }) === false,
  "FAIL 2c: missing preview should fail ChannelConfig check"
);
console.assert(
  isChannelConfig(null) === false,
  "FAIL 2d: null should fail ChannelConfig check"
);

// 3. parsePartialPreferences keeps valid entries and drops bad ones
const parsed = parsePartialPreferences(userRawPartiallyInvalid);
console.assert(
  parsed.sms === undefined,
  "FAIL 3a: sms with bad frequency should be dropped"
);
console.assert(
  parsed.push?.frequency === "off" && parsed.push?.preview === false,
  "FAIL 3b: valid push entry should be kept"
);

// 4. mergePreferences — happy path
const result: ResolvedPreferences = mergePreferences("user-42", orgDefaults, userRawValid);
console.assert(result.userId === "user-42", "FAIL 4a: userId mismatch");
console.assert(
  result.preferences.email.frequency === "digest" &&
  result.preferences.email.preview   === false,
  "FAIL 4b: email should be overridden by user value"
);
console.assert(
  result.preferences.sms.frequency === "digest" &&
  result.preferences.sms.preview   === false,
  "FAIL 4c: sms should fall back to org default"
);
console.assert(
  result.preferences.push.frequency === "immediate" &&
  result.preferences.push.preview   === true,
  "FAIL 4d: push should be overridden by user value"
);
console.assert(
  JSON.stringify(result.overriddenChannels) === JSON.stringify(["email", "push"]),
  "FAIL 4e: overriddenChannels should be ['email', 'push'] (sorted)"
);
console.assert(
  typeof result.mergedAt === "string" && result.mergedAt.includes("T"),
  "FAIL 4f: mergedAt should be an ISO-8601 string"
);

// 5. mergePreferences — garbage input yields no overrides, all org defaults preserved
const resultGarbage = mergePreferences("user-99", orgDefaults, userRawGarbage);
console.assert(
  resultGarbage.overriddenChannels.length === 0,
  "FAIL 5a: garbage input should produce no overrides"
);
console.assert(
  resultGarbage.preferences.email.frequency === "immediate",
  "FAIL 5b: org default for email should be preserved"
);

console.log("All assertions passed ✅");
