# Typed Feature Flag Evaluator

**Difficulty:** Medium

## Scenario

You're building the feature-flag evaluation engine for a product experimentation platform. Raw flag configurations arrive from a remote config service as unknown JSON; your engine must validate them, evaluate each flag against a typed user context, and return a strongly-typed rollout report — with zero `any`.

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
| Type guard functions (`value is T`) | `isAudience`, `isOperator`, `isVariantKind` |
| Discriminated union narrowing | `parseFlagVariant` — switching on `kind` |
| `keyof` constraint on object attribute | `TargetingRule.attribute: keyof UserContext` |
| `unknown` → typed narrowing (no `any`) | All `parse*` functions |
| `as const` array for membership checks | `VALID_AUDIENCES`, `VALID_OPERATORS`, `VALID_KINDS` |
| Discriminated union result type | `FlagResult` union with `status` discriminant |
| Exhaustive operator matching | `evaluateRule` switch over `Operator` |
| Aggregate typed report construction | `evaluateFlags` building `EvaluationReport` |
| `satisfies` / structural typing | `rawBooleanFlag` etc. in test harness |


## Bonus

Extend `TargetingRule` to support a `"regex"` operator that tests `user[attribute]` against a `RegExp` pattern string, and update `evaluateRule` and `parseTargetingRule` accordingly — keeping the discriminated union exhaustive.
