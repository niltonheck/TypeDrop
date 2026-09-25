# Typed CSV Pipeline with Schema Validation & Aggregation

**Difficulty:** Medium

## Scenario

You're building the data-ingestion core for a financial reporting tool. Raw CSV text arrives from uploaded files, each column is validated against a declared schema, and the parsed rows are aggregated into a strongly-typed summary report — all without a single `any` or unsafe cast.

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
| Conditional types (`KindToPrimitive<K>`) | `ColumnKind` → primitive mapping |
| Mapped types over tuple indices (`[I in keyof S]`) | `SchemaRow<S>` definition |
| `infer` inside conditional types | `S[I] extends ColumnDef<infer K>` in `SchemaRow` |
| `UnionToIntersection<U>` helper type | Flattening per-column union into one object |
| Discriminated union result type (`ParseResult<T>`) | `ParseOk` / `ParseErr` |
| `satisfies` operator with `as const` | Schema declaration in test harness |
| Utility type filtering with mapped + conditional types | `NumericKeys<S>`, `AggregationSpec.groupBy` constraint |
| Generic constraints across two type params | `aggregateRows<S, Spec extends AggregationSpec<S>>` |
| Template-literal / key remapping | `GroupSums` return type keyed by `Spec["sum"][number]` |
| Runtime type narrowing without `any` | Cell parsing in `parseCsv` switch/if branches |


## Bonus

Extend `AggregationSpec` to support an optional `avg` field alongside `sum`, and compute per-group averages in `aggregateRows` reflected in the `GroupSums` return type.
