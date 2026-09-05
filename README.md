# Typed Contact Book with Grouped Search & Formatted Output

**Difficulty:** Easy

## Scenario

You're building the contact-management module for a small business CRM. Contacts can be reached by phone, email, or both, and the UI needs to search contacts by name fragment, group results by their first letter, and format each match into a display-ready summary string — all with the compiler enforcing every shape.

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
| Discriminated union (`kind` field) | `ContactChannel` — TODO 1 |
| Interface definition with `readonly` arrays | `Contact` — TODO 2 |
| Generic tuple-rest `NonEmptyArray<T>` | TODO 3 |
| Type alias for `ReadonlyMap` | `ContactBook` — TODO 4 |
| Iterating a `ReadonlyMap` | `searchContacts` — TODO 6 |
| `Record<string, V>` mapped type | `GroupedContacts` — TODO 7 |
| Exhaustive `switch` with `never` guard | `formatChannel` — TODO 9 |
| String interpolation & array join | `formatContact` — TODO 10 |
| Sorting with multi-key comparator | `searchContacts` — TODO 6 |

## Bonus

Extend `searchContacts` to also match against any tag in `contact.tags`, and add a union return type `SearchHit` that records whether the match was on the name or a tag.
