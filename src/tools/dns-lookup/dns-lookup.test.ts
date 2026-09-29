import { describe, it, expect } from "vitest";
import { computeDnsLookupData } from "./compute";
import { dnsLookupInputSchema } from "./schema";

describe("DNS Lookup Contract Tests", () => {
  it("sanitizes domain inputs removing protocol, paths, and casing", () => {
    const valid1 = dnsLookupInputSchema.parse({ target: "https://Example.com/path?query=1" });
    expect(valid1.target).toBe("example.com");

    const valid2 = dnsLookupInputSchema.parse({ target: "  CLOUDFLARE.COM  " });
    expect(valid2.target).toBe("cloudflare.com");
  });

  it("rejects invalid domains", () => {
    expect(() => dnsLookupInputSchema.parse({ target: "" })).toThrow();
    expect(() => dnsLookupInputSchema.parse({ target: "invalid..domain" })).toThrow();
  });

  it("purely organizes DNS records into typed collections without I/O", () => {
    const rawMock = {
      a: [{ address: "192.0.2.1", ttl: 300 }],
      aaaa: [{ address: "2001:db8::1", ttl: 300 }],
      mx: [{ exchange: "mail.example.com", priority: 10 }],
      txt: [["v=spf1 include:_spf.google.com ~all"]],
      ns: ["ns1.example.com", "ns2.example.com"],
      cname: ["target.example.com"],
      soa: {
        nsname: "ns1.example.com",
        hostmaster: "hostmaster.example.com",
        serial: 2026092901,
        refresh: 7200,
        retry: 3600,
        expire: 1209600,
        minttl: 3600,
      },
    };

    const res = computeDnsLookupData("example.com", rawMock);

    expect(res.domain).toBe("example.com");
    expect(res.totalRecordsFound).toBe(8);
    expect(res.recordsByType.A?.[0].value).toBe("192.0.2.1");
    expect(res.recordsByType.AAAA?.[0].value).toBe("2001:db8::1");
    expect(res.recordsByType.MX?.[0].priority).toBe(10);
    expect(res.recordsByType.TXT?.[0].value).toBe("v=spf1 include:_spf.google.com ~all");
    expect(res.recordsByType.NS?.length).toBe(2);
    expect(res.recordsByType.SOA?.[0].serial).toBe(2026092901);
  });
});
