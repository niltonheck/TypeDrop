// ============================================================
// Typed Finite State Machine Executor
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// ============================================================

// ---------------------------------------------------------------------------
// 1. STATE & EVENT DEFINITIONS
// ---------------------------------------------------------------------------

/** All possible order states. */
export type OrderState =
  | "Draft"
  | "Submitted"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

/** All possible events that can be sent to the machine. */
export type OrderEvent =
  | { type: "SUBMIT"; paymentRef: string }
  | { type: "ACCEPT"; warehouseId: string }
  | { type: "SHIP"; trackingCode: string }
  | { type: "DELIVER"; signedBy: string }
  | { type: "CANCEL"; reason: string };

// ---------------------------------------------------------------------------
// 2. CONTEXT
// ---------------------------------------------------------------------------

/**
 * The shared context that accumulates data as the order progresses.
 * All fields are optional because they are populated incrementally.
 */
export interface OrderContext {
  orderId: string;
  paymentRef?: string;
  warehouseId?: string;
  trackingCode?: string;
  signedBy?: string;
  cancelReason?: string;
  history: Array<{ from: OrderState; event: OrderEvent["type"]; to: OrderState; at: number }>;
}

// ---------------------------------------------------------------------------
// 3. TRANSITION DESCRIPTOR
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 1 — Conditional / mapped types):
 *
 * Define a generic `Transition<S extends OrderState, E extends OrderEvent>` type
 * that describes a single valid edge in the state machine:
 *
 *   - `from`   : the source state (S)
 *   - `on`     : the event type that triggers this transition (E["type"])
 *   - `to`     : the target state
 *   - `guard?` : an optional predicate — receives the current context AND the
 *                specific event; returns `true` if the transition is allowed.
 *                The event parameter must be typed as the *exact* event subtype
 *                whose `type` matches `E["type"]` (use `Extract<OrderEvent, { type: E["type"] }>`).
 *   - `effect` : a required side-effect function — same signature as `guard` but
 *                returns `void`; must mutate context to record event data.
 *
 * HINT: Use `Extract<OrderEvent, { type: E["type"] }>` to narrow the event to
 * its concrete subtype inside `guard` and `effect`.
 */
export type Transition<
  S extends OrderState,
  E extends OrderEvent
> = {
  // TODO: fill in the fields described above
  from: S;
  on: E["type"];
  to: OrderState;
  guard?: (ctx: OrderContext, event: Extract<OrderEvent, { type: E["type"] }>) => boolean;
  effect: (ctx: OrderContext, event: Extract<OrderEvent, { type: E["type"] }>) => void;
};

// ---------------------------------------------------------------------------
// 4. MACHINE DEFINITION
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 2 — Discriminated-union array, `satisfies`):
 *
 * Define `TRANSITIONS` — a readonly array of `Transition` descriptors covering
 * every valid edge in the order lifecycle:
 *
 *   Draft       --SUBMIT-->    Submitted   (effect: store paymentRef)
 *   Submitted   --ACCEPT-->    Processing  (effect: store warehouseId)
 *   Processing  --SHIP-->      Shipped     (effect: store trackingCode)
 *   Shipped     --DELIVER-->   Delivered   (effect: store signedBy)
 *   Draft       --CANCEL-->    Cancelled   (effect: store cancelReason)
 *   Submitted   --CANCEL-->    Cancelled   (effect: store cancelReason)
 *   Processing  --CANCEL-->    Cancelled   (effect: store cancelReason;
 *                                           guard: only if ctx.warehouseId starts with "WH-")
 *
 * Each `effect` must ALSO push a history entry into `ctx.history`.
 *
 * Use `satisfies ReadonlyArray<Transition<OrderState, OrderEvent>>` on the array
 * so TypeScript validates every descriptor without widening the literal types.
 */
export const TRANSITIONS = [
  // TODO: implement all seven transitions described above
] satisfies ReadonlyArray<Transition<OrderState, OrderEvent>>;

// ---------------------------------------------------------------------------
// 5. RESULT TYPE
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 3 — Discriminated union result type):
 *
 * Define `TransitionResult` as a discriminated union:
 *
 *   { ok: true;  nextState: OrderState; context: OrderContext }
 * | { ok: false; reason: "NO_TRANSITION" | "GUARD_FAILED";
 *     currentState: OrderState; event: OrderEvent }
 */
export type TransitionResult =
  // TODO: define the two variants described above
  | { ok: true; nextState: OrderState; context: OrderContext }
  | { ok: false; reason: "NO_TRANSITION" | "GUARD_FAILED"; currentState: OrderState; event: OrderEvent };

// ---------------------------------------------------------------------------
// 6. CORE EXECUTOR
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 4 — Type narrowing, exhaustive matching):
 *
 * Implement `applyEvent`:
 *
 *   function applyEvent(
 *     current: OrderState,
 *     event: OrderEvent,
 *     ctx: OrderContext,
 *     transitions: ReadonlyArray<Transition<OrderState, OrderEvent>>
 *   ): TransitionResult
 *
 * Algorithm:
 *   1. Find the first transition where `t.from === current` AND `t.on === event.type`.
 *   2. If none found → return `{ ok: false, reason: "NO_TRANSITION", currentState: current, event }`.
 *   3. If a `guard` exists and returns `false` → return `{ ok: false, reason: "GUARD_FAILED", ... }`.
 *   4. Call `t.effect(ctx, event)` — you MUST use a type-safe cast-free approach.
 *      HINT: Because `t.on === event.type`, the event IS the right subtype, but TS
 *      can't see that without help. Solve this by narrowing: write a helper or
 *      use a discriminated-union switch over `event.type` inside the executor,
 *      OR declare a small overloaded/generic internal helper that proves the
 *      narrowing to the compiler without `as`.
 *   5. Return `{ ok: true, nextState: t.to, context: ctx }`.
 *
 * IMPORTANT: You may NOT use `as`, `any`, or non-null assertions (`!`).
 * The only allowed escape hatch is a single well-typed generic helper function.
 */
export function applyEvent(
  current: OrderState,
  event: OrderEvent,
  ctx: OrderContext,
  transitions: ReadonlyArray<Transition<OrderState, OrderEvent>>
): TransitionResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. MACHINE RUNNER
// ---------------------------------------------------------------------------

/**
 * TODO (Requirement 5 — Generic state machine runner):
 *
 * Implement `runMachine`:
 *
 *   function runMachine(
 *     initialState: OrderState,
 *     events: ReadonlyArray<OrderEvent>,
 *     ctx: OrderContext
 *   ): MachineRunResult
 *
 * Where `MachineRunResult` is:
 *   {
 *     finalState: OrderState;
 *     context: OrderContext;
 *     log: TransitionResult[];   // one entry per event attempted
 *     aborted: boolean;          // true if any transition returned ok: false
 *   }
 *
 * Rules:
 *   - Process events sequentially using `applyEvent` with `TRANSITIONS`.
 *   - If a transition fails (ok: false), record it in `log`, set `aborted: true`,
 *     and STOP processing further events.
 *   - If all events succeed, `aborted` is false.
 */
export type MachineRunResult = {
  finalState: OrderState;
  context: OrderContext;
  log: TransitionResult[];
  aborted: boolean;
};

export function runMachine(
  initialState: OrderState,
  events: ReadonlyArray<OrderEvent>,
  ctx: OrderContext
): MachineRunResult {
  // TODO: implement
  throw new Error("Not implemented");
}
