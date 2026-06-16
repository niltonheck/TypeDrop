// ============================================================
// challenge.ts — Typed Permission Policy Engine
// ============================================================
// TOPICS: discriminated unions, branded types, conditional types,
//         mapped types, generics, unknown → typed narrowing,
//         Result<T,E> error handling, recursive type resolution
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** A non-empty string that names a role, e.g. "admin" */
export type RoleId = string & { readonly __brand: "RoleId" };

/** A non-empty string that names a resource, e.g. "invoice" */
export type ResourceId = string & { readonly __brand: "ResourceId" };

/** A non-empty string that names an action, e.g. "read" */
export type ActionId = string & { readonly __brand: "ActionId" };

// TODO 1 — Implement three brand-constructor functions.
//   Each must validate the input is a non-empty string and return a
//   Result<BrandedType, PolicyError> (see Result below).
//   Signatures:
export declare function toRoleId(raw: string): Result<RoleId, PolicyError>;
export declare function toResourceId(raw: string): Result<ResourceId, PolicyError>;
export declare function toActionId(raw: string): Result<ActionId, PolicyError>;

// ------------------------------------------------------------------
// 2. RESULT TYPE  (no throwing — all errors flow through Result)
// ------------------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// ------------------------------------------------------------------
// 3. POLICY ERROR  (discriminated union — exhaustive matching required)
// ------------------------------------------------------------------

export type PolicyError =
  | { readonly kind: "INVALID_INPUT";    readonly message: string }
  | { readonly kind: "UNKNOWN_ROLE";     readonly roleId: RoleId }
  | { readonly kind: "CYCLE_DETECTED";   readonly cycle: RoleId[] }
  | { readonly kind: "UNKNOWN_RESOURCE"; readonly resourceId: ResourceId }
  | { readonly kind: "UNKNOWN_ACTION";   readonly actionId: ActionId };

// ------------------------------------------------------------------
// 4. RAW (UNVALIDATED) POLICY SHAPE  — what arrives as `unknown`
// ------------------------------------------------------------------

// Do NOT change these interfaces; they model the external config format.
export interface RawPermission {
  resource: unknown;
  actions:  unknown;   // expected: string[]
  effect:   unknown;   // expected: "allow" | "deny"
}

export interface RawRole {
  id:          unknown;
  inherits:    unknown;   // expected: string[]  (parent role IDs)
  permissions: unknown;   // expected: RawPermission[]
}

export interface RawPolicy {
  version: unknown;   // expected: "1.0"
  roles:   unknown;   // expected: RawRole[]
}

// ------------------------------------------------------------------
// 5. VALIDATED POLICY DOMAIN TYPES
// ------------------------------------------------------------------

export type Effect = "allow" | "deny";

export interface Permission {
  readonly resource: ResourceId;
  readonly actions:  ReadonlyArray<ActionId>;
  readonly effect:   Effect;
}

export interface Role {
  readonly id:          RoleId;
  readonly inherits:    ReadonlyArray<RoleId>;
  readonly permissions: ReadonlyArray<Permission>;
}

export interface Policy {
  readonly version: "1.0";
  readonly roles:   ReadonlyMap<RoleId, Role>;
}

// ------------------------------------------------------------------
// 6. AUTHORIZATION REQUEST & DECISION
// ------------------------------------------------------------------

export interface AuthRequest {
  readonly roleId:     RoleId;
  readonly resource:   ResourceId;
  readonly action:     ActionId;
}

export type Decision =
  | { readonly verdict: "ALLOW"; readonly grantedBy: RoleId }
  | { readonly verdict: "DENY";  readonly deniedBy:  RoleId }
  | { readonly verdict: "NO_MATCH" };

// ------------------------------------------------------------------
// 7. RESOLVED ROLE  — flattened view after inheritance is expanded
// ------------------------------------------------------------------

export interface ResolvedRole {
  readonly id:                 RoleId;
  readonly resolvedPermissions: ReadonlyArray<Permission>;
  /** All ancestor role IDs in resolution order (nearest first) */
  readonly inheritanceChain:   ReadonlyArray<RoleId>;
}

// ------------------------------------------------------------------
// 8. UTILITY TYPES  (implement these — used internally & exported)
// ------------------------------------------------------------------

/**
 * TODO 2 — PolicyResult<T>
 * A shorthand alias: Result<T, PolicyError>
 */
