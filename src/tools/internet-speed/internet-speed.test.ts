import { describe, it, expect } from "vitest";
import {
  calculateMbps,
  computeSpeedTestData,
  formatSpeed,
  calculatePracticalCategories,
} from "./compute";
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

  it("formats speed values into Mbps and Gbps units correctly", () => {
    expect(formatSpeed(100, "Mbps")).toBe("100.0");
    expect(formatSpeed(100, "Gbps")).toBe("0.10");
    expect(formatSpeed(950, "Gbps")).toBe("0.95");
    expect(formatSpeed(1500, "Gbps")).toBe("1.50");
  });

  it("calculates practical categories accurately for fast low-latency connection", () => {
    const categories = calculatePracticalCategories(150, 45, 12, 1.5);
    const gaming = categories.find((c) => c.id === "gaming");
    const stream4k = categories.find((c) => c.id === "streaming4k");
    const stream1080p = categories.find((c) => c.id === "streaming1080p");
    const calls = categories.find((c) => c.id === "videoCalls");

    expect(gaming?.status).toBe("excellent");
    expect(stream4k?.status).toBe("excellent");
    expect(stream1080p?.status).toBe("excellent");
    expect(calls?.status).toBe("excellent");
  });

  it("calculates practical categories for constrained connection", () => {
    const categories = calculatePracticalCategories(4, 1, 120, 25);
    const gaming = categories.find((c) => c.id === "gaming");
    const stream4k = categories.find((c) => c.id === "streaming4k");
    const stream1080p = categories.find((c) => c.id === "streaming1080p");

    expect(gaming?.status).toBe("poor");
    expect(stream4k?.status).toBe("poor");
    expect(stream1080p?.status).toBe("marginal");
  });

  it("purely computes speed test output data with timelines and practical categories", () => {
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
    expect(res.rating).toBe("Optimal");
    expect(res.bytesDownloaded).toBe(5_000_000);
    expect(res.practicalCategories.length).toBe(4);
    expect(res.downloadTimeline.length).toBe(10);
    expect(res.uploadTimeline.length).toBe(10);
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

