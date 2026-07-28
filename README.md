# Typed HTTP API Client Builder

**Difficulty:** Easy

## Scenario

You're building the typed HTTP client layer for a mobile app's backend SDK. Consumers should be able to declare their API endpoints once — including method, path params, query params, and response shape — and get back a fully-typed `fetch` wrapper with zero `any` or unsafe casts.

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
| Template literal types | `ExtractPathParams<T>` — recursively parses `/:param` segments from a path string |
| Recursive conditional types | `ExtractPathParams` recurses over the remaining path `Rest` |
| Conditional mapped types | `CallOptions<TPath>` conditionally includes/excludes `pathParams` based on `never` check |
| Phantom type fields | `EndpointDef._response?` carries `TResponse` at the type level without a runtime value |
| Curried generic functions | `defineEndpoint` — first call infers `TPath`, second call fixes `TResponse` explicitly |
| Mapped types over generics | `ApiClient<TEndpoints>` maps each key to its `EndpointCaller` counterpart |
| `infer` in conditional types | `ApiClient` uses `infer TPath, infer TResponse` to unwrap `EndpointDef` |
| Discriminated union result type | `ApiResult<TResponse>` — `{ ok: true; data }` vs `{ ok: false; error }` |
| Type narrowing | Test harness narrows `result.ok` before accessing `result.data` |
| `strict: true` compliance | No `any`, no unsafe `as` in stubs; single justified cast in `createApiClient` |

## Bonus

Extend `EndpointDef` to accept an optional `TBody` type parameter and thread it through `CallOptions` so that `body` is typed as `TBody` (instead of `unknown`) for POST/PUT/PATCH endpoints.
