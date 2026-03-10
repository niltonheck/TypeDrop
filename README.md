# Typed Contact Book Merger

**Difficulty:** Easy

## Scenario

You're building the import feature for a personal CRM app. Users can sync contacts from multiple sources (phone, email, LinkedIn), and your job is to validate raw unknown input, merge duplicate contacts by email, and produce a clean, strongly-typed contact list — all with zero `any`.

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
| Type guard (`value is T`) | `isContactSource` — narrows `unknown` to `ContactSource` |
| Discriminated union (`ParseResult<T>`) | Return type of `parseRawContact` and `mergeContacts` |
| Union literal type (`ContactSource`) | Field type on `Contact`; checked in `isContactSource` |
| `unknown` narrowing without `any` | `parseRawContact` — every field checked before use |
| Generics with constraints | `ParseResult<T>` used as both `ParseResult<Contact>` and `ParseResult<never>` |
| `Map` for keyed aggregation | `mergeContacts` — `Map<string, Contact>` for deduplication |
| `Set` for deduplication | `mergeContacts` — deduplicating `sources` arrays |
| Normalisation logic | Email lowercasing/trimming, phone null-coalescing |
| Array discrimination | Separating successes from failures in `mergeContacts` |

## Bonus

Extend `parseRawContact` to accept an optional second parameter `strictSources: readonly ContactSource[]` using a `const` type parameter, so callers can restrict which sources are valid for a given import context.
