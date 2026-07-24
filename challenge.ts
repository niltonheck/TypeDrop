// =============================================================================
// challenge.ts — Typed Event Emitter with Wildcard Subscriptions & Replay
// =============================================================================
// REQUIREMENTS
// ------------
// 1. Define an `EventMap` interface (see stub below) that maps event names to
//    their payload types. Your emitter must be generic over a user-supplied
//    extension of this interface.
//
// 2. Implement `createEmitter<TMap>()` that returns a fully-typed `Emitter<TMap>`.
//
// 3. `.on(event, handler)` — subscribes to a single named event.
//    The handler receives exactly the payload type for that event.
//    Returns an `Unsubscribe` function.
//
// 4. `.once(event, handler)` — like `.on()` but the handler fires at most once,
//    then automatically unsubscribes. Returns an `Unsubscribe` function.
//
// 5. `.onAny(handler)` — subscribes to ALL events.
//    The handler receives a discriminated union of `{ event: K; payload: TMap[K] }`
//    for every key K in TMap. Returns an `Unsubscribe` function.
//
// 6. `.emit(event, payload)` — fires all matching `.on` / `.once` / `.onAny`
//    subscribers for the given event. The payload must match the event's type.
//
// 7. `.replay(event, n, handler)` — immediately invokes `handler` with the last
//    `n` payloads that were emitted for `event` (oldest-first), then subscribes
//    the handler for future events (like `.on`). Returns an `Unsubscribe` function.
//
// 8. `.history(event)` — returns a readonly array of all payloads emitted so far
//    for the given event (oldest-first). The return type must be
//    `ReadonlyArray<TMap[K]>` for the given event key K — not a wider type.
//
// 9. `.off(event, handler)` — removes a specific handler for a named event.
//
// 10. No `any`, no `as`, no non-null assertions (`!`). Use strict type narrowing.
// =============================================================================

// ---------------------------------------------------------------------------
// Base constraint: every event map must satisfy this shape.
// ---------------------------------------------------------------------------
export type BaseEventMap = Record<string, unknown>;

// ---------------------------------------------------------------------------
// A discriminated-union entry used by `.onAny` handlers.
// Build this as a mapped/distributive type over TMap.
// TODO: replace `never` with the correct distributive mapped type.
// ---------------------------------------------------------------------------
export type AnyEvent<TMap extends BaseEventMap> = never; // ← TODO

// ---------------------------------------------------------------------------
// The unsubscribe handle returned by every subscription method.
// ---------------------------------------------------------------------------
export type Unsubscribe = () => void;

// ---------------------------------------------------------------------------
// Handler types
// ---------------------------------------------------------------------------
export type EventHandler<TPayload> = (payload: TPayload) => void;
export type AnyEventHandler<TMap extends BaseEventMap> = (
  event: AnyEvent<TMap>
) => void;

// ---------------------------------------------------------------------------
// The Emitter interface — generic over the user's event map.
// TODO: fill in the return types and parameter types marked with `TODO`.
// ---------------------------------------------------------------------------
export interface Emitter<TMap extends BaseEventMap> {
  /** Subscribe to a single named event. */
  on<K extends keyof TMap>(
    event: K,
    handler: EventHandler<TMap[K]>
  ): Unsubscribe;

  /** Subscribe once; auto-unsubscribes after the first emission. */
  once<K extends keyof TMap>(
    event: K,
    handler: EventHandler<TMap[K]>
  ): Unsubscribe;

  /** Subscribe to every event as a discriminated union. */
  onAny(handler: AnyEventHandler<TMap>): Unsubscribe;

  /** Emit an event with its required payload. */
  emit<K extends keyof TMap>(event: K, payload: TMap[K]): void;

  /**
   * Replay the last `n` historical payloads for `event` into `handler`,
   * then keep the subscription alive for future emissions.
   */
  replay<K extends keyof TMap>(
    event: K,
    n: number,
    handler: EventHandler<TMap[K]>
  ): Unsubscribe;

  /**
   * Return the full emission history for a named event.
   * Must return `ReadonlyArray<TMap[K]>` — not a wider array type.
   */
  history<K extends keyof TMap>(event: K): ReadonlyArray<TMap[K]>;

  /** Remove a previously registered handler for a named event. */
  off<K extends keyof TMap>(event: K, handler: EventHandler<TMap[K]>): void;
}

// ---------------------------------------------------------------------------
// TODO: implement this factory function.
// ---------------------------------------------------------------------------
export function createEmitter<TMap extends BaseEventMap>(): Emitter<TMap> {
  // Hint: use Map<keyof TMap, ...> for per-event handler sets.
  // Hint: use Map<keyof TMap, TMap[keyof TMap][]> for history storage.
  // Hint: the `onAny` handlers need special handling — they receive a
  //       discriminated union object, not a raw payload.
  throw new Error("TODO: implement createEmitter");
}

// ---------------------------------------------------------------------------
// Example event map — used in tests. Do NOT modify.
// ---------------------------------------------------------------------------
export interface DocEditorEvents {
  "cursor:moved": { userId: string; line: number; col: number };
  "doc:saved": { docId: string; version: number };
  "user:joined": { userId: string; displayName: string };
  "user:left": { userId: string };
}
