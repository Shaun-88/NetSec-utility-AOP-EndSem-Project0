import { describe, it, expect } from "vitest";
import { isIpBlocked, validateUrl } from "../src/core/security/safe-fetch";

describe("SafeFetch Security & SSRF Protection", () => {
  it("blocks private, loopback, and metadata IPv4 ranges", () => {
    // Loopback
    expect(isIpBlocked("127.0.0.1")).toBe(true);
    expect(isIpBlocked("127.0.1.5")).toBe(true);

    // Private Class A
    expect(isIpBlocked("10.0.0.1")).toBe(true);
    expect(isIpBlocked("10.254.0.1")).toBe(true);

    // Private Class B
    expect(isIpBlocked("172.16.0.1")).toBe(true);
    expect(isIpBlocked("172.31.255.254")).toBe(true);

    // Private Class C
    expect(isIpBlocked("192.168.0.1")).toBe(true);
    expect(isIpBlocked("192.168.1.100")).toBe(true);

    // Cloud Metadata / Link-Local
    expect(isIpBlocked("169.254.169.254")).toBe(true);
    expect(isIpBlocked("169.254.1.1")).toBe(true);

    // Current network
    expect(isIpBlocked("0.0.0.0")).toBe(true);
  });

  it("blocks private and loopback IPv6 ranges", () => {
    // IPv6 Loopback
    expect(isIpBlocked("::1")).toBe(true);

    // Unique Local Addresses
    expect(isIpBlocked("fc00::1")).toBe(true);
    expect(isIpBlocked("fd12:3456:789a:1::1")).toBe(true);

    // Link-local
    expect(isIpBlocked("fe80::1")).toBe(true);
  });

  it("permits legitimate public IP addresses", () => {
    expect(isIpBlocked("8.8.8.8")).toBe(false); // Google DNS
    expect(isIpBlocked("1.1.1.1")).toBe(false); // Cloudflare DNS
    expect(isIpBlocked("93.184.216.34")).toBe(false); // example.com
    expect(isIpBlocked("2606:4700:4700::1111")).toBe(false); // Cloudflare IPv6
  });

  it("rejects non-http/https protocols", async () => {
    await expect(validateUrl("ftp://example.com")).rejects.toThrow(
      /Protocol 'ftp:' is not allowed/,
    );
    await expect(validateUrl("file:///etc/passwd")).rejects.toThrow(
      /Protocol 'file:' is not allowed/,
    );
    await expect(validateUrl("gopher://example.com")).rejects.toThrow(
      /Protocol 'gopher:' is not allowed/,
    );
  });

  it("rejects disallowed ports by default", async () => {
    await expect(validateUrl("http://example.com:22")).rejects.toThrow(
      /Port '22' is not in the allowed port list/,
    );
    await expect(validateUrl("http://example.com:25")).rejects.toThrow(
      /Port '25' is not in the allowed port list/,
    );
    await expect(validateUrl("http://example.com:3306")).rejects.toThrow(
      /Port '3306' is not in the allowed port list/,
    );
  });

  it("rejects localhost and loopback hostnames", async () => {
    await expect(validateUrl("http://localhost")).rejects.toThrow(
      /restricted local name|restricted IP address/,
    );
    await expect(validateUrl("http://127.0.0.1")).rejects.toThrow(
      /restricted IP address/,
    );
  });
});
