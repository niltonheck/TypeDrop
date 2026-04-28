# Typed API Rate-Limiter Middleware Chain

**Difficulty:** Hard

## Scenario

You're building the gateway middleware layer for a multi-tenant REST API platform. Raw inbound requests arrive as `unknown` from the network edge; your engine must validate them, route each request through a composable chain of strongly-typed rate-limiter strategies (token bucket, sliding window, concurrency cap), and emit a discriminated-union decision — with zero `any`.

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

| Skill Exercised | Where in `challenge.ts` |
|---|---|
| **Branded types** (no `as`) | `TenantId`, `RouteKey`, `TimestampMs`; TODO (1) constructors |
| **Discriminated unions** | `RateLimiterStrategy`, `GatewayError`, `RateLimitError`, `ValidationError` |
| **Result<T,E> monad** | All return types; `Ok`/`Err` constructors; exhaustive matching |
| **Type narrowing** (discriminant checks) | `evaluateStrategy` switch on `strategy.type`; `validateRequest` guards |
| **Mapped types** | `TenantRegistry<K>` — `{ [P in K]: ... }` |
| **Generic constraints** | `TenantRegistry<K extends TenantId>`, `lookupChain<K extends TenantId>` |
| **`satisfies` operator** | Branded constructor helper; registry literal in test harness |
| **Runtime validation** (`unknown` → typed) | `validateRequest` narrowing all fields of `RawRequest` |
| **Mutation + state machines** | `evaluateStrategy` mutates `strategy.state` in-place per strategy |
| **Short-circuit chain evaluation** | `runChain` stops at first denied strategy |
| **Error wrapping / hierarchy** | `processRequest` wraps `ValidationError` into `GatewayError` |


## Bonus

Extend `TenantRegistry` with a conditional type `ChainFor<R extends TenantRegistry<TenantId>, K extends keyof R, Route extends RouteKey>` that resolves to `MiddlewareChain` if the route is present and `never` otherwise, and use it to make `lookupChain` return `MiddlewareChain | undefined` without any runtime overhead.
