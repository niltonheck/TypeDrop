// =============================================================
// Typed Event Emitter with Middleware Pipeline
// =============================================================
// SCENARIO:
//   You're building the core event bus for a real-time collaboration
//   tool. Components emit strongly-typed events, middleware can
//   transform or gate events before they reach subscribers, and every
//   handler is guaranteed by the compiler to receive the exact payload
//   shape for its event.
//
// YOUR TASK: implement the five functions / class methods marked TODO.
// Do NOT change any type definitions.
// Do NOT use `any`, `as`, or unsafe casts.
// =============================================================

// ─── 1. Event Map ────────────────────────────────────────────
// Defines every event name → payload shape for this application.

export interface AppEventMap {
  "user:joined":  { userId: string; roomId: string; timestamp: number };
  "user:left":    { userId: string; roomId: string; reason: "timeout" | "disconnect" | "kicked" };
  "message:sent": { messageId: string; authorId: string; body: string; roomId: string };
  "message:deleted": { messageId: string; deletedBy: string };
  "room:created": { roomId: string; ownerId: string; maxCapacity: number };
}

// Convenience aliases
export type EventName = keyof AppEventMap;
export type Payload<E extends EventName> = AppEventMap[E];

// ─── 2. Middleware ────────────────────────────────────────────
// A middleware receives the event name + payload and must return:
//   • the (possibly mutated) payload to continue the chain, OR
//   • null / undefined to CANCEL the event (no handlers are called).

export type MiddlewareResult<E extends EventName> = Payload<E> | null | undefined;

export type Middleware<E extends EventName> = (
  event: E,
  payload: Payload<E>
) => MiddlewareResult<E> | Promise<MiddlewareResult<E>>;

// A "universal" middleware that can handle ANY event (used internally).
export type AnyMiddleware = <E extends EventName>(
  event: E,
  payload: Payload<E>
) => MiddlewareResult<E> | Promise<MiddlewareResult<E>>;

// ─── 3. Handler ──────────────────────────────────────────────
export type Handler<E extends EventName> = (payload: Payload<E>) => void | Promise<void>;

// ─── 4. Emission Record ──────────────────────────────────────
// Tracks what happened when an event was emitted.
export type EmitStatus = "delivered" | "cancelled" | "no-listeners";

export interface EmitRecord<E extends EventName> {
  event: E;
  payload: Payload<E>;       // the FINAL payload after middleware (or original if cancelled)
  status: EmitStatus;
  listenerCount: number;     // number of handlers that were called (0 if cancelled/no-listeners)
  middlewareCount: number;   // number of middleware that ran before the chain resolved
}

// ─── 5. TypedEventEmitter class ──────────────────────────────

export class TypedEventEmitter {
  // Internal storage — do not change the type signatures.
  private readonly handlers = new Map<EventName, Set<Handler<EventName>>>();
  private readonly middlewares: AnyMiddleware[] = [];

  // ── 5a. on ─────────────────────────────────────────────────
  // Register a handler for a specific event.
  // Returns an unsubscribe function that removes only this handler.
  //
  // REQUIREMENTS:
  //   R1. The handler must be stored in `this.handlers` under the event key.
  //   R2. Multiple handlers for the same event are all stored and all called.
  //   R3. The returned function, when called, removes only the registered handler.
  on<E extends EventName>(event: E, handler: Handler<E>): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 5b. once ───────────────────────────────────────────────
  // Like `on`, but the handler is automatically removed after its first invocation.
  //
  // REQUIREMENTS:
  //   R4. The handler fires at most once, then unsubscribes itself.
  //   R5. Implement in terms of `on` (reuse unsubscribe logic).
  once<E extends EventName>(event: E, handler: Handler<E>): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 5c. use ────────────────────────────────────────────────
  // Register a universal middleware (runs for every event).
  // Middleware are executed in registration order.
  //
  // REQUIREMENTS:
  //   R6. Push the middleware onto `this.middlewares`.
  //   R7. Return `this` for chaining: emitter.use(mw1).use(mw2).
  use(middleware: AnyMiddleware): this {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 5d. emit ───────────────────────────────────────────────
  // Emit an event, running middleware then notifying handlers.
  //
  // REQUIREMENTS:
  //   R8.  Run each middleware in order, passing the event name and
  //        current payload. If a middleware returns null/undefined,
  //        stop the chain immediately (status = "cancelled").
  //   R9.  Each middleware may return a new payload object; use it
  //        as the input to the next middleware (and finally to handlers).
  //   R10. After middleware, if no handlers are registered for the event,
  //        status = "no-listeners".
  //   R11. Otherwise call every registered handler with the final payload
  //        and set status = "delivered".
  //   R12. Return a Promise<EmitRecord<E>> with all fields populated.
  //   R13. `middlewareCount` = number of middleware that actually ran
  //        (stops counting when one cancels).
  async emit<E extends EventName>(event: E, payload: Payload<E>): Promise<EmitRecord<E>> {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 5e. listenerCount ──────────────────────────────────────
  // Return the number of handlers currently registered for an event.
  //
  // REQUIREMENTS:
  //   R14. Return 0 if no handlers are registered for the event.
  listenerCount<E extends EventName>(event: E): number {
    // TODO
    throw new Error("Not implemented");
  }
}
