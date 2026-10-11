// challenge.ts
//
// 🎯 GOAL: Implement a strongly-typed event emitter where each event name is
// permanently bound to its payload type, enforced entirely at compile time.
//
// ─────────────────────────────────────────────
// REQUIREMENTS
// ─────────────────────────────────────────────
//
// 1. Define an `EventMap` interface that maps event names (string literals)
//    to their payload types. A starter set is provided below — do NOT change
//    the existing entries, but the implementation must work for ANY EventMap.
//
// 2. Implement `TypedEmitter<TMap extends EventMap>` as a class with:
//    a. `on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void`
//       — registers a listener for the given event.
//    b. `off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void`
//       — removes a previously registered listener.
//    c. `emit<K extends keyof TMap>(event: K, payload: TMap[K]): void`
//       — calls every registered listener for that event with the payload.
//    d. `once<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void`
//       — registers a listener that auto-removes itself after the first call.
//
// 3. Implement `listenerCount<K extends keyof TMap>(event: K): number`
//    — returns the number of currently active listeners for an event.
//
// 4. Implement `createEmitter<TMap extends EventMap>(): TypedEmitter<TMap>`
//    — a generic factory function that constructs and returns a new emitter.
//
// 5. No `any`, no type assertions (`as`), no non-null assertions (`!`).
//    The compiler must enforce payload types at every call-site.
//
// ─────────────────────────────────────────────
// TYPE STUBS  (fill in the implementations)
// ─────────────────────────────────────────────

// TODO (Requirement 1): An interface whose keys are event names and values are
// their corresponding payload types.
export interface EventMap {
  [event: string]: unknown;
}

// Convenience alias — a listener is simply a function that receives a payload.
export type Listener<TPayload> = (payload: TPayload) => void;

// ─── Starter EventMap for the dashboard ───────────────────────────────────────
// Do NOT rename or remove these entries; the test harness depends on them.
export interface DashboardEventMap extends EventMap {
  userLoggedIn:    { userId: string; timestamp: number };
  metricUpdated:   { metricName: string; value: number; unit: string };
  alertTriggered:  { alertId: string; severity: "low" | "medium" | "high"; message: string };
  sessionExpired:  { sessionId: string };
}

// ─── TypedEmitter class ────────────────────────────────────────────────────────
// TODO (Requirement 2 & 3): Implement the class body.
// Hint: store listeners in a Map keyed by event name.
export class TypedEmitter<TMap extends EventMap> {
  // TODO: declare a private listeners store

  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
    // TODO
  }

  off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
    // TODO
  }

  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    // TODO
  }

  once<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void {
    // TODO
  }

  listenerCount<K extends keyof TMap>(event: K): number {
    // TODO
    return 0;
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────
// TODO (Requirement 4): Implement the factory function.
export function createEmitter<TMap extends EventMap>(): TypedEmitter<TMap> {
  // TODO
  return new TypedEmitter<TMap>();
}
