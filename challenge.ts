// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Feature Flag Evaluator with Targeting Rules & Rollout
// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS
// 1. Parse and validate raw `unknown` flag configs into the `FeatureFlag` type.
// 2. Evaluate each flag for a given `UserContext` by applying targeting rules
//    in order — the first matching rule wins.
// 3. For flags with no matching rule, fall back to `defaultVariant`.
// 4. Apply percentage-based rollout: use a deterministic hash of
//    `${flagKey}:${userId}` (use `deterministicHash` provided below) to decide
//    whether the user is "in" the rollout bucket (0–99). If the hash % 100
//    is >= the flag's `rolloutPercentage`, serve `defaultVariant` instead.
// 5. Collect evaluation results into a typed `EvaluationReport`.
// 6. Never use `any`, `as`, or non-narrowing type assertions.

// ─── Domain Types ────────────────────────────────────────────────────────────

/** Supported targeting rule operators */
export type RuleOperator =
  | "eq"      // attribute === value
  | "neq"     // attribute !== value
  | "in"      // value is in a list
  | "gt"      // attribute > value  (numeric)
  | "lt";     // attribute < value  (numeric)

/** A single targeting rule */
export interface TargetingRule {
  /** The UserContext attribute key to inspect */
  attribute: keyof UserContext;
  operator: RuleOperator;
  /** The comparison value — string, number, or string[] depending on operator */
  value: string | number | string[];
  /** The variant to serve when this rule matches */
  variant: string;
}

/** A validated feature flag configuration */
export interface FeatureFlag {
  key: string;
  /** Human-readable description */
  description: string;
  /** Whether the flag is active; inactive flags always serve `defaultVariant` */
  enabled: boolean;
  /** Ordered list of targeting rules; first match wins */
  rules: TargetingRule[];
  /** Variant served when no rule matches (or flag is disabled / outside rollout) */
  defaultVariant: string;
  /**
   * 0–100 inclusive. Only users whose `deterministicHash(flagKey:userId) % 100`
   * is **strictly less than** this number are eligible for non-default variants.
   * 100 means everyone is eligible; 0 means no one is.
   */
  rolloutPercentage: number;
}

/** Runtime attributes for the user being evaluated */
export interface UserContext {
  userId: string;
  email: string;
  country: string;
  plan: "free" | "pro" | "enterprise";
  accountAgeDays: number;
}

// ─── Result Types ─────────────────────────────────────────────────────────────

export type EvaluationReason =
  | "DISABLED"          // flag.enabled === false
  | "OUTSIDE_ROLLOUT"   // hash % 100 >= rolloutPercentage
  | "RULE_MATCH"        // a targeting rule matched
  | "DEFAULT";          // no rule matched, within rollout

export interface FlagEvaluation {
  flagKey: string;
  variant: string;
  reason: EvaluationReason;
  /** The index of the matched rule (0-based), or null if no rule matched */
  matchedRuleIndex: number | null;
}

export interface EvaluationReport {
  userId: string;
  evaluatedAt: string; // ISO timestamp
  results: FlagEvaluation[];
  /** Count of flags that resolved to a non-default variant */
  overrideCount: number;
}

// ─── Validation Error ─────────────────────────────────────────────────────────

export interface ValidationError {
  flagIndex: number;
  message: string;
}

// ─── Result Type ──────────────────────────────────────────────────────────────

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ─── Utility (provided — do not modify) ──────────────────────────────────────

/**
 * Deterministic, fast string hash → non-negative integer.
 * Use this for rollout bucket calculation: `deterministicHash(seed) % 100`
 */
export function deterministicHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0; // keep as 32-bit unsigned
  }
  return h;
}

// ─── TODO: Implement the functions below ──────────────────────────────────────

/**
 * REQUIREMENT 1
 * Validate a single raw unknown value into a `FeatureFlag`.
 * Return `{ ok: false, error }` describing the first validation failure found.
 *
 * Minimum validations required:
 *  - `key`               must be a non-empty string
 *  - `description`       must be a string
 *  - `enabled`           must be a boolean
 *  - `defaultVariant`    must be a non-empty string
 *  - `rolloutPercentage` must be a number in [0, 100]
 *  - `rules`             must be an array; each rule must have:
 *      - `attribute`  ∈ keyof UserContext
 *      - `operator`   ∈ RuleOperator
 *      - `value`      string | number | string[]
 *      - `variant`    non-empty string
 */
export function parseFlag(
  raw: unknown,
  index: number
): Result<FeatureFlag, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2–4
 * Evaluate a single validated `FeatureFlag` against a `UserContext`.
 * Must return a `FlagEvaluation` with the correct variant and reason.
 *
 * Evaluation order:
 *  1. If `!flag.enabled`                         → reason: "DISABLED"
 *  2. If outside rollout bucket                  → reason: "OUTSIDE_ROLLOUT"
 *  3. Iterate rules in order; first match wins   → reason: "RULE_MATCH"
 *  4. No rule matched                            → reason: "DEFAULT"
 *
 * Operator semantics (attribute value from UserContext):
 *  - "eq"  : String(attrValue) === String(ruleValue)
 *  - "neq" : String(attrValue) !== String(ruleValue)
 *  - "in"  : Array.isArray(ruleValue) && ruleValue.includes(String(attrValue))
 *  - "gt"  : typeof attrValue === "number" && attrValue > (ruleValue as number)
 *  - "lt"  : typeof attrValue === "number" && attrValue < (ruleValue as number)
 */
export function evaluateFlag(
  flag: FeatureFlag,
  user: UserContext
): FlagEvaluation {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5
 * Parse all raw flag configs, evaluate each against the user, and return a
 * typed `EvaluationReport`.
 *
 * - Skip (do not include) any raw configs that fail validation; instead push a
 *   `ValidationError` into the `errors` out-array passed as the third argument.
 * - `evaluatedAt` should be `new Date().toISOString()`.
 * - `overrideCount` = number of results whose `reason === "RULE_MATCH"`.
 */
export function evaluateFlags(
  rawFlags: unknown[],
  user: UserContext,
  errors: ValidationError[]
): EvaluationReport {
  // TODO
  throw new Error("Not implemented");
}
