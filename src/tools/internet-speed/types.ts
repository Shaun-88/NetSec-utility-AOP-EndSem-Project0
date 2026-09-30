/**
 * Type contracts for the Internet Speed Test Tool.
 */

export type SpeedUnit = "Mbps" | "Gbps";

export interface SpeedHistoryPoint {
  second: number;
  mbps: number;
}

export interface PracticalCategory {
  id: "gaming" | "streaming1080p" | "streaming4k" | "videoCalls";
  title: string;
  status: "excellent" | "good" | "marginal" | "poor";
  label: string;
  explanation: string;
}

export interface SpeedTestSample {
  stage: "ping" | "download" | "upload";
  bytesTransferred: number;
  durationMs: number;
  instantMbps: number;
}

export interface SpeedTestInput {
  target?: string;
  testSizeMb?: number;
}

export interface SpeedTestOutputData {
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  jitterMs: number;
  bytesDownloaded: number;
  bytesUploaded: number;
  durationSeconds: number;
  tier: "Ultra Gigabit" | "Fast Broadband" | "Standard Broadband" | "Basic" | "Constrained";
  rating: "Optimal" | "Good" | "Fair" | "Poor";
  practicalCategories: PracticalCategory[];
  downloadTimeline: SpeedHistoryPoint[];
  uploadTimeline: SpeedHistoryPoint[];
  testedAt: string;
}
