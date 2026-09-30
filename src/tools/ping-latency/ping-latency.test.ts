import { describe, it, expect } from "vitest";
import {
  computePingLatencyData,
  calculateMedian,
  calculateJitter,
  evaluateActivities,
  getRatingSummary,
} from "./compute";
import { pingLatencyInputSchema, cleanTarget } from "./schema";
import type { PingProbeResult } from "./types";

describe("Ping / Latency Checker Contract & Unit Tests", () => {
  describe("Input schema & sanitization", () => {
    it("sanitizes hostnames prepending https:// automatically", () => {
      const valid = pingLatencyInputSchema.parse({ target: "example.com", count: 3 });
      expect(valid.target).toBe("https://example.com");
      expect(valid.count).toBe(3);
    });

    it("leaves already-prefixed URLs unchanged", () => {
      expect(cleanTarget("https://cloudflare.com")).toBe("https://cloudflare.com");
      expect(cleanTarget("http://my-service.org")).toBe("http://my-service.org");
    });

    it("limits probe counts between 1 and 5", () => {
      expect(() => pingLatencyInputSchema.parse({ target: "example.com", count: 0 })).toThrow();
      expect(() => pingLatencyInputSchema.parse({ target: "example.com", count: 10 })).toThrow();
    });
  });

  describe("Math & statistical functions", () => {
    it("calculates median correctly for odd, even, and empty arrays", () => {
      expect(calculateMedian([])).toBe(0);
      expect(calculateMedian([15])).toBe(15);
      expect(calculateMedian([10, 20, 30])).toBe(20);
      expect(calculateMedian([30, 10, 20])).toBe(20); // Unsorted
      expect(calculateMedian([10, 20, 30, 40])).toBe(25); // Even length
    });

    it("calculates RFC 3550 jitter correctly", () => {
      expect(calculateJitter([])).toBe(0);
      expect(calculateJitter([25])).toBe(0);
      // Delays: 20, 25, 30. Diffs: |25-20|=5, |30-25|=5. Mean: 10 / 2 = 5
      expect(calculateJitter([20, 25, 30])).toBe(5);
    });
  });

  describe("Activity suitability & rating evaluation", () => {
    it("evaluates activities for optimal network conditions", () => {
      const activities = evaluateActivities(22, 3, 0);
      expect(activities.length).toBe(4);

      const gaming = activities.find((a) => a.category === "Gaming");
      expect(gaming?.status).toBe("Optimal");

      const conf = activities.find((a) => a.category === "Conferencing");
      expect(conf?.status).toBe("Optimal");

      const voip = activities.find((a) => a.category === "VoIP");
      expect(voip?.status).toBe("Optimal");

      const browsing = activities.find((a) => a.category === "Browsing");
      expect(browsing?.status).toBe("Optimal");
    });

    it("evaluates degraded status when packet loss or high latency is detected", () => {
      const activities = evaluateActivities(220, 45, 10);
      for (const act of activities) {
        expect(act.status).toBe("Degraded");
      }
    });

    it("returns descriptive rating summaries for all categories", () => {
      expect(getRatingSummary("Excellent")).toContain("Outstanding response times");
      expect(getRatingSummary("Good")).toContain("Strong and consistent");
      expect(getRatingSummary("Fair")).toContain("Moderate network latency");
      expect(getRatingSummary("Poor")).toContain("High latency or packet loss");
    });
  });

  describe("Pure compute function", () => {
    it("purely computes latency statistics, median, jitter, and activities without I/O", () => {
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
      expect(res.ratingSummary).toBeTruthy();
      expect(res.activities.length).toBe(4);
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
      expect(res.ratingSummary).toContain("High latency or packet loss");
    });
  });
});
