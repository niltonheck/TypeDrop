// ============================================================
// Typed Permission Policy Evaluator
// ============================================================
// TOPICS: discriminated unions · conditional types · branded types ·
//         mapped types · generics · Result<T,E> · type narrowing ·
//         template literal types · exhaustive matching
// ============================================================

// ------------------------------------------------------------------
// § 1  Branded primitives
// ------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type TenantId   = Brand<string, "TenantId">;
export type SubjectId  = Brand<string, "SubjectId">;
export type ResourceId = Brand<string, "ResourceId">;
export type PolicyId   = Brand<string, "PolicyId">;

// TODO (1): Implement four helper constructors that cast plain strings to
//           their branded counterparts:
//             makeTenantId, makeSubjectId, makeResourceId, makePolicyId
//           Use a single generic helper so you don't repeat yourself.
//           Hint: a generic `brand<B>()` factory that returns a
//           `(s: string) => B` is one clean approach.

// ------------------------------------------------------------------
// § 2  Domain vocabulary
// ------------------------------------------------------------------

export type Action = "read" | "write" | "delete" | "admin";

/** A condition that must be true for the rule to apply. */
export type Condition =
  | { readonly kind: "ipRange";    readonly cidr: string }
  | { readonly kind: "timeWindow"; readonly startHour: number; readonly endHour: number }
  | { readonly kind: "mfaRequired" }
  | { readonly kind: "attributeMatch"; readonly attribute: string; readonly value: string };

/** A single rule within a policy. */
export type PolicyRule = {
  readonly ruleId:     string;
  readonly actions:    ReadonlyArray<Action>;
  readonly resources:  ReadonlyArray<string>; // glob-style patterns, e.g. "docs/*"
  readonly effect:     "allow" | "deny";
  readonly conditions: ReadonlyArray<Condition>;
  readonly priority:   number; // higher = evaluated first
};

/** A compiled, validated policy document. */
export type Policy = {
  readonly policyId:  PolicyId;
  readonly tenantId:  TenantId;
  readonly subjects:  ReadonlyArray<SubjectId>; // principals this policy applies to
  readonly rules:     ReadonlyArray<PolicyRule>;
  readonly version:   number;
};

// ------------------------------------------------------------------
// § 3  Validation — Result<T, E>
// ------------------------------------------------------------------

export type ValidationError =
  | { readonly kind: "missingField";   readonly field: string }
  | { readonly kind: "invalidType";    readonly field: string; readonly expected: string }
  | { readonly kind: "unknownAction";  readonly value: string }
  | { readonly kind: "invalidCidr";    readonly cidr: string }
  | { readonly kind: "badTimeWindow";  readonly startHour: number; readonly endHour: number };

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// TODO (2): Implement `parsePolicy(raw: unknown): Result<Policy, ValidationError>`
//
// Requirements:
//   a. Verify `raw` is a non-null object with the correct shape.
//   b. Validate `policyId`, `tenantId` are non-empty strings.
//   c. Validate `subjects` is a non-empty string[].
//   d. Validate `rules` is a non-empty array; for each rule validate:
//        - `ruleId` is a non-empty string
//        - `actions` contains only valid Action values
//        - `resources` is a non-empty string[]
//        - `effect` is "allow" | "deny"
//        - `priority` is a finite number
//        - `conditions` is an array of valid Condition shapes
//   e. For `ipRange` conditions, perform a basic CIDR check
//      (string contains "/" and both parts are non-empty).
//   f. For `timeWindow` conditions, startHour < endHour, both 0–23.
//   g. Return the first error encountered (fail-fast).
//
// No `any`, no type assertions.

export function parsePolicy(raw: unknown): Result<Policy, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 4  Access request & context
// ------------------------------------------------------------------

export type RequestContext = {
  readonly subjectId:  SubjectId;
  readonly tenantId:   TenantId;
  readonly action:     Action;
  readonly resourceId: ResourceId;
  /** Runtime attributes for `attributeMatch` conditions, e.g. { department: "eng" } */
  readonly attributes: Readonly<Record<string, string>>;
  /** Current hour (0–23) for `timeWindow` conditions */
  readonly currentHour: number;
  /** Whether the subject completed MFA for this session */
  readonly mfaVerified: boolean;
  /** The requester's IP address (dotted-decimal) */
  readonly ipAddress: string;
};

// ------------------------------------------------------------------
// § 5  Verdict — discriminated union
// ------------------------------------------------------------------

export type ConditionFailure =
  | { readonly kind: "ipRange";       readonly cidr: string; readonly ip: string }
  | { readonly kind: "timeWindow";    readonly startHour: number; readonly endHour: number; readonly currentHour: number }
  | { readonly kind: "mfaRequired" }
  | { readonly kind: "attributeMatch"; readonly attribute: string; readonly expected: string; readonly actual: string | undefined };

export type RuleMatch = {
  readonly policyId: PolicyId;
  readonly ruleId:   string;
  readonly effect:   "allow" | "deny";
  readonly priority: number;
};

export type Verdict =
  | { readonly decision: "allow";          readonly matchedRule: RuleMatch }
  | { readonly decision: "deny";           readonly matchedRule: RuleMatch }
  | { readonly decision: "deny-no-match"                                   }
  | { readonly decision: "deny-condition"; readonly matchedRule: RuleMatch; readonly failures: ReadonlyArray<ConditionFailure> };

