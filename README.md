# Typed Paginated API Client with Cursor-Based Iteration

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an admin dashboard that consumes a paginated REST API. Responses arrive in cursor-based pages, and the client must lazily iterate through all pages, accumulate typed results, and surface per-page errors as a typed `Result<T, FetchError>` — never throwing, and never losing the shape of the resource being fetched.

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
| Discriminated union (`Result<T,E>`) | `Result` type alias, `tag` field narrows Ok vs Err |
| Union type for error hierarchy | `FetchError` — three variants keyed on `kind` |
| Generic interfaces | `Page<T>`, `PaginatedClientConfig<T>`, `PageOutcome<T>` |
| Generic type alias (function shape) | `PageFetcher<T>` — generic callable alias |
| Async generator with explicit return type | `fetchPages<T>`: `AsyncGenerator<PageOutcome<T>, void, unknown>` |
| AbortSignal / cancellation pattern | `signal?.aborted` check before each fetch in `fetchPages` |
| Type narrowing on discriminated union | Narrowing `result.tag === "ok"` in `collectAll` to access `.value` |
| Conditional type with `infer` | `ExtractOk<R>` extracts `T` from `Result<T, E>` |
| `satisfies` / `const` generic usage | Config objects typed against `PaginatedClientConfig<User>` |
| Cursor-based pagination state machine | Cursor chain walk logic in `fetchPages` with `maxPages` cap |

## Bonus

After implementing the core challenge, extend `collectAll` to accept an optional `onPage` callback typed as `(outcome: PageOutcome<T>) => void` and invoke it for every yielded outcome, keeping the return type fully inferred.
