// ============================================================
// Typed Notification Router — challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every section marked TODO.
// ============================================================

// ── 1. Channel discriminated union ───────────────────────────
// Each notification targets exactly one channel.
// The `channel` field is the discriminant.

export type EmailPayload = {
  channel: "email";
  to: string;          // must contain "@"
  subject: string;     // non-empty
  body: string;        // non-empty
};

export type SmsPayload = {
  channel: "sms";
  to: string;          // E.164 format: starts with "+", digits only after, 7-15 digits
  body: string;        // non-empty, max 160 chars
};

export type PushPayload = {
  channel: "push";
  deviceToken: string; // non-empty hex string (only 0-9, a-f, A-F), exactly 64 chars
  title: string;       // non-empty
  body: string;        // non-empty
};

export type WebhookPayload = {
  channel: "webhook";
  url: string;         // must start with "https://"
  eventType: string;   // non-empty
  data: Record<string, string | number | boolean>;
};

export type NotificationPayload =
  | EmailPayload
  | SmsPayload
  | PushPayload
  | WebhookPayload;

// ── 2. Delivery result discriminated union ───────────────────

export type DeliverySuccess = {
  status: "delivered";
  channel: NotificationPayload["channel"];
  deliveredAt: string; // ISO timestamp
};

export type DeliveryFailure = {
  status: "failed";
  channel: NotificationPayload["channel"] | "unknown";
  reason: string;
};

export type DeliveryResult = DeliverySuccess | DeliveryFailure;

// ── 3. Dispatch report ───────────────────────────────────────

export type DispatchReport = {
  total: number;
  delivered: number;
  failed: number;
  results: DeliveryResult[];
};

// ── 4. Channel handler type ──────────────────────────────────
// TODO: Define a generic `ChannelHandler<T>` type.
//   It is a function that receives a validated payload of type T
//   and returns a Promise<DeliveryResult>.
//   Requirement: T must be constrained to NotificationPayload.

export type ChannelHandler<T extends NotificationPayload> = (
  payload: T
) => Promise<DeliveryResult>;

// ── 5. Handler registry ──────────────────────────────────────
// TODO: Define `HandlerRegistry` as a mapped type over the
//   channel discriminant ("email" | "sms" | "push" | "webhook").
//   Each key must map to the ChannelHandler for the *exact*
//   NotificationPayload variant whose `channel` matches that key.
//
//   Hint: use `Extract<NotificationPayload, { channel: K }>` to
//   pick the right variant per key K.

export type HandlerRegistry = {
  // TODO — replace this comment with the mapped type body
  [K in NotificationPayload["channel"]]: ChannelHandler<
    Extract<NotificationPayload, { channel: K }>
  >;
};

// ── 6. Runtime validation ────────────────────────────────────
// TODO: Implement `validatePayload`.
//   - Accepts a value of type `unknown`.
//   - Returns `NotificationPayload` on success or throws a
//     descriptive `Error` on failure.
//   - Must validate:
//       • `channel` is one of "email" | "sms" | "push" | "webhook"
//       • All required string fields are non-empty strings
//       • Channel-specific rules (see type comments above):
//           email  → `to` contains "@"
//           sms    → `to` matches /^\+\d{7,15}$/
//           push   → `deviceToken` is exactly 64 hex chars /^[0-9a-fA-F]{64}$/
//           webhook→ `url` starts with "https://"
//           sms    → `body` ≤ 160 chars

export function validatePayload(raw: unknown): NotificationPayload {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. Router ────────────────────────────────────────────────
// TODO: Implement `routeNotifications`.
//   - Accepts:
//       • `rawPayloads: unknown[]`  — unvalidated items from the queue
//       • `registry: HandlerRegistry` — channel handlers
//   - For each item:
//       1. Validate it with `validatePayload` (catch errors → DeliveryFailure)
//       2. Dispatch to the matching handler from the registry
//          (handler errors should also produce a DeliveryFailure)
//   - All dispatches must run CONCURRENTLY (Promise.all / allSettled).
//   - Returns a `Promise<DispatchReport>` aggregating all results.
//
//   Requirements:
//   • Use `Promise.allSettled` so one failure never cancels the others.
//   • The `deliveredAt` timestamp for successes must be an ISO string
//     (new Date().toISOString()).
//   • Failures must capture the error message as `reason`.

export async function routeNotifications(
  rawPayloads: unknown[],
  registry: HandlerRegistry
): Promise<DispatchReport> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Registry builder helper ───────────────────────────────
// TODO: Implement `createRegistry`.
//   - Accepts a value that must satisfy HandlerRegistry.
//   - Returns it unchanged (use `satisfies` so the inferred type
//     stays narrow while still being checked against HandlerRegistry).
//   - This is a one-liner.

export function createRegistry(registry: HandlerRegistry): HandlerRegistry {
  // TODO
  throw new Error("Not implemented");
}