// ------------------------------------------------------------------
// § 6  Condition evaluation helpers
// ------------------------------------------------------------------

// TODO (3): Implement `evaluateCondition(
//               condition: Condition,
//               ctx: RequestContext
//             ): ConditionFailure | null`
//
// Requirements:
//   - Returns `null` if the condition is satisfied, or a `ConditionFailure`
//     describing the failure.
//   - `ipRange`: check that `ctx.ipAddress` starts with the network prefix
//     (you may use a simple prefix-match: strip the mask bits portion and
//     check `ctx.ipAddress.startsWith(prefix)`).
//   - `timeWindow`: ctx.currentHour must be in [startHour, endHour).
//   - `mfaRequired`: ctx.mfaVerified must be true.
//   - `attributeMatch`: ctx.attributes[attribute] must equal value.
//   - Your switch must be exhaustive — TypeScript should catch unhandled kinds.

export function evaluateCondition(
  condition: Condition,
  ctx: RequestContext,
): ConditionFailure | null {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 7  Resource matching
// ------------------------------------------------------------------

// TODO (4): Implement `matchesResource(pattern: string, resourceId: string): boolean`
//
// Requirements:
//   - A pattern ending in "/*" matches any resourceId that starts with
//     the prefix before "/*" (e.g. "docs/*" matches "docs/report").
//   - A pattern of "*" matches everything.
//   - Otherwise, the pattern must be an exact string match.
//   - Pure TypeScript logic, no regex required (but allowed).

export function matchesResource(pattern: string, resourceId: string): boolean {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 8  Policy store — generic typed index
// ------------------------------------------------------------------

// TODO (5): Implement the `PolicyStore` class.
//
// It must satisfy the `IPolicyStore` interface below.
// Internally, maintain a Map indexed by TenantId → Policy[].
// All methods must be correctly typed — no `any`, no type assertions.

export interface IPolicyStore {
  /** Add or replace a policy (keyed by policyId within the tenant). */
  upsert(policy: Policy): void;
  /** Remove a policy by id; returns true if it existed. */
  remove(tenantId: TenantId, policyId: PolicyId): boolean;
  /** Return all policies for a tenant that apply to the given subjectId. */
  forSubject(tenantId: TenantId, subjectId: SubjectId): ReadonlyArray<Policy>;
}

export class PolicyStore implements IPolicyStore {
  // TODO
  upsert(_policy: Policy): void { throw new Error("Not implemented"); }
  remove(_tenantId: TenantId, _policyId: PolicyId): boolean { throw new Error("Not implemented"); }
  forSubject(_tenantId: TenantId, _subjectId: SubjectId): ReadonlyArray<Policy> { throw new Error("Not implemented"); }
}

// ------------------------------------------------------------------
// § 9  Core evaluator
// ------------------------------------------------------------------

// TODO (6): Implement `evaluate(ctx: RequestContext, store: IPolicyStore): Verdict`
//
// Requirements:
//   a. Fetch all policies from the store for ctx.tenantId + ctx.subjectId.
//   b. Collect all rules (across all policies) that match ctx.action AND
//      at least one resource pattern in rule.resources matches ctx.resourceId.
//   c. Sort matching rules by priority DESCENDING (highest first).
//   d. Evaluate conditions for the highest-priority rule:
//        - If all conditions pass → return a Verdict with decision matching
//          the rule's effect ("allow" or "deny").
//        - If any condition fails → return `deny-condition` with all failures.
//   e. If no rules match → return `{ decision: "deny-no-match" }`.
//   f. NOTE: only the single highest-priority rule is evaluated for conditions;
//      lower-priority rules are NOT fallbacks.

export function evaluate(ctx: RequestContext, store: IPolicyStore): Verdict {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 10  Batch evaluation with typed per-request results
// ------------------------------------------------------------------

// TODO (7): Implement `evaluateBatch`.
//
// Signature (you must define the return type — do NOT use `any`):
//   evaluateBatch(
//     requests: ReadonlyArray<RequestContext>,
//     store: IPolicyStore,
//   ): <return type here>
//
// Requirements:
//   - Returns an array parallel to `requests`.
//   - Each element is `{ requestIndex: number; verdict: Verdict }`.
//   - All evaluations are independent (order of results must match input order).
//   - Define a named return-element type `BatchResult` using `Pick`/mapped types
//     or a plain type alias — your choice, but it must be explicit.

export type BatchResult = {
  readonly requestIndex: number;
  readonly verdict: Verdict;
};

export function evaluateBatch(
  requests: ReadonlyArray<RequestContext>,
  store: IPolicyStore,
): ReadonlyArray<BatchResult> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// § 11  Exhaustive verdict reporter
// ------------------------------------------------------------------

// TODO (8): Implement `formatVerdict(verdict: Verdict): string`
//
// Requirements:
//   - "allow"          → "✅ ALLOW — policy <policyId> rule <ruleId> (priority <n>)"
//   - "deny"           → "🚫 DENY  — policy <policyId> rule <ruleId> (priority <n>)"
//   - "deny-no-match"  → "🚫 DENY  — no matching rule found"
//   - "deny-condition" → "🚫 DENY  — policy <policyId> rule <ruleId>; failed conditions: <kinds>"
//                         where <kinds> is a comma-separated list of condition kind strings
//   - Your switch must be exhaustive (use a `never` check on the default branch).

export function formatVerdict(verdict: Verdict): string {
  // TODO
  throw new Error("Not implemented");
}
