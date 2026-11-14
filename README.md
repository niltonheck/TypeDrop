# Typed Product Catalog Filter & Facet Engine

**Difficulty:** Medium

## Scenario

You're building the search & browse layer for an e-commerce platform. Raw catalog entries arrive as `unknown` JSON, your engine must validate and narrow them into typed products, apply a composable set of typed filters, and produce a faceted result — with counts per category, price-range buckets, and availability flags — all enforced by the compiler with no escape hatches.

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
| Type guard with `value is Product` narrowing | `isProduct()` — R1–R6 |
| Union literal narrowing (`Category` validation) | `isProduct()` — R2 |
| `Array.isArray` + element narrowing | `isProduct()` (tags), `parseProducts()` |
| `Partial<Record<K, V>>` typed accumulator | `buildFacets()` — `CategoryFacet`, `PriceFacet` |
| Union return type (`PriceBucket`) without casting | `getPriceBucket()` — R12 |
| Optional fields & AND/OR filter logic | `applyFilter()` — R13–R18 |
| Composing typed sub-functions into a pipeline | `searchCatalog()` — R24–R27 |
| `unknown` input → typed output (no `any`) | `parseProducts()` — R7–R10 |
| `satisfies` / structural inference on result shape | `FacetedResult` return in `searchCatalog()` |


## Bonus

Extend `CatalogFilter` with a `sortBy` field (`"price-asc" | "price-desc" | "rating-desc"`) and apply it after filtering, keeping the return type fully inferred.
