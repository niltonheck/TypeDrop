// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed In-Memory Event Bus with Subscription Management
//
// SCENARIO:
//   You are building the real-time notification core for a collaborative
//   document editor. Components publish and subscribe to strongly-typed events.
//   The compiler must enforce that every subscriber receives exactly the payload
//   shape defined for its event — no `any`, no unsafe casts.
//
// YOUR TASKS (implement every TODO below):
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Event Map ──────────────────────────────────────────────────────────────
// Define the canonical shape of every event in the system.
// Each key is an event name; its value is the payload type.
export interface AppEventMap {
  "cursor:move": { userId: string; x: number; y: number };
  "doc:edit": { userId: string; delta: string; timestamp: number };
  "user:join": { userId: string; displayName: string };
  "user:leave": { userId: string };
  "doc:save": { docId: string; savedBy: string; version: number };
}

// ── 2. Core utility types ─────────────────────────────────────────────────────

/**
 * TODO 1 — EventName
 * A union of all valid event names derived from AppEventMap.
 * Must be computed from the map, not hard-coded.
 */
export type EventName = /* TODO */ never;

/**
 * TODO 2 — EventPayload<K>
 * Given an event name K, resolve its payload type from AppEventMap.
 * K must be constrained to EventName.
 */
export type EventPayload<K extends EventName> = /* TODO */ never;

/**
 * TODO 3 — EventHandler<K>
 * A callback that receives the payload for event K.
 * Must be a generic type alias, not a concrete type.
 */
export type EventHandler<K extends EventName> = /* TODO */ never;

// ── 3. Subscription token ─────────────────────────────────────────────────────

/**
 * A branded type so callers cannot forge or confuse subscription handles.
 * TODO 4 — Complete the brand so SubscriptionToken is distinct from `string`.
 */
export type SubscriptionToken = string & { readonly __brand: "SubscriptionToken" };

// ── 4. EventBus interface ─────────────────────────────────────────────────────

export interface IEventBus {
  /**
   * TODO 5 — on<K>
   * Subscribe to event K with handler.
   * Returns a SubscriptionToken that can be used to unsubscribe.
   * K must be inferred from the event name literal passed by the caller.
   */
  on<K extends EventName>(event: K, handler: EventHandler<K>): SubscriptionToken;

  /**
   * TODO 6 — off
   * Unsubscribe using a previously returned SubscriptionToken.
   * Returns true if the token was found and removed, false otherwise.
   */
  off(token: SubscriptionToken): boolean;

  /**
   * TODO 7 — emit<K>
   * Publish event K with the correct payload.
   * The compiler must reject payloads that don't match K's shape.
   * Returns the number of handlers that were invoked.
   */
  emit<K extends EventName>(event: K, payload: EventPayload<K>): number;

  /**
   * TODO 8 — once<K>
   * Like `on`, but the handler is automatically removed after the first
   * time the event fires.
   * Returns a SubscriptionToken (can be used to cancel before it fires).
   */
  once<K extends EventName>(event: K, handler: EventHandler<K>): SubscriptionToken;

  /**
   * TODO 9 — listenerCount
   * Return the number of active subscribers for a given event.
   */
  listenerCount(event: EventName): number;
}

// ── 5. createEventBus factory ─────────────────────────────────────────────────

/**
 * TODO 10 — createEventBus
 * Implement and return an object satisfying IEventBus.
 *
 * Requirements (enforced by the test harness):
 *   R1. Tokens must be unique across all subscriptions.
 *   R2. `off` must return false for an unknown / already-removed token.
 *   R3. `once` handlers are called at most once even if the event fires
 *       multiple times.
 *   R4. After `off(token)`, the removed handler must NOT be called on
 *       subsequent emits.
 *   R5. `emit` must return the exact count of handlers invoked (once-handlers
 *       that fire count as 1; handlers removed before emit count as 0).
 *   R6. `listenerCount` reflects additions and removals in real time.
 *   R7. Multiple handlers for the same event are all invoked (in
 *       subscription order).
 *
 * Hint: you will need an internal data structure that maps each event name
 * to a collection of { token, handler, once } entries. Choose your internal
 * types carefully so the compiler keeps them safe without `any`.
 */
export function createEventBus(): IEventBus {
  // TODO: implement
  throw new Error("Not implemented");
}
