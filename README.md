# Typed Inventory Aggregator

**Difficulty:** Easy

## Scenario

You're building a dashboard for a small e-commerce warehouse. Given a flat list of product entries (each with a category, SKU, price, and stock count), aggregate them into a per-category summary — the hardest part is getting the TypeScript types exactly right.

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
| Branded types (string intersection) | `Sku` type definition & `toSku` helper |
| Interface design with custom types | `InventoryItem` using `Sku` field |
| Utility type `Record<K, V>` | `InventorySummary` type alias |
| Iteration & single-pass aggregation | `aggregateInventory` reduce/loop logic |
| Typed object accumulation | Building `CategorySummary` entries per category |
| Array sorting with typed keys | `topCategories` sorted by `totalValueUsd` |
| Strict-mode compliance (no `any`) | Entire file — especially `toSku` without a type assertion |

## Bonus

After `aggregateInventory` works, add a generic `groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]>` utility and refactor your implementation to use it.
