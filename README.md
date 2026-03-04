# Typed Plugin Middleware Chain with Typed Error Hierarchy

**Difficulty:** Hard

## Scenario

You're building the request-processing core of an API gateway. Incoming requests pass through a chain of strongly-typed middleware plugins (auth, rate-limiting, transformation, logging). Each plugin can either pass the request downstream, short-circuit with a typed error, or mutate the request context — and the orchestrator must collect per-plugin results, surface a typed error hierarchy, and guarantee exhaustive handling at every exit point.

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

| Skill | Where in the code |
|---|---|
| Branded types (`RequestId`, `PluginName`) | `makeRequestId`, `makePluginName`, `Plugin.name`, `PluginRecord.plugin` |
| Discriminated unions (error variants) | `PluginError` — `AuthError \| RateLimitError \| ValidationError \| UpstreamError` |
| Discriminated unions (chain outcome) | `ChainResult` — `outcome: "success" \| "failure"` |
| Discriminated unions (audit records) | `PluginRecord` — `status: "passed" \| "failed" \| "skipped"` |
| Generic `Result<T, E>` type | `Result<RequestContext, PluginError>` in `Plugin.execute` |
| `never`-assertion exhaustive switch | `renderError` default branch |
| Typed interface design (`Plugin`) | `Plugin.execute` return type |
| Sequential async orchestration | `runChain` — awaiting plugins one-by-one |
| Wall-clock timing with `Date.now()` | `PluginRecord.durationMs` in `runChain` |
| Typed aggregation over union arrays | `summariseAudit` — narrowing each `PluginRecord` variant |
| `strict: true`, zero `any` | Entire file |


## Bonus

Extend runChain to accept an optional `timeout: number` per plugin (via an augmented Plugin interface) and return a new `PluginError` variant `{ kind: "timeout"; pluginName: PluginName; limitMs: number }` when a plugin exceeds its budget — using `Promise.race` and `AbortController`.
