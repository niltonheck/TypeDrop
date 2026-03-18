# Typed API Pagination Cursor Engine

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard that loads large datasets from a paginated REST API. Each resource type has its own shape, and the engine must handle cursor-based pagination, typed per-resource response validation, and aggregation into a single fully-typed result — surfaced through a `Result<T, E>` type with zero `any`.

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

| Skill | Where in Code |
|---|---|
| Generics with `extends` constraint | `parseRawPage<K extends ResourceKind>`, `fetchAllPages<K extends ResourceKind>` |
| Mapped types | `ValidatorRegistry` (`{ [K in ResourceKind]: Validator<ResourceMap[K]> }`) |
| Indexed access types | `ResourceMap[K]` used throughout `PageResult<K>`, `AggregatedResult<K>` |
| Discriminated union narrowing | `PaginationError` union (`kind` discriminant), `Result<T,E>` narrowing |
| `Result<T, E>` error pattern | All three functions return `Result<…, PaginationError>` |
| Runtime type narrowing (unknown → typed) | `buildValidatorRegistry` validators, `parseRawPage` shape checks |
| `Extract` utility type | Test harness uses `Extract<typeof e, { kind: "FETCH_ERROR" }>` |
| Async/await + error boundary | `fetchAllPages` wraps fetcher in try/catch, chains cursor loop |
| Union literal validation | `role`, `status` field checks in validators |
| Default parameters with generics | `maxPages = 10` in `fetchAllPages` |

## Bonus

Extend `fetchAllPages` to accept an optional `onPage` callback typed as `(page: PageResult<K>) => void` that is invoked after each successfully validated page, enabling streaming-style progress reporting.
