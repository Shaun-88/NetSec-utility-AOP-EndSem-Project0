import { describe, it, expect } from "vitest";
import { computeSubnet } from "./compute";
import { subnetInputSchema } from "./schema";

describe("Subnet Calculator Contract Tests", () => {
  it("validates valid IPv4 addresses and prefixes", () => {
    const valid = subnetInputSchema.parse({
      ip: "192.168.1.100",
      cidr: 24,
    });
    expect(valid.ip).toBe("192.168.1.100");
    expect(valid.cidr).toBe(24);
  });

  it("rejects invalid IP addresses and out-of-range CIDRs", () => {
    expect(() =>
      subnetInputSchema.parse({ ip: "999.999.999.999", cidr: 24 }),
    ).toThrow();
    expect(() =>
      subnetInputSchema.parse({ ip: "10.0.0.1", cidr: 33 }),
    ).toThrow();
    expect(() =>
      subnetInputSchema.parse({ ip: "10.0.0.1", cidr: -1 }),
    ).toThrow();
  });

  it("computes /24 network boundaries correctly", () => {
    const res = computeSubnet({ ip: "192.168.1.42", cidr: 24 });
    expect(res.networkAddress).toBe("192.168.1.0");
    expect(res.broadcastAddress).toBe("192.168.1.255");
    expect(res.netmask).toBe("255.255.255.0");
    expect(res.wildcardMask).toBe("0.0.0.255");
    expect(res.firstUsableIp).toBe("192.168.1.1");
    expect(res.lastUsableIp).toBe("192.168.1.254");
    expect(res.usableHosts).toBe(254);
    expect(res.totalHosts).toBe(256);
    expect(res.ipClass).toBe("C");
    expect(res.addressType).toBe("Private (RFC 1918)");
  });

  it("computes /16 network boundaries correctly", () => {
    const res = computeSubnet({ ip: "172.16.50.25", cidr: 16 });
    expect(res.networkAddress).toBe("172.16.0.0");
    expect(res.broadcastAddress).toBe("172.16.255.255");
    expect(res.netmask).toBe("255.255.0.0");
    expect(res.usableHosts).toBe(65534);
    expect(res.ipClass).toBe("B");
    expect(res.addressType).toBe("Private (RFC 1918)");
  });

  it("handles /30 point-to-point links", () => {
    const res = computeSubnet({ ip: "10.0.0.1", cidr: 30 });
    expect(res.networkAddress).toBe("10.0.0.0");
    expect(res.broadcastAddress).toBe("10.0.0.3");
    expect(res.firstUsableIp).toBe("10.0.0.1");
    expect(res.lastUsableIp).toBe("10.0.0.2");
    expect(res.usableHosts).toBe(2);
  });

  it("handles /31 point-to-point links (RFC 3021)", () => {
    const res = computeSubnet({ ip: "10.0.0.0", cidr: 31 });
    expect(res.usableHosts).toBe(2);
    expect(res.firstUsableIp).toBe("10.0.0.0");
    expect(res.lastUsableIp).toBe("10.0.0.1");
  });

  it("handles /32 single host routes", () => {
    const res = computeSubnet({ ip: "8.8.8.8", cidr: 32 });
    expect(res.usableHosts).toBe(1);
    expect(res.firstUsableIp).toBe("8.8.8.8");
    expect(res.lastUsableIp).toBe("8.8.8.8");
    expect(res.addressType).toBe("Public");
    expect(res.ipClass).toBe("A");
  });
});
