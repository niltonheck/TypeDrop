# Typed Paginated API Cursor Engine

**Difficulty:** Hard

## Scenario

You're building the data-fetching layer for a large-scale analytics dashboard that must stream millions of records from a paginated REST API. Pages arrive as `unknown` JSON; your engine must validate them, thread opaque cursors through sequential fetches, enforce concurrency limits across multiple resource streams, and surface a strongly-typed per-resource aggregation report — with zero `any`.

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
| Branded types (`Cursor`, `ResourceId`) | §1 — type aliases with `__brand` discriminant |
| Discriminated union (`FetchError`, `Result<T>`) | §4 — `kind` field narrows each error variant |
| Generic interfaces & extending interfaces | §6, §7, §11 — `ResourceStream<TPayload>`, `ParsedPage<TPayload>` extends `Page<TPayload>` |
| `unknown` → typed narrowing (no `as`) | §8 `validateRawPage`, §9 `parsePage` — field-by-field guards |
| Type predicates / structural guards | §9 R12 — narrowing `next_cursor` to `Cursor | null` |
| Conditional mapped generics | `AggregationReport<TPayload>` wraps `ResourceReport<TPayload>[]` |
| Sequential async iteration with delay | §10 `paginateStream` — `await delay`, cursor threading |
| Concurrency-pool pattern | §11 `runAggregation` — queue-draining loop respecting `concurrencyLimit` |
| `Promise.allSettled` semantics | §11 R25 — no stream failure aborts others |
| `satisfies` / no `any` throughout | All stubs — `strict: true` enforced |

## Bonus

After `runAggregation` completes, add a `summarise` function with the signature `summarise<TPayload, TSummary>(report: AggregationReport<TPayload>, reducer: (acc: TSummary, record: Record<TPayload>) => TSummary, initial: TSummary): TSummary` that folds every record across all streams into a single typed summary value.
