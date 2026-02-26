# Typed Product Inventory Aggregator

**Difficulty:** Easy

## Scenario

You're building a back-office tool for an e-commerce warehouse. Raw inventory records arrive as unknown JSON, and you must safely validate them, group them by category, and compute per-category summaries — the challenge is keeping every step fully typed without reaching for `any`.

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
| `unknown` narrowing (typeof, `in` operator, value checks) | `parseProduct` — step-by-step guard chain |
| Discriminated union (`Result<T, E>`) | Return type of `parseProduct`; consumed in `buildInventoryReport` |
| Union literal type (`Category`) | Field type on `Product`; key of `Map<Category, Product[]>` |
| `Pick<T, K>` utility type | `cheapestProduct` field in `CategorySummary` |
| Generic `Result<T, E>` | Defined and used without `any` |
| `Map<K, V>` with typed keys | Return type of `groupByCategory` |
| Interface design & composition | `Product`, `CategorySummary`, `InventoryReport`, `ParseError` |
| Single-pass aggregation with `reduce` / iteration | `summariseCategory` — stock sum, average, min price |
| Orchestration & index tracking | `buildInventoryReport` — preserves original array index in `ParseError` |
| `strict: true` compliance (no `any`, no `as`) | Entire file |


## Bonus

Extend `buildInventoryReport` to also return a `topCategory` field typed as `Category | null` — the category with the highest `totalStock`, or `null` if no valid products exist.
