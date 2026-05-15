# Typed Streaming ETL Pipeline with Middleware

**Difficulty:** Hard

## Scenario

You're building the data-ingestion layer for a real-time analytics platform. Raw records stream in as `unknown` from heterogeneous sources; your typed ETL pipeline must validate them, pass them through a composable middleware chain (transform, enrich, filter), execute stages with a concurrency limit, and emit a strongly-typed pipeline report — with zero `any`.

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
| Branded / opaque types | `RecordId`, `SourceName` brands applied in `validateRecord` |
| Discriminated union narrowing | `PipelineRecord` union narrowed by `.stage` throughout pipeline |
| Generic async concurrency helper | `runConcurrent<T>` inside `runPipeline` (Req 8a) |
| Middleware / "onion" composition pattern | `composeMiddleware` + `Middleware` type (Req 6) |
| Conditional type widening | `ProcessableRecord` → `TransformedRecord` upgrade in transform/enrich |
| `ReadonlyArray` & immutable record types | All `PipelineRecord` subtypes use `readonly`, `ReadonlyArray` |
| Runtime validation of `unknown` | `validateRecord` — best-effort field extraction without `any` |
| Async middleware with `Promise` chaining | `MiddlewareNext`, `createEnrichMiddleware` (Req 5c) |
| Typed higher-order factory functions | `createTransformMiddleware`, `createFilterMiddleware`, `createEnrichMiddleware` |
| Strict null handling | `FailedRecord.id: RecordId \| null`, best-effort extraction logic |


## Bonus

Extend `runPipeline` to accept an optional `onRecord` callback typed as `(record: PipelineRecord) => void` that is called immediately after each record settles (not waiting for the full batch), enabling real-time progress reporting.
