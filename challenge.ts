// ============================================================
// Challenge: Typed Real-Time Sensor Stream Aggregator
// Date: 2026-06-11 | Difficulty: Medium
// ============================================================
//
// SCENARIO
// --------
// Raw sensor readings arrive as `unknown` from a WebSocket feed.
// You must validate each reading, narrow it to its correct
// discriminated-union variant, aggregate the readings per device,
// and produce a strongly-typed summary report.
//
// REQUIREMENTS
// ------------
// 1. Define a discriminated union `SensorReading` covering three
//    metric kinds: "temperature", "humidity", and "pressure".
//    Each variant carries: deviceId (string), timestamp (number),
//    kind (the discriminant), and value (number).
//
// 2. Implement `parseSensorReading(raw: unknown): Result<SensorReading, ParseError>`
//    that validates a raw value and narrows it to `SensorReading`,
//    returning a typed Result — never throw, never use `any`.
//
// 3. Define `DeviceSummary` — a mapped type keyed by SensorKind
//    where each key maps to `MetricStats` (count, min, max, avg).
//    A device summary also carries `deviceId: string` and
//    `firstSeen: number` / `lastSeen: number`.
//
// 4. Implement `aggregateReadings(readings: SensorReading[]): DeviceAggregation`
//    where `DeviceAggregation` is `Record<string, DeviceSummary>`.
//    - Group readings by `deviceId`
//    - For each device, compute MetricStats for each kind present
//    - Track firstSeen / lastSeen timestamps across ALL readings
//      for that device (regardless of kind)
//    - If a device has no readings for a given kind, omit that key
//      (use Partial over the mapped metric keys)
//
// 5. Implement `processRawFeed(rawItems: unknown[]): FeedReport`
//    that parses every item, collects parse errors, aggregates
//    the valid readings, and returns a `FeedReport` containing:
//    - `aggregation: DeviceAggregation`
//    - `errors: ParseError[]`
//    - `totalReceived: number`
//    - `totalValid: number`
//
// ============================================================

// ------ Result monad ----------------------------------------

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

// ------ Error type ------------------------------------------

export type ParseError = {
  readonly kind: "missing_field" | "wrong_type" | "unknown_kind";
  readonly field?: string;
  readonly message: string;
};

// ------ Sensor domain types ---------------------------------

// TODO 1: Define the SensorKind union type
//   "temperature" | "humidity" | "pressure"
export type SensorKind = /* TODO */ never;

// TODO 1: Define each variant of SensorReading using a
//   discriminated union on the `kind` field.
//   Each variant must have: deviceId, timestamp, kind, value.
export type TemperatureReading = {
  // TODO
};

export type HumidityReading = {
  // TODO
};

export type PressureReading = {
  // TODO
};

export type SensorReading = TemperatureReading | HumidityReading | PressureReading;

// ------ Aggregation types -----------------------------------

// TODO 3: Define MetricStats
export type MetricStats = {
  // TODO: count, min, max, avg
};

// TODO 3: Define DeviceSummary using a mapped type over SensorKind
//   for the metric fields (make them Partial/optional since a device
//   may not report every kind), plus deviceId, firstSeen, lastSeen.
export type DeviceSummary = {
  deviceId: string;
  firstSeen: number;
  lastSeen: number;
} & Partial<{
  // TODO: mapped type — [K in SensorKind]: MetricStats
}>;

export type DeviceAggregation = Record<string, DeviceSummary>;

// ------ Feed report -----------------------------------------

export type FeedReport = {
  aggregation: DeviceAggregation;
  errors: ParseError[];
  totalReceived: number;
  totalValid: number;
};

// ------ Functions to implement ------------------------------

/**
 * TODO 2: Validate `raw` and return Ok<SensorReading> or Err<ParseError>.
 *
 * Validation rules:
 *  - Must be a non-null object
 *  - `deviceId` must be a non-empty string
 *  - `timestamp` must be a finite number
 *  - `kind` must be one of the SensorKind values
 *  - `value` must be a finite number
 *
 * Return the first validation error encountered.
 */
export function parseSensorReading(raw: unknown): Result<SensorReading, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO 4: Group readings by deviceId and compute MetricStats
 * for each SensorKind present on that device.
 * Track firstSeen / lastSeen across all readings for a device.
 */
export function aggregateReadings(readings: SensorReading[]): DeviceAggregation {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO 5: Parse every item in rawItems, collect errors,
 * aggregate valid readings, and return a FeedReport.
 */
export function processRawFeed(rawItems: unknown[]): FeedReport {
  // TODO
  throw new Error("Not implemented");
}
