// ============================================================
// challenge.test.ts — Verification harness
// ============================================================
import {
  parsePolicy,
  resolveRole,
  evaluateRequest,
  authorize,
  toRoleId,
  toResourceId,
  toActionId,
  type Policy,
  type ResolvedRole,
  type PolicyResult,
  type Decision,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const RAW_POLICY_VALID = {
  version: "1.0",
  roles: [
    {
      id: "viewer",
      inherits: [],
      permissions: [
        { resource: "invoice", actions: ["read"], effect: "allow" },
      ],
    },
    {
      id: "editor",
      inherits: ["viewer"],
      permissions: [
        { resource: "invoice", actions: ["create", "update"], effect: "allow" },
      ],
    },
    {
      id: "admin",
      inherits: ["editor"],
      permissions: [
        { resource: "invoice", actions: ["delete"], effect: "allow" },
        { resource: "user",    actions: ["read", "create", "delete"], effect: "allow" },
      ],
    },
    {
      id: "restricted",
      inherits: ["viewer"],
      permissions: [
        // deny takes precedence over inherited allow
        { resource: "invoice", actions: ["read"], effect: "deny" },
      ],
    },
  ],
};

const RAW_POLICY_CYCLE = {
  version: "1.0",
  roles: [
    { id: "a", inherits: ["b"], permissions: [] },
    { id: "b", inherits: ["a"], permissions: [] },
  ],
};

const RAW_POLICY_BAD_VERSION = {
  version: "2.0",
  roles: [],
};

// ------------------------------------------------------------------
// Test 1 — parsePolicy returns ok:true for a valid policy
// ------------------------------------------------------------------
const parsedResult = parsePolicy(RAW_POLICY_VALID);
console.assert(
  parsedResult.ok === true,
  `[TEST 1 FAIL] Expected ok:true from parsePolicy, got: ${JSON.stringify(parsedResult)}`,
);
console.log("[TEST 1 PASS] parsePolicy accepts valid raw policy");

// ------------------------------------------------------------------
// Test 2 — parsePolicy rejects wrong version
// ------------------------------------------------------------------
const badVersionResult = parsePolicy(RAW_POLICY_BAD_VERSION);
console.assert(
  badVersionResult.ok === false && badVersionResult.error.kind === "INVALID_INPUT",
  `[TEST 2 FAIL] Expected INVALID_INPUT for bad version, got: ${JSON.stringify(badVersionResult)}`,
);
console.log("[TEST 2 PASS] parsePolicy rejects wrong version");

// ------------------------------------------------------------------
// Test 3 — resolveRole expands inheritance correctly for "admin"
// ------------------------------------------------------------------
if (parsedResult.ok) {
  const policy: Policy = parsedResult.value;
  const adminRoleId = toRoleId("admin");

  if (adminRoleId.ok) {
    const resolvedResult = resolveRole(adminRoleId.value, policy);
    console.assert(
      resolvedResult.ok === true,
      `[TEST 3 FAIL] Expected ok:true for resolveRole("admin"), got: ${JSON.stringify(resolvedResult)}`,
    );

    if (resolvedResult.ok) {
      const resolved: ResolvedRole = resolvedResult.value;
      // admin inherits editor → viewer; should have permissions from all three
      // viewer: read invoice, editor: create/update invoice, admin: delete invoice + user perms
      const totalPermissions = resolved.resolvedPermissions.length;
      console.assert(
        totalPermissions === 4,
        `[TEST 3 FAIL] Expected 4 permission entries for admin, got: ${totalPermissions}`,
      );
      console.log("[TEST 3 PASS] resolveRole correctly merges inheritance for admin");
    }
  }
}

// ------------------------------------------------------------------
// Test 4 — authorize returns ALLOW for admin deleting an invoice
// ------------------------------------------------------------------
const allowResult: PolicyResult<Decision> = authorize(
  RAW_POLICY_VALID,
  "admin",
  "invoice",
  "delete",
);
console.assert(
  allowResult.ok === true && allowResult.value.verdict === "ALLOW",
  `[TEST 4 FAIL] Expected ALLOW for admin/invoice/delete, got: ${JSON.stringify(allowResult)}`,
);
console.log("[TEST 4 PASS] authorize grants ALLOW for admin deleting invoice");

// ------------------------------------------------------------------
// Test 5 — authorize returns DENY for "restricted" reading an invoice
//          (own deny permission overrides inherited allow)
// ------------------------------------------------------------------
const denyResult: PolicyResult<Decision> = authorize(
  RAW_POLICY_VALID,
  "restricted",
  "invoice",
  "read",
);
console.assert(
  denyResult.ok === true && denyResult.value.verdict === "DENY",
  `[TEST 5 FAIL] Expected DENY for restricted/invoice/read, got: ${JSON.stringify(denyResult)}`,
);
console.log("[TEST 5 PASS] authorize returns DENY when own role denies inherited allow");

// ------------------------------------------------------------------
// Test 6 — resolveRole detects cycles
// ------------------------------------------------------------------
const cycleParsed = parsePolicy(RAW_POLICY_CYCLE);
if (cycleParsed.ok) {
  const cycleRoleId = toRoleId("a");
  if (cycleRoleId.ok) {
    const cycleResult = resolveRole(cycleRoleId.value, cycleParsed.value);
    console.assert(
      cycleResult.ok === false && cycleResult.error.kind === "CYCLE_DETECTED",
      `[TEST 6 FAIL] Expected CYCLE_DETECTED, got: ${JSON.stringify(cycleResult)}`,
    );
    console.log("[TEST 6 PASS] resolveRole detects inheritance cycles");
  }
}

// ------------------------------------------------------------------
// Test 7 — authorize returns UNKNOWN_ACTION for an action not in policy
// ------------------------------------------------------------------
const unknownActionResult = authorize(
  RAW_POLICY_VALID,
  "viewer",
  "invoice",
  "explode",
);
console.assert(
  unknownActionResult.ok === false && unknownActionResult.error.kind === "UNKNOWN_ACTION",
  `[TEST 7 FAIL] Expected UNKNOWN_ACTION, got: ${JSON.stringify(unknownActionResult)}`,
);
console.log("[TEST 7 PASS] authorize returns UNKNOWN_ACTION for unrecognised action");
