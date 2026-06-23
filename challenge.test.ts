// challenge.test.ts
import {
  parseFlag,
  evaluateFlag,
  evaluateFlags,
  deterministicHash,
  type FeatureFlag,
  type UserContext,
  type ValidationError,
} from "./challenge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const alice: UserContext = {
  userId: "user-alice",
  email: "alice@acme.com",
  country: "US",
  plan: "pro",
  accountAgeDays: 120,
};

const bob: UserContext = {
  userId: "user-bob",
  email: "bob@example.com",
  country: "DE",
  plan: "free",
  accountAgeDays: 5,
};

const rawFlags: unknown[] = [
  // Flag 0: country targeting — Alice (US) should get "variant-a"
  {
    key: "new-dashboard",
    description: "Rolls out the new dashboard UI",
    enabled: true,
    rules: [
      { attribute: "country", operator: "in", value: ["US", "CA"], variant: "variant-a" },
      { attribute: "plan", operator: "eq", value: "enterprise", variant: "variant-b" },
    ],
    defaultVariant: "control",
    rolloutPercentage: 100,
  },
  // Flag 1: disabled flag — everyone gets default
  {
    key: "experimental-ai",
    description: "AI features experiment",
    enabled: false,
    rules: [
      { attribute: "plan", operator: "eq", value: "enterprise", variant: "ai-on" },
    ],
    defaultVariant: "ai-off",
    rolloutPercentage: 100,
  },
  // Flag 2: account age gate — Bob (5 days) should get default
  {
    key: "advanced-export",
    description: "Advanced CSV export",
    enabled: true,
    rules: [
      { attribute: "accountAgeDays", operator: "gt", value: 30, variant: "export-on" },
    ],
    defaultVariant: "export-off",
    rolloutPercentage: 100,
  },
  // Flag 3: invalid — missing key field
  {
    description: "Bad flag",
    enabled: true,
    rules: [],
    defaultVariant: "off",
    rolloutPercentage: 50,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

// Test 1: parseFlag rejects a flag missing the `key` field
const badResult = parseFlag(rawFlags[3], 3);
console.assert(
  badResult.ok === false,
  "TEST 1 FAILED: parseFlag should return ok:false for flag missing `key`"
);
console.log("TEST 1 passed:", !badResult.ok && badResult.error.message);

// Test 2: parseFlag accepts a valid flag
const goodResult = parseFlag(rawFlags[0], 0);
console.assert(
  goodResult.ok === true,
  "TEST 2 FAILED: parseFlag should return ok:true for a valid flag"
);
console.log("TEST 2 passed: parsed flag key =", goodResult.ok && goodResult.value.key);

// Test 3: evaluateFlag — Alice gets "variant-a" for "new-dashboard" (country rule matches)
if (goodResult.ok) {
  const eval3 = evaluateFlag(goodResult.value, alice);
  console.assert(
    eval3.variant === "variant-a" && eval3.reason === "RULE_MATCH" && eval3.matchedRuleIndex === 0,
    `TEST 3 FAILED: expected variant-a/RULE_MATCH/0, got ${eval3.variant}/${eval3.reason}/${eval3.matchedRuleIndex}`
  );
  console.log("TEST 3 passed:", eval3);
}

// Test 4: evaluateFlag — disabled flag always returns default variant
const disabledResult = parseFlag(rawFlags[1], 1);
if (disabledResult.ok) {
  const eval4 = evaluateFlag(disabledResult.value, alice);
  console.assert(
    eval4.variant === "ai-off" && eval4.reason === "DISABLED",
    `TEST 4 FAILED: expected ai-off/DISABLED, got ${eval4.variant}/${eval4.reason}`
  );
  console.log("TEST 4 passed:", eval4);
}

// Test 5: evaluateFlags — full report for Alice; invalid flag is skipped, error collected
const errors: ValidationError[] = [];
const report = evaluateFlags(rawFlags, alice, errors);

console.assert(
  report.results.length === 3,
  `TEST 5 FAILED: expected 3 results (1 invalid skipped), got ${report.results.length}`
);
console.assert(
  errors.length === 1,
  `TEST 5 FAILED: expected 1 validation error, got ${errors.length}`
);
console.assert(
  report.overrideCount === 1,
  `TEST 5 FAILED: expected overrideCount 1 (new-dashboard rule match), got ${report.overrideCount}`
);
console.log("TEST 5 passed — report:", JSON.stringify(report, null, 2));
console.log("TEST 5 errors:", errors);

// Bonus check: deterministicHash is stable
const h1 = deterministicHash("new-dashboard:user-alice");
const h2 = deterministicHash("new-dashboard:user-alice");
console.assert(h1 === h2, "deterministicHash must be deterministic");
console.log("BONUS hash stability check passed:", h1);
