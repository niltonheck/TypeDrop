# Typed Product Inventory Filter & Sorter

**Difficulty:** Easy

## Scenario

You're building the catalog browsing feature for an e-commerce storefront. Shoppers can filter products by category, availability, and price range, then sort the results — your engine must validate raw catalog inputs and return a fully typed filtered and sorted result with zero `any`.

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
| Union types (`Category`, `SortField`, `SortDirection`) | Domain type definitions |
| Discriminated union (`ValidationResult<T>`) | `ValidationOk` / `ValidationErr` with `ok` discriminant |
| Generic type alias (`ValidationResult<T>`) | `ValidationResult<T>`, `ValidationOk<T>` |
| `unknown` → typed narrowing (runtime validation) | `validateProduct` — all five field checks |
| Type predicate / narrowing in filter callback | Test harness `.filter((r): r is ... & { ok: true }` |
| Interface composition (`CatalogResult`) | `CatalogResult` aggregates `Product[]` and error array |
| Utility / mapped-style interfaces (`FilterOptions`, `SortOptions`) | Optional fields with `?` on `FilterOptions` |
| `satisfies`-safe exhaustive field ordering | Validation order matches `Product` field declaration |
| Immutability discipline (no mutation) | `filterProducts` and `sortProducts` must return new arrays |
| Pipeline orchestration with typed intermediate results | `processCatalog` wiring all three functions |

## Bonus

Extend `FilterOptions` with an optional `nameContains: string` field and handle it in `filterProducts` using a case-insensitive substring match.
