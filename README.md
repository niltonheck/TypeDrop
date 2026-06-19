# Typed CSV Report Pipeline with Aggregation & Validation

**Difficulty:** Medium

## Scenario

You're building the data-export layer for an analytics dashboard. Raw CSV rows arrive as `unknown[]` from a file-upload parser; your pipeline must validate each row into a strongly-typed record, aggregate metrics in a single pass, and return a typed report summary — with zero `any`.

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


| Skill Exercised | Where in the Code |
|---|---|
| Discriminated unions (`ValidationResult`, `PipelineResult`) | `validateRow` return type, `runPipeline` return type |
| `unknown` narrowing without `any` or `as` | Inside `validateRow` — must check `typeof`, property existence, range guards |
| Union literal type guard (`Region`) | Checking `region` field against the four allowed string literals |
| `keyof SalesRecord` as a field type | `ValidationFailure.field` type annotation |
| `Record<Region, RegionSummary>` mapped/indexed type | `byRegion` in `ReportSummary` and `aggregateRecords` return |
| `Pick<ReportSummary, ...>` utility type | Return type of `aggregateRecords` |
| Single-pass aggregation (reduce / one loop) | Body of `aggregateRecords` |
| Error result pattern (collect failures, continue) | Body of `runPipeline` |
| `try/catch` for fatal error handling | Wrapper in `runPipeline` |
| `satisfies` or exhaustive region initialisation | Seeding all four regions in `byRegion` before aggregation |


## Bonus

After the pipeline runs, add a `topProduct` field to `ReportSummary` that uses a template literal type `\`${string} (${Region})\`` to represent the best-selling product name and its region by total revenue.
