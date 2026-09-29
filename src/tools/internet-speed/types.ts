/**
 * Type contracts for the Internet Speed Test Tool.
 */

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
  testedAt: string;
}
