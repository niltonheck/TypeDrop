// ============================================================
// challenge.ts — Typed Feature Flag Engine
// ============================================================
// TOPICS: discriminated unions, generics, mapped types,
//         conditional types, runtime validation (unknown → typed),
//         Result<T,E> error handling, type narrowing
// ============================================================

// ------------------------------------------------------------------
// 1. CORE VALUE TYPES
// ------------------------------------------------------------------

/** The set of value types a flag can resolve to. */
export type FlagValueType = "boolean" | "string" | "number";

/**
 * Map from FlagValueType → the actual TypeScript type.
 * TODO: Replace the `never` stubs with the correct conditional mapping.
 */
export type FlagValue<T extends FlagValueType> = T extends "boolean"
  ? never // TODO: map "boolean" → boolean
  : T extends "string"
  ? never // TODO: map "string"  → string
  : T extends "number"
  ? never // TODO: map "number"  → number
  : never;

// ------------------------------------------------------------------
// 2. TARGETING RULE TYPES  (discriminated union)
// ------------------------------------------------------------------

/**
 * A rule that matches when the user's attribute equals an exact value.
 *   { kind: "exact", attribute: "country", value: "US" }
 */
export interface ExactRule {
  readonly kind: "exact";
  readonly attribute: string;
  readonly value: string;
}

/**
 * A rule that matches when the user's attribute is in a set of values.
 *   { kind: "set", attribute: "plan", values: ["pro", "enterprise"] }
 */
export interface SetRule {
  readonly kind: "set";
  readonly attribute: string;
  readonly values: readonly string[];
}

/**
 * A rule that matches a percentage of users deterministically by userId.
 *   { kind: "rollout", percentage: 20 }   ← matches ~20 % of user IDs
 */
export interface RolloutRule {
  readonly kind: "rollout";
  /** Integer 0–100 inclusive. */
  readonly percentage: number;
}

/** Discriminated union of all targeting rule shapes. */
export type TargetingRule = ExactRule | SetRule | RolloutRule;

// ------------------------------------------------------------------
// 3. FLAG DEFINITION
// ------------------------------------------------------------------

/**
 * A fully-typed feature flag definition.
 *
 * @template T - the FlagValueType this flag resolves to
 *
 * Rules are evaluated in order; the first match wins.
 * If no rule matches, `defaultValue` is returned.
 */
export interface FlagDefinition<T extends FlagValueType> {
  readonly id: string;
  readonly valueType: T;
  /** Ordered list of targeting rules. */
  readonly rules: ReadonlyArray<{
    readonly rule: TargetingRule;
    /** The value to return when this rule matches. */
    readonly value: FlagValue<T>;
  }>;
  /** Fallback value when no rule matches. */
  readonly defaultValue: FlagValue<T>;
}

// ------------------------------------------------------------------
// 4. FLAG REGISTRY  (mapped type)
// ------------------------------------------------------------------

/**
 * A registry maps flag IDs to their definitions.
 * TODO: Define FlagRegistry as a mapped type over a string-keyed
 *       record where each key maps to a FlagDefinition of *some*
 *       FlagValueType.  Use a generic type parameter `K extends string`.
 *
 * Hint: Record<K, FlagDefinition<FlagValueType>> is the shape,
 *       but express it as a mapped type so callers can index it by key.
 */
export type FlagRegistry<K extends string> = {
  // TODO: fill in the mapped type body
  [P in K]: never; // stub — replace `never`
};

// ------------------------------------------------------------------
// 5. USER CONTEXT
// ------------------------------------------------------------------

/**
 * The evaluation context for a single user.
 * `attributes` is an open-ended string→string map of user properties
 * (e.g. country, plan, email, role …).
 */
export interface UserContext {
  readonly userId: string;
  readonly attributes: Readonly<Record<string, string>>;
}

// ------------------------------------------------------------------
// 6. EVALUATION RESULT  (discriminated union)
// ------------------------------------------------------------------

/**
 * Successful evaluation: the flag resolved to a typed value.
 */
export interface EvalSuccess<T extends FlagValueType> {
  readonly kind: "success";
  readonly flagId: string;
  readonly value: FlagValue<T>;
  /** Which rule index matched (−1 = defaultValue). */
  readonly matchedRuleIndex: number;
}

/**
 * Failed evaluation: the flag ID was not found in the registry.
 */
export interface EvalNotFound {
  readonly kind: "not-found";
  readonly flagId: string;
}

export type EvalResult<T extends FlagValueType> =
  | EvalSuccess<T>
  | EvalNotFound;

