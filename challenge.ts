// ============================================================
// Typed Event Sourcing Engine with Snapshot Compaction
// & Projection Rebuilding
// ============================================================
// Requirements are numbered inline. Solve each TODO.
// Constraints: strict: true, no `any`, no `as`, no unsafe casts.
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN EVENTS — discriminated union
// ---------------------------------------------------------------------------

// Req 1: Define a discriminated union `DomainEvent` whose members are exactly:
//   - DocumentCreated  { kind: "DocumentCreated";  aggregateId: string; title: string;       author: string;    occurredAt: number }
//   - DocumentRenamed  { kind: "DocumentRenamed";  aggregateId: string; newTitle: string;                       occurredAt: number }
//   - CollaboratorAdded{ kind: "CollaboratorAdded"; aggregateId: string; userId: string;      role: Role;        occurredAt: number }
//   - CollaboratorRemoved{ kind:"CollaboratorRemoved"; aggregateId: string; userId: string;   occurredAt: number }
//   - DocumentPublished{ kind: "DocumentPublished"; aggregateId: string; publishedUrl: string; occurredAt: number }
//   - DocumentArchived { kind: "DocumentArchived";  aggregateId: string;                       occurredAt: number }
//
// Req 2: Define `Role` as a union of string literals: "viewer" | "editor" | "admin"

export type Role = TODO;

export type DocumentCreated   = TODO;
export type DocumentRenamed   = TODO;
export type CollaboratorAdded = TODO;
export type CollaboratorRemoved = TODO;
export type DocumentPublished = TODO;
export type DocumentArchived  = TODO;

export type DomainEvent =
  | DocumentCreated
  | DocumentRenamed
  | CollaboratorAdded
  | CollaboratorRemoved
  | DocumentPublished
  | DocumentArchived;

// ---------------------------------------------------------------------------
// 2. EVENT KIND HELPERS — conditional & mapped types
// ---------------------------------------------------------------------------

// Req 3: Define `EventKind` as a template-literal type that extracts every
//   `kind` string from `DomainEvent` (i.e. the union of all `.kind` values).
export type EventKind = TODO;

// Req 4: Define `EventByKind<K extends EventKind>` — a conditional type that
//   narrows `DomainEvent` to the single member whose `kind` equals K.
export type EventByKind<K extends EventKind> = TODO;

// Req 5: Define `EventPayload<K extends EventKind>` — the shape of an event
//   *without* the `kind` and `aggregateId` discriminants (use Omit).
export type EventPayload<K extends EventKind> = TODO;

// ---------------------------------------------------------------------------
// 3. AGGREGATE STATE
// ---------------------------------------------------------------------------

// Req 6: Define `DocumentState` — the fully reduced state of one document:
//   title: string
//   author: string
//   status: "draft" | "published" | "archived"
//   collaborators: Map<string, Role>   // userId → role
//   publishedUrl: string | null

export type DocumentState = TODO;

// Req 7: Define `Snapshot<S>` — a generic snapshot envelope:
//   aggregateId: string
//   version: number          // number of events folded into this snapshot
//   state: S
//   takenAt: number          // epoch ms

export type Snapshot<S> = TODO;

// ---------------------------------------------------------------------------
// 4. REDUCER
// ---------------------------------------------------------------------------

// Req 8: Define `Reducer<S, E extends DomainEvent>` — a function type that
//   accepts the current state (or null for the very first event) and an event,
//   and returns the next state.
export type Reducer<S, E extends DomainEvent> = TODO;

// Req 9: Implement `documentReducer` — a `Reducer<DocumentState, DomainEvent>`
//   that handles every event kind exhaustively.
//   - DocumentCreated    → initialise state (status: "draft", collaborators: new Map)
//   - DocumentRenamed    → update title
//   - CollaboratorAdded  → upsert collaborator in the Map
//   - CollaboratorRemoved→ delete collaborator from the Map (return same state if absent)
//   - DocumentPublished  → set status "published", set publishedUrl
//   - DocumentArchived   → set status "archived"
//   Throw a TypeError for any event arriving before DocumentCreated (state === null
//   and event.kind !== "DocumentCreated").
export const documentReducer: Reducer<DocumentState, DomainEvent> = TODO;

