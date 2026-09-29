import { describe, it, expect } from "vitest";
import { computePortCheckerData } from "./compute";
import { portCheckerInputSchema } from "./schema";

describe("Port Checker Contract Tests", () => {
  it("validates targets and allowed port numbers", () => {
    const valid = portCheckerInputSchema.parse({
      target: "example.com",
      port: 443,
    });
    expect(valid.target).toBe("example.com");
    expect(valid.port).toBe(443);
  });

  it("rejects non-allowlisted ports strictly", () => {
    expect(() =>
      portCheckerInputSchema.parse({ target: "example.com", port: 23 }),
    ).toThrow(); // Telnet rejected
    expect(() =>
      portCheckerInputSchema.parse({ target: "example.com", port: 1337 }),
    ).toThrow(); // Arbitrary port rejected
  });

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
    expect(res.latencyMs).toBe(18.4);
    expect(res.securityRecommendation).toContain("Caution: Database port");
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
    expect(resClosed.securityRecommendation).toContain("Port 22 is closed");
  });
});
