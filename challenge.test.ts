// challenge.test.ts
import { hashUserId, parseFeatureFlag, evaluateFlag, evaluateAll } from "./challenge";
import type { FeatureFlag, UserContext, EvaluationResult } from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const proUser: UserContext = {
  userId: "user-42",
  attributes: { plan: "pro", region: "us-east" },
};

const freeUser: UserContext = {
  userId: "user-99",
  attributes: { plan: "free", region: "eu-west" },
};

// A flag that is disabled entirely
const rawDisabledFlag: unknown = {
  id: "flag-dark-mode",
  name: "Dark Mode",
  enabled: false,
  rules: [],
  defaultValue: false,
};

// A flag with an allowlist rule
const rawAllowlistFlag: unknown = {
  id: "flag-beta-dashboard",
  name: "Beta Dashboard",
  enabled: true,
  rules: [{ kind: "allowlist", userIds: ["user-42", "user-7"] }],
  defaultValue: false,
};

// A flag with an attribute rule
const rawAttributeFlag: unknown = {
  id: "flag-pro-feature",
  name: "Pro Feature",
  enabled: true,
  rules: [{ kind: "attribute", key: "plan", values: ["pro", "enterprise"] }],
  defaultValue: false,
};

// A flag with a percentage rule — user-42 hash % 100 determines match
const rawPercentageFlag: unknown = {
  id: "flag-new-onboarding",
  name: "New Onboarding",
  enabled: true,
  rules: [{ kind: "percentage", rolloutPercent: 100 }], // 100% → always matches
  defaultValue: false,
};

// Malformed flag (missing `id`)
const rawBrokenFlag: unknown = {
  name: "Broken Flag",
  enabled: true,
  rules: [],
  defaultValue: true,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Test 1: disabled flag always returns value=false with reason "disabled"
const disabledFlag: FeatureFlag = parseFeatureFlag(rawDisabledFlag);
const disabledResult: EvaluationResult = evaluateFlag(disabledFlag, proUser);
console.assert(
  disabledResult.value === false && disabledResult.reason.kind === "disabled",
  `[FAIL] Test 1 — disabled flag: expected value=false, reason.kind="disabled", got ${JSON.stringify(disabledResult)}`
);
console.log("[PASS] Test 1 — disabled flag returns correct result");

// Test 2: allowlist rule matches proUser, does not match freeUser
const allowlistFlag: FeatureFlag = parseFeatureFlag(rawAllowlistFlag);
const allowlistProResult: EvaluationResult = evaluateFlag(allowlistFlag, proUser);
const allowlistFreeResult: EvaluationResult = evaluateFlag(allowlistFlag, freeUser);
console.assert(
  allowlistProResult.value === true &&
    allowlistProResult.reason.kind === "rule_match" &&
    allowlistProResult.reason.ruleKind === "allowlist",
  `[FAIL] Test 2a — allowlist should match proUser: got ${JSON.stringify(allowlistProResult)}`
);
console.assert(
  allowlistFreeResult.value === false &&
    allowlistFreeResult.reason.kind === "default",
  `[FAIL] Test 2b — allowlist should NOT match freeUser: got ${JSON.stringify(allowlistFreeResult)}`
);
console.log("[PASS] Test 2 — allowlist rule matches correctly");

// Test 3: attribute rule matches proUser (plan=pro), not freeUser (plan=free)
const attributeFlag: FeatureFlag = parseFeatureFlag(rawAttributeFlag);
const attrProResult: EvaluationResult = evaluateFlag(attributeFlag, proUser);
const attrFreeResult: EvaluationResult = evaluateFlag(attributeFlag, freeUser);
console.assert(
  attrProResult.value === true && attrProResult.reason.kind === "rule_match" && attrProResult.reason.ruleKind === "attribute",
  `[FAIL] Test 3a — attribute rule should match proUser: got ${JSON.stringify(attrProResult)}`
);
console.assert(
  attrFreeResult.value === false && attrFreeResult.reason.kind === "default",
  `[FAIL] Test 3b — attribute rule should NOT match freeUser: got ${JSON.stringify(attrFreeResult)}`
);
console.log("[PASS] Test 3 — attribute rule matches correctly");

// Test 4: percentage rule at 100% always matches
const percentageFlag: FeatureFlag = parseFeatureFlag(rawPercentageFlag);
const pctResult: EvaluationResult = evaluateFlag(percentageFlag, freeUser);
console.assert(
  pctResult.value === true && pctResult.reason.kind === "rule_match" && pctResult.reason.ruleKind === "percentage",
  `[FAIL] Test 4 — 100% rollout should always match: got ${JSON.stringify(pctResult)}`
);
console.log("[PASS] Test 4 — percentage rule at 100% always matches");

// Test 5: evaluateAll collects parse errors and valid results
const allRaw: unknown[] = [
  rawDisabledFlag,
  rawBrokenFlag,       // index 1 → parse error
  rawAttributeFlag,
];
const { results, parseErrors } = evaluateAll(allRaw, proUser);
console.assert(
  results.length === 2,
  `[FAIL] Test 5a — expected 2 valid results, got ${results.length}`
);
console.assert(
  parseErrors.length === 1 && parseErrors[0].index === 1,
  `[FAIL] Test 5b — expected 1 parse error at index 1, got ${JSON.stringify(parseErrors)}`
);
console.log("[PASS] Test 5 — evaluateAll handles mixed valid/invalid flags");

console.log("\nAll tests complete.");
