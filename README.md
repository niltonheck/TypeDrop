# Typed Feature Flag Engine with Targeting Rules & Rollout Segments

**Difficulty:** Medium

## Scenario

You're building the feature-flag evaluation engine for a SaaS platform. Raw flag configurations arrive as `unknown` from a remote config store; your engine must validate them into strongly-typed flag definitions, evaluate targeting rules against a typed user context, and return a fully-typed evaluation result — with zero `any`.

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

| Skill | Where in code |
|---|---|
| Conditional types (`FlagValue<T>`) | `FlagValue<T extends FlagValueType>` type alias |
| Discriminated union narrowing | `TargetingRule` union + exhaustive `switch` in `evaluateRule` |
| Mapped types | `FlagRegistry<K>` definition + `evaluateAll` return type |
| Generic type accumulation (builder pattern) | `FlagRegistryBuilder<K>` widening on `.add()` |
| `Result<T, E>` error handling | `validateFlagDefinition` return type |
| Runtime validation (`unknown` → typed) | `validateFlagDefinition` implementation |
| Readonly + const generics | `FlagDefinition`, `UserContext`, rule arrays |
| Utility types (`Record`, `ReadonlyArray`) | `UserContext.attributes`, `FlagDefinition.rules` |

## Bonus

Extend `FlagRegistryBuilder` with a `.remove(id: K)` method whose return type correctly removes that key from the generic `K` union using the `Exclude` utility type.
