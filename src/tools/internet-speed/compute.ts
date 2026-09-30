import type {
  SpeedTestOutputData,
  PracticalCategory,
  SpeedHistoryPoint,
  SpeedUnit,
} from "./types";

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
 * Formats a speed value into Mbps or Gbps string representation.
 */
export function formatSpeed(mbps: number, unit: SpeedUnit): string {
  if (unit === "Gbps") {
    return (mbps / 1000).toFixed(2);
  }
  return mbps.toFixed(1);
}

/**
 * Determines internet bandwidth service tier based on download capacity.
 */
export function getBandwidthTier(downloadMbps: number): SpeedTestOutputData["tier"] {
  if (downloadMbps >= 250) return "Ultra Gigabit";
  if (downloadMbps >= 80) return "Fast Broadband";
  if (downloadMbps >= 25) return "Standard Broadband";
  if (downloadMbps >= 10) return "Basic";
  return "Constrained";
}

/**
 * Determines overall quality rating based on download throughput and latency.
 */
export function getQualityRating(
  downloadMbps: number,
  latencyMs: number,
): SpeedTestOutputData["rating"] {
  if (downloadMbps >= 100 && latencyMs <= 30) return "Optimal";
  if (downloadMbps >= 25 && latencyMs <= 70) return "Good";
  if (downloadMbps >= 10 && latencyMs <= 120) return "Fair";
  return "Poor";
}

/**
 * Computes practical suitability categories for everyday non-IT use cases.
 */
export function calculatePracticalCategories(
  downloadMbps: number,
  uploadMbps: number,
  latencyMs: number,
  jitterMs: number,
): PracticalCategory[] {
  // 1. Gaming
  let gamingStatus: PracticalCategory["status"] = "poor";
  let gamingLabel = "High Lag Expected";
  let gamingExpl = "Ping exceeds 100ms or speed is too low; competitive gaming will experience significant delay.";

  if (latencyMs <= 35 && jitterMs <= 12 && downloadMbps >= 20 && uploadMbps >= 3) {
    gamingStatus = "excellent";
    gamingLabel = "Ideal for Competitive Gaming";
    gamingExpl = "Ultra-low latency with minimal jitter ensures instant reaction times in fast multiplayer games.";
  } else if (latencyMs <= 65 && downloadMbps >= 10 && uploadMbps >= 2) {
    gamingStatus = "good";
    gamingLabel = "Good for Online Gaming";
    gamingExpl = "Responsive connection suitable for co-op games, console gaming, and casual multiplayer.";
  } else if (latencyMs <= 100 && downloadMbps >= 5) {
    gamingStatus = "marginal";
    gamingLabel = "Playable with Minor Delays";
    gamingExpl = "Suitable for turn-based or casual games, but you may notice occasional latency spikes.";
  }

  // 2. 1080p HD Streaming
  let stream1080Status: PracticalCategory["status"] = "poor";
  let stream1080Label = "Frequent Buffering";
  let stream1080Expl = "Under 3 Mbps; HD video streams will frequently pause to buffer.";

  if (downloadMbps >= 20) {
    stream1080Status = "excellent";
    stream1080Label = "Seamless on Multiple Screens";
    stream1080Expl = "Ample bandwidth to stream 1080p HD on 3 or more devices simultaneously without buffering.";
  } else if (downloadMbps >= 5) {
    stream1080Status = "good";
    stream1080Label = "Good for Single-Screen HD";
    stream1080Expl = "Meets and exceeds Netflix/YouTube HD recommendations for a crisp 1080p experience.";
  } else if (downloadMbps >= 3) {
    stream1080Status = "marginal";
    stream1080Label = "Standard Quality / Occasional Buffer";
    stream1080Expl = "Can stream 720p or 1080p with occasional pauses if other apps use bandwidth.";
  }

  // 3. 4K Ultra HD Streaming
  let stream4kStatus: PracticalCategory["status"] = "poor";
  let stream4kLabel = "Not Recommended for 4K";
  let stream4kExpl = "Bandwidth is below the 15 Mbps threshold needed for Ultra HD video streams.";

  if (downloadMbps >= 50) {
    stream4kStatus = "excellent";
    stream4kLabel = "Flawless 4K Ultra HD";
    stream4kExpl = "More than double the 25 Mbps requirement; provides pristine 4K HDR playback with instant buffering.";
  } else if (downloadMbps >= 25) {
    stream4kStatus = "good";
    stream4kLabel = "Ready for 4K UHD";
    stream4kExpl = "Meets the official 25 Mbps requirement for streaming 4K Ultra HD on a smart TV.";
  } else if (downloadMbps >= 15) {
    stream4kStatus = "marginal";
    stream4kLabel = "Borderline for 4K";
    stream4kExpl = "May start in 4K but frequently drop down to 1080p if any background network activity occurs.";
  }

  // 4. Video Conferencing / Work Calls
  let callStatus: PracticalCategory["status"] = "poor";
  let callLabel = "Stuttering & Audio Drops";
  let callExpl = "Insufficient upload or download bandwidth for clear video conference calls.";

  if (downloadMbps >= 15 && uploadMbps >= 5 && latencyMs <= 50) {
    callStatus = "excellent";
    callLabel = "Broadcast-Quality Video Calls";
    callExpl = "Crystal clear Zoom, Google Meet, or Teams video with seamless screen sharing and zero audio stutter.";
  } else if (downloadMbps >= 4 && uploadMbps >= 1.5 && latencyMs <= 90) {
    callStatus = "good";
    callLabel = "Good for HD Video Meetings";
    callExpl = "Reliable 720p/1080p video calls with stable bidirectional audio.";
  } else if (downloadMbps >= 2 && uploadMbps >= 0.8 && latencyMs <= 140) {
    callStatus = "marginal";
    callLabel = "Audio Clear, Low-Res Video";
    callExpl = "Acceptable for voice meetings, but video quality or screen sharing may degrade.";
  }

  return [
    {
      id: "gaming",
      title: "Online Gaming",
      status: gamingStatus,
      label: gamingLabel,
      explanation: gamingExpl,
    },
    {
      id: "streaming1080p",
      title: "1080p HD Streaming",
      status: stream1080Status,
      label: stream1080Label,
      explanation: stream1080Expl,
    },
    {
      id: "streaming4k",
      title: "4K Ultra HD Streaming",
      status: stream4kStatus,
      label: stream4kLabel,
      explanation: stream4kExpl,
    },
    {
      id: "videoCalls",
      title: "Video Calls (Zoom / Meet)",
      status: callStatus,
      label: callLabel,
      explanation: callExpl,
    },
  ];
}

