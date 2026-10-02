# Typed Query Builder with Schema Inference

**Difficulty:** Hard

## Scenario

You're building the ORM query layer for a multi-tenant analytics platform. Queries are constructed fluently against a strongly-typed schema, the compiler must enforce that only real column names are selected/filtered, aggregation aliases are tracked in the return type, and the final `execute()` call resolves to a shape derived entirely from the chosen columns and aggregations — zero `any`, zero unsafe casts.

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
| Mapped types with conditional nullability | `ColumnType<Schema, Col>` (TODO 2-A) |
| Mapped type projection over union keys | `SelectedRow<Schema, Cols>` (TODO 2-B) |
| Discriminated union with literal `op` fields | `FilterOperator<T>` (provided), `applyFilter` (TODO 7) |
| Tuple-to-object mapped type (`AggRow`) | `AggRow<Aggs>` (TODO 2-D) — maps `alias` keys to `number` |
| Intersection / conditional merge of two mapped types | `QueryRow<Schema, Cols, Aggs>` (TODO 2-E) |
| Generic class with multiple type parameters that evolve per method | `QueryBuilder<Schema, Cols, Aggs>` (TODO 5-A) |
| `satisfies` for schema definition | `OrdersSchema` in test harness |
| `const` type parameters / `as const` readonly tuples | `aggregate(aggs: NewAggs)` call site, `_SampleAgg` |
| Exhaustive discriminated-union narrowing | `applyFilter` switch over all 9 `op` variants (TODO 7) |
| Generic factory function with inferred schema | `createQueryBuilder` (TODO 6) |


## Bonus

Extend QueryRow so that when both Cols and non-empty Aggs are present, the compiler enforces that every column in Cols also appears in a GROUP BY — modelled as a compile-time error if a selected column has no matching `groupBy` entry in the builder's type parameters.
