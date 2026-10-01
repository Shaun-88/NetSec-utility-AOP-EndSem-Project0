import { describe, it, expect } from "vitest";
import {
  computeBreachData,
  type GenericRawBreach,
} from "./compute";
import { breachCheckerInputSchema } from "./schema";

const MOCK_HIBP_BREACH: GenericRawBreach = {
  Name: "Adobe",
  Domain: "adobe.com",
  BreachDate: "2013-10-04",
  Description: "In October 2013, 153 million Adobe accounts were breached.",
  DataClasses: ["Email addresses", "Passwords"],
  IsVerified: true,
  IsSensitive: false,
  PwnCount: 152445165,
};

const MOCK_XON_BREACH: GenericRawBreach = {
  breach: "Canva",
  domain: "canva.com",
  xposed_date: "2019",
  details: "In May 2019, Canva suffered a breach.",
  xposed_data: "Email addresses;Passwords;Names",
  xposed_records: 137000000,
  verified: "Yes",
};

describe("Breach Checker — schema", () => {
  it("accepts a valid email address", () => {
    const result = breachCheckerInputSchema.parse({ target: "user@example.com" });
    expect(result.target).toBe("user@example.com");
  });

  it("trims whitespace from email", () => {
    const result = breachCheckerInputSchema.parse({ target: "  test@domain.org  " });
    expect(result.target).toBe("test@domain.org");
  });

  it("rejects a non-email string", () => {
    expect(() => breachCheckerInputSchema.parse({ target: "notanemail" })).toThrow();
  });

  it("rejects an empty string", () => {
    expect(() => breachCheckerInputSchema.parse({ target: "" })).toThrow();
  });
});

describe("Breach Checker — computeBreachData", () => {
  it("returns zero breaches and isClean=true when given an empty array", () => {
    const result = computeBreachData("clean@example.com", []);
    expect(result.breachCount).toBe(0);
    expect(result.isClean).toBe(true);
    expect(result.breaches).toHaveLength(0);
    expect(result.email).toBe("clean@example.com");
    expect(result.checkedAt).toBeDefined();
  });

  it("parses an HIBP breach format correctly", () => {
    const result = computeBreachData("user@example.com", [MOCK_HIBP_BREACH]);
    expect(result.breachCount).toBe(1);
    expect(result.isClean).toBe(false);
    expect(result.breaches[0].name).toBe("Adobe");
    expect(result.breaches[0].domain).toBe("adobe.com");
    expect(result.breaches[0].breachDate).toBe("2013-10-04");
    expect(result.breaches[0].dataClasses).toContain("Passwords");
    expect(result.breaches[0].hasPassword).toBe(true);
  });

  it("parses an XposedOrNot breach format correctly", () => {
    const result = computeBreachData("user@example.com", [MOCK_XON_BREACH]);
    expect(result.breachCount).toBe(1);
    expect(result.isClean).toBe(false);
    expect(result.breaches[0].name).toBe("Canva");
    expect(result.breaches[0].domain).toBe("canva.com");
    expect(result.breaches[0].dataClasses).toContain("Passwords");
    expect(result.breaches[0].dataClasses).toContain("Names");
    expect(result.breaches[0].hasPassword).toBe(true);
  });

  it("deduplicates duplicate breach names", () => {
    const result = computeBreachData("user@example.com", [
      MOCK_HIBP_BREACH,
      { ...MOCK_HIBP_BREACH, Description: "Duplicate entry" },
    ]);
    expect(result.breachCount).toBe(1);
    expect(result.breaches).toHaveLength(1);
  });

  it("handles string sources correctly", () => {
    const result = computeBreachData("user@example.com", [
      {
        sources: "Dropbox",
        password: "hash",
      },
    ]);
    expect(result.breachCount).toBe(1);
    expect(result.breaches[0].name).toBe("Dropbox");
    expect(result.breaches[0].hasPassword).toBe(true);
  });
});
