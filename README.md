# Typed GroupBy & Aggregation Pipeline

**Difficulty:** Easy

## Scenario

You're building the reporting layer for a small e-commerce analytics dashboard. Raw order records arrive as a flat array and must be grouped by an arbitrary key, then reduced into a typed summary — all without losing type information or reaching for `any`.

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

| Skill | Where in code |
|---|---|
| Generics (`<T>`) | `groupBy<T>` — works for any item type |
| Mapped / conditional type | `StringKeys<T>` — filters keys by value type |
| Generic constraint (`extends`) | `buildReport<K extends StringKeys<Order>>` |
| `Record<K, V>` utility type | Return types of `groupBy` and `buildReport` |
| `keyof` operator | Inside `StringKeys<T>` definition |
| Discriminated / literal union types | `Order.region`, `Order.status` field types |
| Edge-case handling | `summariseGroup([])` returns all-zero summary |
| Single-pass aggregation with `reduce` | `summariseGroup` implementation |

## Bonus

Extend `buildReport` to accept an optional `filter` predicate `(order: Order) => boolean` that is applied before grouping, and ensure the predicate's parameter type is inferred correctly without any explicit annotation at the call site.
