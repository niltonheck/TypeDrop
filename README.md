# Typed Product Inventory Filter

**Difficulty:** Easy

## Scenario

You're building the catalog layer for an e-commerce storefront. Raw product entries arrive as `unknown` from a third-party supplier feed; your engine must validate them, apply typed filter criteria, and return a strongly-typed filtered inventory summary — with zero `any`.

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
| Union types (`Category`, `StockStatus`) | Type definitions, `isCategory`, `isStockStatus` |
| Type guards / narrowing (`value is T`) | `isCategory`, `isStockStatus`, `parseProduct` |
| Optional-field interface design | `ProductFilters` (all fields optional) |
| `Record<K, V>` with exhaustive keys | `InventorySummary.categoryBreakdown` mapped over every `Category` |
| `unknown` → typed narrowing (no `any`) | `parseProduct`, `filterInventory` |
| Utility type thinking (`Pick`-like subset) | `ProductFilters` (mix of Product keys + derived fields) |
| Array methods (`filter`, `reduce`) | `filterInventory` — filtering and breakdown aggregation |
| Strict null safety | `parseProduct` returning `Product \| null`, null discarding in `filterInventory` |

## Bonus

Extend `ProductFilters` with an optional `sortBy` field typed as `"priceAsc" | "priceDesc" | "ratingDesc"` and apply the sort before returning results.
