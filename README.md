# Typed Product Inventory Filter & Summarizer

**Difficulty:** Easy

## Scenario

You're building the inventory management module for an e-commerce dashboard. Raw product entries arrive as `unknown` from a warehouse sync API; your module must validate them into strongly-typed `Product` records, filter them by availability and category, and return a fully-typed `InventorySummary` — with zero `any`.

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
| `unknown` → typed narrowing (runtime validation) | `parseProduct` — field-by-field checks before constructing `Product` |
| Discriminated union / Result type (`ParseResult<T>`) | Return type of `parseProduct`; callers narrow via `.ok` |
| Union type membership guards (`Set.has` as type guard) | `VALID_CATEGORIES` and `VALID_STATUSES` sets used to narrow `category` / `status` |
| `Partial<Record<K, V>>` mapped utility type | `byCategory` field in `InventorySummary` |
| `Record<K, V>` with exhaustive keys | `statuses: Record<AvailabilityStatus, number>` in `CategorySummary` |
| Generic `ParseResult<T>` usage | `parseProduct` return type; `parseProducts` consumes it |
| Interface design & `FilterOptions` optional fields | `FilterOptions` — all fields optional, AND-ed filtering logic |
| Array iteration & aggregation | `summarizeInventory` — single-pass groupBy + accumulation |
| Pipeline composition | `processInventory` chains parse → filter → summarize |
| `strict: true` compliance (no `any`, no `as`) | Entire file — type safety enforced throughout |

## Bonus

Add a fifth `FilterOptions` field `minStockCount?: number` and update `filterProducts` and its tests to support it.
