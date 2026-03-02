# Typed Contact Book with Safe Parsing & Lookup

**Difficulty:** Easy

## Scenario

You're building a lightweight contact management module for a small business app. Raw contact data arrives as unknown JSON from an import file, and you must validate it into strongly-typed records, build an efficient lookup index, and expose typed query helpers — all without reaching for `any`.

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
| Discriminated union (`Result<T,E>`) | `Result` type definition, all `parseContact` return sites |
| Discriminated union (`ParseError`) | `ParseError` type definition, narrowing in test harness |
| Generic type parameters | `Result<T, E>` definition |
| `Record` utility type | `ContactIndex` definition |
| Runtime type narrowing (`unknown` → typed) | `parseContact` implementation |
| Union type (`PhoneType`) | `PhoneNumber.type` field |
| `Contact | undefined` return without assertion | `findById` return type |
| Array methods (`filter`, `every`, `sort`) | `filterByTags`, `searchByName` |
| `Object.values` over a typed Record | `filterByTags`, `searchByName` implementations |
| `satisfies` or structural type checking | `PhoneType` validation inside `parseContact` |

## Bonus

Extend `ParseError` with a `{ kind: "duplicate_id"; id: string }` variant and update `buildIndex` to return a `Result<ContactIndex, ParseError>` that fails on the first duplicate id it encounters.
