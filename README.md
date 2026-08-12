# Typed Safe JSON Parser with Result & Schema Validation

**Difficulty:** Easy

## Scenario

You're building the data-ingestion layer for a configuration management tool. Raw JSON strings arrive from multiple untrusted sources (files, environment variables, API responses) and must be safely parsed, validated against a known shape, and returned as a typed `Result<T, ParseError>` — never throwing, never widening to `unknown` without a guard.

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
| Discriminated union (`Result<T,E>`, `ParseError`) | Types `Result`, `SyntaxParseError`, `ValidationError`, `ParseError` |
| Mapped types | `Schema<T>`, `InferSchema<S>` |
| Conditional types on `FieldKind` | `InferSchema<S>` — mapping `"string"` → `string`, etc. |
| Generic functions with constrained type params | `validateShape<S>`, `parseAndValidate<S>` |
| `unknown` narrowing (no `any`) | `safeParseJSON` return type, `validateShape` parameter |
| Type inference from `const` schema objects | `typeof userSchema` used to derive `User` in the test harness |
| Error result pattern (no throwing) | `safeParseJSON` try/catch, `validateShape` field checks |
| Composing typed pipelines | `parseAndValidate` chaining both steps |


## Bonus

Implement `parseAndValidateMany(raws: string[], schema: S): Result<InferSchema<S>, ParseError>[]` that processes every input string — even if some fail — and returns one `Result` per entry, never short-circuiting.
