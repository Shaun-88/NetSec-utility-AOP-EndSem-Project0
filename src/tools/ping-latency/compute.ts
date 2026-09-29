import type { PingProbeResult, PingLatencyData } from "./types";

/**
 * Calculates median value of an array of numbers.
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculates mean jitter (mean absolute deviation of consecutive delays).
 * RFC 3550 / IPPM standard approach.
 */
function calculateJitter(values: number[]): number {
  if (values.length < 2) return 0;
  let totalDiff = 0;
  for (let i = 1; i < values.length; i++) {
    totalDiff += Math.abs(values[i] - values[i - 1]);
  }
  return totalDiff / (values.length - 1);
}

/**
 * Pure compute function for Ping / Latency Checker.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computePingLatencyData(
  target: string,
  probes: PingProbeResult[],
  resolvedIp?: string,
): PingLatencyData {
  const successfulProbes = probes.filter((p) => p.success);
  const durations = successfulProbes.map((p) => p.durationMs);

  const probesSent = probes.length;
  const probesReceived = successfulProbes.length;
  const packetLossPercent =
    probesSent > 0 ? ((probesSent - probesReceived) / probesSent) * 100 : 0;

  let minLatencyMs = 0;
  let maxLatencyMs = 0;
  let avgLatencyMs = 0;
  let medianLatencyMs = 0;
  let jitterMs = 0;

  if (durations.length > 0) {
    minLatencyMs = Math.round(Math.min(...durations) * 10) / 10;
    maxLatencyMs = Math.round(Math.max(...durations) * 10) / 10;
    avgLatencyMs =
      Math.round(
        (durations.reduce((sum, d) => sum + d, 0) / durations.length) * 10,
      ) / 10;
    medianLatencyMs = Math.round(calculateMedian(durations) * 10) / 10;
    jitterMs = Math.round(calculateJitter(durations) * 10) / 10;
  }

  let rating: PingLatencyData["rating"] = "Excellent";
  if (packetLossPercent > 20 || avgLatencyMs > 250) {
    rating = "Poor";
  } else if (packetLossPercent > 0 || avgLatencyMs > 120) {
    rating = "Fair";
  } else if (avgLatencyMs > 60) {
    rating = "Good";
  }

  return {
    target,
    resolvedIp,
    probesSent,
    probesReceived,
    packetLossPercent: Math.round(packetLossPercent * 10) / 10,
    minLatencyMs,
    maxLatencyMs,
    avgLatencyMs,
    medianLatencyMs,
    jitterMs,
    rating,
    probes,
  };
}
