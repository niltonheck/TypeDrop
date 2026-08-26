# Typed CSV Report Aggregator with Schema Validation & Grouped Statistics

**Difficulty:** Medium

## Scenario

You're building the analytics backend for a SaaS billing platform. Raw sales CSVs arrive from multiple regional offices — each row must be validated against a typed schema, invalid rows collected as structured errors, and valid rows aggregated into per-region, per-product summaries with typed statistics.

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

| Skill | Where in code |
|---|---|
| **Branded types** with `unique symbol` | `RegionCode`, `ProductSku`, `toRegionCode`, `toProductSku` |
| **Discriminated union** Result monad (`Ok` / `Err`) | `Result<T,E>`, `validateRow` return type |
| **Type narrowing** via `result.ok` discriminant | `validateRow`, test harness checks |
| **Mapped type** over `Omit<GroupStats, …>` | `AggregateReport.summary` field type |
| **Generic constraints** (`K extends string`) | `groupBy<T, K extends string>` signature |
| **`Record<K, T[]>`** with narrowed key type | `groupBy` return type |
| **`keyof`** on interface | `ParseError.field: keyof SalesRecord` |
| **Nested `Map` with branded keys** | `byRegion: Map<RegionCode, Map<ProductSku, GroupStats>>` |
| **`Omit` utility type** | `summary` mapped type definition |
| **Runtime validation → typed output** | `validateRow` parsing logic |
| **Single-pass aggregation** | `aggregateReport` implementation |
| **No `any` / no `as`** | Entire file |

## Bonus

Extend `aggregateReport` to accept a generic `SchemaValidator<T>` type parameter so the same function can aggregate any validated record shape, not just `SalesRecord`.
