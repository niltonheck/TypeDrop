# Typed Paginated API Client with Result Chaining

**Difficulty:** Medium

## Scenario

You're building the data-fetching layer for an admin dashboard that pulls paginated records from a REST API. Each page arrives as raw `unknown` JSON, must be validated into a typed shape, and pages must be lazily fetched until exhausted — all surfaced through a `Result<T, E>` type so callers never face surprise runtime exceptions.

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
| Discriminated union (`Result<T,E>`) | `Result` type definition, all return sites |
| Generic types with constraints | `Page<T>`, `parsePage<T>`, `fetchAllPages<T>`, `mapResult`, `chainResult` |
| Branded / nominal types | `ParseError` and `FetchError` with `unique symbol` brands |
| Runtime narrowing of `unknown` | `parsePage` — checking object shape, array, number fields |
| Conditional type narrowing in logic | `mapResult` / `chainResult` — discriminating on `result.ok` |
| Async/await + error handling | `fetchAllPages` — try/catch wrapping `fetcher`, chaining pages |
| Utility / constructor helpers | `ok()`, `err()`, `makeParseError()`, `makeFetchError()` |
| `strict: true` compliance | No `any`, no `as`, no `!` throughout |

## Bonus

After all pages are collected, implement a `groupById` helper typed as `(items: T[], key: keyof T) => Map<T[keyof T], T[]>` and use it to group the collected users by `id`.
