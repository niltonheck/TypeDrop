// ============================================================
// Typed Permission Policy Engine with Conditional Grants
// challenge.ts
// ============================================================
// Compile with: tsc --strict --noEmit challenge.ts
// Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// ------------------------------------------------------------------
// § 1. PRIMITIVE BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque brand helper — do not change. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type PrincipalId = Brand<string, "PrincipalId">;
export type ResourceId  = Brand<string, "ResourceId">;
export type TenantId    = Brand<string, "TenantId">;
export type PolicyId    = Brand<string, "PolicyId">;

/** Helper factories — implement these. */
export function makePrincipalId(s: string): PrincipalId { return s as PrincipalId; }
export function makeResourceId(s: string):  ResourceId  { return s as ResourceId;  }
export function makeTenantId(s: string):    TenantId    { return s as TenantId;    }
export function makePolicyId(s: string):    PolicyId    { return s as PolicyId;    }

// ------------------------------------------------------------------
// § 2. DOMAIN ENUMS & UNION TYPES
// ------------------------------------------------------------------

/** Every action a principal can attempt. */
export type Action =
  | "resource:read"
  | "resource:write"
  | "resource:delete"
  | "resource:share"
  | "admin:impersonate"
  | "admin:audit";

/** Role hierarchy — higher index = more privilege. */
export type Role = "viewer" | "editor" | "manager" | "admin" | "superadmin";

/** Possible outcomes of a policy evaluation. */
export type Decision =
  | { outcome: "allow"; grantedBy: PolicyId }
  | { outcome: "deny";  reason: DenyReason }
  | { outcome: "abstain" };

export type DenyReason =
  | "explicit-deny"
  | "insufficient-role"
  | "condition-not-met"
  | "tenant-mismatch"
  | "resource-locked";

// ------------------------------------------------------------------
// § 3. CONDITIONS (discriminated union)
// ------------------------------------------------------------------
// Conditions are evaluated at runtime against an EvaluationContext.
// Each variant has a unique `kind` discriminant.

export type Condition =
  | { kind: "time-window";    startHour: number; endHour: number }   // UTC hour [0-23]
  | { kind: "ip-allowlist";   cidrs: string[] }                       // e.g. ["10.0.0.0/8"]
  | { kind: "mfa-required" }                                          // principal must have MFA
  | { kind: "same-tenant";    resourceTenantId: TenantId }            // principal & resource share tenant
  | { kind: "min-role";       role: Role }                            // principal must have ≥ role
  | { kind: "all";            conditions: Condition[] }               // logical AND
  | { kind: "any";            conditions: Condition[] };              // logical OR

/** Runtime snapshot available during evaluation. */
export interface EvaluationContext {
  readonly utcHour:          number;          // 0-23
  readonly principalIp:      string;          // e.g. "10.1.2.3"
  readonly principalHasMfa:  boolean;
  readonly principalTenant:  TenantId;
  readonly principalRole:    Role;
}

// ------------------------------------------------------------------
// § 4. POLICY SHAPES (discriminated union)
// ------------------------------------------------------------------

/**
 * A Policy is one of three variants:
 *
 *  - RolePolicy:      grants/denies an action to any principal with a qualifying role
 *  - ResourcePolicy:  grants/denies an action on a specific resource, with optional conditions
 *  - ExplicitDeny:    always denies a specific action regardless of other policies (overrides all)
 */
export type Policy =
  | {
      kind:      "role-policy";
      id:        PolicyId;
      action:    Action;
      role:      Role;           // minimum role required
      effect:    "allow" | "deny";
    }
  | {
      kind:      "resource-policy";
      id:        PolicyId;
      action:    Action;
      resourceId: ResourceId;
      effect:    "allow" | "deny";
      condition?: Condition;     // optional gate
    }
  | {
      kind:      "explicit-deny";
      id:        PolicyId;
      action:    Action;
      principalId?: PrincipalId; // if absent, denies for ALL principals
    };

// ------------------------------------------------------------------
// § 5. PRINCIPAL & RESOURCE
// ------------------------------------------------------------------

export interface Principal {
  readonly id:       PrincipalId;
  readonly tenantId: TenantId;
  readonly role:     Role;
}

export interface Resource {
  readonly id:       ResourceId;
  readonly tenantId: TenantId;
  readonly locked:   boolean;
}

// ------------------------------------------------------------------
// § 6. EVALUATION REQUEST & BATCH RESULT
// ------------------------------------------------------------------

export interface AuthRequest {
  readonly principal:  Principal;
  readonly resource:   Resource;
  readonly action:     Action;
  readonly context:    EvaluationContext;
}

export interface AuthResult {
  readonly request:  AuthRequest;
  readonly decision: Decision;
}

// ------------------------------------------------------------------
// § 7. ROLE ORDERING  (implement this)
// ------------------------------------------------------------------

/**
 * Returns true if `candidate` is at least as privileged as `minimum`.
 *
 * Role order (ascending privilege):
 *   viewer < editor < manager < admin < superadmin
 *
 * Requirements:
 *  R1. Must use the Role union type — no string literals outside of it.
 *  R2. Must not use `any`.
 */
export function roleAtLeast(candidate: Role, minimum: Role): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 8. CONDITION EVALUATOR  (implement this)
// ------------------------------------------------------------------

