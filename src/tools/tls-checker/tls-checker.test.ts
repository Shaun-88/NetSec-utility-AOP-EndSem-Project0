import { describe, it, expect } from "vitest";
import { computeTlsData, type RawCertData } from "./compute";
import { tlsCheckerInputSchema } from "./schema";

const FUTURE_DATE = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toString();
const EXPIRING_DATE = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toString();
const PAST_DATE = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toString();
const PAST_START_DATE = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toString();

const VALID_CERT: RawCertData = {
  subject: { CN: "github.com", O: "GitHub, Inc." },
  issuer: { CN: "DigiCert TLS RSA SHA256 2020 CA1", O: "DigiCert Inc" },
  valid_from: PAST_START_DATE,
  valid_to: FUTURE_DATE,
  serialNumber: "ABCDEF1234567890",
};

const EXPIRING_CERT: RawCertData = {
  subject: { CN: "expiring.example.com" },
  issuer: { CN: "Let's Encrypt Authority X3", O: "Let's Encrypt" },
  valid_from: PAST_START_DATE,
  valid_to: EXPIRING_DATE,
  serialNumber: "1111AAAA",
};

const EXPIRED_CERT: RawCertData = {
  subject: { CN: "expired.example.com" },
  issuer: { CN: "Some Old CA" },
  valid_from: PAST_START_DATE,
  valid_to: PAST_DATE,
  serialNumber: "DEADBEEF",
};

describe("TLS Checker — schema", () => {
  it("accepts a plain domain name", () => {
    const result = tlsCheckerInputSchema.parse({ target: "github.com" });
    expect(result.target).toBe("github.com");
  });

  it("strips https:// from input", () => {
    const result = tlsCheckerInputSchema.parse({ target: "https://github.com" });
    expect(result.target).toBe("github.com");
  });

  it("strips path from URL", () => {
    const result = tlsCheckerInputSchema.parse({ target: "https://github.com/path/to/page" });
    expect(result.target).toBe("github.com");
  });

  it("rejects empty input", () => {
    expect(() => tlsCheckerInputSchema.parse({ target: "" })).toThrow();
  });

  it("rejects invalid domain", () => {
    expect(() => tlsCheckerInputSchema.parse({ target: "not_a_domain!!" })).toThrow();
  });
});

describe("TLS Checker — computeTlsData", () => {
  it("correctly identifies a valid certificate with >30 days remaining", () => {
    const result = computeTlsData("github.com", VALID_CERT, "TLSv1.3");
    expect(result.isExpired).toBe(false);
    expect(result.isExpiringSoon).toBe(false);
    expect(result.daysUntilExpiry).toBeGreaterThan(30);
    expect(result.protocol).toBe("TLSv1.3");
    expect(result.subject.CN).toBe("github.com");
    expect(result.issuer.O).toBe("DigiCert Inc");
  });

  it("correctly identifies a certificate expiring soon (<30 days)", () => {
    const result = computeTlsData("expiring.example.com", EXPIRING_CERT, "TLSv1.2");
    expect(result.isExpired).toBe(false);
    expect(result.isExpiringSoon).toBe(true);
    expect(result.daysUntilExpiry).toBeGreaterThan(0);
    expect(result.daysUntilExpiry).toBeLessThan(30);
  });

  it("correctly identifies an expired certificate", () => {
    const result = computeTlsData("expired.example.com", EXPIRED_CERT, "TLSv1.2");
    expect(result.isExpired).toBe(true);
    expect(result.isExpiringSoon).toBe(false);
    expect(result.daysUntilExpiry).toBeLessThan(0);
  });

  it("populates all required output fields", () => {
    const result = computeTlsData("github.com", VALID_CERT, "TLSv1.3");
    expect(result.domain).toBe("github.com");
    expect(result.serialNumber).toBe("ABCDEF1234567890");
    expect(result.validFrom).toBeDefined();
    expect(result.validTo).toBeDefined();
    expect(result.checkedAt).toBeDefined();
  });

  it("handles cert without optional O field gracefully", () => {
    const result = computeTlsData("expired.example.com", EXPIRED_CERT, "TLSv1.1");
    expect(result.subject.O).toBeUndefined();
    expect(result.issuer.O).toBeUndefined();
  });
});
