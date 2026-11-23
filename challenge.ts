// ============================================================
// Typed Event Sourcing Engine: Commands, Projections & Snapshot Rebuilding
// ============================================================
// TOPICS: discriminated unions · conditional types · generics ·
//         mapped types · Result<T,E> · type narrowing · branded types ·
//         exhaustive matching · infer
// ============================================================

// ── 1. Branded primitives ────────────────────────────────────
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type OrderId    = Brand<string, "OrderId">;
export type ProductId  = Brand<string, "ProductId">;
export type EventSeq   = Brand<number, "EventSeq">;

export function toOrderId(s: string): OrderId       { return s as OrderId; }
export function toProductId(s: string): ProductId   { return s as ProductId; }
export function toEventSeq(n: number): EventSeq     { return n as EventSeq; }

// ── 2. Result type ────────────────────────────────────────────
export type Ok<T>   = { readonly ok: true;  readonly value: T };
export type Err<E>  = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T>    { return { ok: true, value }; }
export function err<E>(error: E): Err<E>  { return { ok: false, error }; }

// ── 3. Domain Commands (arrive as unknown JSON) ───────────────
export type PlaceOrderCommand = {
  readonly type: "PlaceOrder";
  readonly orderId: string;
  readonly customerId: string;
  readonly items: ReadonlyArray<{ productId: string; quantity: number; unitPrice: number }>;
};

export type AddItemCommand = {
  readonly type: "AddItem";
  readonly orderId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
};

export type RemoveItemCommand = {
  readonly type: "RemoveItem";
  readonly orderId: string;
  readonly productId: string;
};

export type ConfirmOrderCommand = {
  readonly type: "ConfirmOrder";
  readonly orderId: string;
};

export type CancelOrderCommand = {
  readonly type: "CancelOrder";
  readonly orderId: string;
  readonly reason: string;
};

export type DomainCommand =
  | PlaceOrderCommand
  | AddItemCommand
  | RemoveItemCommand
  | ConfirmOrderCommand
  | CancelOrderCommand;

// ── 4. Domain Events (the source of truth) ───────────────────
export type OrderPlacedEvent = {
  readonly type: "OrderPlaced";
  readonly seq: EventSeq;
  readonly orderId: OrderId;
  readonly customerId: string;
  readonly items: ReadonlyArray<OrderLineItem>;
  readonly occurredAt: string; // ISO-8601
};

export type ItemAddedEvent = {
  readonly type: "ItemAdded";
  readonly seq: EventSeq;
  readonly orderId: OrderId;
  readonly item: OrderLineItem;
  readonly occurredAt: string;
};

export type ItemRemovedEvent = {
  readonly type: "ItemRemoved";
  readonly seq: EventSeq;
  readonly orderId: OrderId;
  readonly productId: ProductId;
  readonly occurredAt: string;
};

export type OrderConfirmedEvent = {
  readonly type: "OrderConfirmed";
  readonly seq: EventSeq;
  readonly orderId: OrderId;
  readonly occurredAt: string;
};

export type OrderCancelledEvent = {
  readonly type: "OrderCancelled";
  readonly seq: EventSeq;
  readonly orderId: OrderId;
  readonly reason: string;
  readonly occurredAt: string;
};

export type DomainEvent =
  | OrderPlacedEvent
  | ItemAddedEvent
  | ItemRemovedEvent
  | OrderConfirmedEvent
  | OrderCancelledEvent;

// ── 5. Aggregate state ────────────────────────────────────────
export type OrderStatus = "Draft" | "Confirmed" | "Cancelled";

export type OrderLineItem = {
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPrice: number;
};

export type OrderState = {
  readonly orderId: OrderId;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly items: ReadonlyArray<OrderLineItem>;
  readonly lastSeq: EventSeq;
};

// ── 6. Snapshot ───────────────────────────────────────────────
// A snapshot captures a fully-rebuilt state at a given sequence number
// so replay can start from the snapshot instead of the very first event.
export type Snapshot = {
  readonly atSeq: EventSeq;
  readonly state: OrderState;
};

// ── 7. Command validation errors ──────────────────────────────
export type CommandValidationError =
  | { readonly kind: "MissingField";    readonly field: string }
  | { readonly kind: "InvalidType";     readonly field: string; readonly expected: string }
  | { readonly kind: "EmptyItems" }
  | { readonly kind: "NegativeValue";   readonly field: string }
  | { readonly kind: "UnknownCommand";  readonly received: string };

// ── 8. Apply errors ───────────────────────────────────────────
export type ApplyError =
  | { readonly kind: "OrderAlreadyExists"; readonly orderId: OrderId }
  | { readonly kind: "OrderNotFound";      readonly orderId: OrderId }
  | { readonly kind: "InvalidTransition";  readonly from: OrderStatus; readonly to: string }
  | { readonly kind: "ProductNotInOrder";  readonly productId: ProductId };

