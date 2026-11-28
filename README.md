# Typed Contact Book: Search, Tag Filtering & vCard Export

**Difficulty:** Easy

## Scenario

You're building the core logic for a personal contact management app. Users store contacts with typed fields, filter them by tags, search by name or email, and export individual contacts as a formatted vCard string — with the compiler enforcing every contact shape, filter predicate, and export field.

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
| Union types (`PhoneType`, `ContactTag`) | Requirements 1 & 3 — type definitions |
| Interface with optional fields (`Contact`) | Requirement 4 — `birthday?`, `company?` |
| All-optional type with `Partial`-style shape (`SearchQuery`) | Requirement 5 — type definition |
| Mapped type over `keyof` (`VCardField`) | Requirement 7 — `{ [K in keyof Contact]: string }` |
| `Record<ContactTag, Contact[]>` with exhaustive keys | Requirement 9 — `groupByTag` return type |
| Type narrowing / optional field guards | Requirement 8 — `formatVCard` conditional lines |
| `readonly` arrays in function signatures | Requirements 6 & 9 — parameter types |
| `Array.prototype.every` for all-tags matching | Requirement 6 — `searchContacts` tag logic |

## Bonus

Extend `searchContacts` to accept an optional `sortBy: "firstName" | "lastName" | "email"` field in `SearchQuery` and return results sorted accordingly, with the sort key typed via a mapped lookup so the compiler rejects any non-string Contact field.