export type PolicyResult<T> = Result<T, PolicyError>; // replace with your implementation

/**
 * TODO 3 — RolePermissionMap
 * A mapped type: for every RoleId key, its value is ResolvedRole.
 * Hint: you cannot use RoleId as an index signature directly — use a
 * mapped type over `string` constrained to RoleId.
 */
export type RolePermissionMap = { [K in RoleId]: ResolvedRole }; // replace with your implementation

/**
 * TODO 4 — ExtractDenials<P>
 * A conditional/mapped utility type that, given a tuple or array of
 * Permission objects, extracts only those whose `effect` is "deny".
 * Signature: ExtractDenials<P extends ReadonlyArray<Permission>>
 */
export type ExtractDenials<P extends ReadonlyArray<Permission>> = {
  [K in keyof P]: P[K] extends Permission ? (P[K]["effect"] extends "deny" ? P[K] : never) : never;
}[number]; // replace with your implementation

// ------------------------------------------------------------------
// 9. CORE ENGINE FUNCTIONS  (implement all of these)
// ------------------------------------------------------------------

/**
 * TODO 5 — parsePolicy
 * Validate a raw `unknown` value and return a PolicyResult<Policy>.
 *
 * Requirements:
 * R1. Top-level must be an object with version === "1.0" and a roles array.
 * R2. Each role must have a non-empty string `id`, an array `inherits`
 *     of non-empty strings, and an array `permissions`.
 * R3. Each permission must have a non-empty string `resource`, a
 *     non-empty string array `actions`, and effect "allow" | "deny".
 * R4. Role IDs must be unique within the policy.
 * R5. Return INVALID_INPUT errors for any structural violation.
 */
export declare function parsePolicy(raw: unknown): PolicyResult<Policy>;

/**
 * TODO 6 — resolveRole
 * Expand a role's inheritance chain and merge all inherited permissions.
 *
 * Requirements:
 * R6.  Walk the `inherits` list recursively; collect permissions from
 *      all ancestors (depth-first, nearest ancestor first).
 * R7.  Detect cycles using a visited set; return CYCLE_DETECTED if found.
 * R8.  Return UNKNOWN_ROLE if any inherited role ID is not in the policy.
 * R9.  The role's own permissions come LAST (highest precedence) in
 *      `resolvedPermissions`.
 * R10. Populate `inheritanceChain` with ancestor IDs in resolution order.
 */
export declare function resolveRole(
  roleId: RoleId,
  policy: Policy,
): PolicyResult<ResolvedRole>;

/**
 * TODO 7 — evaluateRequest
 * Evaluate an AuthRequest against a fully resolved role.
 *
 * Requirements:
 * R11. Iterate `resolvedPermissions` in order (index 0 … n-1).
 * R12. A permission matches if its `resource` equals the request's
 *      resource AND the request's action is in its `actions` array.
 * R13. On first match: if effect is "deny"  → Decision DENY  (deniedBy  = roleId that owns the permission — use the resolved role's id).
 *      On first match: if effect is "allow" → Decision ALLOW (grantedBy = resolved role's id).
 * R14. If no permission matches → Decision NO_MATCH.
 * R15. Return UNKNOWN_RESOURCE if the request's resource does not appear
 *      in ANY permission of the resolved role.
 * R16. Return UNKNOWN_ACTION   if the request's action   does not appear
 *      in ANY permission of the resolved role.
 *      (R15/R16 are checked before iterating for a match.)
 */
export declare function evaluateRequest(
  request:      AuthRequest,
  resolvedRole: ResolvedRole,
): PolicyResult<Decision>;

/**
 * TODO 8 — authorize
 * Convenience function: parse → resolve → evaluate in one call.
 *
 * Requirements:
 * R17. Accept a raw policy (`unknown`), a raw roleId (`string`),
 *      a raw resource (`string`), and a raw action (`string`).
 * R18. Validate/brand each string input; return early on first error.
 * R19. Parse the policy; return early on parse error.
 * R20. Resolve the role; return early on resolve error.
 * R21. Evaluate the request and return the final PolicyResult<Decision>.
 */
export declare function authorize(
  rawPolicy:   unknown,
  rawRoleId:   string,
  rawResource: string,
  rawAction:   string,
): PolicyResult<Decision>;
