// =============================================================
// challenge.ts — Typed Permission-Based Access Control Engine
// =============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill every TODO. Do not change existing type signatures.
// =============================================================

// ── 1. Core domain types ─────────────────────────────────────

/** All resources that can be acted upon in the platform. */
export type Resource = "billing" | "reports" | "settings" | "users" | "audit_logs";

/** All actions that can be performed on a resource. */
export type Action = "create" | "read" | "update" | "delete";

/**
 * A permission is a branded string of the form `"<resource>:<action>"`.
 * e.g. "billing:read", "users:delete"
 *
 * TODO 1: Define the `Permission` type as a template literal type
 *         combining Resource and Action, then brand it so that
 *         plain strings cannot be assigned to it without going
 *         through `makePermission`.
 */
export type Permission = TODO_1; // replace TODO_1

/** Brand helper — do NOT change this signature. */
declare const __permissionBrand: unique symbol;

/**
 * TODO 2: Implement `makePermission`.
 * Accepts a Resource and an Action and returns a branded Permission.
 * Must NOT use `as` or any type assertion.
 * Hint: use a type-safe overload or a mapped approach.
 */
export function makePermission(resource: Resource, action: Action): Permission {
  // TODO 2
  throw new Error("Not implemented");
}

// ── 2. Role & Policy registry ─────────────────────────────────

export type RoleId = "admin" | "analyst" | "billing_manager" | "viewer" | "support";

/**
 * A policy maps each RoleId to the exact set of Permissions it grants.
 * TODO 3: Define `PolicyRegistry` as a `Record`-based mapped type where
 *         every RoleId key maps to a `ReadonlyArray<Permission>`.
 */
export type PolicyRegistry = TODO_3; // replace TODO_3

/**
 * Built-in registry used by the engine.
 * TODO 4: Fill in realistic permission sets for each role using `makePermission`.
 *         Requirements:
 *         - "admin"           → all permissions on all resources
 *         - "analyst"         → read on reports, read on audit_logs
 *         - "billing_manager" → create/read/update on billing, read on reports
 *         - "viewer"          → read on reports, read on users
 *         - "support"         → read on users, read/update on settings
 *
 *         Use `satisfies PolicyRegistry` to validate the literal.
 */
export const DEFAULT_POLICY_REGISTRY = {
  // TODO 4
} satisfies PolicyRegistry;

// ── 3. Session token (arrives as `unknown`) ───────────────────

/**
 * Shape we expect after validating an inbound token payload.
 */
export interface SessionToken {
  readonly userId: string;
  readonly roles: ReadonlyArray<RoleId>;
  readonly expiresAt: number; // Unix timestamp (ms)
  readonly tenantId: string;
}

/**
 * TODO 5: Implement `validateSessionToken(raw: unknown): SessionToken`.
 * Must perform full runtime validation — no type assertions.
 * Return a valid `SessionToken` or throw a `ValidationError` (defined below).
 * Requirements:
 *   - `userId`   : non-empty string
 *   - `roles`    : non-empty array whose every element is a valid RoleId
 *   - `expiresAt`: number > 0
 *   - `tenantId` : non-empty string
 */
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly reason: string
  ) {
    super(`Validation failed on '${field}': ${reason}`);
    this.name = "ValidationError";
  }
}

const VALID_ROLE_IDS: ReadonlySet<RoleId> = new Set<RoleId>([
  "admin", "analyst", "billing_manager", "viewer", "support",
]);

export function validateSessionToken(raw: unknown): SessionToken {
  // TODO 5
  throw new Error("Not implemented");
}

// ── 4. Access decision types ──────────────────────────────────

/** Discriminated union representing the outcome of an access check. */
export type AccessDecision =
  | { readonly outcome: "granted"; readonly matchedPermission: Permission }
  | { readonly outcome: "denied";  readonly reason: "insufficient_permissions" | "token_expired" | "no_roles" }
  | { readonly outcome: "error";   readonly error: ValidationError };

/**
 * A full access report returned by the engine for a batch of checks.
 *
 * TODO 6: Define `AccessReport<T extends AccessRequest>` as a generic type
 *         where each key of T maps to the AccessDecision for that request.
 *         Use a mapped type over the keys of T.
 */
export interface AccessRequest {
  readonly resource: Resource;
  readonly action: Action;
}

export type AccessReport<T extends Record<string, AccessRequest>> = TODO_6; // replace TODO_6

// ── 5. Engine ─────────────────────────────────────────────────

export interface EngineOptions {
  /** Override the default policy registry. */
  readonly registry?: PolicyRegistry;
  /** Current time in ms (injectable for testing). Defaults to Date.now(). */
  readonly now?: number;
}

/**
 * TODO 7: Implement `checkAccess`.
 *
 * Given a raw (unknown) session token and a named map of access requests,
 * produce a strongly-typed `AccessReport` for every request in the map.
 *
 * Algorithm per request:
 *   1. If token validation throws a ValidationError → outcome: "error"
 *   2. If the token is expired (expiresAt <= now)   → outcome: "denied", reason: "token_expired"
 *   3. If the token has no roles                    → outcome: "denied", reason: "no_roles"
 *   4. Collect all Permissions granted by the token's roles (union across roles).
 *   5. Check whether `makePermission(resource, action)` is in that set.
 *      - Found  → outcome: "granted", matchedPermission: <the permission>
 *      - Not found → outcome: "denied", reason: "insufficient_permissions"
 *
 * The return type must be `AccessReport<T>` — fully typed, no `any`.
 */
export function checkAccess<T extends Record<string, AccessRequest>>(
  rawToken: unknown,
  requests: T,
  options?: EngineOptions
): AccessReport<T> {
  // TODO 7
  throw new Error("Not implemented");
}

// ── 6. Utility: permission diff ───────────────────────────────

/**
 * TODO 8: Implement `diffPermissions`.
 *
 * Given two RoleIds, return an object describing the symmetric diff of
 * their permission sets according to the provided (or default) registry:
 *   - `onlyInA`: permissions in roleA but not roleB
 *   - `onlyInB`: permissions in roleB but not roleA
 *   - `shared` : permissions present in both
 *
 * All three arrays must be typed as `Permission[]`.
 */
export interface PermissionDiff {
  readonly onlyInA: Permission[];
  readonly onlyInB: Permission[];
  readonly shared: Permission[];
}

export function diffPermissions(
  roleA: RoleId,
  roleB: RoleId,
  registry: PolicyRegistry = DEFAULT_POLICY_REGISTRY
): PermissionDiff {
  // TODO 8
  throw new Error("Not implemented");
}
