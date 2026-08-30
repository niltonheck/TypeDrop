# Typed Paginated API Client with Result Chaining & Cursor Inference

**Difficulty:** Medium

## Scenario

You're building the data-access layer for an internal admin dashboard that fetches paginated resources from a REST API. Each endpoint returns a different resource shape, and the client must handle cursor-based pagination, surface typed per-page results, accumulate all pages into a final collection, and propagate fetch errors without losing their structure.

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

| Skill Exercised | Location in Code |
|---|---|
| Generic functions with constrained type parameters | `fetchAllPages<T,E>`, `mapFetchResult<T,U,E>`, `matchResult<T,E,R>` |
| Discriminated union narrowing | `Result<T,E>` — narrowing on `.status` in all three functions |
| Result / Either monad pattern | `ok()`, `err()`, `Result<T,E>` used throughout |
| `Pick` utility type | `UserSummary = Pick<User, "id" \| "name">` |
| Typed error hierarchy with discriminated union | `FetchError = NetworkError \| ParseError \| AuthError` |
| Async iteration / sequential async loops | Cursor-based loop inside `fetchAllPages` |
| Generic return-type inference without explicit annotation | `matchResult` — R inferred from callbacks |
| Strict null checking | `nextCursor: string \| null` — must handle both branches |
| Readonly mapped properties | All types use `readonly` modifiers |
| No `any` / no unsafe widening | Enforced by strict compile constraints |


## Bonus

Extend `fetchAllPages` to accept an optional `maxPages` limit and return a `ParseError`-shaped `Err` if the limit is exceeded before a `null` cursor is reached.
