import { describe, it, expect } from "vitest";
import { computePasswordStrength } from "./compute";
import { passwordStrengthInputSchema } from "./schema";

describe("Password Strength Checker Contract Tests", () => {
  it("validates empty input cleanly", () => {
    const valid = passwordStrengthInputSchema.parse({});
    expect(valid.password).toBe("");
  });

  it("evaluates weak common passwords correctly", () => {
    const res = computePasswordStrength({ password: "password123" });
    expect(res.rating).toBe("Very Weak");
    expect(res.warnings.length).toBeGreaterThan(0);
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
  });

  it("penalizes sequential runs and repetitive patterns", () => {
    const res = computePasswordStrength({ password: "abcdef123456" });
    expect(res.warnings.some((w) => w.includes("predictable sequence"))).toBe(true);
  });
});
