import { describe, it, expect } from "vitest";
import {
  computePasswordStrength,
  formatCrackTime,
  getRatingDescription,
  generateActionableTips,
} from "./compute";
import { passwordStrengthInputSchema } from "./schema";

describe("Password Strength Checker Contract & Unit Tests", () => {
  describe("Input schema & defaults", () => {
    it("validates empty input cleanly", () => {
      const valid = passwordStrengthInputSchema.parse({});
      expect(valid.password).toBe("");
    });
  });

  describe("Formatting and plain-language helpers", () => {
    it("formats crack times across timescales accurately", () => {
      expect(formatCrackTime(0.5)).toBe("Instantaneous");
      expect(formatCrackTime(45)).toBe("45 seconds");
      expect(formatCrackTime(180)).toBe("3 minutes");
      expect(formatCrackTime(7200)).toBe("2 hours");
      expect(formatCrackTime(86400 * 5)).toBe("5 days");
      expect(formatCrackTime(31536000 * 2)).toBe("2 years");
    });

    it("returns plain-language rating descriptions for all tiers", () => {
      expect(getRatingDescription("Very Weak")).toContain("Extremely vulnerable");
      expect(getRatingDescription("Weak")).toContain("Below modern security standards");
      expect(getRatingDescription("Moderate")).toContain("Decent for low-risk accounts");
      expect(getRatingDescription("Strong")).toContain("Robust security posture");
      expect(getRatingDescription("Very Strong")).toContain("Exceptional defense");
    });

    it("generates actionable tips for weak configurations", () => {
      const tips = generateActionableTips(
        8,
        {
          hasUppercase: false,
          hasLowercase: true,
          hasNumbers: false,
          hasSymbols: false,
          hasMinLength: false,
          hasNoCommonPatterns: false,
        },
        ["Contains common dictionary term: 'password'"],
      );

      expect(tips.some((t) => t.includes("Make it longer"))).toBe(true);
      expect(tips.some((t) => t.includes("Remove dictionary words"))).toBe(true);
      expect(tips.some((t) => t.includes("uppercase"))).toBe(true);
      expect(tips.some((t) => t.includes("numbers"))).toBe(true);
      expect(tips.some((t) => t.includes("symbols"))).toBe(true);
    });
  });

  describe("Pure compute function", () => {
    it("evaluates weak common passwords correctly", () => {
      const res = computePasswordStrength({ password: "password123" });
      expect(res.rating).toBe("Very Weak");
      expect(res.ratingDescription).toContain("Extremely vulnerable");
      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.actionableTips.length).toBeGreaterThan(0);
      expect(res.score).toBeLessThan(35);
    });

    it("evaluates strong passwords with high entropy and long crack times", () => {
      const res = computePasswordStrength({ password: "K9#xP!m9$wL2@vQ7" });
      expect(res.rating).toBe("Very Strong");
      expect(res.entropyBits).toBeGreaterThan(70);
      expect(res.checklist.hasUppercase).toBe(true);
      expect(res.checklist.hasLowercase).toBe(true);
      expect(res.checklist.hasNumbers).toBe(true);
      expect(res.checklist.hasSymbols).toBe(true);
      expect(res.crackTimes.onlineAttack).toContain("years");
      expect(res.actionableTips.some((t) => t.includes("Never reuse"))).toBe(true);
    });

    it("penalizes sequential runs and repetitive patterns", () => {
      const res = computePasswordStrength({ password: "abcdef123456" });
      expect(res.warnings.some((w) => w.includes("predictable sequence"))).toBe(true);
    });

    it("handles completely empty password evaluation cleanly", () => {
      const res = computePasswordStrength({ password: "" });
      expect(res.score).toBe(0);
      expect(res.entropyBits).toBe(0);
      expect(res.actionableTips.length).toBeGreaterThan(0);
    });
  });
});
