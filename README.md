# Typed Safe JSON Parser with Result Type

**Difficulty:** Easy

## Scenario

You're building the API response layer for a mobile app backend. Raw JSON arrives over the wire and must be safely parsed and narrowed into one of several known response shapes — the compiler must enforce that callers always handle both the success and failure paths, and that the typed payload is only accessible after a successful parse.

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
| Discriminated union (`Result<T,E>`) | `Result` type definition, returned by `parseApiResponse` |
| Generic type parameters | `Result<T, E>` — `T` and `E` are both constrained by usage |
| Discriminated union narrowing (`kind` field) | `isApiPayload` switch/if-else, `describePayload` switch |
| Union types (`ApiPayload`, `ParseError`) | `type ApiPayload` and `type ParseError` definitions |
| User-defined type guard (`value is T`) | `isApiPayload(value: unknown): value is ApiPayload` |
| `unknown` narrowing without `any` | `isApiPayload` — narrowing `unknown` via property checks |
| Exhaustive switch with `never` | `describePayload` default branch |
| Utility / pattern: Result/Either monad | `parseApiResponse` return type and caller handling |


## Bonus

Extend `parseApiResponse` to accept a second generic type parameter and a custom type guard, making it a fully reusable `safeParse<T>(raw: string, guard: (v: unknown) => v is T): Result<T, ParseError>`.
