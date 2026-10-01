import { describe, it, expect } from "vitest";
import { computeWhoisData, type RawRdapResponse } from "./compute";
import { whoisInputSchema } from "./schema";

const MOCK_RDAP_RESPONSE: RawRdapResponse = {
  ldhName: "CLOUDFLARE.COM",
  status: ["client delete prohibited", "client transfer prohibited", "client update prohibited"],
  events: [
    { eventAction: "registration", eventDate: "1998-04-09T04:00:00Z" },
    { eventAction: "expiration", eventDate: "2028-04-10T04:00:00Z" },
    { eventAction: "last changed", eventDate: "2023-03-20T08:38:56Z" },
    { eventAction: "last update of RDAP database", eventDate: "2024-01-01T00:00:00Z" },
  ],
  nameservers: [
    { ldhName: "ns1.cloudflare.com" },
    { ldhName: "ns2.cloudflare.com" },
    { ldhName: "ns3.cloudflare.com" },
    { ldhName: "ns4.cloudflare.com" },
  ],
  entities: [
    {
      roles: ["registrar"],
      vcardArray: [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "CLOUDFLARE, INC."],
        ],
      ],
    },
    {
      roles: ["registrant"],
      vcardArray: [
        "vcard",
        [
          ["version", {}, "text", "4.0"],
          ["fn", {}, "text", "Cloudflare, Inc."],
          ["adr", { type: "work" }, "text", ["", "", "101 Townsend St", "San Francisco", "CA", "94107", "United States"]],
        ],
      ],
    },
  ],
};

const MINIMAL_RDAP: RawRdapResponse = {
  ldhName: "EXAMPLE.COM",
  status: [],
  events: [],
  nameservers: [],
  entities: [],
};

describe("WHOIS — schema", () => {
  it("accepts a plain domain name", () => {
    const result = whoisInputSchema.parse({ target: "cloudflare.com" });
    expect(result.target).toBe("cloudflare.com");
  });

  it("strips https:// from input", () => {
    const result = whoisInputSchema.parse({ target: "https://cloudflare.com" });
    expect(result.target).toBe("cloudflare.com");
  });

  it("strips path from URL", () => {
    const result = whoisInputSchema.parse({ target: "https://cloudflare.com/blog/post" });
    expect(result.target).toBe("cloudflare.com");
  });

  it("rejects empty input", () => {
    expect(() => whoisInputSchema.parse({ target: "" })).toThrow();
  });
});

describe("WHOIS — computeWhoisData", () => {
  it("extracts all fields from a complete RDAP response", () => {
    const result = computeWhoisData("cloudflare.com", MOCK_RDAP_RESPONSE);

    expect(result.domain).toBe("cloudflare.com");
    expect(result.registrar).toBe("CLOUDFLARE, INC.");
    expect(result.registrationDate).toBe("1998-04-09T04:00:00Z");
    expect(result.expiryDate).toBe("2028-04-10T04:00:00Z");
    expect(result.updatedDate).toBe("2023-03-20T08:38:56Z");
    expect(result.nameServers).toHaveLength(4);
    expect(result.nameServers).toContain("ns1.cloudflare.com");
    expect(result.status).toContain("client delete prohibited");
    expect(result.registrantCountry).toBe("United States");
    expect(result.checkedAt).toBeDefined();
  });

  it("returns nulls for missing dates in a minimal response", () => {
    const result = computeWhoisData("example.com", MINIMAL_RDAP);
    expect(result.registrationDate).toBeNull();
    expect(result.expiryDate).toBeNull();
    expect(result.updatedDate).toBeNull();
    expect(result.nameServers).toHaveLength(0);
    expect(result.status).toHaveLength(0);
    expect(result.registrantCountry).toBeNull();
    expect(result.registrar).toBe("Unknown");
  });

  it("normalizes domain name to lowercase", () => {
    const result = computeWhoisData("cloudflare.com", MOCK_RDAP_RESPONSE);
    expect(result.domain).toBe("cloudflare.com"); // CLOUDFLARE.COM -> cloudflare.com
  });

  it("normalizes nameservers to lowercase", () => {
    const result = computeWhoisData("cloudflare.com", MOCK_RDAP_RESPONSE);
    for (const ns of result.nameServers) {
      expect(ns).toBe(ns.toLowerCase());
    }
  });
});
