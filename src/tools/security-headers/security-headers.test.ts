import { describe, it, expect } from "vitest";
import { computeSecurityHeaderAudit } from "./compute";
import { securityHeadersInputSchema } from "./schema";

describe("Security Header Analyzer Contract Tests", () => {
  it("sanitizes hostnames prepending https:// automatically", () => {
    const valid = securityHeadersInputSchema.parse({ target: "example.com" });
    expect(valid.target).toBe("https://example.com");
  });

  it("grades an insecure site with no headers as Grade F with 0 points", () => {
    const res = computeSecurityHeaderAudit("https://insecure.test", {}, 200);
    expect(res.grade).toBe("F");
    expect(res.score).toBe(0);
    expect(res.auditedHeaders.every((h) => h.status === "fail")).toBe(true);
    // Verifies remediation guidance is provided on failure
    expect(res.auditedHeaders[0].remediationExample).toBeDefined();
  });

  it("grades a hardened site with all headers as Grade A+", () => {
    const hardenedHeaders = {
      "content-security-policy": "default-src 'self'; script-src 'self' 'nonce-rAnd0m'",
      "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
    };

    const res = computeSecurityHeaderAudit("https://secure.test", hardenedHeaders, 200);
    expect(res.grade).toBe("A+");
    expect(res.score).toBe(100);
    expect(res.auditedHeaders.every((h) => h.status === "pass")).toBe(true);
  });

  it("penalizes information disclosure headers", () => {
    const leakingHeaders = {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-powered-by": "PHP/7.4.3",
      server: "Apache/2.4.41 (Ubuntu)",
    };

    const res = computeSecurityHeaderAudit("https://leaking.test", leakingHeaders, 200);
    expect(res.leakedInfoHeaders.length).toBe(2);
    expect(res.score).toBeLessThan(20); // 20 - 10 = 10
  });

  it("flags CSP with unsafe-inline as warning with reduced score", () => {
    const headers = {
      "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
    };

    const res = computeSecurityHeaderAudit("https://test.com", headers, 200);
    const cspItem = res.auditedHeaders.find((h) => h.header === "Content-Security-Policy");
    expect(cspItem?.status).toBe("warn");
    expect(cspItem?.pointsEarned).toBe(15);
  });

  it("recognizes modern CSP frame-ancestors directive as superseding X-Frame-Options", () => {
    const headers = {
      "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
    };

    const res = computeSecurityHeaderAudit("https://test.com", headers, 200);
    const xfoItem = res.auditedHeaders.find((h) => h.header === "X-Frame-Options");
    expect(xfoItem?.status).toBe("pass");
    expect(xfoItem?.pointsEarned).toBe(15);
  });

  it("flags short HSTS max-age as warning", () => {
    const headers = {
      "strict-transport-security": "max-age=86400", // Only 1 day
    };

    const res = computeSecurityHeaderAudit("https://test.com", headers, 200);
    const hstsItem = res.auditedHeaders.find((h) => h.header === "Strict-Transport-Security");
    expect(hstsItem?.status).toBe("warn");
    expect(hstsItem?.pointsEarned).toBe(12);
  });
});
