import { describe, it, expect } from "vitest";
import { computeJwtDecode } from "./compute";
import { jwtDecoderInputSchema } from "./schema";

describe("JWT Decoder Contract Tests", () => {
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

  it("validates input schema safely", () => {
    const valid = jwtDecoderInputSchema.parse({ token: validToken });
    expect(valid.token).toBe(validToken);
  });

  it("decodes headers and payload correctly without I/O", () => {
    const res = computeJwtDecode({ token: validToken }, 1700000100);

    expect(res.isValid).toBe(true);
    expect(res.header.alg).toBe("HS256");
    expect(res.payload.sub).toBe("user_456");
    expect(res.payload.role).toBe("Admin");
    expect(res.validation.isExpired).toBe(false);
    expect(res.signature).toBe("test_signature");
  });

  it("identifies expired tokens accurately based on current epoch", () => {
    // Current time: 2000000001 (after expiration 2000000000)
    const res = computeJwtDecode({ token: validToken }, 2000000001);
    expect(res.validation.isExpired).toBe(true);
    expect(res.validation.timeRemaining).toContain("Expired");
  });

  it("handles malformed or invalid JWT strings cleanly", () => {
    const resBadSegments = computeJwtDecode({ token: "header.payload" });
    expect(resBadSegments.isValid).toBe(false);
    expect(resBadSegments.error).toContain("Expected 3 dot-separated segments");

    const resGarbage = computeJwtDecode({ token: "abc.def.ghi" });
    expect(resGarbage.isValid).toBe(false);
  });
});
