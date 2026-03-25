# Typed Product Catalog Filter & Sorter

**Difficulty:** Easy

## Scenario

You're building the browse experience for a small e-commerce storefront. Shoppers can filter products by category, price range, and availability, then sort the results — your engine must validate raw filter inputs and return a fully typed, sorted product list.

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
| Discriminated union (`Result<T, E>`) | Return type of `validateFilter`; narrowing via `result.ok` in tests |
| Union type narrowing | `category` field checked against `Category` union values |
| Utility type `keyof` | `ValidationError.field` typed as `keyof RawFilterInput` |
| Template / literal union types | `Category`, `SortField`, `SortDirection` as string literal unions |
| Optional properties | `ValidatedFilter` fields all optional; `RawFilterInput` all optional |
| Type-safe generic constraint | `sortProducts` returns `Product[]` without casting |
| `satisfies`-friendly pattern | `ValidatedFilter` built up field-by-field, only valid values assigned |
| Runtime validation → typed output | `validateFilter` converts `unknown`-ish strings to typed values |

## Bonus

Extend `validateFilter` to also accept a `minRating` / `maxRating` string field and propagate it through `applyFilter`, all without introducing new `any` or type assertions.
