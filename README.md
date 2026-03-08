# Typed Inventory Aggregator

**Difficulty:** Easy

## Scenario

You're building the stock-management module for an e-commerce back-office. Raw inventory records arrive from multiple warehouses and must be validated, grouped by category, and summarised — all with zero `any` and fully typed results.

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
| Union types (`Category`) | `Category` type alias; narrowing in `validateRecord` |
| `Omit` utility type | `InventoryItem extends Omit<RawRecord, "category">` |
| `Record` utility type | Return type of `aggregateByCategory` uses `Partial<Record<Category, CategorySummary>>` |
| Discriminated union (`Result<T,E>`) | `validateRecord` return type; narrowing via `.ok` in tests |
| Runtime `unknown → typed` narrowing | Checking `category` membership in `validateRecord` |
| Single-pass aggregation with `reduce` | `aggregateByCategory` must iterate `items` once |
| Composing typed pipelines | `processInventory` chains `partitionRecords` → `aggregateByCategory` |
| `strict: true` compliance | No `any`, no type assertions anywhere |


## Bonus

Extend `aggregateByCategory` to also return the `warehouseId` that holds the most stock for each category (breaking ties by whichever warehouse appears first), adding a `topWarehouseId: string` field to `CategorySummary` — still in a single pass.
