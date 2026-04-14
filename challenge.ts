// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Feature Flag Evaluator
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO:
//   Raw flag configurations arrive from a remote config service as unknown JSON.
//   Your engine must validate them, evaluate each flag against a typed user
//   context, and return a strongly-typed rollout report — with zero `any`.
//
// REQUIREMENTS (implement every numbered TODO):
// ─────────────────────────────────────────────────────────────────────────────

// ── Domain Types ──────────────────────────────────────────────────────────────

/** The audiences a flag can target. */
export type Audience = "internal" | "beta" | "public";

/** Supported rule operators. */
export type Operator = "eq" | "neq" | "in" | "not_in" | "gte" | "lte";

/**
 * A single targeting rule.
 * `attribute` is a key of UserContext.
 * `value` is the scalar or array to compare against.
 */
export interface TargetingRule {
  attribute: keyof UserContext;
  operator: Operator;
  value: string | number | string[];
}

/**
 * Discriminated union of flag variants.
 *  - "boolean"  → enabled: boolean
 *  - "string"   → variant: string
 *  - "number"   → variant: number
 */
export type FlagVariant =
  | { kind: "boolean"; enabled: boolean }
  | { kind: "string"; variant: string }
  | { kind: "number"; variant: number };

/**
 * A fully validated feature flag.
 * `rules` are evaluated in order; the first match wins.
 * If no rule matches, `defaultVariant` is used.
 */
export interface FeatureFlag {
  id: string;
  name: string;
  audience: Audience;
  rules: TargetingRule[];
  defaultVariant: FlagVariant;
}

/** The runtime context for the user being evaluated. */
export interface UserContext {
  userId: string;
  email: string;
  plan: string;
  country: string;
  accountAgeDays: number;
  audience: Audience;
}

// ── Result Types ──────────────────────────────────────────────────────────────

/** Per-flag evaluation outcome. */
export type FlagResult =
  | { status: "matched"; flagId: string; rule: TargetingRule; variant: FlagVariant }
  | { status: "default"; flagId: string; variant: FlagVariant }
  | { status: "invalid"; flagId: string; error: string };

/** Aggregate report returned by the evaluator. */
export interface EvaluationReport {
  userId: string;
  evaluatedAt: string; // ISO timestamp
  results: FlagResult[];
  summary: {
    total: number;
    matched: number;
    defaulted: number;
    invalid: number;
  };
}

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_AUDIENCES: Audience[] = ["internal", "beta", "public"];
const VALID_OPERATORS: Operator[] = ["eq", "neq", "in", "not_in", "gte", "lte"];
const VALID_KINDS = ["boolean", "string", "number"] as const;
type VariantKind = (typeof VALID_KINDS)[number];

/**
 * TODO 1 — isAudience(value: unknown): value is Audience
 * Return true iff `value` is one of the three valid audience strings.
 */
export function isAudience(value: unknown): value is Audience {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 2 — isOperator(value: unknown): value is Operator
 * Return true iff `value` is one of the six valid operator strings.
 */
export function isOperator(value: unknown): value is Operator {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 3 — isVariantKind(value: unknown): value is VariantKind
 * Return true iff `value` is "boolean", "string", or "number".
 */
export function isVariantKind(value: unknown): value is VariantKind {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 4 — parseFlagVariant(raw: unknown): FlagVariant
 * Validate and parse a raw object into a FlagVariant discriminated union.
 * Throw a descriptive Error if the shape is invalid.
 *
 * Rules:
 *  - `kind` must pass isVariantKind
 *  - "boolean" → `enabled` must be a boolean
 *  - "string"  → `variant` must be a string
 *  - "number"  → `variant` must be a number
 */
export function parseFlagVariant(raw: unknown): FlagVariant {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 5 — parseTargetingRule(raw: unknown): TargetingRule
 * Validate and parse a raw object into a TargetingRule.
 * Throw a descriptive Error if the shape is invalid.
 *
 * Rules:
 *  - `attribute` must be a non-empty string and a valid keyof UserContext
 *  - `operator` must pass isOperator
 *  - `value` must be a string, number, or non-empty array of strings
 */
export function parseTargetingRule(raw: unknown): TargetingRule {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 6 — parseFeatureFlag(raw: unknown): FeatureFlag
 * Validate and parse a raw object into a FeatureFlag.
 * Throw a descriptive Error if the shape is invalid.
 *
 * Rules:
 *  - `id` and `name` must be non-empty strings
 *  - `audience` must pass isAudience
 *  - `rules` must be an array (each element parsed via parseTargetingRule)
 *  - `defaultVariant` must parse via parseFlagVariant
 */
export function parseFeatureFlag(raw: unknown): FeatureFlag {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Rule Evaluation ───────────────────────────────────────────────────────────

/**
 * TODO 7 — evaluateRule(rule: TargetingRule, user: UserContext): boolean
 * Evaluate a single targeting rule against the user context.
 *
 * Operator semantics:
 *  - "eq"      → user[attribute] === value  (scalar)
 *  - "neq"     → user[attribute] !== value  (scalar)
 *  - "in"      → (value as string[]).includes(String(user[attribute]))
 *  - "not_in"  → !(value as string[]).includes(String(user[attribute]))
 *  - "gte"     → Number(user[attribute]) >= Number(value)  (scalar)
 *  - "lte"     → Number(user[attribute]) <= Number(value)  (scalar)
 */
export function evaluateRule(rule: TargetingRule, user: UserContext): boolean {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Main Evaluator ────────────────────────────────────────────────────────────

/**
 * TODO 8 — evaluateFlags(rawFlags: unknown[], user: UserContext): EvaluationReport
 * For each element of rawFlags:
 *   a. Attempt to parse it as a FeatureFlag (parseFeatureFlag).
 *      On parse error → push an FlagResult with status "invalid".
 *   b. Check audience: if flag.audience !== "public" AND flag.audience !== user.audience
 *      → treat as status "default" using flag.defaultVariant.
 *   c. Evaluate rules in order; first matching rule → status "matched" with that rule & variant.
 *      Hint: the variant for a matched rule is the flag's defaultVariant
 *            (flags in this system use rules only for targeting, variant is always defaultVariant).
 *   d. No rule matched → status "default" with flag.defaultVariant.
 *
 * Build and return a complete EvaluationReport including the summary counts.
 */
export function evaluateFlags(rawFlags: unknown[], user: UserContext): EvaluationReport {
  // TODO: implement
  throw new Error("Not implemented");
}
