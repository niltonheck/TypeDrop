# Typed Retry-with-Backoff Fetch Orchestrator

**Difficulty:** Hard

## Scenario

You're building the resilient data-fetching layer for a financial trading dashboard. External market-data endpoints are flaky; your orchestrator must validate raw responses, retry failed requests with typed exponential back-off policies, fan out concurrent calls within a concurrency cap, and surface a strongly-typed per-endpoint result report — with zero `any`.

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
| Branded / opaque types | `EndpointUrl`, `makeEndpointUrl` (TODO 1) |
| Discriminated union narrowing | `Result<T,E>`, `EndpointOutcome`, `FetchError` |
| `unknown` → typed runtime validation | `parseMarketQuote` (TODO 4) |
| Generic `Ok`/`Err` constructors | `ok<T>`, `err<E extends string>` (TODO 2–3) |
| Conditional return type (no `as`) | `makeEndpointUrl` return `EndpointUrl \| "invalid"` |
| Exponential back-off maths + clamping | `computeDelay` (TODO 5) |
| `AbortController` / `AbortSignal` integration | `fetchWithRetry` (TODO 6f) |
| Typed async retry loop with sleep | `fetchWithRetry` (TODO 6a–6e) |
| Concurrency batching with `Promise.allSettled` | `orchestrate` (TODO 7b) |
| Typed `Record` / `Readonly` report building | `OrchestrationReport`, `orchestrate` (TODO 7d) |
| Single-pass aggregation with `Partial<Record<…>>` | `aggregateReport` (TODO 8a–8d) |
| Type predicate / type guard function | `extractFulfilledUrls` (TODO 9) |

## Bonus

Extend `orchestrate` to accept a per-spec `timeoutMs` field and wire up a per-request `AbortController` that auto-aborts after that deadline, surfacing `"TIMEOUT"` in the report.
