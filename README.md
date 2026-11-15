# Typed Contact Book: Group, Search & Export

**Difficulty:** Easy

## Scenario

You're building the core logic for a personal contact-book app. Contacts are stored with typed fields, can belong to labelled groups, and must be searchable by name or email and exportable to a simple vCard-style string — with the compiler enforcing every field shape, search result, and export format.

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
| `Pick<T, Keys>` utility type | `ContactSummary` derived from `Contact` |
| `Record<K, V>` utility type | `GroupedContacts = Record<GroupLabel, Contact[]>` |
| Union type as constraint | `GroupLabel`, `PhoneEntry.type` |
| `ReadonlyArray<T>` / `readonly` fields | `Contact.phones`, `Contact.groups`, all fields |
| Optional fields (`birthday?`) | `Contact.birthday`, used in `exportVCard` & `mergeContacts` |
| Type narrowing (non-empty string guard) | `mergeContacts` scalar fallback logic |
| Template literal / string manipulation | `exportVCard` TEL line uppercasing |
| Typed return shapes enforced by compiler | All four functions return concrete named types |


## Bonus

Add a fifth function `importVCard(raw: string): Contact` that parses a vCard string back into a typed `Contact` record, returning a `Result<Contact, string>` discriminated union instead of throwing.
