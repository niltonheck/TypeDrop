// ─── challenge.ts ────────────────────────────────────────────────────────────
// Real-time Typed Event Emitter with Wildcard Subscriptions
//
// REQUIREMENTS
// 1. Define an `EventMap` interface that maps event names (string keys) to their
//    payload types. A concrete `DocEventMap` is already provided — do not change it.
// 2. Implement the generic `TypedEmitter<TMap extends EventMap>` class with:
//    a. `on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe`
//       — registers a listener for a specific event; returns a zero-arg cleanup fn.
//    b. `once<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe`
//       — like `on`, but the listener fires at most once then auto-unsubscribes.
//    c. `emit<K extends keyof TMap>(event: K, payload: TMap[K]): void`
//       — calls all listeners registered for that event with the given payload.
//    d. `onAny(listener: WildcardListener<TMap>): Unsubscribe`
//       — registers a listener that receives EVERY event as a discriminated-union
//         envelope `{ event: K; payload: TMap[K] }` for each K in keyof TMap.
//    e. `listenerCount<K extends keyof TMap>(event: K): number`
//       — returns the number of active listeners for a given event (wildcards excluded).
// 3. `Unsubscribe` must be a branded function type (not a plain `() => void`) so
//    callers can distinguish it from arbitrary zero-arg functions in the type system.
// 4. `WildcardListener<TMap>` must be expressed as a mapped/distributive type that
//    produces a union of `(envelope: { event: K; payload: TMap[K] }) => void`
//    for every K — NOT a single overloaded function with `unknown` payload.
// 5. `listenerCount` must be typed so that passing an event name not in TMap is a
//    compile-time error (no string index fallback).
// ─────────────────────────────────────────────────────────────────────────────

// ── Provided concrete event map — do NOT modify ──────────────────────────────
export interface DocEventMap {
  "cursor:move": { userId: string; x: number; y: number };
  "doc:edit": { userId: string; delta: string; timestamp: number };
  "presence:join": { userId: string; displayName: string };
  "presence:leave": { userId: string };
  "doc:save": { docId: string; revision: number };
}

// ── Type-level building blocks — implement these ──────────────────────────────

/** A map of event names to their payload types. */
export interface EventMap {
  [event: string]: unknown;
}

/**
 * A branded cleanup function returned by `on` / `once` / `onAny`.
 * Branding it prevents accidentally passing a plain `() => void` where an
 * `Unsubscribe` is expected (and vice-versa).
 */
// TODO: Define `Unsubscribe` as a branded callable type.
export type Unsubscribe = unknown; // replace `unknown` with your implementation

/** A typed listener for a single specific event. */
// TODO: Define `Listener<TPayload>` — a function receiving exactly one payload arg.
export type Listener<TPayload> = unknown; // replace with your implementation

/**
 * A wildcard listener that can handle any event in TMap.
 * Must distribute over keyof TMap to produce a union of narrowly-typed handler
 * signatures — one per event key — NOT a single `(envelope: { event: string;
 * payload: unknown }) => void`.
 */
// TODO: Define `WildcardListener<TMap extends EventMap>` using a distributive or
//       mapped type approach.
export type WildcardListener<TMap extends EventMap> = unknown; // replace with your implementation

// ── Main class — implement this ───────────────────────────────────────────────

export class TypedEmitter<TMap extends EventMap> {
  // TODO: add private storage for specific listeners and wildcard listeners.

  /**
   * Subscribe to a specific event.
   * @returns An `Unsubscribe` function that removes this listener when called.
   */
  on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Subscribe to a specific event, firing at most once.
   * @returns An `Unsubscribe` function that removes this listener when called.
   */
  once<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Emit an event, calling all matching specific listeners then all wildcard listeners.
   * Wildcard listeners receive a discriminated-union envelope `{ event, payload }`.
   */
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Subscribe to every event in the map.
   * The listener receives a discriminated-union envelope for each event.
   * @returns An `Unsubscribe` function.
   */
  onAny(listener: WildcardListener<TMap>): Unsubscribe {
    // TODO: implement
    throw new Error("Not implemented");
  }

  /**
   * Returns the count of active specific listeners for the given event.
   * Wildcard listeners are NOT counted here.
   */
  listenerCount<K extends keyof TMap>(event: K): number {
    // TODO: implement
    throw new Error("Not implemented");
  }
}
