# Typed Book Club Reading List Builder

**Difficulty:** Easy

## Scenario

You're building the reading list feature for a book club app. Members submit raw book entries from a form, and you must validate them, tag each book with a derived reading status, and produce a sorted, fully typed reading list — with zero `any`.

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
| Union types (`Genre`, `ReadingStatus`, `BookValidationError`) | §1, §5 |
| Generic `Result<T, E>` type with discriminated union | §2 |
| Type-predicate / narrowing function (`isGenre`) | §3 |
| `unknown` narrowing without `any` or `as` | §5 `parseBook` |
| `Record<ReadingStatus, number>` mapped utility type | §6 `ReadingList.summary` |
| Interface design with derived fields | §1 `Book` |
| Sorting and aggregation with typed accumulator | §6 `buildReadingList` |
| Generic helper functions (`ok`, `err`) | §2 |


## Bonus

Add a second overload of `buildReadingList` that accepts a `Genre` filter and returns only books matching that genre, with the summary counts reflecting the filtered set.
