// ============================================================
// Typed Event Emitter State Machine
// challenge.ts
// ============================================================
// Scenario:
//   A real-time collaboration session moves through states:
//     Idle → Connecting → Active → Suspended → Closed
//   Only certain transitions are legal. Each transition fires a
//   typed event with a payload specific to that transition.
//   Listeners must receive the exact payload for the event they
//   subscribe to — no casting, no any.
// ============================================================

// ── 1. State definitions ─────────────────────────────────────

export type SessionState =
  | "Idle"
  | "Connecting"
  | "Active"
  | "Suspended"
  | "Closed";

// ── 2. Event payload map ──────────────────────────────────────
// Each key is an event name; the value is the payload type for
// that event. Add all five transition events below.
//
// Requirements (event name → payload shape):
//   "session:connecting" → { sessionId: string; url: string }
//   "session:active"     → { sessionId: string; userId: string; joinedAt: Date }
//   "session:suspended"  → { sessionId: string; reason: string; suspendedAt: Date }
//   "session:resumed"    → { sessionId: string; resumedAt: Date }
//   "session:closed"     → { sessionId: string; code: number; message: string }

// TODO: Define SessionEventMap as an interface mapping each
//       event name string to its payload type.
export interface SessionEventMap {
  // TODO: fill in all five entries
}

// ── 3. Legal transitions ──────────────────────────────────────
// A Transition<From, To, Event> describes one legal state move.
// The compiler should enforce that Event is a key of
// SessionEventMap.

// TODO: Define the Transition type — it must be generic over
//       From extends SessionState,
//       To   extends SessionState,
//       Event extends keyof SessionEventMap
export type Transition<
  // TODO: fill in type parameters with their constraints
> = {
  from: From;
  to: To;
  event: Event;
};

// TODO: Define LegalTransitions as a tuple type listing every
//       allowed transition (use Transition<...> for each):
//         Idle        → Connecting  via "session:connecting"
//         Connecting  → Active      via "session:active"
//         Active      → Suspended   via "session:suspended"
//         Suspended   → Active      via "session:resumed"
//         Active      → Closed      via "session:closed"
//         Suspended   → Closed      via "session:closed"
export type LegalTransitions = [
  // TODO: fill in all six Transition entries
];

// Helper: derive a union of all legal transition objects
export type LegalTransition = LegalTransitions[number];

// ── 4. Typed dispatch constraint ──────────────────────────────
// DispatchFor<E> resolves to the LegalTransition whose `event`
// field equals E — used to constrain dispatch() so callers can
// only fire an event when the machine is in the right `from`
// state.

// TODO: Define DispatchFor<E extends keyof SessionEventMap>
//       using a conditional type / Extract over LegalTransition
export type DispatchFor<E extends keyof SessionEventMap> =
  // TODO
  never;

// ── 5. Listener type ──────────────────────────────────────────
// A listener for event E receives exactly SessionEventMap[E].

// TODO: Define Listener<E extends keyof SessionEventMap>
export type Listener<E extends keyof SessionEventMap> =
  // TODO
  never;

// ── 6. SessionMachine class ───────────────────────────────────
// Implement a class that:
//   a) Tracks the current SessionState (starts at "Idle")
//   b) Allows subscribing typed listeners per event name
//   c) Exposes dispatch() that:
//        - Accepts an event name E and its payload
//        - Validates at runtime that the current state matches
//          one of the legal `from` states for E
//        - Transitions to the corresponding `to` state
//        - Notifies all listeners subscribed to E
//   d) Exposes getState() returning the current SessionState

export class SessionMachine {
  // TODO: private state field (SessionState)
  // TODO: private listeners registry (typed map)

  constructor() {
    // TODO: initialise state to "Idle"
  }

  // Subscribe a listener for a specific event.
  // Returns an unsubscribe function.
  on<E extends keyof SessionEventMap>(
    event: E,
    listener: Listener<E>
  ): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  // Dispatch a transition event with its payload.
  // Requirement 1: E must be a key of SessionEventMap (enforced by generic).
  // Requirement 2: payload must be SessionEventMap[E] (enforced by generic).
  // Requirement 3: current state must match a legal `from` for E (runtime check).
  // Requirement 4: on success, state transitions to the `to` of the matched rule.
  // Requirement 5: all listeners for E are called with the payload.
  // Returns true if the transition succeeded, false if the current state was illegal.
  dispatch<E extends keyof SessionEventMap>(
    event: E,
    payload: SessionEventMap[E]
  ): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  getState(): SessionState {
    // TODO
    throw new Error("Not implemented");
  }
}

// ── 7. Typed subscription helper (bonus) ─────────────────────
// TODO: Implement a standalone function `once` that subscribes
//       a listener to a SessionMachine for a given event but
//       automatically unsubscribes after the first invocation.
//       Signature must be fully typed (no any, no as).
export function once<E extends keyof SessionEventMap>(
  machine: SessionMachine,
  event: E,
  listener: Listener<E>
): void {
  // TODO
  throw new Error("Not implemented");
}
