# Typed CSV Report Parser

**Difficulty:** Easy

## Scenario

You're building the data-import pipeline for a sales analytics dashboard. Raw CSV text arrives from uploaded files as plain strings; your parser must validate each row, transform it into a strongly-typed record, and return a typed parse report — with zero `any`.

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
| Discriminated union (`ok: true \| false`) | `RowResult` type definition |
| Generic interface with default type param | `ColumnSchema<T = string>` |
| `satisfies` operator with `ReadonlyArray` | `SALE_COLUMNS satisfies ReadonlyArray<ColumnSchema<unknown>>` |
| `Extract<>` utility type | `failures` field in `ParseReport` |
| `Record<K, V>` utility type | Return type of `revenueByRegion` |
| Union literal type (`Region`) | `SaleRecord.region` field + validation logic |
| Type narrowing via discriminant | Splitting `RowResult[]` into records vs failures |
| Strict null checks (no `!`) | `validate` returning `string \| null` |
| `unknown` over `any` in generics | `ColumnSchema<unknown>` in `SALE_COLUMNS` |

## Bonus

Extend `parseCSV` to accept a second optional `delimiter` parameter typed as `"," | ";" | "\t"` and use it throughout, keeping `","` as the default.
