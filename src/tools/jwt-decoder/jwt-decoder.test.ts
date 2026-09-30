import { describe, it, expect } from "vitest";
import { computeJwtDecode, cleanTokenInput, formatRelativeTime } from "./compute";
import { jwtDecoderInputSchema } from "./schema";

describe("JWT Decoder Contract & Technical Robustness Tests", () => {
  const sampleHeader = { alg: "HS256", typ: "JWT" };
  const samplePayload = {
    sub: "user_456",
    name: "Alex Vance",
    role: "Admin",
    exp: 2000000000, // Year 2033
    iat: 1700000000,
  };

  const headerB64 = Buffer.from(JSON.stringify(sampleHeader)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(samplePayload)).toString("base64url");
  const validToken = `${headerB64}.${payloadB64}.test_signature`;

  describe("Token cleaning & input validation", () => {
    it("validates input schema safely", () => {
      const valid = jwtDecoderInputSchema.parse({ token: validToken });
      expect(valid.token).toBe(validToken);
    });

    it("strips Bearer prefixes, quotes, and whitespace in cleanTokenInput", () => {
      expect(cleanTokenInput(`Bearer ${validToken}`)).toBe(validToken);
      expect(cleanTokenInput(`bearer ${validToken}`)).toBe(validToken);
      expect(cleanTokenInput(`"${validToken}"`)).toBe(validToken);
      expect(cleanTokenInput(`'${validToken}'`)).toBe(validToken);
    });
  });

  describe("Decoded output and claims analysis", () => {
    it("decodes headers and payload correctly without I/O", () => {
      const res = computeJwtDecode({ token: validToken }, 1700000100);

      expect(res.isValid).toBe(true);
      expect(res.header.alg).toBe("HS256");
      expect(res.payload.sub).toBe("user_456");
      expect(res.payload.role).toBe("Admin");
      expect(res.validation.isExpired).toBe(false);
      expect(res.signature).toBe("test_signature");

      const subClaim = res.claimsList.find((c) => c.claim === "sub");
      expect(subClaim?.isStandardClaim).toBe(true);
      expect(subClaim?.description).toContain("Subject");

      const expClaim = res.claimsList.find((c) => c.claim === "exp");
      expect(expClaim?.formattedDate).toContain("2033");
    });

    it("identifies expired tokens accurately based on current epoch", () => {
      // Current time: 2000000001 (after expiration 2000000000)
      const res = computeJwtDecode({ token: validToken }, 2000000001);
      expect(res.validation.isExpired).toBe(true);
      expect(res.validation.timeRemaining).toContain("Expired");
    });

    it("formats relative times for expiration correctly", () => {
      expect(formatRelativeTime(-120)).toContain("Expired 2 mins ago");
      expect(formatRelativeTime(3600)).toContain("Expires in 1 hour");
      expect(formatRelativeTime(86400 * 3)).toContain("Expires in 3 days");
    });
  });

  describe("Graceful handling of malformed or non-JWT input (Zero Crashes)", () => {
    it("handles empty or whitespace-only token input cleanly", () => {
      const resEmpty = computeJwtDecode({ token: "" });
      expect(resEmpty.isValid).toBe(false);
      expect(resEmpty.error).toContain("No JWT token provided");
    });

    it("handles incorrect segment counts gracefully", () => {
      const res1 = computeJwtDecode({ token: "header.payload" });
      expect(res1.isValid).toBe(false);
      expect(res1.error).toContain("Expected 3 dot-separated segments");

      const res4 = computeJwtDecode({ token: "a.b.c.d" });
      expect(res4.isValid).toBe(false);
      expect(res4.error).toContain("Expected 3 dot-separated segments");
    });

    it("handles non-base64 or non-JSON segments gracefully without throwing", () => {
      const resGarbage = computeJwtDecode({ token: "abc.def.ghi" });
      expect(resGarbage.isValid).toBe(false);
      expect(resGarbage.error).toContain("Malformed JWT Header");
    });

    it("handles non-object JSON payloads gracefully (e.g. primitive JSON)", () => {
      const primitiveB64 = Buffer.from(JSON.stringify(12345)).toString("base64url");
      const badJsonToken = `${headerB64}.${primitiveB64}.sig`;
      const res = computeJwtDecode({ token: badJsonToken });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("Malformed JWT Payload");
    });

    it("handles Bearer prefixed tokens smoothly", () => {
      const resBearer = computeJwtDecode({ token: `Bearer ${validToken}` }, 1700000100);
      expect(resBearer.isValid).toBe(true);
      expect(resBearer.payload.sub).toBe("user_456");
    });
  });
});
