// ============================================================
// challenge.test.ts — Typed Multi-Tenant Permission Engine
// ============================================================
import {
  tenantId, roleId, userId, resource,
  type Tenant, type AccessRequest,
  resolvePermissions, checkAccess, buildAuditTrail, summariseAudit,
} from "./challenge";

// ── Build a test tenant ──────────────────────────────────────
//
//  Role hierarchy:
//    viewer  (read)
//      └── editor  (write)   inherits viewer
//            └── manager (delete)  inherits editor → viewer
//  admin role (admin, read, write, delete) — no parent
//
const TENANT: Tenant = {
  id: tenantId("acme"),
  roles: new Map([
    [roleId("viewer"),  { id: roleId("viewer"),  label: "Viewer",  permissions: ["read"],          parentRoleId: undefined }],
    [roleId("editor"),  { id: roleId("editor"),  label: "Editor",  permissions: ["write"],         parentRoleId: roleId("viewer") }],
    [roleId("manager"), { id: roleId("manager"), label: "Manager", permissions: ["delete"],        parentRoleId: roleId("editor") }],
    [roleId("admin"),   { id: roleId("admin"),   label: "Admin",   permissions: ["admin","read","write","delete"], parentRoleId: undefined }],
  ]),
  users: new Map([
    [userId("alice"),  roleId("manager")],
    [userId("bob"),    roleId("viewer")],
    [userId("carol"),  roleId("admin")],
    [userId("dave"),   roleId("editor")],
  ]),
};

// ── Test 1: resolvePermissions walks the full chain ──────────
{
  const events: unknown[] = [];
  const perms = resolvePermissions(TENANT, roleId("manager"), (e) => events.push(e));

  console.assert(
    perms.has("read") && perms.has("write") && perms.has("delete"),
    "Test 1a FAILED: manager should transitively hold read, write, delete"
  );
  console.assert(
    !perms.has("admin"),
    "Test 1b FAILED: manager should NOT hold admin"
  );
  // manager→editor and editor→viewer = 2 RoleInherited events
  console.assert(
    events.length === 2,
    `Test 1c FAILED: expected 2 RoleInherited events, got ${events.length}`
  );
  console.log("Test 1 passed ✓");
}

// ── Test 2: checkAccess — granted and denied paths ───────────
{
  const noopEmit = () => {};

  // alice is manager → can delete
  const r1 = checkAccess(TENANT, userId("alice"), resource("doc:42"), "delete", noopEmit);
  console.assert(r1.outcome === "granted", "Test 2a FAILED: alice should be granted delete");

  // bob is viewer → cannot write
  const r2 = checkAccess(TENANT, userId("bob"), resource("doc:42"), "write", noopEmit);
  console.assert(r2.outcome === "denied", "Test 2b FAILED: bob should be denied write");

  // carol is admin → can do anything
  const r3 = checkAccess(TENANT, userId("carol"), resource("doc:42"), "admin", noopEmit);
  console.assert(r3.outcome === "granted", "Test 2c FAILED: carol should be granted admin");

  console.log("Test 2 passed ✓");
}

// ── Test 3: checkAccess — unknown user is denied ─────────────
{
  const noopEmit = () => {};
  const r = checkAccess(TENANT, userId("ghost"), resource("doc:1"), "read", noopEmit);
  console.assert(r.outcome === "denied", "Test 3 FAILED: unknown user should be denied");
  console.log("Test 3 passed ✓");
}

// ── Test 4: buildAuditTrail event ordering & types ───────────
{
  const requests: ReadonlyArray<AccessRequest> = [
    { userId: userId("alice"),  resource: resource("file:A"), action: "write"  },
    { userId: userId("bob"),    resource: resource("file:B"), action: "delete" },
    { userId: userId("carol"),  resource: resource("file:C"), action: "admin"  },
  ];

  const trail = buildAuditTrail(TENANT, requests);

  // At minimum we must have 3 decision events
  const decisionEvents = trail.filter(
    (e) => e.kind === "AccessGranted" || e.kind === "AccessDenied"
  );
  console.assert(
    decisionEvents.length === 3,
    `Test 4a FAILED: expected 3 decision events, got ${decisionEvents.length}`
  );

  // bob (viewer) cannot delete → AccessDenied
  const bobEvent = decisionEvents.find(
    (e) => (e.kind === "AccessGranted" || e.kind === "AccessDenied") && e.userId === userId("bob")
  );
  console.assert(bobEvent?.kind === "AccessDenied", "Test 4b FAILED: bob's event should be AccessDenied");

  // alice (manager) can write → AccessGranted
  const aliceEvent = decisionEvents.find(
    (e) => (e.kind === "AccessGranted" || e.kind === "AccessDenied") && e.userId === userId("alice")
  );
  console.assert(aliceEvent?.kind === "AccessGranted", "Test 4c FAILED: alice's event should be AccessGranted");

  console.log("Test 4 passed ✓");
}

// ── Test 5: summariseAudit aggregation ───────────────────────
{
  const requests: ReadonlyArray<AccessRequest> = [
    { userId: userId("alice"), resource: resource("x"), action: "read"   },  // granted (manager)
    { userId: userId("alice"), resource: resource("x"), action: "admin"  },  // denied  (manager)
    { userId: userId("bob"),   resource: resource("x"), action: "read"   },  // granted (viewer)
    { userId: userId("bob"),   resource: resource("x"), action: "write"  },  // denied  (viewer)
    { userId: userId("carol"), resource: resource("x"), action: "admin"  },  // granted (admin)
  ];

  const trail   = buildAuditTrail(TENANT, requests);
  const summary = summariseAudit(trail);

  console.assert(summary.granted === 3, `Test 5a FAILED: expected granted=3, got ${summary.granted}`);
  console.assert(summary.denied  === 2, `Test 5b FAILED: expected denied=2,  got ${summary.denied}`);
  console.assert(
    summary.perUser[userId("alice")].granted === 1 &&
    summary.perUser[userId("alice")].denied  === 1,
    "Test 5c FAILED: alice perUser breakdown wrong"
  );
  console.assert(
    summary.perUser[userId("bob")].granted === 1 &&
    summary.perUser[userId("bob")].denied  === 1,
    "Test 5d FAILED: bob perUser breakdown wrong"
  );
  console.log("Test 5 passed ✓");
}
