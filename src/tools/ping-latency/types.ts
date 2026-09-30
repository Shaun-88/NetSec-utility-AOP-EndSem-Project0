/**
 * Type contracts for the Ping / Latency Checker Tool.
 */

export interface PingProbeResult {
  seq: number;
  durationMs: number;
  status: number;
  success: boolean;
  error?: string;
}

export interface PingActivityRating {
  name: string;
  category: "Gaming" | "Conferencing" | "VoIP" | "Browsing";
  status: "Optimal" | "Good" | "Acceptable" | "Degraded";
  explanation: string;
}

export interface PingLatencyInput {
  target: string;
  count?: number;
}

export interface PingLatencyData {
  target: string;
  resolvedIp?: string;
  probesSent: number;
  probesReceived: number;
  packetLossPercent: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  avgLatencyMs: number;
  medianLatencyMs: number;
  jitterMs: number;
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  ratingSummary: string;
  activities: PingActivityRating[];
  probes: PingProbeResult[];
}