// ------------------------------------------------------------------
// 7. RESULT TYPE  (for validation)
// ------------------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ------------------------------------------------------------------
// 8. VALIDATION ERROR
// ------------------------------------------------------------------

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}

// ------------------------------------------------------------------
// 9. RUNTIME VALIDATION
// ------------------------------------------------------------------

/**
 * Requirement 1 — validateFlagDefinition
 *
 * Parse an `unknown` blob (e.g. from JSON.parse) into a
 * `FlagDefinition<FlagValueType>`.
 *
 * Must validate:
 *  - `id`        is a non-empty string
 *  - `valueType` is one of "boolean" | "string" | "number"
 *  - `rules`     is an array; each entry has a valid `rule` (correct `kind`
 *                shape) and a `value` matching the declared `valueType`
 *  - `defaultValue` matches the declared `valueType`
 *
 * Returns Result<FlagDefinition<FlagValueType>, ValidationError[]>.
 */
export function validateFlagDefinition(
  raw: unknown
): Result<FlagDefinition<FlagValueType>, ValidationError[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. ROLLOUT HASH  (deterministic percentage bucketing)
// ------------------------------------------------------------------

/**
 * Requirement 2 — rolloutHash
 *
 * Given a `userId` string, return a stable integer in [0, 99] that
 * determines whether the user falls inside a rollout percentage.
 *
 * A simple deterministic approach:
 *   sum the char-codes of the userId string, then modulo 100.
 *
 * Returns true if `hash(userId) < percentage`.
 */
export function rolloutHash(userId: string, percentage: number): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 11. RULE EVALUATION
// ------------------------------------------------------------------

/**
 * Requirement 3 — evaluateRule
 *
 * Return true if `ctx` matches `rule`.
 *
 * - ExactRule  : ctx.attributes[attribute] === value
 * - SetRule    : ctx.attributes[attribute] is in values
 * - RolloutRule: rolloutHash(ctx.userId, percentage) is true
 *
 * Use a type-narrowing exhaustive switch on `rule.kind`.
 */
export function evaluateRule(rule: TargetingRule, ctx: UserContext): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 12. FLAG EVALUATION
// ------------------------------------------------------------------

/**
 * Requirement 4 — evaluateFlag
 *
 * Evaluate a single flag against a user context.
 *
 * Algorithm:
 *  1. Look up `flagId` in `registry`; if missing return EvalNotFound.
 *  2. Iterate rules in order; return EvalSuccess with the first matching
 *     rule's value and its index.
 *  3. If no rule matches, return EvalSuccess with defaultValue and
 *     matchedRuleIndex: -1.
 *
 * The return type must be EvalResult<FlagValueType>.
 */
export function evaluateFlag<K extends string>(
  registry: FlagRegistry<K>,
  flagId: string,
  ctx: UserContext
): EvalResult<FlagValueType> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 13. BULK EVALUATION
// ------------------------------------------------------------------

/**
 * Requirement 5 — evaluateAll
 *
 * Evaluate every flag in the registry for a given user context.
 *
 * Returns a Record where each key is a flag ID and each value is its
 * EvalResult<FlagValueType>.
 *
 * TODO: also define the return type precisely using a mapped type
 *       over K so callers get per-key inference.
 */
export function evaluateAll<K extends string>(
  registry: FlagRegistry<K>,
  ctx: UserContext
): { [P in K]: EvalResult<FlagValueType> } {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 14. REGISTRY BUILDER  (builder pattern with generics)
// ------------------------------------------------------------------

/**
 * Requirement 6 — FlagRegistryBuilder
 *
 * Implement a builder that accumulates flag definitions and produces a
 * typed FlagRegistry.
 *
 * Usage:
 *   const registry = new FlagRegistryBuilder()
 *     .add(flagA)
 *     .add(flagB)
 *     .build();
 *
 * - `add(flag: FlagDefinition<FlagValueType>)` must return `this` so
 *   calls are chainable.
 * - `build()` must return a FlagRegistry whose key union is exactly
 *   the IDs of flags that were added.
 *
 * Hint: track accumulated keys with a generic type parameter that
 *       widens on each `.add()` call.
 */
export class FlagRegistryBuilder<K extends string = never> {
  // TODO: implement internal state

  add(
    flag: FlagDefinition<FlagValueType>
  ): FlagRegistryBuilder<K | typeof flag.id> {
    // TODO: implement
    throw new Error("Not implemented");
  }

  build(): FlagRegistry<K> {
    // TODO: implement
    throw new Error("Not implemented");
  }
}
