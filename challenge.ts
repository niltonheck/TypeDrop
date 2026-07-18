// challenge.ts
//
// TYPED IN-MEMORY EVENT EMITTER
// ─────────────────────────────────────────────────────────────────────────────
// Implement a generic, strictly-typed EventEmitter class.
//
// REQUIREMENTS
// ─────────────────────────────────────────────────────────────────────────────
// 1. The class must be generic over an `EventMap` — a record that maps event
//    name strings to their payload type (e.g. { userLoggedIn: { userId: string } }).
// 2. `on(event, listener)` — registers a listener for the given event.
//    The listener must receive exactly the payload type declared in EventMap.
//    Returns `this` to allow chaining.
// 3. `off(event, listener)` — removes a previously registered listener.
//    Returns `this` to allow chaining.
// 4. `emit(event, payload)` — calls every registered listener for that event
//    with the given payload. Returns `true` if at least one listener was
//    called, `false` otherwise.
// 5. `once(event, listener)` — like `on`, but the listener is automatically
//    removed after it fires once. Returns `this` to allow chaining.
// 6. `listenerCount(event)` — returns the number of active listeners for an event.
// 7. NO `any`, NO type assertions (`as`), NO non-null assertions (`!`).
// ─────────────────────────────────────────────────────────────────────────────

// TODO: Replace this stub with your full implementation.
// Hint: EventMap will be something like:
//   { click: { x: number; y: number }; resize: { width: number; height: number } }

export class EventEmitter<EventMap extends Record<string, unknown>> {
  // TODO: declare a private field to store listeners per event name.
  //       Think about what type the Map (or object) values should be.

  // TODO: implement on()
  on<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): this {
    throw new Error("Not implemented");
  }

  // TODO: implement off()
  off<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): this {
    throw new Error("Not implemented");
  }

  // TODO: implement emit()
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): boolean {
    throw new Error("Not implemented");
  }

  // TODO: implement once()
  once<K extends keyof EventMap>(
    event: K,
    listener: (payload: EventMap[K]) => void
  ): this {
    throw new Error("Not implemented");
  }

  // TODO: implement listenerCount()
  listenerCount<K extends keyof EventMap>(event: K): number {
    throw new Error("Not implemented");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTING TYPES — use these in your tests and feel free to extend them.
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardEventMap {
  userLoggedIn: { userId: string; timestamp: number };
  metricUpdated: { metricName: string; value: number };
  alertTriggered: { severity: "low" | "medium" | "high"; message: string };
  connectionClosed: { code: number };
}
