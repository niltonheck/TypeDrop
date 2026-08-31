// ============================================================
// Typed In-Memory Event Emitter with Listener Registry
// challenge.ts
// ============================================================
// RULES: strict: true — no `any`, no `as`, no type assertions.
// ============================================================

// ------------------------------------------------------------------
// 1. Define the application's event map.
//    Each key is an event name; its value is the payload type for
//    that event. Add exactly these three events:
//
//    "user:login"    → { userId: string; timestamp: number }
//    "metric:update" → { metricId: string; value: number; unit: string }
//    "alert:fired"   → { alertId: string; severity: "low" | "medium" | "high"; message: string }
// ------------------------------------------------------------------

export type AppEventMap = {
  // TODO: fill in the three event entries described above
};

// ------------------------------------------------------------------
// 2. Generic listener type.
//    A Listener for event E (a key of AppEventMap) is a function that
//    receives exactly the payload for that event and returns void.
// ------------------------------------------------------------------

export type Listener<E extends keyof AppEventMap> = (
  // TODO: declare the single parameter using AppEventMap
) => void;

// ------------------------------------------------------------------
// 3. EventEmitter class.
//    Internally stores listeners in a registry typed as a mapped type
//    over AppEventMap so each slot holds the right listener array.
//
//    Requirements:
//    [R1] `on<E>(event: E, listener: Listener<E>): void`
//         — registers a listener for the given event.
//    [R2] `off<E>(event: E, listener: Listener<E>): void`
//         — removes a previously registered listener (no-op if absent).
//    [R3] `emit<E>(event: E, payload: AppEventMap[E]): void`
//         — calls every registered listener for the event with the payload.
//    [R4] `listenerCount<E>(event: E): number`
//         — returns the number of currently registered listeners for the event.
//    [R5] The internal registry must be typed — no `any` allowed anywhere
//         in the class body.
// ------------------------------------------------------------------

// Helper: a registry that holds an array of listeners for every event.
// TODO: replace `never` with the correct mapped type over AppEventMap.
type ListenerRegistry = never;

export class EventEmitter {
  // TODO: declare the private registry field using ListenerRegistry

  constructor() {
    // TODO: initialise the registry so every event key starts with an empty array.
    //       Hint: use the keys of AppEventMap.
  }

  // [R1]
  on<E extends keyof AppEventMap>(event: E, listener: Listener<E>): void {
    // TODO
  }

  // [R2]
  off<E extends keyof AppEventMap>(event: E, listener: Listener<E>): void {
    // TODO
  }

  // [R3]
  emit<E extends keyof AppEventMap>(event: E, payload: AppEventMap[E]): void {
    // TODO
  }

  // [R4]
  listenerCount<E extends keyof AppEventMap>(event: E): number {
    // TODO
    return 0;
  }
}
