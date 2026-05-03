# Typed In-Memory Search Index

**Difficulty:** Medium

## Scenario

You're building the client-side search layer for a documentation site. Raw document payloads arrive as `unknown` from a local JSON bundle; your engine must validate them, build an inverted index over configurable fields, and return strongly-typed ranked results — with zero `any`.

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

| Skill | Where in `challenge.ts` |
|---|---|
| `infer` in conditional types | `ExtractFields<C>` (TODO 3-A) |
| Built-in utility types (`Required`, `Record`) | `WeightMap<F>` (TODO 3-B) |
| `unknown` → typed narrowing (no `any`) | `validateDocument` (TODO 4) |
| Discriminated union construction & return | `ValidationResult` variants returned in TODO 4 & 6-B |
| Generic class with constrained type parameter | `SearchIndex<F extends string>` (TODO 6) |
| `Partial<Record<F, number>>` & merge logic | `constructor` weight-map building (TODO 6-A) |
| `Map<K, V>` with proper generics | Inverted index internals (TODO 6-B/C) |
| Discriminated union narrowing at call site | `search()` return variants (TODO 6-C) |
| Template / mapped type usage | `WeightMap`, `IndexConfig.fieldWeights` |
| Regex-based string processing (typed) | `tokenise` (TODO 5) |

## Bonus

Extend `search` to support multi-word phrase queries where every token must appear in the same document (AND semantics), returning only documents that match all tokens.
