# Typed Feature Flag Evaluator with Audience Targeting

**Difficulty:** Medium

## Scenario

You're building the feature-flag evaluation engine for a SaaS platform. Raw flag configurations arrive as `unknown` from a remote config service; your engine must validate them into strongly-typed `FeatureFlag` records, evaluate each flag against a typed `UserContext` using discriminated targeting rules, and return a fully-typed `EvaluationResult` per flag — with zero `any`.

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

| Skill Exercised | Where in the Code |
|---|---|
| Discriminated union types | `TargetingRule` (3 variants), `EvaluationReason` (3 variants) |
| Named type aliases before union | `PercentageRule`, `AllowlistRule`, `AttributeRule` |
| `Record<string, string>` | `UserContext.attributes` |
| `unknown` → typed narrowing (no `any`) | `parseFeatureFlag` — field-by-field runtime guards |
| Discriminated union exhaustive handling | `evaluateFlag` switch/if over `rule.kind` |
| Typed error collection | `evaluateAll` return type with `parseErrors` array |
| Template-literal / indexed access types | `ruleKind: TargetingRule["kind"]` in `EvaluationReason` |
| `satisfies` or `const` assertions (optional stretch) | Can be used to validate mock data shapes |
| Strict null / no `any` compliance | All stubs and inferred types under `strict: true` |

## Bonus

Add a fourth `TargetingRule` variant `{ kind: "semver_gte"; attributeKey: string; minVersion: string }` that matches when the user's attribute value is a semver string ≥ `minVersion`, and update `parseFeatureFlag` + `evaluateFlag` to handle it exhaustively.
