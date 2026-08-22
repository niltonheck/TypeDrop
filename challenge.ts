// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts
// Typed Event Emitter with Discriminated Union Payloads
// ─────────────────────────────────────────────────────────────────────────────

// ─── Domain Events ───────────────────────────────────────────────────────────

export type TaskAssignedEvent = {
  type: "task:assigned";
  taskId: string;
  assigneeId: string;
  dueDate: string; // ISO-8601
};

export type CommentPostedEvent = {
  type: "comment:posted";
  taskId: string;
  authorId: string;
  body: string;
};

export type StatusChangedEvent = {
  type: "status:changed";
  taskId: string;
  from: "todo" | "in-progress" | "done";
  to: "todo" | "in-progress" | "done";
};

// TODO 1 ─ Define `AppEvent` as a discriminated union of the three event types
//           above. Use the `type` field as the discriminant.
export type AppEvent = never; // replace `never` with the correct union

// ─── Event Map ───────────────────────────────────────────────────────────────

// TODO 2 ─ Define `EventMap` as a mapped type that maps each AppEvent's `type`
//           string to its full event object shape.
//           Hint: use a distributive mapped type over AppEvent.
//           The result should be equivalent to:
//             { "task:assigned": TaskAssignedEvent;
//               "comment:posted": CommentPostedEvent;
//               "status:changed": StatusChangedEvent; }
//           but derived automatically — do NOT write it by hand.
export type EventMap = never; // replace `never` with the correct mapped type

// ─── Listener type ───────────────────────────────────────────────────────────

// TODO 3 ─ Define `Listener<K>` where K extends keyof EventMap.
//           A Listener receives the correctly-narrowed event payload and returns void.
export type Listener<K extends keyof EventMap> = never; // replace with correct function type

// ─── TypedEventEmitter ────────────────────────────────────────────────────────

export class TypedEventEmitter {
  // TODO 4 ─ Add a private field `_listeners` typed as a Map from each event key
  //           to an array of listeners for that event.
  //           Use: Map<keyof EventMap, Listener<keyof EventMap>[]>
  //           Hint: you'll need a type that captures the per-key array correctly.
  //           A simple Map<string, Listener<keyof EventMap>[]> is NOT acceptable —
  //           the field must use keyof EventMap as the key type.

  constructor() {
    // TODO 5 ─ Initialise `_listeners` as an empty Map.
    throw new Error("Not implemented");
  }

  // TODO 6 ─ Implement `on<K extends keyof EventMap>(event: K, listener: Listener<K>): void`
  //           Registers `listener` for the given event key.
  //           If no array exists for that key yet, create one.
  on<K extends keyof EventMap>(event: K, listener: Listener<K>): void {
    throw new Error("Not implemented");
  }

  // TODO 7 ─ Implement `off<K extends keyof EventMap>(event: K, listener: Listener<K>): void`
  //           Removes the first matching listener for the given event key.
  off<K extends keyof EventMap>(event: K, listener: Listener<K>): void {
    throw new Error("Not implemented");
  }

  // TODO 8 ─ Implement `emit<K extends keyof EventMap>(event: EventMap[K]): void`
  //           Dispatches the event to all registered listeners for event.type.
  //           The event object itself carries its own `type` discriminant —
  //           use that to look up the right listeners.
  emit<K extends keyof EventMap>(event: EventMap[K]): void {
    throw new Error("Not implemented");
  }

  // TODO 9 ─ Implement `listenerCount(event: keyof EventMap): number`
  //           Returns the number of listeners currently registered for the given key.
  listenerCount(event: keyof EventMap): number {
    throw new Error("Not implemented");
  }
}
