// ============================================================
// Typed Event-Sourced State Machine
// challenge.ts
// ============================================================
// Compile under: strict: true — NO `any`, NO type assertions (`as`)
// ============================================================

// ── 1. State & Event Catalogue ────────────────────────────────────────────────

/** All possible order states. */
export type OrderState =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

/**
 * Every domain event carries a `type` discriminant plus its own payload.
 * Add `occurredAt` (ISO-8601 string) to every event automatically via a
 * generic wrapper — do NOT repeat the field in each variant.
 */
export type BaseEvent<T extends string, P extends object = Record<string, never>> = {
  type: T;
  occurredAt: string;
} & P;

export type OrderPlaced    = BaseEvent<"OrderPlaced",    { orderId: string; customerId: string; totalCents: number }>;
export type OrderConfirmed = BaseEvent<"OrderConfirmed", { confirmedBy: string }>;
export type OrderShipped   = BaseEvent<"OrderShipped",   { trackingNumber: string; carrier: string }>;
export type OrderDelivered = BaseEvent<"OrderDelivered", { signedBy: string }>;
export type OrderCancelled = BaseEvent<"OrderCancelled", { reason: string }>;
export type OrderRefunded  = BaseEvent<"OrderRefunded",  { amountCents: number; refundId: string }>;

/** Union of all domain events. */
export type OrderEvent =
  | OrderPlaced
  | OrderConfirmed
  | OrderShipped
  | OrderDelivered
  | OrderCancelled
  | OrderRefunded;

// ── 2. Legal Transition Map ───────────────────────────────────────────────────

/**
 * TODO: Define `TransitionMap` as a mapped type over `OrderState`.
 *
 * Each key is a state S. Its value is a readonly tuple (or array) of the
 * `OrderEvent["type"]` strings that are LEGAL to apply when in state S.
 *
 * Legal transitions (state → allowed event types):
 *   Pending   → ["OrderConfirmed", "OrderCancelled"]
 *   Confirmed → ["OrderShipped",   "OrderCancelled"]
 *   Shipped   → ["OrderDelivered", "OrderCancelled"]
 *   Delivered → ["OrderRefunded"]
 *   Cancelled → []          (terminal — no further events)
 *   Refunded  → []          (terminal — no further events)
 *
 * Requirement: The type of each value must be a readonly tuple/array of
 * `OrderEvent["type"]` literals — NOT just `string[]`.
 */
export type TransitionMap = {
  // TODO: implement — mapped type over OrderState
  [S in OrderState]: ReadonlyArray<OrderEvent["type"]>;
};

/**
 * TODO: Provide the runtime constant that satisfies `TransitionMap`.
 * Use `satisfies TransitionMap` so TypeScript validates it but preserves
 * the literal tuple types on each entry.
 */
export const TRANSITIONS = {
  // TODO: fill in all six entries
} satisfies TransitionMap;

// ── 3. Conditional Type: LegalEvents<S> ──────────────────────────────────────

/**
 * TODO: Define a conditional / mapped type `LegalEvents<S>` where
 * S extends OrderState, that resolves to the union of `OrderEvent`
 * sub-types whose `type` field is listed in `TRANSITIONS[S]`.
 *
 * Example:
 *   LegalEvents<"Pending">   →  OrderConfirmed | OrderCancelled
 *   LegalEvents<"Delivered"> →  OrderRefunded
 *   LegalEvents<"Cancelled"> →  never
 *
 * Hint: Use `Extract<OrderEvent, { type: ... }>` and index into
 * `typeof TRANSITIONS[S][number]` to get the allowed type strings.
 */
export type LegalEvents<S extends OrderState> = Extract<
  OrderEvent,
  // TODO: replace `never` with the correct constraint
  never
>;

// ── 4. Aggregate Root ─────────────────────────────────────────────────────────

/** Snapshot of an order reconstructed from its event log. */
export interface OrderAggregate {
  orderId: string;
  customerId: string;
  state: OrderState;
  totalCents: number;
  trackingNumber: string | null;
  refundId: string | null;
  /** Immutable append-only log — newest event last. */
  readonly events: readonly OrderEvent[];
}

// ── 5. Core Functions ─────────────────────────────────────────────────────────

/**
 * TODO: Implement `createOrder`.
 *
 * Requirements:
 *  1. Accepts an `OrderPlaced` event.
 *  2. Returns a brand-new `OrderAggregate` in state "Pending".
 *  3. The `events` array must contain exactly the supplied event.
 */
export function createOrder(event: OrderPlaced): OrderAggregate {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement `applyEvent`.
 *
 * Requirements:
 *  1. Generic over `S extends OrderState` — the CURRENT state of the aggregate.
 *  2. The `event` parameter must be typed as `LegalEvents<S>` so that passing
 *     an illegal event is a compile-time error.
 *  3. Returns an updated `OrderAggregate` (do NOT mutate the input).
 *  4. Appends the event to `events`.
 *  5. Transitions `state` correctly:
 *       OrderConfirmed → "Confirmed"
 *       OrderShipped   → "Shipped"
 *       OrderDelivered → "Delivered"
 *       OrderCancelled → "Cancelled"
 *       OrderRefunded  → "Refunded"
 *  6. Updates `trackingNumber` when the event is `OrderShipped`.
 *  7. Updates `refundId` when the event is `OrderRefunded`.
 *  8. Throws a descriptive `Error` if the runtime state of `aggregate` does
 *     NOT match `S` (guard against stale generics).
 *
 * Signature (do NOT change the generic constraints or parameter order):
 */
export function applyEvent<S extends OrderState>(
  aggregate: OrderAggregate & { state: S },
  event: LegalEvents<S>
): OrderAggregate {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement `rehydrate`.
 *
 * Requirements:
 *  1. Accepts a non-empty `readonly OrderEvent[]` (first event MUST be
 *     `OrderPlaced`; throw if not).
 *  2. Replays every event in order by calling `createOrder` then
 *     `applyEvent` for each subsequent event.
 *  3. Because each `applyEvent` call requires `LegalEvents<S>`, you will need
 *     to validate transitions at runtime (use `TRANSITIONS`) and throw a
 *     descriptive error for any illegal event in the log.
 *  4. Returns the final `OrderAggregate`.
 *
 * Note: `rehydrate` is the one place where you'll need careful runtime
 * narrowing — the type system can't track state across a loop iteration.
 * Use the `TRANSITIONS` map for the runtime guard; you may use a type
 * assertion ONLY inside this function and ONLY on the `applyEvent` call
 * (comment explaining why is required).
 */
export function rehydrate(events: readonly OrderEvent[]): OrderAggregate {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement `isTerminal`.
 *
 * Requirements:
 *  1. Returns `true` if `state` is "Cancelled" or "Refunded".
 *  2. Must be a type predicate: `state is "Cancelled" | "Refunded"`.
 */
export function isTerminal(state: OrderState): state is "Cancelled" | "Refunded" {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement `getEventsByType`.
 *
 * Requirements:
 *  1. Generic over `T extends OrderEvent["type"]`.
 *  2. Accepts an `OrderAggregate` and an event type string `T`.
 *  3. Returns a `readonly` array of the `Extract<OrderEvent, { type: T }>` sub-type.
 *  4. No `any`, no unsafe casts — use a type guard or `satisfies` pattern.
 */
export function getEventsByType<T extends OrderEvent["type"]>(
  aggregate: OrderAggregate,
  eventType: T
): ReadonlyArray<Extract<OrderEvent, { type: T }>> {
  // TODO
  throw new Error("Not implemented");
}
