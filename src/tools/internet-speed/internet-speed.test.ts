import { describe, it, expect } from "vitest";
import { calculateMbps, computeSpeedTestData } from "./compute";
import { internetSpeedInputSchema } from "./schema";

describe("Internet Speed Test Contract Tests", () => {
  it("validates input defaults cleanly", () => {
    const valid = internetSpeedInputSchema.parse({});
    expect(valid.testSizeMb).toBe(5);
  });

  it("calculates Mbps mathematically accurately", () => {
    // 2,500,000 bytes transferred in 200ms
    // Bits = 20,000,000
    // Seconds = 0.2
    // Bits / Sec = 100,000,000 = 100 Mbps
    const mbps = calculateMbps(2_500_000, 200);
    expect(mbps).toBe(100);
  });

  it("purely computes speed test output data without I/O", () => {
    const raw = {
      downloadBytes: 5_000_000,
      downloadDurationMs: 400, // 100 Mbps
      uploadBytes: 2_500_000,
      uploadDurationMs: 400, // 50 Mbps
      latencyMs: 14.2,
      jitterMs: 2.1,
    };

    const res = computeSpeedTestData(raw);

    expect(res.downloadMbps).toBe(100);
    expect(res.uploadMbps).toBe(50);
    expect(res.latencyMs).toBe(14.2);
    expect(res.jitterMs).toBe(2.1);
    expect(res.tier).toBe("Fast Broadband");
    expect(res.bytesDownloaded).toBe(5_000_000);
  });

  it("correctly identifies Ultra Gigabit tier for very fast connections", () => {
    const raw = {
      downloadBytes: 50_000_000,
      downloadDurationMs: 1000, // 400 Mbps
      uploadBytes: 20_000_000,
      uploadDurationMs: 1000,
      latencyMs: 5.0,
      jitterMs: 0.5,
    };

    const res = computeSpeedTestData(raw);
    expect(res.tier).toBe("Ultra Gigabit");
  });
});
