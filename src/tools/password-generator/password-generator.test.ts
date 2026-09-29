import { describe, it, expect } from "vitest";
import { computePasswords, buildCharacterPool } from "./compute";
import { passwordGeneratorInputSchema } from "./schema";

describe("Password Generator Contract Tests", () => {
  it("validates input defaults and length boundaries", () => {
    const valid = passwordGeneratorInputSchema.parse({});
    expect(valid.length).toBe(16);
    expect(valid.includeUppercase).toBe(true);
    expect(valid.includeNumbers).toBe(true);

    expect(() => passwordGeneratorInputSchema.parse({ length: 4 })).toThrow();
    expect(() =>
      passwordGeneratorInputSchema.parse({
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      }),
    ).toThrow();
  });

  it("builds correct character pool based on selected options", () => {
    const poolNumbersOnly = buildCharacterPool({
      length: 10,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: false,
      quantity: 1,
    });
    expect(poolNumbersOnly.pool).toBe("0123456789");
    expect(poolNumbersOnly.requiredCharsets.length).toBe(1);

    const poolNoAmbiguous = buildCharacterPool({
      length: 10,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: true,
      quantity: 1,
    });
    // AMBIGUOUS includes '0', '1', '5', '2'
    expect(poolNoAmbiguous.pool.includes("0")).toBe(false);
    expect(poolNoAmbiguous.pool.includes("1")).toBe(false);
  });

  it("purely computes passwords deterministically with mock entropy without I/O", () => {
    let mockCounter = 0;
    const mockRng = (max: number) => {
      mockCounter = (mockCounter + 1) % max;
      return mockCounter;
    };

    const res = computePasswords(
      {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: false,
        quantity: 2,
      },
      mockRng,
    );

    expect(res.passwords.length).toBe(2);
    expect(res.passwords[0].password.length).toBe(12);
    expect(res.passwords[0].entropyBits).toBeGreaterThan(50);
    expect(res.characterPoolSize).toBeGreaterThan(70);
  });
});
