# Typed groupBy & Aggregation with Mapped Types

**Difficulty:** Easy

## Scenario

You're building the analytics dashboard for a small e-commerce platform. Sales records stream in from the backend and you need to group them by a chosen key, then compute per-group summaries — all without losing type information about which keys are valid grouping fields.

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

| Skill | Where in Code |
|---|---|
| Conditional types to filter keys by value type | `GroupableKey` (TODO 1) |
| Indexed-access types (`SaleRecord[K]`) | `GroupedSummary<K>` (TODO 2) |
| Mapped types producing a `Record` | `GroupedSummary<K>` (TODO 2) |
| Generics constrained by a derived union (`K extends GroupableKey`) | `groupAndSummarise` & `topGroup` signatures (TODO 3–4) |
| Precise return types using generic type parameters | `topGroup` return type `SaleRecord[K]` (TODO 4) |
| Iteration & aggregation (reduce / accumulator pattern) | `groupAndSummarise` body (TODO 3) |

## Bonus

Extend `groupAndSummarise` to accept an optional `filter` predicate typed as `(r: SaleRecord) => boolean` and apply it before grouping, ensuring the predicate parameter type is inferred from `SaleRecord` without widening.
