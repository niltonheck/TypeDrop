# Typed Safe JSON Parser with Result Type

**Difficulty:** Easy

## Scenario

You're building the configuration-loading layer for a CLI tool. Raw JSON strings arrive from config files, environment variables, and remote endpoints — any of which can be malformed or structurally wrong. You need a small, strongly-typed parsing toolkit that turns `unknown` blobs into validated, shaped data without ever reaching for `any` or unsafe type assertions.

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
| Discriminated union types (`ok: true \| false`) | `Result<T, E>` definition — Requirement 1 |
| Multi-variant discriminated union with literal `kind` | `ParseError` definition — Requirement 2 |
| `unknown` return type + runtime narrowing | `safeParseJSON` — Requirement 3 |
| Type alias for a generic function shape | `Validator<T>` — Requirement 4 |
| `typeof` type guards for primitives | `validateString/Number/Boolean` — Requirement 5 |
| Mapped type `{ [K in keyof T]: Validator<T[K]> }` | `validateObject` schema parameter — Requirement 6 |
| Generic function composition | `parseTo<T>` — Requirement 7 |
| Generic higher-order function over `Result` | `mapResult<T, U, E>` — Requirement 8 |

## Bonus

Extend validateObject to support optional fields by accepting `Validator<T[K]> | undefined` in the schema and skipping validation for keys whose validator is undefined.
