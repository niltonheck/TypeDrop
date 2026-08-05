# Typed Safe JSON Parser & Result Unwrapper

**Difficulty:** Easy

## Scenario

You're building a lightweight data-ingestion utility for a dashboard that consumes JSON payloads from third-party webhooks. Payloads can be malformed, partially missing required fields, or entirely the wrong shape — so every parse must return a typed `Result<T, ParseError>` instead of throwing, and callers must exhaustively handle both branches.

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

| Skill exercised | Where in the code |
|---|---|
| Discriminated union types | `Result<T,E>`, `ParseError`, switching on `.kind` |
| Generic smart constructors | `ok<T>()`, `err<E>()` |
| Type narrowing via `kind` guard | `unwrapOr`, `describeError`, field extractors |
| `unknown` → typed narrowing (no `as`) | `getString`, `getNumber` — checking `typeof` before assignment |
| Exhaustiveness checking | `describeError` — unhandled `ParseError` branch is a compile error |
| Utility / structural typing | `OrderPayload`, `RefundPayload` as readonly interfaces |
| Fail-fast chaining of Results | `parseOrderPayload`, `parseRefundPayload` |
| Generic function with inferred params | `unwrapOr<T, E>` — no annotation needed at call site |

## Bonus

Extend `Result<T, E>` with a generic `mapOk<U>(result: Result<T,E>, fn: (v: T) => U): Result<U, E>` transformer and use it to convert a parsed `OrderPayload`'s `totalCents` into a formatted dollar string without unwrapping manually.
