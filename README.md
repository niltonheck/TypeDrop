# Typed Contact Book Grouper

**Difficulty:** Easy

## Scenario

You're building the "All Contacts" view for a mobile address book app. Raw contact entries arrive from storage as unknown blobs; your engine must validate them, group them by the first letter of their last name, and return a fully typed alphabetical index — with zero `any`.

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
| `unknown` → typed narrowing (runtime type guards) | `validateContact` — narrowing `RawContact` (`unknown`) field-by-field |
| Discriminated union (`ValidationError`) | `ValidationError` type definition; pattern-matched in tests |
| Generic `Result<T, E>` type | Return type of `validateContact`; consumed in test harness |
| Template literal / explicit union (`AlphaKey`) | `AlphaKey` type definition (`"A" \| "B" \| … \| "Z" \| "#"`) |
| `Record<K, V>` utility type | `ContactIndex = Record<AlphaKey, Contact[]>` |
| Type narrowing with `ok` discriminant | Test harness `if (r1.ok)` / `if (!r2.ok)` branches |
| Sorting with multi-key comparator | `buildContactIndex` — sort by `lastName` then `firstName` |
| `satisfies` / exhaustive key coverage | Ensuring all 27 `AlphaKey` values are present in the index |

## Bonus

As a stretch goal, replace the explicit `AlphaKey` union with a purely type-level derivation — using a recursive conditional type or `infer` over a tuple of characters — so adding a new symbol (e.g. `"Ä"`) requires changing only one source-of-truth tuple.
