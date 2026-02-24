# Typed Contact Book Lookup

**Difficulty:** Easy

## Scenario

You're building a small contact book utility for an internal HR tool. Given a list of contacts with varying optional fields, you must build a strongly-typed lookup index and implement search/filter helpers — the challenge is in the types, not the logic.

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
| `Record<K, V>` utility type | `ContactIndex` type alias (Requirement 1) |
| `Pick<T, K>` utility type | `ContactSummary` type alias (Requirement 2) |
| `Partial<T>` utility type | `SearchFilters` type alias (Requirement 3) |
| Union types (`\|`) | `Department` and `Seniority` type aliases |
| Optional properties (`?`) | `Contact.phone`, `Contact.tags`, all `SearchFilters` fields |
| Typed function signatures (no `any`) | All three exported functions |
| `Object.values` / iteration over typed index | `summarise` implementation |
| Runtime narrowing (checking `undefined`) | `filterContacts` — ignoring absent filter fields |
| Array method chaining with type inference | `filterContacts` — `.filter`, `.every` |

## Bonus

Extend `filterContacts` to accept an optional `limit` parameter (typed as `number | undefined`) and return at most that many results.
