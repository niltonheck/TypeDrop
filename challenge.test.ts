// =============================================================
// challenge.test.ts — Typed Permission-Based Access Control Engine
// =============================================================
import {
  makePermission,
  validateSessionToken,
  checkAccess,
  diffPermissions,
  DEFAULT_POLICY_REGISTRY,
  ValidationError,
  type Permission,
  type AccessReport,
  type AccessRequest,
} from "./challenge";

// ── helpers ───────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── mock data ─────────────────────────────────────────────────
const NOW = 1_748_650_000_000; // fixed "current" time for tests

const validAdminTokenRaw: unknown = {
  userId: "user-001",
  roles: ["admin"],
  expiresAt: NOW + 3_600_000, // 1 hour from now
  tenantId: "tenant-acme",
};

const validAnalystTokenRaw: unknown = {
  userId: "user-002",
  roles: ["analyst"],
  expiresAt: NOW + 3_600_000,
  tenantId: "tenant-acme",
};

const expiredTokenRaw: unknown = {
  userId: "user-003",
  roles: ["viewer"],
  expiresAt: NOW - 1_000, // already expired
  tenantId: "tenant-acme",
};

const malformedTokenRaw: unknown = {
  userId: "",            // invalid: empty string
  roles: ["analyst"],
  expiresAt: NOW + 3_600_000,
  tenantId: "tenant-acme",
};

const unknownRoleTokenRaw: unknown = {
  userId: "user-004",
  roles: ["superuser"],  // not a valid RoleId
  expiresAt: NOW + 3_600_000,
  tenantId: "tenant-acme",
};

// ── Test 1: makePermission produces correct string value ──────
console.log("\nTest 1 — makePermission");
const p = makePermission("billing", "read");
assert(
  (p as string) === "billing:read",
  `makePermission("billing","read") === "billing:read"  (got: ${p})`
);

// ── Test 2: validateSessionToken happy path ───────────────────
console.log("\nTest 2 — validateSessionToken happy path");
const session = validateSessionToken(validAnalystTokenRaw);
assert(session.userId === "user-002", "userId is 'user-002'");
assert(session.roles.length === 1 && session.roles[0] === "analyst", "role is 'analyst'");

// ── Test 3: validateSessionToken rejects bad data ─────────────
console.log("\nTest 3 — validateSessionToken rejects bad data");
let threw = false;
try { validateSessionToken(malformedTokenRaw); } catch (e) {
  threw = e instanceof ValidationError;
}
assert(threw, "throws ValidationError for empty userId");

let threwUnknownRole = false;
try { validateSessionToken(unknownRoleTokenRaw); } catch (e) {
  threwUnknownRole = e instanceof ValidationError;
}
assert(threwUnknownRole, "throws ValidationError for unknown role 'superuser'");

// ── Test 4: checkAccess — admin granted, analyst denied ───────
console.log("\nTest 4 — checkAccess decisions");

const requests = {
  canDeleteUsers:  { resource: "users",   action: "delete" },
  canReadReports:  { resource: "reports", action: "read"   },
  canCreateBilling:{ resource: "billing", action: "create" },
} satisfies Record<string, AccessRequest>;

const adminReport = checkAccess(validAdminTokenRaw, requests, { now: NOW });
assert(adminReport.canDeleteUsers.outcome === "granted",  "admin: canDeleteUsers → granted");
assert(adminReport.canReadReports.outcome === "granted",  "admin: canReadReports → granted");
assert(adminReport.canCreateBilling.outcome === "granted","admin: canCreateBilling → granted");

const analystReport = checkAccess(validAnalystTokenRaw, requests, { now: NOW });
assert(analystReport.canDeleteUsers.outcome === "denied",  "analyst: canDeleteUsers → denied");
assert(analystReport.canReadReports.outcome === "granted", "analyst: canReadReports → granted");
assert(analystReport.canCreateBilling.outcome === "denied","analyst: canCreateBilling → denied");
if (analystReport.canDeleteUsers.outcome === "denied") {
  assert(
    analystReport.canDeleteUsers.reason === "insufficient_permissions",
    "analyst denial reason is 'insufficient_permissions'"
  );
}

// ── Test 5: checkAccess — expired token ───────────────────────
console.log("\nTest 5 — checkAccess expired token");
const expiredReport = checkAccess(expiredTokenRaw, requests, { now: NOW });
assert(
  expiredReport.canReadReports.outcome === "denied" &&
  expiredReport.canReadReports.reason === "token_expired",
  "expired token → denied/token_expired"
);

// ── Test 6: checkAccess — validation error propagated ─────────
console.log("\nTest 6 — checkAccess propagates ValidationError");
const badReport = checkAccess(malformedTokenRaw, requests, { now: NOW });
assert(
  badReport.canReadReports.outcome === "error" &&
  badReport.canReadReports.error instanceof ValidationError,
  "malformed token → error outcome with ValidationError"
);

// ── Test 7: diffPermissions ───────────────────────────────────
console.log("\nTest 7 — diffPermissions");
const diff = diffPermissions("billing_manager", "analyst");
const onlyInBillingManager = diff.onlyInA.map(p => p as string);
const onlyInAnalyst = diff.onlyInB.map(p => p as string);
const shared = diff.shared.map(p => p as string);

assert(
  onlyInBillingManager.includes("billing:create") &&
  onlyInBillingManager.includes("billing:read") &&
  onlyInBillingManager.includes("billing:update"),
  "billing_manager has exclusive billing permissions"
);
assert(
  onlyInAnalyst.includes("audit_logs:read"),
  "analyst has exclusive audit_logs:read"
);
assert(
  shared.includes("reports:read"),
  "both share reports:read"
);

console.log("\nAll tests complete.\n");
