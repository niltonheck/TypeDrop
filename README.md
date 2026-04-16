# Typed API Rate Limiter

**Difficulty:** Medium

## Scenario

You're building the outbound API gateway for a SaaS integration platform. Multiple services make concurrent requests to third-party APIs with different rate limits; your gateway must validate raw endpoint configurations, enforce per-client token-bucket limits, execute requests with typed results, and return a structured dispatch report — with zero `any`.

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
| **Branded types** — runtime-validated nominal wrappers | `TokenCount`, `ClientId`, `EndpointUrl`; `makeTokenCount` / `makeClientId` / `makeEndpointUrl` |
| **Discriminated unions** — exhaustive status tagging | `RequestResult<TPayload, TResponse>` with `"fulfilled"` / `"rate_limited"` / `"rejected"` variants |
| **Generics** — two type parameters flowing through the whole API | `ApiRequest<TPayload>`, `FetchFn<TPayload, TResponse>`, `DispatchReport<TPayload, TResponse>`, `dispatchBatch<TPayload, TResponse>` |
| **`unknown` → typed narrowing / validation** | `validateEndpointConfig(raw: unknown)` using brand constructors and field checks |
| **`Promise.allSettled` concurrency** | `dispatchBatch` — all requests run concurrently, results collected regardless of individual failure |
| **Typed class design** — encapsulation with typed getters | `TokenBucket` (private state, typed getters) and `RateLimiterRegistry` (Map-backed typed storage) |
| **`ReadonlyArray` / `ReadonlyMap`** — immutable output shapes | `DispatchReport.results` and `DispatchReport.clientSummary` |
| **Aggregation with `Map`** — single-pass client summary | `clientSummary` construction in `dispatchBatch` using `ClientId` as key |

## Bonus

Extend `dispatchBatch` to accept an optional `maxConcurrency: number` parameter that limits how many `fetchFn` calls run simultaneously using a semaphore pattern, while still returning results in original request order.