// ---------------------------------------------------------------------------
// 5. EVENT LOG & REPLAY
// ---------------------------------------------------------------------------

// Req 10: Define `EventLog` — an append-only log for one aggregate:
//   aggregateId: string
//   events: readonly DomainEvent[]

export type EventLog = TODO;

// Req 11: Implement `replayFromSnapshot` — generic over state type S:
//   Signature: replayFromSnapshot<S>(
//     log: EventLog,
//     reducer: Reducer<S, DomainEvent>,
//     snapshot?: Snapshot<S>
//   ): S
//   - If a snapshot is provided, replay only events whose index >= snapshot.version
//   - If no snapshot, replay from index 0
//   - Throw RangeError if the log is empty and no snapshot is provided
export function replayFromSnapshot<S>(
  log: EventLog,
  reducer: Reducer<S, DomainEvent>,
  snapshot?: Snapshot<S>
): S {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 6. SNAPSHOT COMPACTION
// ---------------------------------------------------------------------------

// Req 12: Implement `takeSnapshot` — generic over state type S:
//   Signature: takeSnapshot<S>(
//     aggregateId: string,
//     state: S,
//     version: number,
//     takenAt: number
//   ): Snapshot<S>
//   Simply constructs and returns a well-typed Snapshot<S> envelope.
export function takeSnapshot<S>(
  aggregateId: string,
  state: S,
  version: number,
  takenAt: number
): Snapshot<S> {
  // TODO
  throw new Error("Not implemented");
}

// Req 13: Implement `compactLog` — given an EventLog and a compaction threshold N,
//   return a tuple [Snapshot<DocumentState>, EventLog] where:
//   - The snapshot is taken after folding the first N events (version = N)
//   - The returned EventLog retains only events at index >= N
//   - Use `documentReducer` internally
//   - Throw RangeError if N < 1 or N > log.events.length
export function compactLog(
  log: EventLog,
  n: number,
  now: number
): [Snapshot<DocumentState>, EventLog] {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. PROJECTIONS — typed read-model subscriptions
// ---------------------------------------------------------------------------

// Req 14: Define `Projection<TState, K extends EventKind>` — describes a
//   read-model that listens to a *subset* of event kinds:
//   {
//     eventKinds: readonly K[]
//     initialState: TState
//     handle: (state: TState, event: EventByKind<K>) => TState
//   }
export type Projection<TState, K extends EventKind> = TODO;

// Req 15: Implement `runProjection` — generic over TState and K extends EventKind:
//   Signature: runProjection<TState, K extends EventKind>(
//     log: EventLog,
//     projection: Projection<TState, K>
//   ): TState
//   - Iterate over log.events
//   - For each event whose `kind` is in projection.eventKinds, call projection.handle
//   - Use a type guard to narrow the event to EventByKind<K> before passing it
//   - Return the final accumulated state
export function runProjection<TState, K extends EventKind>(
  log: EventLog,
  projection: Projection<TState, K>
): TState {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 8. COLLABORATOR SUMMARY PROJECTION (concrete usage)
// ---------------------------------------------------------------------------

// Req 16: Define `CollaboratorSummary`:
//   { totalAdded: number; totalRemoved: number; currentCount: number }
export type CollaboratorSummary = TODO;

// Req 17: Implement `collaboratorProjection` — a
//   Projection<CollaboratorSummary, "CollaboratorAdded" | "CollaboratorRemoved">
//   with initialState { totalAdded: 0, totalRemoved: 0, currentCount: 0 }
//   handle:
//     - CollaboratorAdded   → increment totalAdded and currentCount
//     - CollaboratorRemoved → increment totalRemoved, decrement currentCount
//   The compiler must enforce that only CollaboratorAdded | CollaboratorRemoved
//   events reach the handler — no extra narrowing hacks needed.
export const collaboratorProjection: Projection<
  CollaboratorSummary,
  "CollaboratorAdded" | "CollaboratorRemoved"
> = TODO;
