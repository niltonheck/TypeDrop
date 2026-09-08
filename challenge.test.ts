// challenge.test.ts
import {
  stableHash,
  evaluateFlag,
  evaluateWithAudit,
  batchEvaluate,
  type Flag,
  type UserContext,
  type EvaluationRecord,
} from "./challenge";

// ─── Mock flag configs ───────────────────────────────────────────────────────

const darkModeFlag = {
  key: "flag_dark_mode" as const,
  rules: [
    { kind: "boolean" as const, value: true },
  ],
  defaultVariant: "off" as const,
} satisfies Flag<"on" | "off">;

const rolloutFlag = {
  key: "flag_new_dashboard" as const,
  rules: [
    { kind: "percentage" as const, threshold: 50 },
  ],
  defaultVariant: "off" as const,
} satisfies Flag<"on" | "off">;

const themeFlag = {
  key: "flag_theme" as const,
  rules: [
    {
      kind: "segment" as const,
      segmentVariants: {
        beta: "midnight",
        internal: "midnight",
        standard: "default",
        enterprise: "enterprise",
      },
      defaultVariant: "default" as const,
    },
  ],
  defaultVariant: "default" as const,
} satisfies Flag<"midnight" | "default" | "enterprise">;

const noRuleFlag = {
  key: "flag_empty" as const,
  rules: [],
  defaultVariant: "off" as const,
} satisfies Flag<"on" | "off">;

// ─── Mock users ──────────────────────────────────────────────────────────────

const betaUser: UserContext = {
  userId: "user_beta_001",
  segment: "beta",
  attributes: { plan: "pro", country: "US" },
};

const standardUser: UserContext = {
  userId: "user_std_999",
  segment: "standard",
  attributes: { plan: "free" },
};

// ─── Tests ───────────────────────────────────────────────────────────────────

// Test 1: Boolean rule always returns the fixed value
const t1 = evaluateFlag(darkModeFlag, betaUser);
console.assert(t1 === "on", `[FAIL] Test 1: expected "on", got "${t1}"`);
console.log(`[PASS] Test 1: boolean rule → "${t1}"`);

// Test 2: Segment rule maps beta user to "midnight"
const t2 = evaluateFlag(themeFlag, betaUser);
console.assert(t2 === "midnight", `[FAIL] Test 2: expected "midnight", got "${t2}"`);
console.log(`[PASS] Test 2: segment rule (beta) → "${t2}"`);

// Test 3: Segment rule maps standard user to "default"
const t3 = evaluateFlag(themeFlag, standardUser);
console.assert(t3 === "default", `[FAIL] Test 3: expected "default", got "${t3}"`);
console.log(`[PASS] Test 3: segment rule (standard) → "${t3}"`);

// Test 4: No-rule flag falls back to defaultVariant
const t4 = evaluateFlag(noRuleFlag, betaUser);
console.assert(t4 === "off", `[FAIL] Test 4: expected "off", got "${t4}"`);
console.log(`[PASS] Test 4: no-rule flag → default "${t4}"`);

// Test 5: Percentage rule is deterministic & audit record is well-formed
const hash = stableHash(betaUser.userId, rolloutFlag.key);
const expectedVariant = hash < 50 ? "on" : "off";
const record: EvaluationRecord<"on" | "off"> = evaluateWithAudit(rolloutFlag, betaUser);
console.assert(
  record.resolvedVariant === expectedVariant,
  `[FAIL] Test 5a: expected "${expectedVariant}", got "${record.resolvedVariant}"`
);
console.assert(record.ruleKind === "percentage", `[FAIL] Test 5b: expected ruleKind "percentage", got "${record.ruleKind}"`);
console.assert(record.userId === betaUser.userId, `[FAIL] Test 5c: userId mismatch`);
console.assert(typeof record.evaluatedAt === "number", `[FAIL] Test 5d: evaluatedAt must be a number`);
console.log(`[PASS] Test 5: percentage audit record → variant="${record.resolvedVariant}", ruleKind="${record.ruleKind}"`);

// Test 6: batchEvaluate indexes all results by flag key
const batch = batchEvaluate([darkModeFlag, noRuleFlag] as ReadonlyArray<Flag<"on" | "off">>, standardUser);
console.assert(batch.size === 2, `[FAIL] Test 6a: expected 2 entries, got ${batch.size}`);
console.assert(batch.get("flag_dark_mode")?.resolvedVariant === "on", `[FAIL] Test 6b: dark_mode should be "on"`);
console.assert(batch.get("flag_empty")?.resolvedVariant === "off", `[FAIL] Test 6c: empty flag should be "off"`);
console.log(`[PASS] Test 6: batchEvaluate → ${batch.size} records`);
