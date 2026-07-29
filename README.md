# Typed State Machine with Transition Guards & Effect Hooks

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for an e-commerce platform. Orders move through a strict set of states (e.g. `"pending"` → `"paid"` → `"shipped"` → `"delivered"`), and only certain transitions are legal. Each transition can have a typed guard (a predicate that must pass) and an effect hook (a side-effect callback typed to the exact source/target states). The TypeScript types must make illegal transitions a compile-time error.

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
| Template literal type inference with `infer` | `FromState<K>`, `ToState<K>` — split `"X->Y"` into two `OrderState` halves |
| Mapped types + conditional filtering | `LegalTransitionsFrom<S>` — iterates `TransitionKey`, keeps only keys whose `FromState` matches `S` |
| `keyof` + indexed access utility types | `PayloadFor<K>` — `OrderTransitions[K]` indexed by a constrained key |
| Generic constraints on class methods | `transition<K extends TransitionKey>` and `canTransition<K>` — payload type flows from `K` |
| Discriminated union return type | `TransitionResult<K>` — `{ ok: true; ... } \| { ok: false; reason: ...; }` |
| `Omit` utility type in factory signature | `createOrderMachine` omits `lastTransitionAt` from the context parameter |
| `satisfies` / `ReadonlyArray` in config | `TransitionConfig<K>.effects` typed as `ReadonlyArray<Effect<K>>` |
| Async iteration & sequential awaiting | `transition` must `await` each effect in order |
| Runtime narrowing of `unknown` keys | `availableTransitions` iterates all `TransitionKey`s and filters by `FromState<K>` at runtime |
| Strict `strict: true` compliance | No `any`, no `as`, no type assertions anywhere in stubs or tests |


## Bonus

Add a generic `history` log to `OrderStateMachine` that records every successful transition as a `Readonly<TransitionResult<K> & { ok: true }>` entry, and expose a `getHistory()` method typed as a read-only tuple that grows with each transition.
