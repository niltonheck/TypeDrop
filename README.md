# Typed Paginated API Client with Result Aggregation

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an analytics dashboard. The backend exposes a cursor-based paginated endpoint, and your client must walk every page, accumulate records, handle per-page errors gracefully, and surface a fully-typed aggregated result — all without losing type information or resorting to `any`.

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
| Discriminated union (`ok: true \| false`) | `Result<T,E>`, `Ok<T>`, `Err<E>` types |
| Generic type parameters (`<T, E, K>`) | Every function and interface |
| `keyof` constraint | `pluckField<T, E, K extends keyof T>` |
| Indexed access type (`T[K]`) | Return type of `pluckField` |
| `async`/`await` sequential iteration | `fetchAllPages` cursor loop |
| Higher-order typed functions | `mapFetchPage` wrapping `FetchPage<A,E>` → `FetchPage<B,E>` |
| Type alias for function shape | `FetchPage<T, E>` |
| Generic interface | `Page<T>`, `AggregatedResult<T, E>` |
| Result / Either pattern | `ok()`, `err()`, narrowing with `result.ok` |
| No `any` / no type assertions | Enforced throughout all stubs |

## Bonus

After all pages are fetched, add a `groupBy<T, E, K extends keyof T>(result: AggregatedResult<T, E>, key: K): Map<T[K], T[]>` utility that buckets items by the given field's value, with the `Map` key type fully inferred as `T[K]`.
