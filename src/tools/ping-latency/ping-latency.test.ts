import { describe, it, expect } from "vitest";
import { computePingLatencyData } from "./compute";
import { pingLatencyInputSchema } from "./schema";
import type { PingProbeResult } from "./types";

describe("Ping / Latency Checker Contract Tests", () => {
  it("sanitizes hostnames prepending https:// automatically", () => {
    const valid = pingLatencyInputSchema.parse({ target: "example.com", count: 3 });
    expect(valid.target).toBe("https://example.com");
    expect(valid.count).toBe(3);
  });

  it("limits probe counts between 1 and 5", () => {
    expect(() => pingLatencyInputSchema.parse({ target: "example.com", count: 0 })).toThrow();
    expect(() => pingLatencyInputSchema.parse({ target: "example.com", count: 10 })).toThrow();
  });

  it("purely computes latency statistics, median, and jitter without I/O", () => {
    const mockProbes: PingProbeResult[] = [
      { seq: 1, durationMs: 20, status: 200, success: true },
      { seq: 2, durationMs: 25, status: 200, success: true },
      { seq: 3, durationMs: 30, status: 200, success: true },
      { seq: 4, durationMs: 25, status: 200, success: true },
    ];

    const res = computePingLatencyData("https://example.com", mockProbes, "93.184.216.34");

    expect(res.minLatencyMs).toBe(20);
    expect(res.maxLatencyMs).toBe(30);
    expect(res.avgLatencyMs).toBe(25);
    expect(res.medianLatencyMs).toBe(25);
    // Consecutive differences: |25-20|=5, |30-25|=5, |25-30|=5. Mean: 15 / 3 = 5
    expect(res.jitterMs).toBe(5);
    expect(res.packetLossPercent).toBe(0);
    expect(res.rating).toBe("Excellent");
  });

  it("handles dropped probes and calculates packet loss", () => {
    const mockProbes: PingProbeResult[] = [
      { seq: 1, durationMs: 50, status: 200, success: true },
      { seq: 2, durationMs: 0, status: 0, success: false, error: "Timeout" },
      { seq: 3, durationMs: 50, status: 200, success: true },
      { seq: 4, durationMs: 0, status: 0, success: false, error: "Timeout" },
    ];

    const res = computePingLatencyData("https://example.com", mockProbes);

    expect(res.probesSent).toBe(4);
    expect(res.probesReceived).toBe(2);
    expect(res.packetLossPercent).toBe(50);
    expect(res.rating).toBe("Poor");
  });
});
