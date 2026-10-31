// ============================================================
// challenge.ts — Typed Event Sourcing Engine
// Rules: strict: true, no `any`, no type assertions (`as`)
// ============================================================

// ── 1. Domain Events ─────────────────────────────────────────
// Requirement 1: Define a discriminated union `OrderEvent` with
// at least these four variants (tag field: `type`):
//   • "OrderPlaced"   – { orderId: string; customerId: string; placedAt: Date; totalCents: number }
//   • "ItemAdded"     – { orderId: string; sku: string; qty: number; unitCents: number }
//   • "ItemRemoved"   – { orderId: string; sku: string; qty: number }
//   • "OrderShipped"  – { orderId: string; carrier: string; trackingCode: string; shippedAt: Date }
//   • "OrderCancelled"– { orderId: string; reason: string; cancelledAt: Date }
// Each variant must also carry: `eventId: string` and `version: number`.

export type OrderEventType =
  | "OrderPlaced"
  | "ItemAdded"
  | "ItemRemoved"
  | "OrderShipped"
  | "OrderCancelled";

// TODO: define each individual event type then compose OrderEvent
export type OrderEvent = never; // replace `never` with your discriminated union

// ── 2. Branded Types ─────────────────────────────────────────
// Requirement 2: Create branded types so raw strings cannot be
// accidentally used where typed IDs are expected.
//   • `OrderId`    branded from string
//   • `CustomerId` branded from string
//   • `EventId`    branded from string
// Provide constructor functions:
//   toOrderId(s: string): OrderId
//   toCustomerId(s: string): CustomerId
//   toEventId(s: string): EventId

declare const __orderId: unique symbol;
declare const __customerId: unique symbol;
declare const __eventId: unique symbol;

export type OrderId = string & { readonly [__orderId]: true };
export type CustomerId = string & { readonly [__customerId]: true };
export type EventId = string & { readonly [__eventId]: true };

// TODO: implement the three constructor functions
export function toOrderId(s: string): OrderId {
  throw new Error("TODO");
}
export function toCustomerId(s: string): CustomerId {
  throw new Error("TODO");
}
export function toEventId(s: string): EventId {
  throw new Error("TODO");
}

// ── 3. Event Store ───────────────────────────────────────────
// Requirement 3: Implement an append-only in-memory EventStore.
// The store must:
//   • append(event: OrderEvent): void — add event; throw if
//     event.version !== (last version for that orderId) + 1
//     (first event for an order must have version === 1)
//   • getStream(orderId: string): readonly OrderEvent[] — all
//     events for that order, ordered by version ascending
//   • allEvents(): readonly OrderEvent[] — every stored event

export class EventStore {
  // TODO: choose appropriate private storage
  // TODO: implement append, getStream, allEvents
  append(_event: OrderEvent): void {
    throw new Error("TODO");
  }
  getStream(_orderId: string): readonly OrderEvent[] {
    throw new Error("TODO");
  }
  allEvents(): readonly OrderEvent[] {
    throw new Error("TODO");
  }
}

// ── 4. Read Model & Projection ───────────────────────────────
// Requirement 4: Define the `OrderReadModel` shape and implement
// a typed `Projector<S>` interface + `OrderProjector` class.

export type LineItem = {
  readonly sku: string;
  readonly qty: number;
  readonly unitCents: number;
};

export type OrderStatus =
  | "pending"
  | "active"
  | "shipped"
  | "cancelled";

export type OrderReadModel = {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly placedAt: Date;
  readonly totalCents: number;       // sum of all line-item costs (qty × unitCents)
  readonly items: readonly LineItem[];
  readonly shippedAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly lastVersion: number;
};

// Requirement 5: A generic Projector interface — S is the state/read-model type.
// `apply` must be exhaustive over all OrderEvent variants (use a switch on `type`).
export interface Projector<S> {
  /** Return the initial empty state for a given orderId */
  init(orderId: string): S;
  /** Fold a single event into the current state, returning the next state */
  apply(state: S, event: OrderEvent): S;
  /** Replay an entire stream from scratch (or from a snapshot) */
  replayFrom(stream: readonly OrderEvent[], snapshot?: S): S;
}

