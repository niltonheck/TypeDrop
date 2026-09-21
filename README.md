# Typed Contact Book Search & Filter

**Difficulty:** Easy

## Scenario

You're building the search and filter core for a personal contact management app. Users can look up contacts by name or tag, and the results must be narrowed into strongly-typed shapes the compiler fully understands.

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
| Union types (`ContactGroup`, `PhoneEntry.label`) | `ContactGroup`, `PhoneEntry` interface |
| Branded / nominal types | `ContactId = string & { readonly __brand: "ContactId" }` |
| Optional fields on an object type | `SearchQuery` — all four fields are `?` |
| `Record<K, V>` utility type | `groupContacts` return type |
| Generics + `keyof` constraint | `pickContactFields<K extends keyof Contact>` |
| `Pick<T, K>` utility type | `pickContactFields` return type `Pick<Contact, K>[]` |
| Type narrowing (`null` check) | `hasEmail` filter branch in `searchContacts` |
| `strict: true` compliance | No `any`, no unsafe `as` outside the designated trust boundary |

## Bonus

Extend `SearchQuery` with a `nameContains` field and make the match accent-insensitive (e.g. "martin" matches "Martínez") using `String.prototype.normalize`.
