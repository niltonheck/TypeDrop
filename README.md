# Typed Paginated API Client with Retry & Cancellation

**Difficulty:** Hard

## Scenario

You're building the data-fetching core for an analytics dashboard that pulls large datasets from a paginated REST API. The client must handle page-by-page iteration, per-request retry logic with exponential back-off, and cooperative cancellation — all with airtight generic typing so callers never lose the shape of the resource they're fetching.

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


| Skill | Where exercised |
|---|---|
| Branded / nominal types | `ValidUrl`, `PageNumber` — structurally identical to `string`/`number` but distinct at the type level |
| Discriminated unions | `Result<T,E>` (`ok`/`err` tag), `ApiError` (`kind` tag) — exhaustive narrowing required |
| Generics with inferred type parameters | `fetchPage<T>`, `fetchAllPages<T>`, `withRetry<T>`, `createPaginatedClient<T>` |
| Utility types / `ClientConfig` lookup | `ClientConfig<T>["parseItems"]` used as a parameter type in `fetchPage` |
| Type-safe helper constructors | `ok<T>()` and `err<E>()` return the specific tagged branch, not the union |
| Async/concurrency primitives | `withRetry` — exponential back-off, `AbortSignal` cancellation between delays |
| AbortSignal cooperative cancellation | Checked before each fetch and between retry delays; propagated as `"cancelled"` variant |
| Composition pattern | `createPaginatedClient` wires all primitives into a `PaginatedClient<T>` interface |
| `readonly` / immutability discipline | All interfaces use `readonly`; `PageEnvelope.items` is `readonly T[]` |
| No `any` / no type assertions | Entire file must compile under `strict: true` with zero `any` or `as` |


## Bonus

Extend `PaginatedClient` with a `fetchPage` streaming overload that accepts an `onItem` callback typed as `(item: T) => void` and invokes it for each item as pages arrive, without buffering the full dataset in memory.
