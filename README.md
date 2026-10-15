# Typed Product Catalog Filter & Grouper

**Difficulty:** Easy

## Scenario

You're building the browse-page logic for an e-commerce storefront. Raw product records arrive from a database query and must be filtered by a typed criteria object, then grouped into a strongly-typed map — the compiler must enforce that every filter key matches a real product field and that the grouped output preserves the correct value types throughout.

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

| TypeScript Skill | Where in Code |
|---|---|
| Mapped types (`[K in keyof T]`) | `FilterCriteria`, `StringKeys`, `GroupedProducts` |
| Conditional types (`T extends U ? A : B`) | `StringKeys` definition |
| Indexed access types (`[keyof Product]`) | Collapsing mapped type to a union in `StringKeys` |
| Generic constraints (`K extends StringKeys`) | `groupBy` and `filterAndGroup` signatures |
| `ReadonlyArray<T>` input typing | Both `filterProducts` and `groupBy` |
| Inferred return type (no manual annotation) | `filterAndGroup` return type |
| `Record<K, V>` utility type | `GroupedProducts` definition |
| Phantom / branding field for IDE surfacing | `_groupKey?: K` in `GroupedProducts` |

## Bonus

Add a `sortBy` function that accepts a `keyof Product` and a direction (`"asc" | "desc"`) and returns a comparator-sorted copy of the array, with the direction encoded as a template literal type `SortDir = "asc" | "desc"`.
