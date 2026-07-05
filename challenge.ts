// challenge.ts
// =============================================================================
// Typed Feature Flag Evaluator with Audience Targeting
// =============================================================================
// SCENARIO:
//   Raw flag configurations arrive as `unknown` from a remote config service.
//   You must validate them, evaluate each flag against a UserContext using
//   discriminated targeting rules, and return a typed EvaluationResult per flag.
//
// REQUIREMENTS:
//   1. Define a `TargetingRule` discriminated union with three variants:
//        - "percentage"  → { kind: "percentage"; rolloutPercent: number }   // 0–100
//        - "allowlist"   → { kind: "allowlist";  userIds: string[] }
//        - "attribute"   → { kind: "attribute";  key: string; values: string[] }
//      Each variant must be a separate named type alias before the union.
//
//   2. Define a `FeatureFlag` type with:
//        - id:          string
//        - name:        string
//        - enabled:     boolean          // master kill-switch
//        - rules:       TargetingRule[]  // evaluated in order; first match wins
//        - defaultValue: boolean         // returned when no rule matches
//
//   3. Define a `UserContext` type with:
//        - userId:     string
//        - attributes: Record<string, string>  // arbitrary KV pairs, e.g. { plan: "pro" }
//
//   4. Define an `EvaluationResult` type with:
//        - flagId:    string
//        - value:     boolean
//        - reason:    EvaluationReason   // see requirement 5
//
//   5. Define an `EvaluationReason` discriminated union:
//        - { kind: "disabled" }                          // master kill-switch was off
//        - { kind: "rule_match"; ruleIndex: number; ruleKind: TargetingRule["kind"] }
//        - { kind: "default" }                           // fell through all rules
//
//   6. Implement:
//        parseFeatureFlag(raw: unknown): FeatureFlag
//      Throws a descriptive Error if the raw value is missing required fields
//      or contains invalid types. Do NOT use `any` or type assertions (`as`).
//
//   7. Implement:
//        evaluateFlag(flag: FeatureFlag, ctx: UserContext): EvaluationResult
//      Rules:
//        a. If flag.enabled === false → return { value: false, reason: { kind: "disabled" } }
//        b. Iterate flag.rules in order; return on the FIRST matching rule:
//             - "percentage": hash userId deterministically (use `hashUserId` below)
//                             → match if hash % 100 < rolloutPercent
//             - "allowlist":  match if ctx.userId is in userIds
//             - "attribute":  match if ctx.attributes[key] is in values
//           On match → return { value: true, reason: { kind: "rule_match", ruleIndex: i, ruleKind: rule.kind } }
//        c. No rule matched → return { value: flag.defaultValue, reason: { kind: "default" } }
//
//   8. Implement:
//        evaluateAll(
//          rawFlags: unknown[],
//          ctx: UserContext
//        ): { results: EvaluationResult[]; parseErrors: Array<{ index: number; message: string }> }
//      Parse each raw flag with parseFeatureFlag; on parse error collect it in
//      parseErrors (do not throw); evaluate successfully parsed flags and collect
//      in results. Preserve original array order for results.
//
// HELPER — do not modify:
export function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0; // keep 32-bit unsigned
  }
  return hash;
}

// =============================================================================
// YOUR TYPE DEFINITIONS (requirements 1–5)
// =============================================================================

// TODO: PercentageRule
// TODO: AllowlistRule
// TODO: AttributeRule
// TODO: TargetingRule  (discriminated union of the three above)

// TODO: FeatureFlag

// TODO: UserContext

// TODO: EvaluationReason  (discriminated union)
// TODO: EvaluationResult

// =============================================================================
// YOUR FUNCTION IMPLEMENTATIONS (requirements 6–8)
// =============================================================================

// TODO: parseFeatureFlag(raw: unknown): FeatureFlag

// TODO: evaluateFlag(flag: FeatureFlag, ctx: UserContext): EvaluationResult

// TODO: evaluateAll(
//   rawFlags: unknown[],
//   ctx: UserContext
// ): { results: EvaluationResult[]; parseErrors: Array<{ index: number; message: string }> }