// ── 9. Utility: extract event type names ─────────────────────
// TODO: Define a conditional/mapped type `EventTypeOf<E>` that, given a
//       union member of DomainEvent, extracts its `type` string literal.
//       e.g. EventTypeOf<OrderPlacedEvent> → "OrderPlaced"
export type EventTypeOf<E extends DomainEvent> = E["type"];

// TODO: Define `EventByType<T extends DomainEvent["type"]>` — a conditional
//       type that maps a type-string literal back to the matching event union member.
//       e.g. EventByType<"ItemAdded"> → ItemAddedEvent
export type EventByType<T extends DomainEvent["type"]> = Extract<DomainEvent, { type: T }>;

// ── 10. Command handler map (mapped type over DomainCommand) ──
// TODO: Define `CommandHandlerMap` — a mapped type where each key is a
//       DomainCommand["type"] and each value is a handler function:
//         (cmd: <matching command>, state: OrderState | undefined) =>
//             Result<DomainEvent, ApplyError>
//       Use `Extract` to narrow the command type per key.
export type CommandHandlerMap = {
  [K in DomainCommand["type"]]: (
    cmd: Extract<DomainCommand, { type: K }>,
    state: OrderState | undefined
  ) => Result<DomainEvent, ApplyError>;
};

// ── 11. Core functions you must implement ────────────────────

/**
 * REQUIREMENT 1 — Command validation
 * Parse an `unknown` value into a `DomainCommand`.
 * Return Err<CommandValidationError> for any of:
 *   - missing or wrong-typed `type` field
 *   - unknown command type string
 *   - missing required fields per command type
 *   - items array empty (PlaceOrder)
 *   - quantity or unitPrice ≤ 0
 */
export function validateCommand(
  raw: unknown
): Result<DomainCommand, CommandValidationError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Event application (single event → next state)
 * Apply one DomainEvent to the current state (undefined = no state yet).
 * Rules:
 *   - OrderPlaced   : state must be undefined → creates new Draft state
 *   - ItemAdded     : state must exist & be Draft → appends item (or increments qty)
 *   - ItemRemoved   : state must exist & be Draft → removes item; Err if not found
 *   - OrderConfirmed: state must exist & be Draft → transitions to Confirmed
 *   - OrderCancelled: state must exist & status ≠ Cancelled → transitions to Cancelled
 * Return Err<ApplyError> on illegal transitions or missing state.
 */
export function applyEvent(
  state: OrderState | undefined,
  event: DomainEvent
): Result<OrderState, ApplyError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Command → Event (dispatch via CommandHandlerMap)
 * Given a validated DomainCommand and the current state, produce the
 * next DomainEvent using the provided handler map.
 * The sequence number of the produced event must be currentSeq + 1.
 * Hint: use the `handlers` map — index by `cmd.type`.
 */
export function handleCommand(
  cmd: DomainCommand,
  state: OrderState | undefined,
  handlers: CommandHandlerMap,
  currentSeq: EventSeq,
  occurredAt: string
): Result<DomainEvent, ApplyError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4 — Replay events from a snapshot (or from scratch)
 * Given an optional snapshot and an ordered list of DomainEvents
 * (only those with seq > snapshot.atSeq should be applied),
 * replay all relevant events in sequence order to produce the final OrderState.
 * Return Err<ApplyError> if any event application fails.
 * Return Err<ApplyError> with kind "OrderNotFound" if events is empty and
 * no snapshot is provided.
 */
export function replayEvents(
  events: ReadonlyArray<DomainEvent>,
  snapshot?: Snapshot
): Result<OrderState, ApplyError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — Build a snapshot
 * Given a fully-replayed OrderState, produce a Snapshot at its lastSeq.
 */
export function buildSnapshot(state: OrderState): Snapshot {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 6 — Projection: order total
 * Compute the total value of all line items in the state.
 * Returns 0 for an empty items array.
 */
export function projectOrderTotal(state: OrderState): number {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 7 — Projection: event log summary
 * Given an array of DomainEvents for one order, return a summary object:
 * {
 *   orderId: OrderId,
 *   eventCount: number,
 *   eventTypes: ReadonlyArray<DomainEvent["type"]>,  // in appearance order, deduplicated
 *   firstSeq: EventSeq,
 *   lastSeq: EventSeq,
 * }
 * The events array is guaranteed non-empty.
 */
export type EventLogSummary = {
  readonly orderId: OrderId;
  readonly eventCount: number;
  readonly eventTypes: ReadonlyArray<DomainEvent["type"]>;
  readonly firstSeq: EventSeq;
  readonly lastSeq: EventSeq;
};

export function projectEventLog(
  events: ReadonlyArray<DomainEvent>
): EventLogSummary {
  // TODO
  throw new Error("Not implemented");
}
