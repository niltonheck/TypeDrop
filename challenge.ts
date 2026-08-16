// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts — Typed Event Emitter with Discriminated Payloads
// ─────────────────────────────────────────────────────────────────────────────
//
// SCENARIO
// --------
// You're building the real-time notification hub for a collaborative document
// editor. Components subscribe to strongly-typed events (cursor moves, edits,
// presence changes, errors). The emitter must guarantee that every listener
// receives exactly the payload shape its event name promises — no `any`, no
// casting, no missed cases.
//
// REQUIREMENTS
// ------------
// 1. Define an `EventMap` interface that maps event names (string keys) to
//    their payload types. A concrete `DocEventMap` is provided below — do not
//    change it.
//
// 2. Implement a generic `TypedEmitter<TMap extends EventMap>` class with:
//      • emit<K extends keyof TMap>(event: K, payload: TMap[K]): void
//      • on<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe
//      • once<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): Unsubscribe
//      • off<K extends keyof TMap>(event: K, listener: Listener<TMap[K]>): void
//      • listenerCount<K extends keyof TMap>(event: K): number
//
// 3. Implement `createDocEmitter(): TypedEmitter<DocEventMap>` — a plain
//    factory that returns a new emitter bound to the concrete event map.
//
// 4. Implement `replayLast<TMap extends EventMap, K extends keyof TMap>(
//      emitter: TypedEmitter<TMap>,
//      event: K,
//      listener: Listener<TMap[K]>
//    ): Unsubscribe`
//    This helper:
//      • Subscribes `listener` to future emissions of `event`.
//      • If the emitter has already emitted `event` at least once, immediately
//        calls `listener` with the most-recently emitted payload (synchronously,
//        before returning).
//      • Returns an `Unsubscribe` function that removes the listener.
//    Hint: you will need to extend `TypedEmitter` internally to track the last
//    payload per event key.
//
// 5. Implement `mergeEmitters<TMap extends EventMap>(
//      ...emitters: ReadonlyArray<TypedEmitter<TMap>>
//    ): TypedEmitter<TMap>`
//    Returns a NEW emitter that re-emits every event received from ANY of the
//    source emitters. The merged emitter itself can also be used to emit.
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Core type primitives ─────────────────────────────────────────────────────

/** A map from event-name strings to their payload types. */
export interface EventMap {
  [event: string]: unknown;
}

/** A strongly-typed listener callback. */
export type Listener<TPayload> = (payload: TPayload) => void;

/** Returned by `on` / `once` / `replayLast` — call it to remove the listener. */
export type Unsubscribe = () => void;

// ── Concrete event map for the document editor ───────────────────────────────

export interface CursorMovedPayload {
  userId: string;
  line: number;
  col: number;
}

export interface TextEditedPayload {
  userId: string;
  docId: string;
  delta: string; // simplified diff string
  timestamp: number;
}

export interface PresenceChangedPayload {
  userId: string;
  status: "online" | "away" | "offline";
}

export interface DocErrorPayload {
  code: "CONFLICT" | "PERMISSION_DENIED" | "NETWORK";
  message: string;
}

/** The concrete event map — DO NOT MODIFY. */
export interface DocEventMap extends EventMap {
  cursorMoved: CursorMovedPayload;
  textEdited: TextEditedPayload;
  presenceChanged: PresenceChangedPayload;
  docError: DocErrorPayload;
}

// ── TODO 1 — TypedEmitter class ───────────────────────────────────────────────
//
// Implement a generic TypedEmitter<TMap extends EventMap> class.
// All five methods must be type-safe; no `any` allowed.
//
export class TypedEmitter<TMap extends EventMap> {
  // TODO: store listeners per event key

  emit<K extends keyof TMap>(_event: K, _payload: TMap[K]): void {
    // TODO
  }

  on<K extends keyof TMap>(_event: K, _listener: Listener<TMap[K]>): Unsubscribe {
    // TODO
    return () => {};
  }

  once<K extends keyof TMap>(_event: K, _listener: Listener<TMap[K]>): Unsubscribe {
    // TODO
    return () => {};
  }

  off<K extends keyof TMap>(_event: K, _listener: Listener<TMap[K]>): void {
    // TODO
  }

  listenerCount<K extends keyof TMap>(_event: K): number {
    // TODO
    return 0;
  }
}

// ── TODO 2 — createDocEmitter ─────────────────────────────────────────────────
//
// Factory that returns a new TypedEmitter<DocEventMap>.
//
export function createDocEmitter(): TypedEmitter<DocEventMap> {
  // TODO
  throw new Error("Not implemented");
}

// ── TODO 3 — replayLast ───────────────────────────────────────────────────────
//
// Subscribe `listener` to future emissions of `event`.
// If the emitter has already emitted `event` at least once, immediately invoke
// `listener` with the most-recently emitted payload before returning.
// Returns an Unsubscribe that removes the listener.
//
// Requirements:
//   • The last-payload cache must be stored ON the emitter instance (so that
//     multiple calls to replayLast on the same emitter share the same cache).
//   • Do NOT change the TypedEmitter class signature — extend it internally
//     or use a WeakMap keyed on the emitter instance.
//
export function replayLast<TMap extends EventMap, K extends keyof TMap>(
  emitter: TypedEmitter<TMap>,
  event: K,
  listener: Listener<TMap[K]>
): Unsubscribe {
  // TODO
  throw new Error("Not implemented");
}

// ── TODO 4 — mergeEmitters ────────────────────────────────────────────────────
//
// Returns a new TypedEmitter<TMap> that re-emits every event received from
// ANY of the provided source emitters.
// The returned emitter is also fully usable on its own (you can call .emit on
// it directly and subscribers will receive those too).
//
export function mergeEmitters<TMap extends EventMap>(
  ...emitters: ReadonlyArray<TypedEmitter<TMap>>
): TypedEmitter<TMap> {
  // TODO
  throw new Error("Not implemented");
}
