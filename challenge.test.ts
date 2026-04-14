// challenge.test.ts
import {
  isAudience,
  isOperator,
  parseFlagVariant,
  parseTargetingRule,
  parseFeatureFlag,
  evaluateRule,
  evaluateFlags,
  type UserContext,
  type EvaluationReport,
} from "./challenge";

// ── Mock User ─────────────────────────────────────────────────────────────────

const mockUser: UserContext = {
  userId: "u_001",
  email: "alice@acme.com",
  plan: "pro",
  country: "US",
  accountAgeDays: 120,
  audience: "beta",
};

// ── Mock Raw Flags ────────────────────────────────────────────────────────────

const rawBooleanFlag = {
  id: "flag_dark_mode",
  name: "Dark Mode",
  audience: "beta",
  rules: [
    { attribute: "plan", operator: "eq", value: "pro" },
  ],
  defaultVariant: { kind: "boolean", enabled: true },
};

const rawStringFlag = {
  id: "flag_theme",
  name: "UI Theme",
  audience: "public",
  rules: [
    { attribute: "country", operator: "in", value: ["US", "CA"] },
  ],
  defaultVariant: { kind: "string", variant: "light" },
};

const rawNumberFlag = {
  id: "flag_max_seats",
  name: "Max Seats",
  audience: "internal",
  rules: [],
  defaultVariant: { kind: "number", variant: 5 },
};

const rawInvalidFlag = {
  id: "",            // invalid: empty id
  name: "Bad Flag",
  audience: "vip",   // invalid audience
  rules: [],
  defaultVariant: { kind: "boolean", enabled: false },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

// Test 1: isAudience narrows correctly
console.assert(isAudience("beta") === true, "FAIL T1a: 'beta' should be a valid audience");
console.assert(isAudience("vip") === false, "FAIL T1b: 'vip' should NOT be a valid audience");
console.assert(isAudience(42) === false, "FAIL T1c: 42 should NOT be a valid audience");

// Test 2: isOperator narrows correctly
console.assert(isOperator("gte") === true, "FAIL T2a: 'gte' should be a valid operator");
console.assert(isOperator("between") === false, "FAIL T2b: 'between' should NOT be a valid operator");

// Test 3: parseFlagVariant — happy paths
const bv = parseFlagVariant({ kind: "boolean", enabled: false });
console.assert(bv.kind === "boolean", "FAIL T3a: kind should be 'boolean'");

const sv = parseFlagVariant({ kind: "string", variant: "dark" });
console.assert(sv.kind === "string", "FAIL T3b: kind should be 'string'");

// Test 4: parseFlagVariant — throws on bad input
let threw = false;
try { parseFlagVariant({ kind: "boolean", enabled: "yes" }); } catch { threw = true; }
console.assert(threw, "FAIL T4: parseFlagVariant should throw when enabled is not a boolean");

// Test 5: evaluateRule — "eq" match
const eqRule = parseTargetingRule({ attribute: "plan", operator: "eq", value: "pro" });
console.assert(evaluateRule(eqRule, mockUser) === true, "FAIL T5a: plan eq 'pro' should match");

const neqRule = parseTargetingRule({ attribute: "plan", operator: "neq", value: "free" });
console.assert(evaluateRule(neqRule, mockUser) === true, "FAIL T5b: plan neq 'free' should match");

// Test 6: evaluateRule — "in" match
const inRule = parseTargetingRule({ attribute: "country", operator: "in", value: ["US", "CA"] });
console.assert(evaluateRule(inRule, mockUser) === true, "FAIL T6: country in [US,CA] should match");

// Test 7: evaluateRule — "gte" match
const gteRule = parseTargetingRule({ attribute: "accountAgeDays", operator: "gte", value: 90 });
console.assert(evaluateRule(gteRule, mockUser) === true, "FAIL T7: accountAgeDays gte 90 should match");

// Test 8: evaluateFlags — full report shape
const report: EvaluationReport = evaluateFlags(
  [rawBooleanFlag, rawStringFlag, rawNumberFlag, rawInvalidFlag],
  mockUser
);

console.assert(report.userId === mockUser.userId, "FAIL T8a: userId should match");
console.assert(report.results.length === 4, "FAIL T8b: should have 4 results");
console.assert(report.summary.total === 4, "FAIL T8c: total should be 4");

// flag_dark_mode: audience=beta matches user.audience=beta, rule plan eq pro → matched
const darkModeResult = report.results.find(r => r.flagId === "flag_dark_mode");
console.assert(darkModeResult?.status === "matched", "FAIL T8d: dark_mode flag should be 'matched'");

// flag_theme: audience=public → always eligible, rule country in [US,CA] → matched
const themeResult = report.results.find(r => r.flagId === "flag_theme");
console.assert(themeResult?.status === "matched", "FAIL T8e: theme flag should be 'matched'");

// flag_max_seats: audience=internal, user.audience=beta → default
const seatsResult = report.results.find(r => r.flagId === "flag_max_seats");
console.assert(seatsResult?.status === "default", "FAIL T8f: max_seats flag should be 'default' (audience mismatch)");

// invalid flag → invalid
const invalidResult = report.results.find(r => r.status === "invalid");
console.assert(invalidResult !== undefined, "FAIL T8g: should have one invalid result");

console.assert(report.summary.invalid === 1, "FAIL T8h: summary.invalid should be 1");
console.assert(report.summary.matched === 2, "FAIL T8i: summary.matched should be 2");
console.assert(report.summary.defaulted === 1, "FAIL T8j: summary.defaulted should be 1");

console.log("All assertions passed ✅");
