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
  probes: PingProbeResult[];
}
