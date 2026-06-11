// ============================================================
// Test Harness: challenge.test.ts
// Run: npx ts-node --strict challenge.test.ts
// ============================================================

import {
  parseSensorReading,
  aggregateReadings,
  processRawFeed,
  type SensorReading,
  type FeedReport,
  type DeviceAggregation,
} from "./challenge";

// ---- Mock data ---------------------------------------------

const validTemperature = {
  deviceId: "sensor-A",
  timestamp: 1_000,
  kind: "temperature",
  value: 22.5,
};

const validHumidity = {
  deviceId: "sensor-A",
  timestamp: 2_000,
  kind: "humidity",
  value: 55.0,
};

const validPressure = {
  deviceId: "sensor-B",
  timestamp: 1_500,
  kind: "pressure",
  value: 1013.25,
};

const anotherTemperature = {
  deviceId: "sensor-A",
  timestamp: 3_000,
  kind: "temperature",
  value: 24.5,
};

const invalidMissingDeviceId = {
  timestamp: 1_000,
  kind: "temperature",
  value: 22.5,
};

const invalidBadKind = {
  deviceId: "sensor-C",
  timestamp: 1_000,
  kind: "wind_speed",
  value: 10,
};

const invalidValueNotNumber = {
  deviceId: "sensor-D",
  timestamp: 1_000,
  kind: "humidity",
  value: "high",
};

// ---- Test 1: parseSensorReading — valid input ---------------

const r1 = parseSensorReading(validTemperature);
console.assert(r1.ok === true, "Test 1a FAILED: valid temperature should parse ok");
if (r1.ok) {
  console.assert(
    r1.value.kind === "temperature",
    "Test 1b FAILED: kind should be 'temperature'"
  );
  console.assert(
    r1.value.deviceId === "sensor-A",
    "Test 1c FAILED: deviceId should be 'sensor-A'"
  );
}

// ---- Test 2: parseSensorReading — invalid inputs -----------

const r2 = parseSensorReading(invalidMissingDeviceId);
console.assert(r2.ok === false, "Test 2a FAILED: missing deviceId should fail");
if (!r2.ok) {
  console.assert(
    r2.error.kind === "missing_field" || r2.error.kind === "wrong_type",
    "Test 2b FAILED: error kind should be missing_field or wrong_type"
  );
}

const r3 = parseSensorReading(invalidBadKind);
console.assert(r3.ok === false, "Test 3a FAILED: unknown kind should fail");
if (!r3.ok) {
  console.assert(
    r3.error.kind === "unknown_kind",
    "Test 3b FAILED: error kind should be unknown_kind"
  );
}

const r4 = parseSensorReading(invalidValueNotNumber);
console.assert(r4.ok === false, "Test 4 FAILED: non-number value should fail");

// ---- Test 3: aggregateReadings -----------------------------

const readings: SensorReading[] = [
  validTemperature as SensorReading,
  anotherTemperature as SensorReading,
  validHumidity as SensorReading,
  validPressure as SensorReading,
];

// Re-parse to get properly typed SensorReadings
const parsedReadings: SensorReading[] = [
  validTemperature,
  anotherTemperature,
  validHumidity,
  validPressure,
].reduce<SensorReading[]>((acc, raw) => {
  const result = parseSensorReading(raw);
  if (result.ok) acc.push(result.value);
  return acc;
}, []);

const agg: DeviceAggregation = aggregateReadings(parsedReadings);

console.assert("sensor-A" in agg, "Test 5a FAILED: sensor-A should be in aggregation");
console.assert("sensor-B" in agg, "Test 5b FAILED: sensor-B should be in aggregation");

const sensorA = agg["sensor-A"];
console.assert(
  sensorA !== undefined,
  "Test 5c FAILED: sensor-A summary should exist"
);
if (sensorA) {
  console.assert(
    sensorA.temperature !== undefined,
    "Test 5d FAILED: sensor-A should have temperature stats"
  );
  console.assert(
    sensorA.humidity !== undefined,
    "Test 5e FAILED: sensor-A should have humidity stats"
  );
  console.assert(
    sensorA.temperature?.count === 2,
    `Test 5f FAILED: temperature count should be 2, got ${sensorA.temperature?.count}`
  );
  console.assert(
    sensorA.temperature?.min === 22.5,
    `Test 5g FAILED: temperature min should be 22.5, got ${sensorA.temperature?.min}`
  );
  console.assert(
    sensorA.temperature?.max === 24.5,
    `Test 5h FAILED: temperature max should be 24.5, got ${sensorA.temperature?.max}`
  );
  console.assert(
    sensorA.temperature?.avg === 23.5,
    `Test 5i FAILED: temperature avg should be 23.5, got ${sensorA.temperature?.avg}`
  );
  console.assert(
    sensorA.firstSeen === 1_000,
    `Test 5j FAILED: firstSeen should be 1000, got ${sensorA.firstSeen}`
  );
  console.assert(
    sensorA.lastSeen === 3_000,
    `Test 5k FAILED: lastSeen should be 3000, got ${sensorA.lastSeen}`
  );
  // sensor-A has no pressure readings — key should be absent
  console.assert(
    sensorA.pressure === undefined,
    "Test 5l FAILED: sensor-A should NOT have pressure stats"
  );
}

// ---- Test 4: processRawFeed --------------------------------

const rawFeed: unknown[] = [
  validTemperature,
  validHumidity,
  validPressure,
  anotherTemperature,
  invalidMissingDeviceId,
  invalidBadKind,
  invalidValueNotNumber,
  null,
  42,
];

const report: FeedReport = processRawFeed(rawFeed);

console.assert(
  report.totalReceived === 9,
  `Test 6a FAILED: totalReceived should be 9, got ${report.totalReceived}`
);
console.assert(
  report.totalValid === 4,
  `Test 6b FAILED: totalValid should be 4, got ${report.totalValid}`
);
console.assert(
  report.errors.length === 5,
  `Test 6c FAILED: errors.length should be 5, got ${report.errors.length}`
);
console.assert(
  "sensor-A" in report.aggregation,
  "Test 6d FAILED: sensor-A should appear in feed report aggregation"
);

console.log("All tests completed — check for any FAILED assertions above.");
