import { describe, it, expect } from "vitest";
import { parsePwnedPasswordResponse } from "./compute";
import { pwnedPasswordInputSchema } from "./schema";

// A realistic mock response from https://api.pwnedpasswords.com/range/5BAA6
// The prefix "5BAA6" corresponds to SHA-1 of "password" = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
const MOCK_HIBP_RESPONSE = `
003D68EB55068C33ACE09247EE4C639306B:3
0044A69A6C8AB6C050526AA9D82B3B4ED6:2
1E4C9B93F3F0682250B6CF8331B7EE68FD8:8765319
005AD45ABAB06EB4B0A2AF6C97E6F3E9B3:1
`.trim();

// SHA-1("password") = 5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8
const PREFIX = "5BAA6";
const FULL_HASH = "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8";

describe("Pwned Password — schema", () => {
  it("accepts a valid 5-char hex prefix and 40-char full hash", () => {
    const result = pwnedPasswordInputSchema.parse({
      prefix: "5baa6",
      fullHash: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
    });
    expect(result.prefix).toBe("5baa6");
    expect(result.fullHash).toBe("5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8");
  });

  it("rejects a prefix that is not 5 characters", () => {
    expect(() =>
      pwnedPasswordInputSchema.parse({
        prefix: "abc",
        fullHash: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
      }),
    ).toThrow();
  });

  it("rejects a non-hex prefix", () => {
    expect(() =>
      pwnedPasswordInputSchema.parse({
        prefix: "ZZZZZ",
        fullHash: "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
      }),
    ).toThrow();
  });

  it("rejects a fullHash that is not 40 characters", () => {
    expect(() =>
      pwnedPasswordInputSchema.parse({
        prefix: "5baa6",
        fullHash: "short",
      }),
    ).toThrow();
  });

  it("rejects a fullHash with non-hex characters", () => {
    expect(() =>
      pwnedPasswordInputSchema.parse({
        prefix: "5baa6",
        fullHash: "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ",
      }),
    ).toThrow();
  });
});

describe("Pwned Password — parsePwnedPasswordResponse", () => {
  it("returns pwnedCount > 0 when password is found in breach list", () => {
    const result = parsePwnedPasswordResponse(MOCK_HIBP_RESPONSE, FULL_HASH, PREFIX);
    expect(result.isPwned).toBe(true);
    expect(result.pwnedCount).toBe(8765319);
  });

  it("returns pwnedCount = 0 when password is not found", () => {
    // This fullHash starts with "FFFF0" so no line in MOCK_HIBP_RESPONSE (which uses prefix 5BAA6) will match
    const result = parsePwnedPasswordResponse(
      MOCK_HIBP_RESPONSE,
      "ffff0aaaaabbbbccccddddeeeeffffaaaaabbbbc",
      "FFFF0",
    );
    expect(result.isPwned).toBe(false);
    expect(result.pwnedCount).toBe(0);
  });

  it("is case-insensitive for hash matching", () => {
    // Uppercase full hash should still match lower-case suffix in response
    const upperHash = FULL_HASH.toUpperCase();
    const result = parsePwnedPasswordResponse(MOCK_HIBP_RESPONSE, upperHash, PREFIX);
    expect(result.isPwned).toBe(true);
    expect(result.pwnedCount).toBe(8765319);
  });

  it("returns the prefix in the output (lowercased)", () => {
    const result = parsePwnedPasswordResponse(MOCK_HIBP_RESPONSE, FULL_HASH, PREFIX);
    expect(result.prefix).toBe(PREFIX.toLowerCase());
  });

  it("includes a checkedAt ISO timestamp", () => {
    const result = parsePwnedPasswordResponse(MOCK_HIBP_RESPONSE, FULL_HASH, PREFIX);
    expect(result.checkedAt).toBeDefined();
    expect(() => new Date(result.checkedAt)).not.toThrow();
  });
});
