// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  makePrincipalId, makeResourceId, makeTenantId, makePolicyId,
  roleAtLeast, evaluateCondition, evaluatePolicy, evaluatePolicies,
  batchEvaluate, buildAuditSummary,
  type Principal, type Resource, type AuthRequest,
  type Policy, type EvaluationContext, type Action,
} from "./challenge";

// ── Fixtures ────────────────────────────────────────────────────────

const TENANT_A = makeTenantId("tenant-a");
const TENANT_B = makeTenantId("tenant-b");

const alice: Principal = {
  id:       makePrincipalId("alice"),
  tenantId: TENANT_A,
  role:     "editor",
};

const bob: Principal = {
  id:       makePrincipalId("bob"),
  tenantId: TENANT_A,
  role:     "viewer",
};

const adminCarla: Principal = {
  id:       makePrincipalId("carla"),
  tenantId: TENANT_A,
  role:     "admin",
};

const docA: Resource = { id: makeResourceId("doc-a"), tenantId: TENANT_A, locked: false };
const docLocked: Resource = { id: makeResourceId("doc-locked"), tenantId: TENANT_A, locked: true };
const docB: Resource = { id: makeResourceId("doc-b"), tenantId: TENANT_B, locked: false };

const baseCtx: EvaluationContext = {
  utcHour:         10,
  principalIp:     "10.1.2.3",
  principalHasMfa: true,
  principalTenant: TENANT_A,
  principalRole:   "editor",
};

const policies: Policy[] = [
  {
    kind:   "role-policy",
    id:     makePolicyId("p-viewer-read"),
    action: "resource:read",
    role:   "viewer",
    effect: "allow",
  },
  {
    kind:       "resource-policy",
    id:         makePolicyId("p-editor-write-docA"),
    action:     "resource:write",
    resourceId: docA.id,
    effect:     "allow",
    condition:  { kind: "min-role", role: "editor" },
  },
  {
    kind:        "explicit-deny",
    id:          makePolicyId("p-deny-bob-write"),
    action:      "resource:write",
    principalId: makePrincipalId("bob"),
  },
  {
    kind:   "role-policy",
    id:     makePolicyId("p-admin-audit"),
    action: "admin:audit",
    role:   "admin",
    effect: "allow",
  },
];

// ── Test 1: roleAtLeast ─────────────────────────────────────────────
console.assert(roleAtLeast("admin", "editor")      === true,  "T1a: admin >= editor");
console.assert(roleAtLeast("viewer", "manager")    === false, "T1b: viewer < manager");
console.assert(roleAtLeast("superadmin", "superadmin") === true, "T1c: superadmin >= superadmin");

// ── Test 2: evaluateCondition ───────────────────────────────────────
console.assert(
  evaluateCondition({ kind: "time-window", startHour: 9, endHour: 17 }, baseCtx) === true,
  "T2a: hour 10 in [9,17)"
);
console.assert(
  evaluateCondition({ kind: "time-window", startHour: 9, endHour: 10 }, baseCtx) === false,
  "T2b: hour 10 NOT in [9,10)"
);
console.assert(
  evaluateCondition({ kind: "ip-allowlist", cidrs: ["10.0.0.0/8"] }, baseCtx) === true,
  "T2c: 10.1.2.3 matches 10.0.0.0/8"
);
console.assert(
  evaluateCondition({ kind: "ip-allowlist", cidrs: ["192.168.0.0/16"] }, baseCtx) === false,
  "T2d: 10.1.2.3 does NOT match 192.168.0.0/16"
);
console.assert(
  evaluateCondition({ kind: "mfa-required" }, baseCtx) === true,
  "T2e: MFA present"
);
console.assert(
  evaluateCondition({ kind: "same-tenant", resourceTenantId: TENANT_A }, baseCtx) === true,
  "T2f: same tenant"
);
console.assert(
  evaluateCondition(
    { kind: "all", conditions: [{ kind: "mfa-required" }, { kind: "min-role", role: "editor" }] },
    baseCtx
  ) === true,
  "T2g: all conditions met"
);
console.assert(
  evaluateCondition(
    { kind: "any", conditions: [{ kind: "min-role", role: "admin" }, { kind: "mfa-required" }] },
    baseCtx
  ) === true,
  "T2h: any condition met (mfa)"
);

// ── Test 3: evaluatePolicy — locked resource ────────────────────────
const lockedReq: AuthRequest = {
  principal: alice,
  resource:  docLocked,
  action:    "resource:write",
  context:   baseCtx,
};
const lockedDecision = evaluatePolicy(policies[1], lockedReq);
console.assert(
  lockedDecision.outcome === "deny" && lockedDecision.reason === "resource-locked",
  "T3: locked resource → deny(resource-locked)"
);

// ── Test 4: evaluatePolicies — tenant mismatch ──────────────────────
const crossTenantReq: AuthRequest = {
  principal: alice,
  resource:  docB,
  action:    "resource:read",
  context:   { ...baseCtx },
};
const crossResult = evaluatePolicies(policies, crossTenantReq);
console.assert(
  crossResult.decision.outcome === "deny" &&
  crossResult.decision.reason === "tenant-mismatch",
  "T4: cross-tenant → deny(tenant-mismatch)"
);

// ── Test 5: evaluatePolicies — explicit deny short-circuits ─────────
const bobWriteReq: AuthRequest = {
  principal: bob,
  resource:  docA,
  action:    "resource:write",
  context:   { ...baseCtx, principalRole: "viewer" },
};
const bobResult = evaluatePolicies(policies, bobWriteReq);
console.assert(
  bobResult.decision.outcome === "deny" &&
  bobResult.decision.reason === "explicit-deny",
  "T5: explicit deny for bob write"
);

// ── Test 6: evaluatePolicies — allow path ──────────────────────────
const aliceWriteReq: AuthRequest = {
  principal: alice,
  resource:  docA,
  action:    "resource:write",
  context:   { ...baseCtx, principalRole: "editor" },
};
const aliceResult = evaluatePolicies(policies, aliceWriteReq);
console.assert(
  aliceResult.decision.outcome === "allow",
  "T6: alice can write doc-a (editor, condition met)"
);

// ── Test 7: batchEvaluate + buildAuditSummary ───────────────────────
const carlaAuditReq: AuthRequest = {
  principal: adminCarla,
  resource:  docA,
  action:    "admin:audit",
  context:   { ...baseCtx, principalRole: "admin" },
};

batchEvaluate(policies, [aliceWriteReq, crossTenantReq, carlaAuditReq]).then((results) => {
  console.assert(results.length === 3, "T7a: batch returns 3 results");
  console.assert(results[0].decision.outcome === "allow",  "T7b: alice write allowed");
  console.assert(results[1].decision.outcome === "deny",   "T7c: cross-tenant denied");
  console.assert(results[2].decision.outcome === "allow",  "T7d: carla audit allowed");

  const summary = buildAuditSummary(results);
  console.assert(summary["resource:write"].allowed === 1,  "T8a: 1 write allowed");
  console.assert(summary["resource:read"].allowed  === 0,  "T8b: 0 reads allowed");
  console.assert(summary["admin:audit"].allowed    === 1,  "T8c: 1 audit allowed");
  console.assert(summary["resource:read"].denied   === 1,  "T8d: 1 read denied (tenant-mismatch)");

  console.log("✅ All tests passed!");
}).catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
