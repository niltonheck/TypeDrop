// ============================================================
// Typed Notification Router
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Complete the `NotificationEvent` discriminated union so that
//    each channel variant carries ONLY the fields relevant to it.
// 2. Implement `createRouter` which registers a typed handler per
//    channel and returns a `route` function.
// 3. `route` must accept a single `NotificationEvent`, call the
//    matching handler, and return a `DeliveryResult`.
// 4. `summarise` must aggregate an array of `DeliveryResult` into
//    a `DeliverySummary` using a single-pass reduce (no extra loops).
// 5. No `any`, no type assertions (`as`), no non-null assertions (`!`).
// ============================================================

// ── Channel literals ─────────────────────────────────────────
export type Channel = "email" | "push" | "sms";

// ── TODO 1 ───────────────────────────────────────────────────
// Define three event shapes and combine them into one
// discriminated union called `NotificationEvent`.
//
// EmailEvent  – channel: "email" | to: string | subject: string | body: string
// PushEvent   – channel: "push"  | deviceToken: string | title: string | payload: Record<string, string>
// SmsEvent    – channel: "sms"   | phoneNumber: string | message: string

export type EmailEvent = {
  // TODO: fill in fields
};

export type PushEvent = {
  // TODO: fill in fields
};

export type SmsEvent = {
  // TODO: fill in fields
};

export type NotificationEvent = EmailEvent | PushEvent | SmsEvent;

// ── Delivery result ───────────────────────────────────────────
export type DeliveryStatus = "sent" | "failed" | "skipped";

export type DeliveryResult = {
  channel: Channel;
  status: DeliveryStatus;
  /** Optional human-readable message, e.g. error reason or recipient info */
  message?: string;
};

// ── Delivery summary ──────────────────────────────────────────
export type DeliverySummary = {
  total: number;
  /** Count per status */
  counts: Record<DeliveryStatus, number>;
  /** Results grouped by channel */
  byChannel: Partial<Record<Channel, DeliveryResult[]>>;
};

// ── TODO 2 ───────────────────────────────────────────────────
// Define `HandlerMap` — a mapped type where each key is a Channel
// and its value is a function that receives the *specific* event
// type for that channel and returns a DeliveryResult.
//
// Hint: you'll need a helper conditional/mapped type that maps a
// Channel string to its corresponding event type.

export type ChannelEventMap = {
  // TODO: map each Channel key to its event type
  //   email -> EmailEvent
  //   push  -> PushEvent
  //   sms   -> SmsEvent
};

export type HandlerMap = {
  // TODO: for each Channel K, the handler receives ChannelEventMap[K]
};

// ── TODO 3 ───────────────────────────────────────────────────
// Implement `createRouter`.
// It accepts a complete `HandlerMap` and returns an object with
// a single method: `route(event: NotificationEvent): DeliveryResult`.

export function createRouter(handlers: HandlerMap): {
  route(event: NotificationEvent): DeliveryResult;
} {
  // TODO: implement — narrow the event by `channel`, delegate to the
  // correct handler, return its DeliveryResult.
  throw new Error("Not implemented");
}

// ── TODO 4 ───────────────────────────────────────────────────
// Implement `summarise`.
// Must use a SINGLE Array.prototype.reduce call — no extra
// forEach / map / filter loops.

export function summarise(results: DeliveryResult[]): DeliverySummary {
  // TODO: implement
  throw new Error("Not implemented");
}
