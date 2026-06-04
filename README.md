# Typed Product Inventory Aggregator

**Difficulty:** Medium

## Scenario

You're building the reporting layer for an e-commerce warehouse system. Raw inventory records arrive as `unknown` JSON from a legacy ERP API; your engine must validate them, apply category-level discount rules via a typed strategy registry, and produce a strongly-typed per-category stock summary — with zero `any`.

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
| Union types (`Category`) | `type Category`, `validateProduct` category check |
| Mapped types (exhaustive + optional) | `DiscountRegistry` (every key required), `InventoryReport` (every key optional) |
| `satisfies` operator | `defaultDiscountRegistry satisfies DiscountRegistry` |
| Generic `Result<T, E>` type | `validateProduct` return type, error accumulation |
| Runtime `unknown` narrowing | `validateProduct` — all field checks without `any` |
| `Record<string, ValidationError[]>` | `AggregatorResult.errors` |
| `Set<string>` in typed interface | `CategorySummary.warehouseCodes` |
| Default function parameters with typed registry | `aggregateInventory` second param |
| Aggregation with single-pass accumulation | `aggregateInventory` loop body |
| Exhaustive error collection (no short-circuit) | `validateProduct` R2 requirement |


## Bonus

Add a `filterByWarehouse(report: InventoryReport, code: string): InventoryReport` function that returns a new report containing only products from the given warehouse code, preserving the full mapped-type contract.
