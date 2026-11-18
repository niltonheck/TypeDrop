// ============================================================
// challenge.ts — Typed Multi-Tenant Permission Engine
// with Role Inheritance & Audit Trail
// ============================================================
// Requirements:
//   1. Define branded types for TenantId, RoleId, UserId, and Resource.
//   2. Define a discriminated union for Permission actions (read, write, delete, admin).
//   3. Define Role with an optional parentRoleId for single inheritance.
//   4. Define Tenant that owns a registry of roles keyed by RoleId.
//   5. Define a UserAssignment mapping a UserId to a RoleId within a tenant.
//   6. Define a discriminated-union AuditEvent with at least three variants:
//        AccessGranted, AccessDenied, RoleInherited.
//   7. Implement `resolvePermissions`: given a tenant and a roleId, walk the
//        inheritance chain (no cycles) and return the full flat Set of Permission
//        actions the role transitively holds. Must be typed to return
//        ReadonlySet<PermissionAction>.
//   8. Implement `checkAccess`: given a tenant, a userId, a resource, and a
//        requested action, look up the user's role, resolve its permissions, and
//        return a typed AccessResult (granted | denied) with a reason string.
//   9. Implement `buildAuditTrail`: accepts a tenant, a list of AccessRequest
//        entries, processes each through checkAccess, and returns a
//        ReadonlyArray<AuditEvent> — one event per request.
//  10. Implement `summariseAudit`: given a ReadonlyArray<AuditEvent>, return an
//        AuditSummary with counts of granted, denied, and roleInherited events,
//        plus a breakdown Record<UserId, { granted: number; denied: number }>.
// ============================================================

// --------------- Branded primitives -------------------------

// TODO: declare branded types for TenantId, RoleId, UserId, Resource
// e.g. type TenantId = string & { readonly __brand: "TenantId" };

export type TenantId = string & { readonly __brand: "TenantId" };
export type RoleId   = string & { readonly __brand: "RoleId" };
export type UserId   = string & { readonly __brand: "UserId" };
export type Resource = string & { readonly __brand: "Resource" };

// Helper factories — implement these so callers can create branded values
export function tenantId(raw: string): TenantId { return raw as TenantId; }
export function roleId(raw: string):   RoleId   { return raw as RoleId; }
export function userId(raw: string):   UserId   { return raw as UserId; }
export function resource(raw: string): Resource { return raw as Resource; }

// --------------- Permission actions -------------------------

// TODO: define a union type PermissionAction covering:
//   "read" | "write" | "delete" | "admin"
export type PermissionAction = TODO;

// --------------- Role & Tenant ------------------------------

// TODO: define the Role interface
// Fields: id: RoleId, label: string, permissions: ReadonlyArray<PermissionAction>,
//         parentRoleId?: RoleId
export interface Role {
  // TODO
}

// TODO: define the Tenant interface
// Fields: id: TenantId, roles: ReadonlyMap<RoleId, Role>,
//         users: ReadonlyMap<UserId, RoleId>   ← maps user → their assigned role
export interface Tenant {
  // TODO
}

// --------------- Access result ------------------------------

// TODO: define a discriminated union AccessResult
// Two variants: { outcome: "granted"; role: RoleId } and
//               { outcome: "denied";  reason: string }
export type AccessResult = TODO;

// --------------- Audit events (discriminated union) ---------

// TODO: define AuditEvent as a discriminated union with these three variants:
//
//   AccessGranted  — { kind: "AccessGranted";  userId; resource; action; roleId; timestamp: number }
//   AccessDenied   — { kind: "AccessDenied";   userId; resource; action; reason: string; timestamp: number }
//   RoleInherited  — { kind: "RoleInherited";  tenantId; childRoleId: RoleId; parentRoleId: RoleId; timestamp: number }
//
// Note: RoleInherited events are emitted once per inheritance edge traversed
// inside resolvePermissions (pass a collector callback to capture them).
export type AuditEvent = TODO;

// --------------- AccessRequest (input to buildAuditTrail) ---

export interface AccessRequest {
  readonly userId:   UserId;
  readonly resource: Resource;
  readonly action:   PermissionAction;
}

// --------------- AuditSummary -------------------------------

// TODO: define AuditSummary
// Fields: granted: number, denied: number, roleInherited: number,
//         perUser: Record<UserId, { granted: number; denied: number }>
export interface AuditSummary {
  // TODO
}

// ============================================================
// Core functions — implement all five below
// ============================================================

/**
 * Requirement 7
 * Walk the role inheritance chain for `startRoleId` within `tenant`.
 * Collect every PermissionAction transitively.
 * Emit a RoleInherited AuditEvent via `emitEvent` for each parent edge traversed.
 * Guard against cycles (a role must not be visited twice).
 */
export function resolvePermissions(
  tenant:       Tenant,
  startRoleId:  RoleId,
  emitEvent:    (event: AuditEvent) => void,
): ReadonlySet<PermissionAction> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Requirement 8
 * Look up userId in tenant.users → roleId.
 * Resolve permissions for that role (collect RoleInherited events via emitEvent).
 * Return AccessResult: granted if the resolved set includes `action`, denied otherwise.
 */
export function checkAccess(
  tenant:    Tenant,
  userId:    UserId,
  resource:  Resource,
  action:    PermissionAction,
  emitEvent: (event: AuditEvent) => void,
): AccessResult {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Requirement 9
 * Process each AccessRequest through checkAccess.
 * For every request, append either an AccessGranted or AccessDenied event.
 * Also append any RoleInherited events emitted during permission resolution.
 * Return all events in chronological order as a ReadonlyArray<AuditEvent>.
 */
export function buildAuditTrail(
  tenant:   Tenant,
  requests: ReadonlyArray<AccessRequest>,
): ReadonlyArray<AuditEvent> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Requirement 10
 * Aggregate the audit trail into an AuditSummary.
 * Count each event kind and build the perUser breakdown.
 */
export function summariseAudit(
  events: ReadonlyArray<AuditEvent>,
): AuditSummary {
  // TODO
  throw new Error("Not implemented");
}