// TODO: implement OrderProjector satisfying Projector<OrderReadModel>
// `apply` must handle ALL five event types exhaustively — the compiler
// should complain if you miss one (use a `never` exhaustiveness check helper).
export class OrderProjector implements Projector<OrderReadModel> {
  init(_orderId: string): OrderReadModel {
    throw new Error("TODO");
  }
  apply(_state: OrderReadModel, _event: OrderEvent): OrderReadModel {
    throw new Error("TODO");
  }
  replayFrom(
    _stream: readonly OrderEvent[],
    _snapshot?: OrderReadModel
  ): OrderReadModel {
    throw new Error("TODO");
  }
}

// ── 5. Snapshot Store ────────────────────────────────────────
// Requirement 6: Define a `Snapshot<S>` type and a `SnapshotStore<S>` class.
// Snapshot must record: `orderId`, `state: S`, `atVersion: number`, `takenAt: Date`.
// SnapshotStore must:
//   • save(snapshot: Snapshot<S>): void — overwrite any existing snapshot for orderId
//   • load(orderId: string): Snapshot<S> | null
//   • shouldSnapshot(currentVersion: number, interval: number): boolean
//     — returns true when currentVersion is a non-zero multiple of interval

export type Snapshot<S> = {
  readonly orderId: string;
  readonly state: S;
  readonly atVersion: number;
  readonly takenAt: Date;
};

export class SnapshotStore<S> {
  // TODO: choose appropriate private storage
  save(_snapshot: Snapshot<S>): void {
    throw new Error("TODO");
  }
  load(_orderId: string): Snapshot<S> | null {
    throw new Error("TODO");
  }
  shouldSnapshot(_currentVersion: number, _interval: number): boolean {
    throw new Error("TODO");
  }
}

// ── 6. Aggregate Root ────────────────────────────────────────
// Requirement 7: Implement `OrderAggregate` — the façade that wires
// everything together.
//
// Constructor: (store: EventStore, projector: Projector<OrderReadModel>,
//               snapshots: SnapshotStore<OrderReadModel>, snapshotInterval?: number)
//
// Methods:
//   • append(event: OrderEvent): void
//       – delegates to store.append; after appending, checks shouldSnapshot
//         and saves one if due (using the current read model as state)
//   • getReadModel(orderId: string): OrderReadModel
//       – load snapshot (if any), fetch remaining events after snapshot.atVersion,
//         replay from snapshot state
//   • listAll(): readonly string[] — distinct orderIds seen so far

export class OrderAggregate {
  // TODO: store private references to dependencies
  constructor(
    _store: EventStore,
    _projector: Projector<OrderReadModel>,
    _snapshots: SnapshotStore<OrderReadModel>,
    _snapshotInterval: number = 5
  ) {
    throw new Error("TODO");
  }

  append(_event: OrderEvent): void {
    throw new Error("TODO");
  }

  getReadModel(_orderId: string): OrderReadModel {
    throw new Error("TODO");
  }

  listAll(): readonly string[] {
    throw new Error("TODO");
  }
}

// ── 7. Utility: buildEventStream ─────────────────────────────
// Requirement 8: Implement a generic helper:
//
//   function buildEventStream<E extends { version: number; orderId: string }>(
//     events: readonly E[],
//     fromVersion: number         // exclusive lower bound (0 = all)
//   ): readonly E[]
//
// Returns events with version > fromVersion, sorted ascending by version.

export function buildEventStream<
  E extends { version: number; orderId: string }
>(events: readonly E[], fromVersion: number): readonly E[] {
  throw new Error("TODO");
}

// ── 8. Exhaustiveness helper (you must use this inside apply) ─
// Requirement 9: Implement `assertNever` so the compiler enforces
// exhaustive switches.
export function assertNever(x: never): never {
  throw new Error(`Unhandled variant: ${JSON.stringify(x)}`);
}
