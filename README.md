# Typed Feature Flag Evaluator with Targeting Rules & Rollout

**Difficulty:** Medium

## Scenario

You're building the feature-flag evaluation engine for a SaaS platform. Raw flag configurations arrive as `unknown` from a remote config service; your evaluator must validate them, match each flag's targeting rules against a typed user context, apply percentage-based rollouts, and return a strongly-typed evaluation report — with zero `any`.

## How to solve

1. Open `challenge.ts`
2. Implement the types and functions marked with `TODO`
3. Verify your solution using one of the methods below

### In CodeSandbox (recommended)

1. Click the **Open Devtool** icon in the top-right corner (or press `Ctrl + \``)
2. In the Devtools panel, click **Type Check + Run Tests** to validate your solution
3. For `console.log` output and assertion results, open your **browser DevTools** (`F12` > Console tab)

### Locally

```bash
npm install
npm test    # runs tsc --noEmit && tsx challenge.test.ts
```

## Evaluation Checklist

| Skill Exercised | Where in Code |
|---|---|
| `unknown` → typed narrowing (no `as`) | `parseFlag`: validating raw object fields with `typeof` / `Array.isArray` guards |
| Discriminated union (`Result<T,E>`) | Return type of `parseFlag`; narrowed via `.ok` in test harness |
| Union & literal types | `RuleOperator`, `EvaluationReason`, `UserContext["plan"]` |
| `keyof` constraint | `TargetingRule.attribute: keyof UserContext`; validated in `parseFlag` |
| Exhaustive operator matching | `evaluateFlag` switch/if chain over `RuleOperator` — all 5 branches required |
| Branded / narrow string literals | `EvaluationReason` union ensures only valid reasons are returned |
| Generic Result type | `Result<FeatureFlag, ValidationError>` used without `any` |
| Typed error accumulation | `errors: ValidationError[]` out-param pattern in `evaluateFlags` |
| Mapped/utility type awareness | `keyof UserContext` drives valid attribute names for rules |
| Pure deterministic computation | `deterministicHash` usage for rollout bucket — no randomness |

## Bonus

Extend `evaluateFlag` to support a `"contains"` operator that checks whether a string attribute includes a substring, adding it to `RuleOperator` and handling it exhaustively.
