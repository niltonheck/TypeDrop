# Typed Contact Book Grouper

**Difficulty:** Easy

## Scenario

You're building the display layer for a mobile contact book app. Raw contact entries arrive as `unknown` from a device sync API; your engine must validate them, normalize their data, and group them into a strongly-typed alphabetical index — with zero `any`.

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
| `unknown` → narrowed type guard | `isPlainObject` returning `value is Record<string, unknown>` |
| Discriminated / union type narrowing | `ContactCategory` union check in `validateContact` |
| Template literal + `Uppercase<>` utility type | `AlphaKey` type definition |
| `Partial<Record<K, V>>` mapped utility type | `ContactIndex` type definition |
| Result/error object pattern (no exceptions) | `GroupResult` with `index` + `errors` |
| Type predicate (`value is T`) | Return type of `isPlainObject` |
| Null-handling & normalization | `phone` field logic in `validateContact` |
| Single-pass aggregation with `reduce` / loops | `groupContacts` building the index |
| In-place or post-sort with typed comparator | Per-bucket sort by `fullName` in `groupContacts` |

## Bonus

Extend `groupContacts` to accept an optional `filterCategory` parameter typed as `ContactCategory` and, when provided, only index contacts belonging to that category.
