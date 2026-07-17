# Typed Dependency Injection Container

**Difficulty:** Hard

## Scenario

You're building the service-locator core for a backend framework. Modules register factories under typed token keys, declare their dependencies on other tokens, and the container must resolve the full dependency graph at runtime — detecting circular dependencies, enforcing that every dependency is registered before resolution, and returning a fully-typed resolved instance — all with zero `any`.

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
| **Branded / phantom types** | `Token<T>` uses an intersection with a phantom `__tokenType` field to make tokens nominally typed | 
| **Conditional + mapped types (`infer`)** | `ResolvedTuple<Tokens>` maps over a tuple of `Token<X>` and extracts `X` via `infer U` |
| **Generic inference from `const` tuples** | `provide()` infers `Deps` as a `ReadonlyArray<Token<unknown>>` const tuple, then derives callback param types via `ResolvedTuple<Deps>` |
| **Discriminated union result type** | `ResolveResult<T>` is a discriminated union on `ok: true/false` with a `reason` string-literal union |
| **Type erasure with `unknown`** | `RegistrationEntry` stores heterogeneous factories using `unknown` instead of `any`, requiring safe narrowing on retrieval |
| **Recursive generic resolution** | `resolveInner` recurses through the dep graph while threading a `Set<symbol>` for cycle detection |
| **`satisfies` operator** | Test harness uses `satisfies Logger / Database / UserService` to verify structural compatibility |
| **Singleton + side-effect management** | `register` clears the singleton cache on re-registration (R3); `unregister` clears both maps (R11) |


## Bonus

Extend the container with a `resolveAll<Tokens extends ReadonlyArray<Token<unknown>>>(tokens: Tokens): ResolveResult<ResolvedTuple<Tokens>>` method that resolves a tuple of tokens in one call and returns either all values or the first error — with the success value precisely typed as the resolved tuple.
