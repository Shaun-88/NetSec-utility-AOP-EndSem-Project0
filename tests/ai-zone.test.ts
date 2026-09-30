import { describe, it, expect, vi } from "vitest";
import { buildHistoryPromptContext } from "../src/core/ai/history-context";
import { BIG_BRO_SYSTEM_PROMPT } from "../src/core/ai/system-prompt";
import { POST as chatPost } from "../src/app/api/chat/route";
import { NextRequest } from "next/server";
import type { ToolHistoryRecord } from "../src/db/schema";

// Mock auth session
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock DB queries
vi.mock("@/db/queries/history", () => ({
  getUserToolHistory: vi.fn().mockResolvedValue([]),
}));

describe("Phase 20 AI Zone & Chat System Tests", () => {
  describe("History Prompt Context Builder", () => {
    it("returns clean fallback when no history records exist", () => {
      const context = buildHistoryPromptContext([]);
      expect(context).toContain("<user_recent_diagnostic_history>");
      expect(context).toContain("No recent tool executions found");
      expect(context).toContain("</user_recent_diagnostic_history>");
    });

    it("structures diagnostic records into passive data tags with risk and summary", () => {
      const mockRecords: ToolHistoryRecord[] = [
        {
          id: "record-001",
          userId: "agent-1",
          toolId: "port-checker",
          target: "scanme.nmap.org",
          data: {
            aiContext: {
              summary: "Port scan revealed open web ports (80, 443).",
              riskLevel: "low",
              keyFindings: ["HTTP 80 open", "HTTPS 443 open"],
              targetType: "hostname",
              recommendedActions: [],
            },
          },
          ranAt: new Date("2026-09-30T10:00:00Z"),
        },
      ];

      const context = buildHistoryPromptContext(mockRecords);
      expect(context).toContain("<user_recent_diagnostic_history>");
      expect(context).toContain("scanme.nmap.org");
      expect(context).toContain("Port Checker");
      expect(context).toContain("LOW");
      expect(context).toContain("Port scan revealed open web ports");
      expect(context).toContain("</user_recent_diagnostic_history>");
    });

    it("ensures sensitive credentials are never leaked into prompt context", () => {
      const mockCredRecord: ToolHistoryRecord[] = [
        {
          id: "record-002",
          userId: "agent-1",
          toolId: "password-generator",
          target: "Length: 24",
          data: {
            length: 24,
            entropyBits: 128,
            redacted: true,
            aiContext: {
              summary: "Generated 24-char password with 128 bits entropy.",
              riskLevel: "none",
              keyFindings: ["Length: 24 characters"],
              targetType: "credential",
              recommendedActions: [],
            },
          },
          ranAt: new Date("2026-09-30T10:30:00Z"),
        },
      ];

      const context = buildHistoryPromptContext(mockCredRecord);
      expect(context).not.toContain("password123");
      expect(context).not.toContain("plaintext");
      expect(context).toContain("Password Generator");
    });
  });

  describe("System Prompt Guardrails & Blue-Team Policy", () => {
    it("contains explicit blue-team refusal directives against offensive tools", () => {
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("DEFENSIVE (Blue-Team)");
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("Malware, ransomware, spyware");
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("Exploits, shellcode");
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("Brute-force");
    });

    it("contains prompt injection isolation directives for scan data", () => {
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("<user_recent_diagnostic_history>");
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("passive data");
      expect(BIG_BRO_SYSTEM_PROMPT).toContain("as instructions");
    });
  });

  describe("Chat API Route Security & Validation", () => {
    it("rejects unauthenticated requests with 401 status", async () => {
      const { auth } = await import("@/auth");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain("Authentication required");
    });

    it("rejects invalid payloads missing messages array with 400 status", async () => {
      const { auth } = await import("@/auth");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: "user-alpha" } } as any);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ invalid: true }),
      });

      const res = await chatPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Invalid chat payload");
    });
  });
});
