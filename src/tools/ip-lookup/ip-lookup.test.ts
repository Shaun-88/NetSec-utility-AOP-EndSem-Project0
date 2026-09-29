import { describe, it, expect } from "vitest";
import { computeIpLookupData } from "./compute";
import { ipLookupInputSchema } from "./schema";
import type { RawIpIntelligenceResponse } from "./types";

describe("IP Lookup Contract Tests", () => {
  it("validates empty / default input as undefined target (self-lookup)", () => {
    const valid = ipLookupInputSchema.parse({});
    expect(valid.target).toBeUndefined();

    const emptyStr = ipLookupInputSchema.parse({ target: "   " });
    expect(emptyStr.target).toBeUndefined();
  });

  it("validates specific IP or hostname targets", () => {
    const validIp = ipLookupInputSchema.parse({ target: "1.1.1.1" });
    expect(validIp.target).toBe("1.1.1.1");

    const validHost = ipLookupInputSchema.parse({ target: "github.com" });
    expect(validHost.target).toBe("github.com");
  });

  it("purely computes structured IP intelligence output without I/O", () => {
    const rawMock: RawIpIntelligenceResponse = {
      ip: "8.8.8.8",
      success: true,
      type: "IPv4",
      continent: "North America",
      country: "United States",
      country_code: "US",
      region: "California",
      city: "Mountain View",
      latitude: 37.386,
      longitude: -122.0838,
      postal: "94035",
      flag: {
        emoji: "🇺🇸",
      },
      connection: {
        asn: 15169,
        org: "Google LLC",
        isp: "Google LLC",
        domain: "google.com",
      },
      timezone: {
        id: "America/Los_Angeles",
        utc: "-07:00",
        current_time: "2026-09-29T08:00:00-07:00",
      },
      security: {
        vpn: false,
        proxy: false,
        tor: false,
        hosting: true,
      },
    };

    const output = computeIpLookupData("8.8.8.8", rawMock, "dns.google");

    expect(output.ip).toBe("8.8.8.8");
    expect(output.ipVersion).toBe("IPv4");
    expect(output.hostname).toBe("dns.google");
    expect(output.location.city).toBe("Mountain View");
    expect(output.location.country).toBe("United States");
    expect(output.location.countryCode).toBe("US");
    expect(output.network.asn).toBe("AS15169");
    expect(output.network.isp).toBe("Google LLC");
    expect(output.security.isHosting).toBe(true);
    expect(output.security.isVpnOrProxy).toBe(false);
  });
});
