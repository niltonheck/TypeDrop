# Typed Paginated API Client with Result Chaining

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that consumes a paginated REST API. The client must handle multi-page traversal, surface typed errors without throwing, and aggregate all pages into a single typed collection — all enforced at compile time with no unsafe casts.

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
| Discriminated union (`success: true/false`) | `Ok<T>`, `Err<E>`, `Result<T,E>` types |
| Generic type parameters | `Result<T,E>`, `Page<T>`, `mapResult`, `flatMapResult`, `fetchPage`, `fetchAllPages` |
| Type narrowing on discriminant field | Inside `mapResult`, `flatMapResult` — branching on `result.success` |
| `unknown` → typed narrowing (no `any`) | `PageAdapter<T>` receives `unknown`; adapter must narrow safely |
| Async/await + `Promise<Result<T,E>>` | `fetchPage`, `fetchAllPages` |
| Error result types (Result monad) | `ok()`, `err()`, `mapResult`, `flatMapResult` |
| Try/catch with typed error construction | `fetchPage` — catching simulateFetch rejections and adapter throws |
| Cursor-based pagination loop | `fetchAllPages` — while loop consuming `nextCursor` |
| `interface` with generic field | `Page<T>` — `items: T[]`, `nextCursor`, `totalCount` |
| Functor map & monadic bind pattern | `mapResult` (functor), `flatMapResult` (monad bind) |

## Bonus

After `fetchAllPages` succeeds, pipe the result through a `flatMapResult` call that validates the total item count matches `totalCount` from the last page — returning an `Err` with code `"PARSE_ERROR"` if they disagree.
