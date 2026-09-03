# Typed Schema-Validated ETL Pipeline with Branded Results

**Difficulty:** Hard

## Scenario

You're building the ingestion layer for a data-warehouse platform. Raw records arrive as `unknown` JSON blobs, must be validated against per-table schemas, transformed into strongly-typed domain rows, and either committed to a typed sink or collected into a structured error report — all without a single `any` or unsafe cast in sight.

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
| Branded / nominal types | `Validated<T>` with `unique symbol` brand |
| Discriminated unions | `FieldSchema` (`kind` discriminant), `Result<T,E>` (`ok` discriminant) |
| Mapped types | `inferRow<S>` — iterates over `S["fields"]` keys |
| Conditional types | `inferRow<S>` — maps `FieldSchema` kind → TS type; required vs optional split |
| `infer` keyword | Extracting the literal value type from `{ kind: "literal"; value: V }` |
| Template / indexed access types | `S["required"][number]` to distribute required keys |
| Generic constraints | `S extends TableSchema` on `validateRow`, `runPipeline`, `Transformer` |
| `satisfies` operator | Test harness uses `satisfies TableSchema` for schema literal |
| Result / Either pattern | `Ok<T>` / `Err<E>` union with helper constructors |
| Runtime narrowing (unknown → typed) | `validateRow` — structural check then per-field kind checks |
| Intersection types | `{ index: number } & ValidationError` in `PipelineReport.errors` |
| Generic interface | `Sink<Out>` with typed `write` method |


## Bonus

Extend `FieldSchema` with an `"array"` kind whose `items` is itself a `FieldSchema`, and make `inferRow` recursively infer the element type — so `{ kind: "array", items: { kind: "number" } }` maps to `number[]`.
