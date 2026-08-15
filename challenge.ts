// ============================================================
// challenge.ts — Typed Event Emitter with Discriminated Subscriptions
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// ---------------------------------------------------------------------------
// 1. Domain event map — extend this shape to add new events.
//    Keys are event names; values are the payload type for that event.
// ---------------------------------------------------------------------------
export interface DocumentEventMap {
  "presence:join":   PresencePayload;
  "presence:leave":  PresencePayload;
  "cursor:move":     CursorPayload;
  "comment:add":     CommentPayload;
  "comment:resolve": CommentResolvedPayload;
  "permission:change": PermissionPayload;
}

// ---------------------------------------------------------------------------
// 2. Payload types — already defined for you.
// ---------------------------------------------------------------------------
export interface PresencePayload {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface CursorPayload {
  userId: string;
  /** Character offset from document start */
  offset: number;
  /** Optional selection range end offset */
  selectionEnd: number | null;
}

export interface CommentPayload {
  commentId: string;
  userId: string;
  anchorOffset: number;
  text: string;
  createdAt: string; // ISO-8601
}

export interface CommentResolvedPayload {
  commentId: string;
  resolvedBy: string;
  resolvedAt: string; // ISO-8601
}

export interface PermissionPayload {
  userId: string;
  role: "viewer" | "editor" | "admin";
  grantedBy: string;
}

// ---------------------------------------------------------------------------
// 3. Utility types — TODO: implement each one.
// ---------------------------------------------------------------------------

/**
 * TODO: EventNames
 * A union of all keys in DocumentEventMap (i.e. all valid event names).
 *
 * Example: "presence:join" | "presence:leave" | "cursor:move" | ...
 */
export type EventNames = /* TODO */ never;

/**
 * TODO: PayloadOf<K>
 * Given an event name K, resolve to its payload type.
 *
 * Example: PayloadOf<"cursor:move"> === CursorPayload
 */
export type PayloadOf<K extends EventNames> = /* TODO */ never;

/**
 * TODO: Listener<K>
 * A callback that receives exactly the payload for event K.
 * Must be a function type — no extra properties.
 *
 * Example: Listener<"comment:add"> === (payload: CommentPayload) => void
 */
export type Listener<K extends EventNames> = /* TODO */ never;

/**
 * TODO: ListenerMap
 * An object type where each key is an event name and each value is
 * a *readonly array* of Listener<K> for that key.
 * Use a mapped type over EventNames (or DocumentEventMap).
 *
 * Hint: you'll need a homomorphic mapped type to keep K in scope per entry.
 */
export type ListenerMap = /* TODO */ never;

// ---------------------------------------------------------------------------
// 4. Subscription handle — returned by `on`, used to unsubscribe.
// ---------------------------------------------------------------------------
export interface Subscription {
  /** Removes this specific listener from the emitter. */
  unsubscribe(): void;
}

// ---------------------------------------------------------------------------
// 5. TypedEventEmitter interface — TODO: fill in the method signatures.
// ---------------------------------------------------------------------------
export interface TypedEventEmitter {
  /**
   * TODO: on<K>
   * Register a listener for event K.
   * - K must be constrained to EventNames.
   * - The listener must accept exactly PayloadOf<K>.
   * - Returns a Subscription so the caller can later unsubscribe.
   */
  on<K extends EventNames>(event: K, listener: Listener<K>): Subscription;

  /**
   * TODO: once<K>
   * Like `on`, but the listener is automatically removed after its first
   * invocation. Returns a Subscription for early cancellation.
   */
  once<K extends EventNames>(event: K, listener: Listener<K>): Subscription;

  /**
   * TODO: off<K>
   * Manually remove a previously registered listener for event K.
   * If the listener was not registered, this is a no-op.
   */
  off<K extends EventNames>(event: K, listener: Listener<K>): void;

  /**
   * TODO: emit<K>
   * Dispatch an event, calling all registered listeners for K with payload.
   * - Must be generic over K.
   * - Payload must be exactly PayloadOf<K> — no widening.
   */
  emit<K extends EventNames>(event: K, payload: PayloadOf<K>): void;

  /**
   * TODO: listenerCount<K>
   * Returns the number of active listeners registered for event K.
   */
  listenerCount<K extends EventNames>(event: K): number;

  /**
   * TODO: clear<K>
   * Removes ALL listeners for a given event K.
   */
  clear<K extends EventNames>(event: K): void;

  /**
   * TODO: clearAll
   * Removes ALL listeners for ALL events.
   */
  clearAll(): void;
}

// ---------------------------------------------------------------------------
// 6. Factory function — TODO: implement the body.
// ---------------------------------------------------------------------------

/**
 * TODO: createEventEmitter
 *
 * Requirements (implement ALL of the following):
 *
 * R1. Internally store listeners in a structure typed as `Partial<ListenerMap>`
 *     (partial because not every event need have listeners at startup).
 *
 * R2. `on` must push the listener into the correct bucket and return a
 *     Subscription whose `unsubscribe` calls `off` for that listener.
 *
 * R3. `once` must wrap the listener in a one-shot shim: after the first call,
 *     the shim calls `off` on itself, then forwards the payload to the original
 *     listener. The returned Subscription must cancel the *shim* (not the
 *     original listener).
 *
 * R4. `off` must remove exactly the first occurrence of the listener reference
 *     from the bucket (reference equality). If not found, do nothing.
 *
 * R5. `emit` must invoke every current listener for the event in registration
 *     order, passing the exact payload. Listeners added during emit for the
 *     same event must NOT be called in the current emit cycle (snapshot first).
 *
 * R6. `listenerCount` returns 0 when no bucket exists for the event.
 *
 * R7. `clear` removes the bucket for that event entirely.
 *
 * R8. `clearAll` resets the internal store to an empty object.
 */
export function createEventEmitter(): TypedEventEmitter {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. BONUS — NamespacedEmitter (stretch goal, optional)
// ---------------------------------------------------------------------------

/**
 * TODO (BONUS): EventNamespace
 * A template literal type that extracts the namespace prefix from an event
 * name (the part before the colon).
 *
 * Example: EventNamespace<"presence:join"> === "presence"
 *          EventNamespace<"comment:resolve"> === "comment"
 */
export type EventNamespace<K extends EventNames> = /* TODO */ never;

/**
 * TODO (BONUS): EventsInNamespace<NS>
 * Given a namespace string NS, produce the union of all EventNames whose
 * namespace prefix equals NS.
 *
 * Example: EventsInNamespace<"comment"> === "comment:add" | "comment:resolve"
 */
export type EventsInNamespace<NS extends string> = /* TODO */ never;

/**
 * TODO (BONUS): clearNamespace
 * A function that, given a TypedEventEmitter and a namespace string NS,
 * clears ALL events belonging to that namespace.
 * The namespace parameter must be constrained to only valid prefixes that
 * actually appear in DocumentEventMap.
 */
export function clearNamespace<NS extends EventNamespace<EventNames>>(
  emitter: TypedEventEmitter,
  namespace: NS
): void {
  // TODO (BONUS): implement
  throw new Error("Not implemented");
}
