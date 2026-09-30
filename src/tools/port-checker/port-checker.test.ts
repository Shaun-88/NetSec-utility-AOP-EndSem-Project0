import { describe, it, expect } from "vitest";
import { computePortCheckerData, getStatusMeaning, getSecurityRecommendation } from "./compute";
import { portCheckerInputSchema, cleanHost, ALLOWED_PORTS, ALLOWED_PORT_NUMBERS } from "./schema";

describe("Port Checker Contract & Unit Tests", () => {
  describe("Input schema and cleanHost", () => {
    it("validates standard domains and permitted ports", () => {
      const valid = portCheckerInputSchema.parse({
        target: "example.com",
        port: 443,
      });
      expect(valid.target).toBe("example.com");
      expect(valid.port).toBe(443);
    });

    it("cleans URLs with protocol, path, and single port suffix", () => {
      expect(cleanHost("https://my-site.org/status?query=1")).toBe("my-site.org");
      expect(cleanHost("http://api.internal.local:8080/v1")).toBe("api.internal.local");
      expect(cleanHost("192.168.1.1:443")).toBe("192.168.1.1");
    });

    it("cleans and preserves IPv6 targets accurately", () => {
      expect(cleanHost("2606:4700:4700::1111")).toBe("2606:4700:4700::1111");
      expect(cleanHost("[2001:db8::1]:443")).toBe("2001:db8::1");
      expect(cleanHost("[2001:db8::1]")).toBe("2001:db8::1");
    });

    it("rejects non-allowlisted ports strictly per security policy", () => {
      expect(() =>
        portCheckerInputSchema.parse({ target: "example.com", port: 23 }),
      ).toThrow(); // Telnet rejected
      expect(() =>
        portCheckerInputSchema.parse({ target: "example.com", port: 1337 }),
      ).toThrow(); // Arbitrary port rejected
      expect(() =>
        portCheckerInputSchema.parse({ target: "example.com", port: 0 }),
      ).toThrow();
    });

    it("ensures all 16 allow-listed ports have plain explanations and use cases", () => {
      expect(ALLOWED_PORTS.length).toBe(16);
      expect(ALLOWED_PORT_NUMBERS).toContain(80);
      expect(ALLOWED_PORT_NUMBERS).toContain(443);
      expect(ALLOWED_PORT_NUMBERS).toContain(22);
      expect(ALLOWED_PORT_NUMBERS).toContain(25);
      expect(ALLOWED_PORT_NUMBERS).toContain(3306);
      expect(ALLOWED_PORT_NUMBERS).toContain(5432);

      for (const p of ALLOWED_PORTS) {
        expect(p.plainExplanation.length).toBeGreaterThan(15);
        expect(p.useCase.length).toBeGreaterThan(15);
        expect(p.service).toBeTruthy();
        expect(p.category).toBeTruthy();
      }
    });
  });

  describe("Compute function & security postures", () => {
    it("purely computes port status and guidance without I/O", () => {
      const res = computePortCheckerData(
        "db.internal.example",
        "93.184.216.34",
        5432,
        "open",
        18.4,
      );

      expect(res.port).toBe(5432);
      expect(res.serviceName).toBe("PostgreSQL");
      expect(res.status).toBe("open");
      expect(res.statusMeaning).toContain("accepted the TCP handshake");
      expect(res.plainExplanation).toContain("PostgreSQL");
      expect(res.latencyMs).toBe(18.4);
      expect(res.securityRecommendation).toContain("Caution: Database port 5432");
    });

    it("handles closed and filtered states with appropriate advice", () => {
      const resClosed = computePortCheckerData(
        "example.com",
        "93.184.216.34",
        22,
        "closed",
        12.1,
      );
      expect(resClosed.status).toBe("closed");
      expect(resClosed.statusMeaning).toContain("TCP Reset (RST)");
      expect(resClosed.securityRecommendation).toContain("SSH port 22 is closed");

      const resFiltered = computePortCheckerData(
        "example.com",
        "93.184.216.34",
        443,
        "filtered",
        3000,
      );
      expect(resFiltered.status).toBe("filtered");
      expect(resFiltered.statusMeaning).toContain("3.0-second timeout window");
      expect(resFiltered.securityRecommendation).toContain("Web traffic to port 443 timed out");
    });

    it("provides specific guidance for web and database security postures", () => {
      const dbClosed = getSecurityRecommendation(3306, "closed");
      expect(dbClosed).toContain("Good security posture: Database port 3306 is closed");

      const dbFiltered = getSecurityRecommendation(5432, "filtered");
      expect(dbFiltered).toContain("Excellent security posture: Database port 5432 is filtered");

      const httpOpen = getSecurityRecommendation(80, "open");
      expect(httpOpen).toContain("Port 80 (HTTP) is open. Ensure an automatic 301/308 redirect");

      const ftpOpen = getSecurityRecommendation(21, "open");
      expect(ftpOpen).toContain("Warning: Unencrypted FTP (port 21) transmits credentials in plaintext");
    });

    it("returns correct status meanings", () => {
      expect(getStatusMeaning("open")).toContain("welcoming incoming connections");
      expect(getStatusMeaning("closed")).toContain("no application is currently listening");
      expect(getStatusMeaning("filtered")).toContain("silently dropped or blocked by a network firewall");
    });
  });
});
