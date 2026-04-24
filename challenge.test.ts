// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parsePolicy,
  evaluateCondition,
  matchesResource,
  PolicyStore,
  evaluate,
  evaluateBatch,
  formatVerdict,
  makeTenantId,
  makeSubjectId,
  makeResourceId,
  makePolicyId,
  type Policy,
  type RequestContext,
  type Verdict,
} from "./challenge";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL  ${label}`);
    failed++;
  }
}

// ------------------------------------------------------------------
// Mock branded IDs
// ------------------------------------------------------------------
const T1 = makeTenantId("tenant-acme");
const S1 = makeSubjectId("user-alice");
const S2 = makeSubjectId("user-bob");
const R1 = makeResourceId("docs/report-q1");
const P1 = makePolicyId("policy-001");

// ------------------------------------------------------------------
// Mock raw policy document
// ------------------------------------------------------------------
const rawValidPolicy: unknown = {
  policyId: "policy-001",
  tenantId:  "tenant-acme",
  subjects:  ["user-alice"],
  version:   1,
  rules: [
    {
      ruleId:     "rule-allow-read",
      actions:    ["read"],
      resources:  ["docs/*"],
      effect:     "allow",
      priority:   100,
      conditions: [
        { kind: "mfaRequired" },
        { kind: "timeWindow", startHour: 8, endHour: 18 },
      ],
    },
    {
      ruleId:     "rule-deny-delete",
      actions:    ["delete"],
      resources:  ["docs/*"],
      effect:     "deny",
      priority:   200,
      conditions: [],
    },
  ],
};

const rawInvalidPolicy: unknown = {
  policyId: "",          // invalid: empty string
  tenantId: "tenant-x",
  subjects: ["user-a"],
  version:  1,
  rules: [],
};

// ------------------------------------------------------------------
// § A  parsePolicy
// ------------------------------------------------------------------
console.log("\n── § A  parsePolicy ──");

const parsed = parsePolicy(rawValidPolicy);
assert("valid policy parses successfully", parsed.ok === true);
assert(
  "parsed policyId matches",
  parsed.ok && parsed.value.policyId === "policy-001",
);

const parsedBad = parsePolicy(rawInvalidPolicy);
assert("empty policyId returns error", parsedBad.ok === false);
assert(
  "error kind is missingField or invalidType",
  !parsedBad.ok &&
    (parsedBad.error.kind === "missingField" || parsedBad.error.kind === "invalidType"),
);

const parsedNull = parsePolicy(null);
assert("null input returns error", parsedNull.ok === false);

// ------------------------------------------------------------------
// § B  matchesResource
// ------------------------------------------------------------------
console.log("\n── § B  matchesResource ──");

assert('glob "docs/*" matches "docs/report-q1"',   matchesResource("docs/*", "docs/report-q1"));
assert('glob "docs/*" does NOT match "other/file"', !matchesResource("docs/*", "other/file"));
assert('"*" matches anything',                      matchesResource("*", "anything/at/all"));
assert('exact match "docs/report-q1"',              matchesResource("docs/report-q1", "docs/report-q1"));
assert('exact match does not over-match',           !matchesResource("docs/report-q1", "docs/report-q2"));

// ------------------------------------------------------------------
// § C  evaluateCondition
// ------------------------------------------------------------------
console.log("\n── § C  evaluateCondition ──");

const baseCtx: RequestContext = {
  subjectId:   S1,
  tenantId:    T1,
  action:      "read",
  resourceId:  R1,
  attributes:  { department: "eng" },
  currentHour: 10,
  mfaVerified: true,
  ipAddress:   "192.168.1.42",
};

assert(
  "mfaRequired passes when mfaVerified=true",
  evaluateCondition({ kind: "mfaRequired" }, baseCtx) === null,
);
assert(
  "mfaRequired fails when mfaVerified=false",
  evaluateCondition({ kind: "mfaRequired" }, { ...baseCtx, mfaVerified: false }) !== null,
);
assert(
  "timeWindow passes when currentHour in range",
  evaluateCondition({ kind: "timeWindow", startHour: 8, endHour: 18 }, baseCtx) === null,
);
assert(
  "timeWindow fails when currentHour out of range",
  evaluateCondition({ kind: "timeWindow", startHour: 8, endHour: 18 }, { ...baseCtx, currentHour: 20 }) !== null,
);
assert(
  "attributeMatch passes",
  evaluateCondition({ kind: "attributeMatch", attribute: "department", value: "eng" }, baseCtx) === null,
);
assert(
  "attributeMatch fails on wrong value",
  evaluateCondition({ kind: "attributeMatch", attribute: "department", value: "hr" }, baseCtx) !== null,
);
assert(
  "ipRange passes for matching prefix",
  evaluateCondition({ kind: "ipRange", cidr: "192.168.1.0/24" }, baseCtx) === null,
);
assert(
  "ipRange fails for non-matching prefix",
  evaluateCondition({ kind: "ipRange", cidr: "10.0.0.0/8" }, baseCtx) !== null,
);

// ------------------------------------------------------------------
// § D  evaluate (end-to-end)
// ------------------------------------------------------------------
console.log("\n── § D  evaluate ──");

// Build store from successfully parsed policy
const store = new PolicyStore();
if (parsed.ok) {
  store.upsert(parsed.value);
}

// Alice reads docs/report-q1 during business hours with MFA
const verdict1 = evaluate(baseCtx, store);
assert(
  "Alice read docs/* with MFA in time window → allow",
  verdict1.decision === "allow",
);
assert(
  "allow verdict carries correct ruleId",
  verdict1.decision === "allow" && verdict1.matchedRule.ruleId === "rule-allow-read",
);

// Alice reads docs/report-q1 outside time window
const verdict2 = evaluate({ ...baseCtx, currentHour: 20 }, store);
assert(
  "Alice read docs/* outside time window → deny-condition",
  verdict2.decision === "deny-condition",
);

// Bob (not in policy subjects) reads docs/report-q1
const verdict3 = evaluate({ ...baseCtx, subjectId: S2 }, store);
assert(
  "Bob (not in policy) → deny-no-match",
  verdict3.decision === "deny-no-match",
);

// Alice tries to delete → highest priority rule (200) has no conditions, effect=deny
const verdict4 = evaluate({ ...baseCtx, action: "delete" }, store);
assert(
  "Alice delete docs/* → deny (rule-deny-delete)",
  verdict4.decision === "deny",
);

// ------------------------------------------------------------------
// § E  evaluateBatch
// ------------------------------------------------------------------
console.log("\n── § E  evaluateBatch ──");

const batchResults = evaluateBatch(
  [
    baseCtx,
    { ...baseCtx, subjectId: S2 },
    { ...baseCtx, action: "delete" },
  ],
  store,
);

assert("batch returns 3 results", batchResults.length === 3);
assert("batch[0].requestIndex === 0", batchResults[0]?.requestIndex === 0);
assert("batch[1].verdict is deny-no-match", batchResults[1]?.verdict.decision === "deny-no-match");
assert("batch[2].verdict is deny", batchResults[2]?.verdict.decision === "deny");

// ------------------------------------------------------------------
// § F  formatVerdict
// ------------------------------------------------------------------
console.log("\n── § F  formatVerdict ──");

const fmtAllow = formatVerdict(verdict1);
assert("allow message starts with ✅", fmtAllow.startsWith("✅"));

const fmtDenyNoMatch = formatVerdict({ decision: "deny-no-match" });
assert("deny-no-match message starts with 🚫", fmtDenyNoMatch.startsWith("🚫"));
assert(
  "deny-no-match message mentions 'no matching rule'",
  fmtDenyNoMatch.toLowerCase().includes("no matching rule"),
);

const fmtDenyCond = formatVerdict(verdict2);
assert("deny-condition message starts with 🚫", fmtDenyCond.startsWith("🚫"));
assert("deny-condition message mentions 'timeWindow'", fmtDenyCond.includes("timeWindow"));

// ------------------------------------------------------------------
// Summary
// ------------------------------------------------------------------
console.log(`\n══════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
