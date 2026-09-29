import { describe, it, expect } from "vitest";
import { computeSecurityHeaderAudit } from "./compute";
import { securityHeadersInputSchema } from "./schema";

describe("Security Header Analyzer Contract Tests", () => {
  it("sanitizes hostnames prepending https:// automatically", () => {
    const valid = securityHeadersInputSchema.parse({ target: "example.com" });
    expect(valid.target).toBe("https://example.com");
  });

  it("grades an insecure site with no headers as Grade F", () => {
    const res = computeSecurityHeaderAudit("https://insecure.test", {}, 200);
    expect(res.grade).toBe("F");
    expect(res.score).toBe(0);
    expect(res.auditedHeaders.every((h) => h.status === "fail")).toBe(true);
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
      "strict-transport-security": "max-age=31536000",
      "x-powered-by": "PHP/7.4.3",
      server: "Apache/2.4.41 (Ubuntu)",
    };

    const res = computeSecurityHeaderAudit("https://leaking.test", leakingHeaders, 200);
    expect(res.leakedInfoHeaders.length).toBe(2);
  });
});
