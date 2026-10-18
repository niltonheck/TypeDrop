# Typed Event Emitter State Machine

**Difficulty:** Hard

## Scenario

You're building the session-lifecycle engine for a real-time collaboration tool. User sessions move through a strict set of states (Idle → Connecting → Active → Suspended → Closed), and every legal transition must fire a strongly-typed event — the compiler must guarantee that only valid transitions are dispatched, that each event's payload matches its transition, and that listeners receive exactly the right payload type for the event they subscribed to.

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
| Interface as a typed map (`SessionEventMap`) | `SessionEventMap` interface — keys are event names, values are distinct payload shapes |
| Generic type with multiple constrained parameters | `Transition<From extends SessionState, To extends SessionState, Event extends keyof SessionEventMap>` |
| Tuple type for an exhaustive list | `LegalTransitions` — a fixed-length tuple of `Transition` objects |
| Indexed access / `[number]` to derive a union | `LegalTransition = LegalTransitions[number]` |
| Conditional type + `Extract` over a union | `DispatchFor<E>` — filters `LegalTransition` to only those whose `event` equals `E` |
| Generic mapped listener type | `Listener<E>` — function type parameterised over `keyof SessionEventMap` |
| Generic method with keyof constraint | `on<E extends keyof SessionEventMap>` and `dispatch<E extends keyof SessionEventMap>` |
| Runtime narrowing matching compile-time rules | `dispatch()` checks current state against legal `from` states derived from `LegalTransitions` |
| Returning a typed unsubscribe closure | `on()` returns `() => void` and correctly removes the listener |
| Higher-order generic function (`once`) | `once<E extends keyof SessionEventMap>` wraps `on` with auto-unsubscribe logic |


## Bonus

Extend `SessionMachine` with a typed `history()` method that returns a read-only array of `{ event: keyof SessionEventMap; payload: SessionEventMap[keyof SessionEventMap]; from: SessionState; to: SessionState; timestamp: Date }` tuples, where each entry's `payload` is narrowed to the exact type for its `event`.
