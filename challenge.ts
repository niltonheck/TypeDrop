// ============================================================
// challenge.ts — Typed Event Emitter with Discriminated Payloads
// ============================================================
// GOAL: Implement a lightweight, fully type-safe event emitter
// where each event name is permanently bound to its payload type.
//
// Rules:
//   - No `any`, no `as`, no type assertions
//   - strict: true must pass
//   - Listeners receive ONLY the correct payload for their event
// ============================================================

// ── 1. Domain event map ──────────────────────────────────────
// Requirement 1: Define an `EventMap` interface that maps each
// event name (string literal) to its payload type.
// Must include at least these three events:
//
//   "user:joined"    → { userId: string; roomId: string; timestamp: number }
//   "doc:edited"     → { docId: string; delta: string; authorId: string }
//   "cursor:moved"   → { userId: string; x: number; y: number }

export interface EventMap {
  // TODO: add the three required event entries here
}

// ── 2. Listener type ─────────────────────────────────────────
// Requirement 2: Define a generic `Listener<E extends EventMap, K extends keyof E>`
// type alias that represents a callback receiving exactly E[K] as its argument.

export type Listener<E extends EventMap, K extends keyof E> = /* TODO */ never;

// ── 3. TypedEmitter class ────────────────────────────────────
// Requirement 3: Implement `TypedEmitter<E extends EventMap>` with:
//
//   on<K extends keyof E>(event: K, listener: Listener<E, K>): void
//     — registers a listener for the given event
//
//   off<K extends keyof E>(event: K, listener: Listener<E, K>): void
//     — removes a previously registered listener (identity comparison)
//
//   emit<K extends keyof E>(event: K, payload: E[K]): void
//     — calls every registered listener for that event with the payload
//
//   once<K extends keyof E>(event: K, listener: Listener<E, K>): void
//     — registers a listener that fires at most once, then removes itself

export class TypedEmitter<E extends EventMap> {
  // TODO: store listeners in a Map or Record — choose a type-safe structure

  on<K extends keyof E>(event: K, listener: Listener<E, K>): void {
    // TODO
  }

  off<K extends keyof E>(event: K, listener: Listener<E, K>): void {
    // TODO
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    // TODO
  }

  once<K extends keyof E>(event: K, listener: Listener<E, K>): void {
    // TODO
  }
}

// ── 4. createRoomEmitter factory ─────────────────────────────
// Requirement 4: Export a factory function `createRoomEmitter`
// that returns a new `TypedEmitter<EventMap>` instance.
// The return type must be explicitly annotated as `TypedEmitter<EventMap>`.

export function createRoomEmitter(): TypedEmitter<EventMap> {
  // TODO
  return undefined!; // replace this line
}

// ── 5. Bonus — listenerCount helper ──────────────────────────
// Requirement 5 (stretch): Add a `listenerCount<K extends keyof E>(event: K): number`
// method to TypedEmitter that returns the number of active listeners for an event.
