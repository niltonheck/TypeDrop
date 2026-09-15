# Typed Product Catalog Filter & Sorter

**Difficulty:** Easy

## Scenario

You're building the core filtering and sorting logic for an e-commerce product catalog page. Shoppers can narrow results by category, price range, and in-stock status, then sort by price or rating — and the compiler must enforce every filter shape and sort key along the way.

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

| Skill | Where in the code |
|---|---|
| Union types | `Category`, `SortKey`, `SortOrder` |
| Interface design with optional fields | `FilterCriteria` |
| `Record<K, V>` utility type | `groupByCategory` return type |
| Indexed access / keyof narrowing | `product[options.key]` in `sortProducts` |
| `readonly` arrays | Parameters of `filterProducts`, `filterAndSort`, `groupByCategory` |
| Function composition | `filterAndSort` calling `filterProducts` + `sortProducts` |
| No mutation guarantee | Spread / `.filter()` / `.sort()` on copies |

## Bonus

Extend `FilterCriteria` with a `nameContains?: string` field (case-insensitive substring match) and update `filterProducts` to apply it.
