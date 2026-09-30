import { describe, it, expect, vi } from "vitest";
import { synthesizeAIContext } from "../src/core/history/ai-synthesizer";
import { NETWORK_TOOL_IDS, CYBER_TOOL_IDS } from "../src/db/queries/history";
import { GET as purgeGet } from "../src/app/api/cron/purge-history/route";
import { NextRequest } from "next/server";

// Mock DB queries for isolated unit testing
vi.mock("../src/db/queries/history", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/db/queries/history")>();
  return {
    ...actual,
    purgeExpiredHistory: vi.fn().mockResolvedValue(5),
  };
});

describe("Phase 19 History System & AI Telemetry Tests", () => {
  describe("AI Context Synthesizer", () => {
    it("synthesizes structured context and evaluates risk for port-checker", () => {
      const highRiskData = {
        results: [
          { port: 80, status: "open" },
          { port: 23, status: "open" }, // Telnet = high risk
        ],
      };
      const context = synthesizeAIContext("port-checker", "test.server.local", highRiskData);

      expect(context.riskLevel).toBe("high");
      expect(context.targetType).toBe("hostname");
      expect(context.summary).toContain("Port accessibility scan");
      expect(context.recommendedActions.some((a) => a.includes("Telnet"))).toBe(true);
    });

    it("evaluates security header grading and flags missing guardrails", () => {
      const headerData = {
        grade: "F",
        missingHeaders: ["Content-Security-Policy", "Strict-Transport-Security"],
        presentHeaders: ["X-Content-Type-Options"],
      };
      const context = synthesizeAIContext("security-headers", "https://unprotected.site", headerData);

      expect(context.riskLevel).toBe("high");
      expect(context.summary).toContain("Grade F");
      expect(context.recommendedActions.length).toBeGreaterThanOrEqual(2);
    });

    it("enforces zero-knowledge redaction note on password-generator", () => {
      const genData = {
        length: 24,
        entropyBits: 130,
      };
      const context = synthesizeAIContext("password-generator", null, genData);

      expect(context.riskLevel).toBe("none");
      expect(context.targetType).toBe("credential");
      expect(context.summary).toContain("Zero-knowledge redaction");
    });

    it("flags expired JWT tokens and detects unsigned 'none' algorithm", () => {
      const expiredData = {
        header: { alg: "none", typ: "JWT" },
        payload: { sub: "agent_42" },
        isExpired: true,
        expirationDate: "2020-01-01",
      };
      const context = synthesizeAIContext("jwt-decoder", "agent_42", expiredData);

      expect(context.riskLevel).toBe("high"); // alg: 'none' is critical
      expect(context.recommendedActions.some((a) => a.includes("algorithm is 'none'"))).toBe(true);
    });

    it("verifies file hash mismatch triggers high risk alert", () => {
      const mismatchData = {
        fileName: "malware-sample.exe",
        fileSize: 45000,
        matched: false,
      };
      const context = synthesizeAIContext("file-hash", "malware-sample.exe", mismatchData);

      expect(context.riskLevel).toBe("high");
      expect(context.summary).toContain("TAMPERED / MISMATCH");
    });
  });

  describe("Registry Category Coverage", () => {
    it("ensures all network tools are cataloged in NETWORK_TOOL_IDS", () => {
      expect(NETWORK_TOOL_IDS).toContain("internet-speed");
      expect(NETWORK_TOOL_IDS).toContain("ip-lookup");
      expect(NETWORK_TOOL_IDS).toContain("dns-lookup");
      expect(NETWORK_TOOL_IDS).toContain("subnet-calculator");
      expect(NETWORK_TOOL_IDS).toContain("port-checker");
      expect(NETWORK_TOOL_IDS).toContain("ping-latency");
      expect(NETWORK_TOOL_IDS.length).toBe(6);
    });

    it("ensures all cybersecurity tools are cataloged in CYBER_TOOL_IDS", () => {
      expect(CYBER_TOOL_IDS).toContain("password-generator");
      expect(CYBER_TOOL_IDS).toContain("password-strength");
      expect(CYBER_TOOL_IDS).toContain("hash-generator");
      expect(CYBER_TOOL_IDS).toContain("jwt-decoder");
      expect(CYBER_TOOL_IDS).toContain("file-hash");
      expect(CYBER_TOOL_IDS).toContain("security-headers");
      expect(CYBER_TOOL_IDS).toContain("binary-text");
      expect(CYBER_TOOL_IDS.length).toBe(7);
    });
  });

  describe("48-Hour Retention Bounding & Tenant Isolation", () => {
    it("simulates in-memory tenant filter with 48h expiration boundary", () => {
      const now = Date.now();
      const oneHourAgo = new Date(now - 3600 * 1000);
      const fortySevenHoursAgo = new Date(now - 47 * 3600 * 1000);
      const fiftyHoursAgo = new Date(now - 50 * 3600 * 1000); // EXPIRED

      const mockDbRows = [
        {
          id: "rec-1",
          userId: "agent_alpha",
          toolId: "port-checker",
          target: "alpha.local",
          ranAt: oneHourAgo,
        },
        {
          id: "rec-2",
          userId: "agent_alpha",
          toolId: "dns-lookup",
          target: "alpha-dns.local",
          ranAt: fortySevenHoursAgo, // Valid within 48h
        },
        {
          id: "rec-3",
          userId: "agent_alpha",
          toolId: "ip-lookup",
          target: "8.8.8.8",
          ranAt: fiftyHoursAgo, // Should be excluded (> 48h)
        },
        {
          id: "rec-4",
          userId: "agent_beta",
          toolId: "port-checker",
          target: "beta.local",
          ranAt: oneHourAgo,
        },
      ];

      // Query function with strict userId and 48-hour cut-off
      const queryUserWithin48h = (targetUser: string) => {
        const cutoff = now - 48 * 3600 * 1000;
        return mockDbRows.filter(
          (row) => row.userId === targetUser && row.ranAt.getTime() >= cutoff,
        );
      };

      const alphaRecords = queryUserWithin48h("agent_alpha");
      const betaRecords = queryUserWithin48h("agent_beta");

      // Verify User Alpha records
      expect(alphaRecords.length).toBe(2);
      expect(alphaRecords.map((r) => r.id)).toEqual(["rec-1", "rec-2"]);
      expect(alphaRecords.some((r) => r.id === "rec-3")).toBe(false); // 50h old record omitted
      expect(alphaRecords.some((r) => r.userId === "agent_beta")).toBe(false); // Tenant isolation

      // Verify User Beta records
      expect(betaRecords.length).toBe(1);
      expect(betaRecords[0].id).toBe("rec-4");
      expect(betaRecords.some((r) => r.userId === "agent_alpha")).toBe(false);
    });
  });

  describe("Protected Cron Auto-Purge Route Authorization", () => {
    it("rejects unauthorized cron requests when CRON_SECRET is configured", async () => {
      process.env.CRON_SECRET = "super-secret-cron-token";

      const req = new NextRequest("http://localhost:3000/api/cron/purge-history", {
        headers: { authorization: "Bearer invalid-token" },
      });

      const res = await purgeGet(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("Unauthorized");
    });

    it("executes purge and returns success when CRON_SECRET matches", async () => {
      process.env.CRON_SECRET = "super-secret-cron-token";

      const req = new NextRequest("http://localhost:3000/api/cron/purge-history", {
        headers: { authorization: "Bearer super-secret-cron-token" },
      });

      const res = await purgeGet(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("success");
      expect(json.purgedCount).toBe(5);
      expect(json.retentionWindowHours).toBe(48);
    });
  });
});
