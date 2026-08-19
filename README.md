# Typed Schema-Validated API Response Normalizer with Result Monad & Conditional Types

**Difficulty:** Hard

## Scenario

You're building the ingestion layer for a multi-source data warehouse. Raw API responses arrive as `unknown` JSON blobs from heterogeneous vendors — each with its own shape, required fields, and numeric/string quirks. Your normalizer must validate, coerce, and reshape each blob into a strongly-typed domain record, surfacing structured, exhaustively-matchable validation errors — all without a single `any` or unsafe cast.

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
| **Branded types** (`Brand<T, B>`) | `ISODateString`, `PositiveNumber`, `NonEmptyString` — Req 1 |
| **Discriminated union** (Result monad) | `Ok<T>` / `Err<E>` / `Result<T,E>` — Req 2 |
| **Discriminated union** (error hierarchy) | `FieldError` variants (`missing`, `wrong_type`, `out_of_range`, `invalid_format`) — Req 3 |
| **Mapped types** | `Schema<R>` — maps each key of R to `FieldSchema<R[K]>` — Req 5 |
| **Generic functions + type narrowing** | `nonEmptyString`, `positiveNumber`, `isoDateString` — Req 6 |
| **Generic accumulator / error collection** | `normalize<R>` — collects ALL field errors — Req 7 |
| **Generic mapped registry** | `SchemaRegistry<M>` / `RegistryEntry<R>` — Req 8 |
| **Indexed access types** (`M[K]`) | `normalizeFromRegistry` return type `Result<M[K], ValidationError>` — Req 9 |
| **Generic batch processing** | `normalizeBatch` — returns `BatchResult<M[K]>` — Req 10 |
| **Conditional type + `infer`** | `NormalizedOutput<S>` — extracts `T` from `FieldSchema<T>` — Req 11 |
| **`satisfies` constraint** | `orderSchema satisfies Schema<OrderRecord>` etc. — Req 12 |


## Bonus

Extend `FieldSchema<T>` with an optional `coerce` step that runs before `validate` (e.g. converting a numeric string `"3"` to `3`), and update `normalize` to call it when present — without widening the output type.
