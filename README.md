# Typed In-Memory Query Engine

**Difficulty:** Medium

## Scenario

You're building a lightweight client-side query engine for a product catalog dashboard. It must filter, sort, and aggregate a typed collection of records — and the compiler must guarantee that every field name, comparator, and aggregation function is valid for the shape of the record being queried.

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


| TypeScript Skill | Where in Code |
|---|---|
| Mapped types to extract keys by value type (`KeysOfType`) | `type KeysOfType<T, V>` |
| Distributive mapped type linking two fields (`FilterClause`) | `type FilterClause<T>` — maps over `keyof T` to pair `field` and `value` |
| Generic type constraints (`T extends FlatRecord`) | All types and both functions |
| Utility-style conditional types | `KeysOfType` used inside `AggregateClause` |
| `keyof T` as a type for struct fields | `SortClause<T>.field`, `AggregateClause<T>.field` |
| Union narrowing at runtime | `applyFilter` — switch/if on `op` and `typeof` guards |
| Generic function implementation with no `any` | `applyFilter<T>`, `runQuery<T>` |
| Discriminated / mapped union consumption | Iterating `FilterClause<T>[]` inside `runQuery` |


## Bonus

Extend `Query<T>` with an optional `groupBy: keyof T` field and update `runQuery` to return one `AggregateResult` per distinct value of that field, stored in a `Record<string, AggregateResult>`.
