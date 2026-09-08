# Typed Feature-Flag Evaluation Engine

**Difficulty:** Medium

## Scenario

You're building the feature-flag evaluation core for a SaaS platform. Flags can be simple on/off toggles, percentage rollouts, or user-segment overrides; the evaluator must resolve the correct variant for a given user context and produce a typed audit record — all without a single `any` or unsafe cast.

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
| Discriminated union (`kind` discriminant) | `FlagRule` type — three members with `kind` tag |
| Generic types with `extends string` constraint | `Flag<V>`, `EvaluationRecord<V>`, all three functions |
| Template literal branded types | `FlagKey = \`flag_${string}\`` |
| `satisfies` operator for inference preservation | Mock flag configs in test harness |
| Mapped type over a union (`Record<Segment, V \| null>`) | `segment` rule's `segmentVariants` field |
| Type narrowing via discriminant | `evaluateFlag` switch/if-chain over `rule.kind` |
| `ReadonlyArray` and `Map` with precise key types | `batchEvaluate` signature |
| Union literal return type enforcement (`V` not `string`) | Return type of `evaluateFlag` and `EvaluationRecord.resolvedVariant` |

## Bonus

Add a `composeFlags` helper that takes two `Flag<V>` values and returns a new `Flag<V>` whose rule list is the concatenation of both, with the first flag's `defaultVariant` as the fallback — fully typed with no widening.
