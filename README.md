# Typed GroupBy & Aggregation Pipeline

**Difficulty:** Easy

## Scenario

You're building the reporting layer for a sales dashboard. Raw transaction records need to be bucketed by an arbitrary key, then summarised with typed aggregation functions — all without losing the shape of the original data or reaching for `any`.

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

| Skill exercised | Where in the code |
|---|---|
| Generics with multiple type parameters (`T`, `K`, `S`) | All four functions |
| `extends` constraint on a union type (`K extends Keyable`) | `Grouped<K, T>`, every function signature |
| Generic `Map<K, V>` usage | `Grouped<K, T>` type alias, `groupBy` implementation |
| Mapped/utility type composition | `GroupSummary<K, S>` type alias |
| Type inference — callers never annotate generics | `groupAndAggregate` call sites in tests |
| Immutability discipline (no mutation) | `topN` requirement |
| Callback typing (`keySelector`, `summarise`, `score`) | All four function signatures |
| `satisfies`-friendly return types (no `any` widening) | Return types on all functions |

## Bonus

Add a fifth function `pivot` that converts a `Grouped<K, T>` into a `Record<string, T[]>` using a mapped type so the keys become string-literal union members inferred from the data.
