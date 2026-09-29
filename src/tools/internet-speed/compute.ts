import type { SpeedTestOutputData } from "./types";

/**
 * Calculates megabits per second (Mbps) from bytes and milliseconds.
 */
export function calculateMbps(bytes: number, durationMs: number): number {
  if (durationMs <= 0 || bytes <= 0) return 0;
  const bits = bytes * 8;
  const seconds = durationMs / 1000;
  const mbps = bits / (seconds * 1_000_000);
  return Math.round(mbps * 100) / 100;
}

/**
 * Determines internet bandwidth service tier based on download capacity.
 */
function getBandwidthTier(downloadMbps: number): SpeedTestOutputData["tier"] {
  if (downloadMbps >= 250) return "Ultra Gigabit";
  if (downloadMbps >= 80) return "Fast Broadband";
  if (downloadMbps >= 25) return "Standard Broadband";
  if (downloadMbps >= 10) return "Basic";
  return "Constrained";
}

export interface RawSpeedMeasurements {
  downloadBytes: number;
  downloadDurationMs: number;
  uploadBytes: number;
  uploadDurationMs: number;
  latencyMs: number;
  jitterMs: number;
}

/**
 * Pure compute function for Internet Speed Test.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeSpeedTestData(raw: RawSpeedMeasurements): SpeedTestOutputData {
  const downloadMbps = calculateMbps(raw.downloadBytes, raw.downloadDurationMs);
  const uploadMbps = calculateMbps(raw.uploadBytes, raw.uploadDurationMs);
  const totalDurationSeconds =
    Math.round(((raw.downloadDurationMs + raw.uploadDurationMs) / 1000) * 10) / 10;

  return {
    downloadMbps,
    uploadMbps,
    latencyMs: Math.round(raw.latencyMs * 10) / 10,
    jitterMs: Math.round(raw.jitterMs * 10) / 10,
    bytesDownloaded: raw.downloadBytes,
    bytesUploaded: raw.uploadBytes,
    durationSeconds: totalDurationSeconds,
    tier: getBandwidthTier(downloadMbps),
    testedAt: new Date().toISOString(),
  };
}
