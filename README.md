# Typed Streaming ETL Pipeline

**Difficulty:** Hard

## Scenario

You're building the data-ingestion layer for a real-time analytics platform. Raw event batches arrive as `unknown` from multiple upstream sources; your pipeline must validate them, transform each event through a typed middleware chain, fan-out to per-topic async sinks with a concurrency limit, and return a strongly-typed pipeline execution report — with zero `any`.

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
| **Branded types** (non-`as` construction via Result) | `makeEventId`, `makeTopicName`, `makeSourceId` + `TODO 1` |
| **Discriminated union** (PipelineError, EventOutcome) | `PipelineError` type, `EventOutcome` type, exhaustive matching in `fanOutToSinks` |
| **Result\<T,E\> monad** (ok/err, chaining without throwing) | Throughout — `validateEvent`, `runMiddlewares`, `fanOutToSinks` |
| **Recursive conditional type** (MiddlewareChain validity) | `MiddlewareChain<MS>` — `TODO 2` |
| **Generic middleware chain** (type-safe payload threading) | `Middleware<TIn,TOut>`, `runMiddlewares` — `TODO 4` |
| **Mapped types** (SinkRegistry keyed by TopicName union) | `SinkRegistry<Topics>` |
| **Runtime type narrowing** (unknown → ValidatedEvent) | `validateEvent` — `TODO 3` |
| **Concurrency-limited async fan-out** (Promise pool) | `fanOutToSinks` — `TODO 5` |
| **Aggregation into typed report** | `runPipeline` — `TODO 6` |


## Bonus

Extend `MiddlewareChain` so it also infers and exposes the *final* output payload type as a type-level value, then use that inferred type to parameterise the return type of `runMiddlewares` instead of `Record<string, unknown>`.
