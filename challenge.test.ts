// ============================================================
// challenge.test.ts — Feature Flag Engine Test Harness
// ============================================================
import {
  validateFlagDefinition,
  rolloutHash,
  evaluateRule,
  evaluateFlag,
  evaluateAll,
  FlagRegistryBuilder,
  type FlagDefinition,
  type FlagValueType,
  type UserContext,
} from "./challenge";

// ------------------------------------------------------------------
// Mock flag definitions
// ------------------------------------------------------------------

const boolFlag: FlagDefinition<"boolean"> = {
  id: "dark-mode",
  valueType: "boolean",
  rules: [
    {
      rule: { kind: "set", attribute: "plan", values: ["pro", "enterprise"] },
      value: true,
    },
    {
      rule: { kind: "exact", attribute: "country", value: "DE" },
      value: true,
    },
  ],
  defaultValue: false,
};

const stringFlag: FlagDefinition<"string"> = {
  id: "checkout-variant",
  valueType: "string",
  rules: [
    {
      rule: { kind: "rollout", percentage: 50 },
      value: "variant-b",
    },
  ],
  defaultValue: "control",
};

const numberFlag: FlagDefinition<"number"> = {
  id: "max-seats",
  valueType: "number",
  rules: [
    {
      rule: { kind: "exact", attribute: "plan", value: "enterprise" },
      value: 500,
    },
    {
      rule: { kind: "exact", attribute: "plan", value: "pro" },
      value: 25,
    },
  ],
  defaultValue: 5,
};

// ------------------------------------------------------------------
// Build a registry
// ------------------------------------------------------------------

const registry = new FlagRegistryBuilder()
  .add(boolFlag)
  .add(stringFlag)
  .add(numberFlag)
  .build();

// ------------------------------------------------------------------
// Mock user contexts
// ------------------------------------------------------------------

const proUser: UserContext = {
  userId: "user-001",
  attributes: { plan: "pro", country: "US" },
};

const freeUser: UserContext = {
  userId: "user-999",
  attributes: { plan: "free", country: "FR" },
};

const deUser: UserContext = {
  userId: "user-042",
  attributes: { plan: "free", country: "DE" },
};

const enterpriseUser: UserContext = {
  userId: "user-007",
  attributes: { plan: "enterprise", country: "UK" },
};

// ------------------------------------------------------------------
// TEST 1 — validateFlagDefinition: valid input succeeds
// ------------------------------------------------------------------
const rawValid: unknown = {
  id: "new-nav",
  valueType: "boolean",
  rules: [
    { rule: { kind: "exact", attribute: "role", value: "admin" }, value: true },
  ],
  defaultValue: false,
};
const validResult = validateFlagDefinition(rawValid);
console.assert(validResult.ok === true, "TEST 1 FAILED: valid flag should parse");
if (validResult.ok) {
  console.assert(
    validResult.value.id === "new-nav",
    "TEST 1b FAILED: parsed id should be 'new-nav'"
  );
}

// ------------------------------------------------------------------
// TEST 2 — validateFlagDefinition: invalid input returns errors
// ------------------------------------------------------------------
const rawInvalid: unknown = {
  id: "",                // empty id — invalid
  valueType: "boolean",
  rules: [],
  defaultValue: "oops", // wrong type for boolean flag
};
const invalidResult = validateFlagDefinition(rawInvalid);
console.assert(
  invalidResult.ok === false,
  "TEST 2 FAILED: invalid flag should fail validation"
);
if (!invalidResult.ok) {
  console.assert(
    invalidResult.error.length >= 2,
    "TEST 2b FAILED: should report at least 2 errors (id + defaultValue)"
  );
}

// ------------------------------------------------------------------
// TEST 3 — evaluateFlag: SetRule matches pro user → true
// ------------------------------------------------------------------
const darkModeForPro = evaluateFlag(registry, "dark-mode", proUser);
console.assert(
  darkModeForPro.kind === "success" &&
    darkModeForPro.value === true &&
    darkModeForPro.matchedRuleIndex === 0,
  "TEST 3 FAILED: pro user should get dark-mode=true via SetRule (index 0)"
);

// ------------------------------------------------------------------
// TEST 4 — evaluateFlag: ExactRule matches DE user → true; free FR user → false
// ------------------------------------------------------------------
const darkModeForDE = evaluateFlag(registry, "dark-mode", deUser);
console.assert(
  darkModeForDE.kind === "success" && darkModeForDE.value === true,
  "TEST 4a FAILED: DE user should get dark-mode=true via ExactRule"
);

const darkModeForFree = evaluateFlag(registry, "dark-mode", freeUser);
console.assert(
  darkModeForFree.kind === "success" &&
    darkModeForFree.value === false &&
    darkModeForFree.matchedRuleIndex === -1,
  "TEST 4b FAILED: free FR user should get dark-mode=false (defaultValue)"
);

// ------------------------------------------------------------------
// TEST 5 — evaluateFlag: number flag, enterprise → 500; unknown flag → not-found
// ------------------------------------------------------------------
const seatsForEnterprise = evaluateFlag(registry, "max-seats", enterpriseUser);
console.assert(
  seatsForEnterprise.kind === "success" && seatsForEnterprise.value === 500,
  "TEST 5a FAILED: enterprise user should get max-seats=500"
);

const missing = evaluateFlag(registry, "nonexistent-flag", proUser);
console.assert(
  missing.kind === "not-found",
  "TEST 5b FAILED: unknown flag should return not-found"
);

// ------------------------------------------------------------------
// TEST 6 — evaluateAll: returns results for every flag
// ------------------------------------------------------------------
const allForPro = evaluateAll(registry, proUser);
console.assert(
  allForPro["dark-mode"].kind === "success",
  "TEST 6a FAILED: evaluateAll should include dark-mode result"
);
console.assert(
  allForPro["max-seats"].kind === "success" &&
    (allForPro["max-seats"] as { kind: "success"; value: number; flagId: string; matchedRuleIndex: number }).value === 25,
  "TEST 6b FAILED: evaluateAll max-seats for pro user should be 25"
);

console.log("All tests passed! ✅");
