# Typed Product Inventory Grouper

**Difficulty:** Easy

## Scenario

You're building the catalog layer for an e-commerce platform. Raw product entries arrive as `unknown` from a warehouse API; your engine must validate them, group them by category, and return a strongly-typed per-category inventory summary — with zero `any`.

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
| Discriminated union (`ParseResult<T>`) | `parseProduct` return type; narrowing via `parsed.ok` in test harness |
| Generic type parameter (`ParseResult<T>`) | `ParseResult<Product>` instantiation |
| Runtime type narrowing (`typeof`, `in`) | Inside `parseProduct` to validate each field |
| Interface definition with constraints | `Product`, `CategorySummary`, `InventoryReport` |
| `unknown` → typed narrowing (no `any`) | `parseProduct(_raw: unknown)` parameter |
| `Map<string, Product[]>` for grouping | Inside `buildInventoryReport` accumulation loop |
| `Array.prototype.reduce` / iteration | Computing `CategorySummary` fields per group |
| Alphabetical sort on typed array | `summaries.sort((a, b) => a.category.localeCompare(b.category))` |

## Bonus

Extend `CategorySummary` with an `averagePrice` field (average price across products in the category, regardless of stock) and verify it in the test harness.
