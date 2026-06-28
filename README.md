# Typed CSV Contact Importer with Validation & Deduplication

**Difficulty:** Easy

## Scenario

You're building the contact-import pipeline for a CRM tool. Raw CSV rows arrive as `unknown` from a file parser; your module must validate them into strongly-typed `Contact` records, collect structured field-level errors, and deduplicate entries by email — returning a fully-typed import report with zero `any`.

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
| Branded types (`Email`) | `type Email = string & { readonly _brand: "Email" }` |
| Discriminated unions (`RowResult`) | `type RowResult = { status: "ok" … } \| { status: "error" … }` |
| Non-empty array type (`[FieldError, ...FieldError[]]`) | `errors` field on the `"error"` variant of `RowResult` |
| Type guards with `unknown` narrowing | `isPlainObject`, field checks inside `validateRow` |
| Mapped/utility types (`Record<string, unknown>`) | Return type of `isPlainObject` |
| `satisfies` / literal union narrowing (`ContactCategory`) | Checking `category` against the union literals |
| Runtime validation without `any` | All field checks in `validateRow` |
| Aggregation with `Map`/`Set` for deduplication | Email deduplication in `importContacts` |
| Strict null handling | Every field access guarded before use |

## Bonus

Extend `ImportReport` with a `summary` field typed as `Record<ContactCategory, number>` that counts imported contacts per category using a single-pass `reduce`.
