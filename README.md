# Typed Event-Sourced State Machine

**Difficulty:** Hard

## Scenario

You're building the order-lifecycle engine for a fulfillment platform. Orders move through a strict set of states driven by domain events — the compiler must guarantee that every transition is valid for the current state, every event carries exactly the right payload, and replaying an event log always reconstructs a consistent, fully-typed snapshot.

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
| Discriminated unions | `OrderState` and `OrderEvent` — each variant has a `kind` discriminant |
| `satisfies` operator | `TRANSITIONS` array uses `satisfies ReadonlyArray<Transition<...>>` to keep narrow inference |
| Generic `Transition<From, Evt, To>` type | Parameterised triple encodes each valid edge at the type level |
| Conditional types + `infer` | `LegalMove` extracts `{ from, on }` pairs from the `TRANSITIONS` tuple via `infer` |
| Mapped / utility types (`Pick`) | `project` return type is `Pick<OrderSnapshot, K>` driven by a generic `K extends keyof OrderSnapshot` |
| Exhaustive narrowing | `transition` must handle every `OrderState × OrderEvent` combination; compiler warns on missing cases |
| `const` generic parameter / `keyof` constraint | `project<K extends keyof OrderSnapshot>` — caller's array is narrowed to a subset of snapshot keys |
| Error hierarchy | `MachineError extends Error` with typed public fields `fromState` and `event` |
| `ReadonlyArray` / immutability | Event log and transition map are `ReadonlyArray`; state objects use `readonly` fields |
| No `any` / no `as` | Enforced throughout — narrowing must be structural, not cast-based |


## Bonus

Derive a `ValidNextEvents<S extends OrderState["kind"]>` type that, given a state kind string, produces the union of event `kind` strings that are legal from that state — using only the `TRANSITIONS` tuple and conditional types, with no manual enumeration.