/**
 * Recursively evaluates a Condition against an EvaluationContext.
 *
 * Requirements:
 *  R3. Must be exhaustive across ALL Condition kinds (use a never-check helper).
 *  R4. "time-window"  → true if context.utcHour is in [startHour, endHour) (exclusive end).
 *  R5. "ip-allowlist" → true if principalIp falls within ANY of the given CIDRs.
 *        For simplicity, implement prefix-match only: an IP matches a CIDR "a.b.c.d/N"
 *        if the first Math.floor(N/8) octets of the IP equal those of the CIDR address.
 *        (e.g. "10.1.2.3" matches "10.0.0.0/8" because first 1 octet matches)
 *  R6. "mfa-required" → true if context.principalHasMfa is true.
 *  R7. "same-tenant"  → true if context.principalTenant === condition.resourceTenantId.
 *  R8. "min-role"     → true if roleAtLeast(context.principalRole, condition.role).
 *  R9. "all"          → true if every nested condition evaluates to true.
 *  R10."any"          → true if at least one nested condition evaluates to true.
 */
export function evaluateCondition(
  condition: Condition,
  ctx: EvaluationContext
): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 9. POLICY EVALUATOR  (implement this)
// ------------------------------------------------------------------

/**
 * Evaluates a single Policy against an AuthRequest and returns a Decision.
 *
 * Requirements:
 *  R11. ExplicitDeny always returns { outcome: "deny", reason: "explicit-deny" }
 *       if the policy's principalId is absent OR matches the request's principal.
 *  R12. If the resource is locked, return { outcome: "deny", reason: "resource-locked" }
 *       before evaluating any other policy kind.
 *  R13. RolePolicy: if the principal's role satisfies the minimum role:
 *         - effect "allow" → { outcome: "allow", grantedBy: policy.id }
 *         - effect "deny"  → { outcome: "deny",  reason: "insufficient-role" }
 *       Otherwise → { outcome: "abstain" }.
 *  R14. ResourcePolicy: only applies when policy.resourceId === request.resource.id.
 *         - If a condition is present and evaluateCondition returns false →
 *             { outcome: "deny", reason: "condition-not-met" }
 *         - effect "allow" → { outcome: "allow", grantedBy: policy.id }
 *         - effect "deny"  → { outcome: "deny",  reason: "explicit-deny" }
 *       If resourceId doesn't match → { outcome: "abstain" }.
 *  R15. Must be exhaustive across all Policy kinds (use a never-check).
 */
export function evaluatePolicy(policy: Policy, request: AuthRequest): Decision {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 10. POLICY ENGINE  (implement this)
// ------------------------------------------------------------------

/**
 * Evaluates an ordered list of policies against an AuthRequest and
 * returns the final AuthResult.
 *
 * Requirements:
 *  R16. First, check tenant isolation: if request.principal.tenantId !==
 *       request.resource.tenantId, immediately return
 *       { outcome: "deny", reason: "tenant-mismatch" } without evaluating policies.
 *  R17. Evaluate policies in the order provided. An ExplicitDeny short-circuits
 *       immediately (return its decision without checking further policies).
 *  R18. Collect all non-abstain decisions. If any "deny" exists among them,
 *       return the first deny.
 *  R19. If at least one "allow" exists and no deny, return the first allow.
 *  R20. If all policies abstain, return { outcome: "abstain" }.
 *  R21. The return type must be AuthResult (wrap the decision with the request).
 */
export function evaluatePolicies(
  policies: Policy[],
  request: AuthRequest
): AuthResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 11. BATCH EVALUATOR  (implement this)
// ------------------------------------------------------------------

/**
 * Runs evaluatePolicies concurrently over an array of AuthRequests.
 *
 * Requirements:
 *  R22. Accept a shared policy list and an array of AuthRequests.
 *  R23. Execute all evaluations concurrently using Promise.all.
 *  R24. Each evaluation is wrapped in a microtask (Promise.resolve().then(...))
 *       so callers can treat it as async even though evaluation is synchronous.
 *  R25. Return Promise<AuthResult[]> preserving input order.
 */
export async function batchEvaluate(
  policies: Policy[],
  requests: AuthRequest[]
): Promise<AuthResult[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 12. AUDIT SUMMARY  (implement this)
// ------------------------------------------------------------------

/** Per-action breakdown inside the summary. */
export type ActionSummary = {
  readonly [A in Action]: {
    readonly allowed: number;
    readonly denied:  number;
    readonly abstained: number;
  };
};

/**
 * Aggregates an array of AuthResults into an ActionSummary.
 *
 * Requirements:
 *  R26. Every Action key must be present in the returned object (use a mapped type).
 *  R27. Count each result's decision outcome under the result's action key.
 *  R28. The return type must be ActionSummary — the compiler must enforce all keys.
 */
export function buildAuditSummary(results: AuthResult[]): ActionSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 13. EXHAUSTIVENESS HELPER  (provided — do not change)
// ------------------------------------------------------------------

/** Use this to assert a branch is unreachable. */
export function assertNever(x: never, msg?: string): never {
  throw new Error(msg ?? `Unexpected value: ${JSON.stringify(x)}`);
}
