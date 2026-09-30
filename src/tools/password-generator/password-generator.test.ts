import { describe, it, expect } from "vitest";
import {
  computePasswords,
  buildCharacterPool,
  getStrengthTier,
  getCrackTimeEstimate,
} from "./compute";
import { passwordGeneratorInputSchema } from "./schema";

describe("Password Generator Contract & Unit Tests", () => {
  describe("Input schema & boundaries", () => {
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
  });

  describe("Character pool generation", () => {
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
  });

  describe("Strength tiers and crack time estimates", () => {
    it("classifies strength tiers according to Shannon entropy bits", () => {
      expect(getStrengthTier(110)).toBe("Uncrackable");
      expect(getStrengthTier(85)).toBe("Very Strong");
      expect(getStrengthTier(68)).toBe("Strong");
      expect(getStrengthTier(48)).toBe("Moderate");
      expect(getStrengthTier(25)).toBe("Weak");
    });

    it("provides plain-language crack time estimates", () => {
      expect(getCrackTimeEstimate(110)).toContain("Centuries to billions of years");
      expect(getCrackTimeEstimate(85)).toContain("Millions of years");
      expect(getCrackTimeEstimate(68)).toContain("Hundreds to thousands of years");
      expect(getCrackTimeEstimate(48)).toContain("Several days to months");
      expect(getCrackTimeEstimate(25)).toContain("Instantly to a few hours");
    });
  });

  describe("Deterministic compute function", () => {
    it("purely computes passwords deterministically with mock entropy without I/O", () => {
      let mockCounter = 0;
      const mockRng = (max: number) => {
        mockCounter = (mockCounter + 1) % max;
        return mockCounter;
      };

      const res = computePasswords(
        {
          length: 16,
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
      expect(res.passwords[0].password.length).toBe(16);
      expect(res.passwords[0].entropyBits).toBeGreaterThan(100);
      expect(res.passwords[0].strengthTier).toBe("Uncrackable");
      expect(res.passwords[0].crackTimeEstimate).toBeTruthy();
      expect(res.characterPoolSize).toBeGreaterThan(70);
    });
  });
});
