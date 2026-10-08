# Typed Schema-Validated Query Builder

**Difficulty:** Hard

## Scenario

You're building the data-access layer for a multi-tenant analytics platform. Consumers declare a typed query against a known table schema — selecting columns, filtering rows, sorting, and paginating — and the compiler must enforce that every referenced column exists on the target table, that filter value types match the column's declared type, and that the final result rows contain exactly the selected columns with their correct types.

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


| TypeScript Skill | Where Exercised |
|---|---|
| Mapped types | `InferRow<S>` — maps schema keys to TS types via `ColumnTypeMap` |
| Conditional types | `OpsForKind<K>` — selects valid operators per column kind |
| Distributive mapped types | `AnyFilterClause<S>` — distributes over `keyof S` to build a discriminated union |
| Generic type inference | `query<Cols>` — `Cols` inferred from `descriptor.select` without explicit type args |
| `Pick` utility type | `QueryResult` rows typed as `Pick<InferRow<S>, Cols[number]>` |
| Indexed access types | `Cols[number]` — converts a tuple/array type to a union of its element types |
| `satisfies` operator | Mock data uses `satisfies TableSchema` for schema declaration |
| `as const` + `ReadonlyArray` | `select` tuple captured as a const tuple for precise `Cols` inference |
| Branded types (bonus) | `QueryId` brand prevents raw strings from being used as query IDs |
| Exhaustive `never` check | `default` branch in `evaluateFilter` uses `never` to catch unhandled ops |
| Discriminated union narrowing | `evaluateFilter` narrows `op` via `switch` to satisfy the type checker |


## Bonus

Define a branded `QueryId` type (e.g. `string & { readonly __brand: "QueryId" }`), expose a `makeQueryId(raw: string): QueryId` constructor, add an optional `queryId?: QueryId` field to `QueryDescriptor`, and verify the compiler rejects a plain `string` in that position.