export interface RawSpeedMeasurements {
  downloadBytes: number;
  downloadDurationMs: number;
  uploadBytes: number;
  uploadDurationMs: number;
  latencyMs: number;
  jitterMs: number;
  downloadTimeline?: SpeedHistoryPoint[];
  uploadTimeline?: SpeedHistoryPoint[];
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

  // Synthesize timeline samples if not passed in
  const downloadTimeline: SpeedHistoryPoint[] =
    raw.downloadTimeline && raw.downloadTimeline.length > 0
      ? raw.downloadTimeline
      : Array.from({ length: 10 }, (_, i) => ({
          second: i + 1,
          mbps: Math.round(downloadMbps * (0.85 + (i * 0.03) % 0.25) * 10) / 10,
        }));

  const uploadTimeline: SpeedHistoryPoint[] =
    raw.uploadTimeline && raw.uploadTimeline.length > 0
      ? raw.uploadTimeline
      : Array.from({ length: 10 }, (_, i) => ({
          second: i + 1,
          mbps: Math.round(uploadMbps * (0.82 + (i * 0.035) % 0.28) * 10) / 10,
        }));

  return {
    downloadMbps,
    uploadMbps,
    latencyMs: Math.round(raw.latencyMs * 10) / 10,
    jitterMs: Math.round(raw.jitterMs * 10) / 10,
    bytesDownloaded: raw.downloadBytes,
    bytesUploaded: raw.uploadBytes,
    durationSeconds: totalDurationSeconds,
    tier: getBandwidthTier(downloadMbps),
    rating: getQualityRating(downloadMbps, raw.latencyMs),
    practicalCategories: calculatePracticalCategories(
      downloadMbps,
      uploadMbps,
      raw.latencyMs,
      raw.jitterMs,
    ),
    downloadTimeline,
    uploadTimeline,
    testedAt: new Date().toISOString(),
  };
}

