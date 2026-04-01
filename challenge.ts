// ─── challenge.ts ────────────────────────────────────────────────────────────
// Typed Notification Dispatcher
//
// SCENARIO: You are building the notification dispatch layer for a SaaS
// platform. Notifications are strongly typed by channel, deliveries fan out
// concurrently (up to a configurable limit), and every outcome is captured in
// a typed Result<T, E> — never throwing, never using `any`.
//
// ─── REQUIREMENTS ────────────────────────────────────────────────────────────
// 1. Define the discriminated-union `Notification` type that covers all three
//    channels: "email", "sms", and "push". Each channel carries its own
//    channel-specific fields (see stubs below).
// 2. Implement `validateNotification` that narrows an `unknown` input to a
//    `Notification` and returns `Result<Notification, ValidationError>`.
// 3. Implement `dispatch` that calls the appropriate `ChannelSender` for a
//    `Notification` and returns `Promise<Result<DispatchReceipt, DispatchError>>`.
// 4. Implement `fanOutDispatch` that accepts a list of raw unknown payloads and
//    a `DispatchConfig`, validates each one, fans out the dispatches
//    concurrently (honouring `config.concurrencyLimit`), and returns a
//    `Promise<DispatchSummary>`.
// 5. `DispatchSummary` must be derived from `Result` via mapped/utility types —
//    do NOT define it as a plain hand-written interface (see stub hint).
// ─────────────────────────────────────────────────────────────────────────────

// ── Branded primitive ─────────────────────────────────────────────────────────
type Brand<T, B extends string> = T & { readonly __brand: B };

export type RecipientId = Brand<string, "RecipientId">;
export type NotificationId = Brand<string, "NotificationId">;

// ── Result<T, E> ──────────────────────────────────────────────────────────────
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ── Notification channels (discriminated union) ───────────────────────────────
// TODO 1: Fill in the channel-specific fields for each variant.
//   • EmailNotification  – id, channel: "email", recipientId, toAddress (string), subject (string), body (string)
//   • SmsNotification    – id, channel: "sms",   recipientId, phoneNumber (string), text (string)
//   • PushNotification   – id, channel: "push",  recipientId, deviceToken (string), title (string), payload (Record<string, string>)
//   All three share: id: NotificationId, recipientId: RecipientId

export type EmailNotification = {
  // TODO
};

export type SmsNotification = {
  // TODO
};

export type PushNotification = {
  // TODO
};

export type Notification = EmailNotification | SmsNotification | PushNotification;

// ── Errors ────────────────────────────────────────────────────────────────────
export type ValidationError = {
  readonly kind: "ValidationError";
  readonly field: string;
  readonly message: string;
};

export type DispatchError = {
  readonly kind: "DispatchError";
  readonly channel: Notification["channel"];
  readonly reason: string;
};

// ── Receipts ──────────────────────────────────────────────────────────────────
export type DispatchReceipt = {
  readonly notificationId: NotificationId;
  readonly recipientId: RecipientId;
  readonly channel: Notification["channel"];
  readonly dispatchedAt: Date;
};

// ── Channel senders ───────────────────────────────────────────────────────────
// A ChannelSender is generic over the specific notification sub-type.
export type ChannelSender<N extends Notification> = (
  notification: N
) => Promise<Result<DispatchReceipt, DispatchError>>;

// TODO 2: Define `ChannelSenders` as a mapped type over each channel string
// ("email" | "sms" | "push") that maps to the correct ChannelSender variant.
// Hint: use a conditional type or Extract<Notification, { channel: K }> to
// select the right Notification sub-type for each key K.
export type ChannelSenders = {
  // TODO — must be a mapped/conditional type, not three hand-written properties
};

// ── Dispatch config ───────────────────────────────────────────────────────────
export type DispatchConfig = {
  readonly concurrencyLimit: number;
  readonly senders: ChannelSenders;
};

// ── DispatchSummary ───────────────────────────────────────────────────────────
// TODO 3: Define DispatchSummary using utility/mapped types derived from Result.
// It must contain:
//   • results: ReadonlyArray<Result<DispatchReceipt, ValidationError | DispatchError>>
//   • succeeded: number   (count of ok: true entries)
//   • failed: number      (count of ok: false entries)
// Constraint: the element type of `results` must reuse Result<…> — do not
// inline { ok: true; … } | { ok: false; … } by hand.
export type DispatchSummary = {
  // TODO
};

// ── Function stubs ────────────────────────────────────────────────────────────

/**
 * TODO 4 – Requirement 2
 * Validate an `unknown` value and narrow it to a `Notification`.
 * Return Result<Notification, ValidationError>.
 *
 * Rules:
 *  - Must be a plain object with a string `channel` field.
 *  - `channel` must be one of "email" | "sms" | "push".
 *  - `id` must be a non-empty string (brand it as NotificationId).
 *  - `recipientId` must be a non-empty string (brand it as RecipientId).
 *  - Channel-specific required fields must be non-empty strings
 *    (for push: `payload` must be a Record<string, string>).
 *  - Return the FIRST validation failure found.
 */
export function validateNotification(
  raw: unknown
): Result<Notification, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO 5 – Requirement 3
 * Dispatch a single validated Notification using the matching ChannelSender
 * from `senders`.
 * Return Promise<Result<DispatchReceipt, DispatchError>>.
 */
export async function dispatch(
  notification: Notification,
  senders: ChannelSenders
): Promise<Result<DispatchReceipt, DispatchError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO 6 – Requirement 4 & 5
 * Fan out dispatch for an array of raw unknown payloads.
 *
 * Steps:
 *  1. Validate each payload with `validateNotification`.
 *     - If invalid, record Result<never, ValidationError> in results.
 *  2. For valid notifications, dispatch concurrently honouring
 *     `config.concurrencyLimit` (process in batches of that size).
 *  3. Collect every outcome into `DispatchSummary`.
 */
export async function fanOutDispatch(
  rawPayloads: readonly unknown[],
  config: DispatchConfig
): Promise<DispatchSummary> {
  // TODO
  throw new Error("Not implemented");
}
