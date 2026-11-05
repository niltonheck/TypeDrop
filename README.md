# Typed Contact Address Book with Search & Grouping

**Difficulty:** Easy

## Scenario

You're building the contacts module for a lightweight CRM. Raw contact records arrive from a form submission, and your job is to validate them, normalize their phone numbers, search by field, and group them — with the compiler enforcing every field shape, group key, and search result type.

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
| Branded / nominal types | `CountryCode` brand applied in `validateContact` |
| Discriminated union narrowing | `ValidationResult` (`ok: true` / `ok: false`) consumed in test harness and produced in `validateContact` |
| Mapped + conditional types | `StringContactField` mapped type filters `Contact` keys to only `string`-valued ones |
| `Record<K, V>` utility type | `groupByCategory` return type enforces all four `ContactGroup` keys |
| Union type literals | `PhoneType`, `ContactGroup` — validated at runtime, enforced at compile time |
| `keyof` usage | `ValidationError.field` typed as `keyof RawContact` |
| `readonly` arrays & interfaces | All interfaces and return types use `readonly` throughout |
| Runtime narrowing of `unknown` | `RawContact` fields typed as `unknown`; narrowed via `typeof` / `Array.isArray` checks |


## Bonus

Extend `searchContacts` to accept an array of `SearchQuery` objects and return only contacts that match ALL queries simultaneously (AND semantics), keeping the return type identical.
