import type { PingProbeResult, PingLatencyData, PingActivityRating } from "./types";

/**
 * Calculates median value of an array of numbers.
 */
export function calculateMedian(values: number[]): number {
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
export function calculateJitter(values: number[]): number {
  if (values.length < 2) return 0;
  let totalDiff = 0;
  for (let i = 1; i < values.length; i++) {
    totalDiff += Math.abs(values[i] - values[i - 1]);
  }
  return totalDiff / (values.length - 1);
}

/**
 * Evaluates real-world activity suitability for gaming, conferencing, VoIP, and browsing.
 */
export function evaluateActivities(
  medianMs: number,
  jitterMs: number,
  lossPercent: number,
): PingActivityRating[] {
  // 1. Competitive Gaming
  let gamingStatus: PingActivityRating["status"] = "Degraded";
  let gamingExp = "Elevated lag and packet drop will cause rubber-banding and missed inputs.";
  if (lossPercent === 0 && medianMs <= 40 && jitterMs <= 10) {
    gamingStatus = "Optimal";
    gamingExp = "Ultra-low delay with minimal jitter. Ideal for competitive FPS and fast-paced multiplayer gaming.";
  } else if (lossPercent === 0 && medianMs <= 75 && jitterMs <= 20) {
    gamingStatus = "Good";
    gamingExp = "Smooth gaming experience for most online multiplayer titles.";
  } else if (lossPercent <= 5 && medianMs <= 120) {
    gamingStatus = "Acceptable";
    gamingExp = "Playable, though occasional hit registration delays or mild stutter may occur.";
  }

  // 2. Video Conferencing (Zoom / Teams / Meet)
  let confStatus: PingActivityRating["status"] = "Degraded";
  let confExp = "Audio stutter, robotic voice artifacts, or frozen screens likely.";
  if (lossPercent === 0 && medianMs <= 80 && jitterMs <= 15) {
    confStatus = "Optimal";
    confExp = "Fluid video and instantaneous speech sync with zero dropped frames.";
  } else if (lossPercent === 0 && medianMs <= 140 && jitterMs <= 25) {
    confStatus = "Good";
    confExp = "Clear audio and video with virtually no perceptible lag.";
  } else if (lossPercent <= 5 && medianMs <= 200) {
    confStatus = "Acceptable";
    confExp = "Minor audio pauses or occasional video resolution adjustments may occur.";
  }

  // 3. Voice Calls (VoIP / Discord)
  let voipStatus: PingActivityRating["status"] = "Degraded";
  let voipExp = "Choppy audio and frequent dropped syllables due to packet loss or jitter.";
  if (lossPercent === 0 && medianMs <= 60 && jitterMs <= 10) {
    voipStatus = "Optimal";
    voipExp = "Immediate voice transmission with no awkward speaking collisions.";
  } else if (lossPercent === 0 && medianMs <= 120 && jitterMs <= 20) {
    voipStatus = "Good";
    voipExp = "Clear, natural conversation flow.";
  } else if (lossPercent <= 5 && medianMs <= 180) {
    voipStatus = "Acceptable";
    voipExp = "Slight voice delay, but communication remains fully understandable.";
  }

  // 4. Web Browsing & Cloud Apps
  let browsingStatus: PingActivityRating["status"] = "Degraded";
  let browsingExp = "Slow site load times, dropped requests, and sluggish remote application feel.";
  if (lossPercent === 0 && medianMs <= 80) {
    browsingStatus = "Optimal";
    browsingExp = "Snappy, near-instantaneous page transitions and cloud API responses.";
  } else if (lossPercent <= 1 && medianMs <= 150) {
    browsingStatus = "Good";
    browsingExp = "Fast and responsive web navigation.";
  } else if (lossPercent <= 5 && medianMs <= 250) {
    browsingStatus = "Acceptable";
    browsingExp = "Slightly noticeable delay when loading heavy web pages.";
  }

  return [
    {
      name: "Competitive Online Gaming",
      category: "Gaming",
      status: gamingStatus,
      explanation: gamingExp,
    },
    {
      name: "Video Meetings (Zoom / Teams)",
      category: "Conferencing",
      status: confStatus,
      explanation: confExp,
    },
    {
      name: "Voice Calls & Discord",
      category: "VoIP",
      status: voipStatus,
      explanation: voipExp,
    },
    {
      name: "Web Browsing & Cloud Apps",
      category: "Browsing",
      status: browsingStatus,
      explanation: browsingExp,
    },
  ];
}

/**
 * Returns plain-language rating summary for general users.
 */
export function getRatingSummary(rating: PingLatencyData["rating"]): string {
  switch (rating) {
    case "Excellent":
      return "Outstanding response times and rock-solid network stability. Your connection is primed for competitive esports gaming, crystal-clear 4K video meetings, and zero-delay browsing.";
    case "Good":
      return "Strong and consistent connection performance. Online multiplayer games, high-definition video calls, and streaming will operate smoothly with negligible delay.";
    case "Fair":
      return "Moderate network latency detected. Routine web browsing and media streaming are fine, but you may notice input lag in competitive multiplayer games or slight speech overlap during video conferences.";
    case "Poor":
      return "High latency or packet loss detected. Expect noticeable delay, stutter, and rubber-banding during online gaming, along with degraded audio and buffering on video calls.";
  }
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

  const activities = evaluateActivities(medianLatencyMs, jitterMs, packetLossPercent);
  const ratingSummary = getRatingSummary(rating);

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
    ratingSummary,
    activities,
    probes,
  };
}
