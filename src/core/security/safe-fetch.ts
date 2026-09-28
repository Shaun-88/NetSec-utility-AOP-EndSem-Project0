import "server-only";
import net from "node:net";
import dns from "node:dns/promises";

/**
 * Node.js net.BlockList configured with RFC1918, loopback, link-local,
 * and cloud metadata IP ranges to prevent SSRF vulnerabilities.
 */
const blockList = new net.BlockList();

// IPv4 Private & Restricted Ranges
blockList.addSubnet("127.0.0.0", 8, "ipv4");     // Loopback
blockList.addSubnet("10.0.0.0", 8, "ipv4");      // Private Class A
blockList.addSubnet("172.16.0.0", 12, "ipv4");   // Private Class B
blockList.addSubnet("192.168.0.0", 16, "ipv4");  // Private Class C
blockList.addSubnet("169.254.0.0", 16, "ipv4");  // Link-Local / AWS/GCP Metadata
blockList.addSubnet("0.0.0.0", 8, "ipv4");        // Current network
blockList.addSubnet("100.64.0.0", 10, "ipv4");   // Carrier-grade NAT

// IPv6 Restricted Ranges
blockList.addAddress("::1", "ipv6");              // Loopback
blockList.addSubnet("fc00::", 7, "ipv6");         // Unique Local Address
blockList.addSubnet("fe80::", 10, "ipv6");        // Link-Local Address

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxRedirects?: number;
  maxBytes?: number;
  headers?: Record<string, string>;
  method?: "GET" | "HEAD";
  allowedPorts?: number[];
}

export interface SafeFetchResponse {
  status: number;
  statusText: string;
  headers: Headers;
  text(): Promise<string>;
  json<T = unknown>(): Promise<T>;
  url: string;
}

/**
 * Checks whether an IP address is blocked by SSRF policy.
 */
export function isIpBlocked(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) {
    return blockList.check(ip, "ipv4");
  } else if (family === 6) {
    // If it's an IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1), check the underlying IPv4
    if (ip.toLowerCase().startsWith("::ffff:")) {
      const ipv4Part = ip.slice(7);
      if (net.isIPv4(ipv4Part)) {
        return blockList.check(ipv4Part, "ipv4");
      }
    }
    return blockList.check(ip, "ipv6");
  }
  return true; // Invalid IP is rejected
}

/**
 * Resolves a hostname and verifies that NONE of the resolved IPs are in blocked ranges.
 */
export async function validateHost(
  hostname: string,
): Promise<{ resolvedIps: string[] }> {
  // If the hostname itself is an IP, check it directly
  if (net.isIP(hostname)) {
    if (isIpBlocked(hostname)) {
      throw new Error(`SSRF Blocked: Host '${hostname}' is a restricted IP address.`);
    }
    return { resolvedIps: [hostname] };
  }

  // Reject local domain names
  const lowerHost = hostname.toLowerCase();
  if (
    lowerHost === "localhost" ||
    lowerHost.endsWith(".localhost") ||
    lowerHost.endsWith(".local") ||
    lowerHost.endsWith(".internal")
  ) {
    throw new Error(`SSRF Blocked: Host '${hostname}' is a restricted local name.`);
  }

  let lookupResults: Array<{ address: string; family: number }>;
  try {
    lookupResults = await dns.lookup(hostname, { all: true });
  } catch (err) {
    throw new Error(
      `DNS Lookup Failed: Unable to resolve host '${hostname}': ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  if (!lookupResults || lookupResults.length === 0) {
    throw new Error(`DNS Lookup Failed: No IP addresses resolved for '${hostname}'.`);
  }

  const resolvedIps = lookupResults.map((r) => r.address);
  for (const ip of resolvedIps) {
    if (isIpBlocked(ip)) {
      throw new Error(
        `SSRF Blocked: Host '${hostname}' resolved to restricted IP address '${ip}'.`,
      );
    }
  }

  return { resolvedIps };
}

/**
 * Validates a target URL for protocol, allowed ports, and IP resolution.
 */
export async function validateUrl(
  rawUrl: string,
  allowedPorts: number[] = [80, 443],
): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL provided: '${rawUrl}'`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `SSRF Blocked: Protocol '${parsed.protocol}' is not allowed. Only http: and https: are permitted.`,
    );
  }

  const port = parsed.port
    ? parseInt(parsed.port, 10)
    : parsed.protocol === "https:"
    ? 443
    : 80;

  if (!allowedPorts.includes(port)) {
    throw new Error(
      `SSRF Blocked: Port '${port}' is not in the allowed port list (${allowedPorts.join(
        ", ",
      )}).`,
    );
  }

  await validateHost(parsed.hostname);
  return parsed;
}

/**
 * Safe fetch wrapper that enforces SSRF prevention, manual redirect validation,
 * response size caps, and strict timeouts.
 */
export async function safeFetch(
  targetUrl: string,
  options: SafeFetchOptions = {},
): Promise<SafeFetchResponse> {
  const {
    timeoutMs = 8000,
    maxRedirects = 3,
    maxBytes = 2 * 1024 * 1024, // 2MB max
    headers = {},
    method = "GET",
    allowedPorts = [80, 443],
  } = options;

  let currentUrl = targetUrl;
  let redirectsRemaining = maxRedirects;

  while (true) {
    const validatedUrl = await validateUrl(currentUrl, allowedPorts);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(validatedUrl.toString(), {
        method,
        headers: {
          ...headers,
          "User-Agent": "NetSecArmoury-DiagnosticsBot/1.0",
          Accept: "*/*",
        },
        redirect: "manual",
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle Redirects manually to re-verify destination IPs
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) {
          throw new Error("Redirect response missing 'Location' header.");
        }

        if (redirectsRemaining <= 0) {
          throw new Error(`Maximum redirect limit (${maxRedirects}) exceeded.`);
        }

        redirectsRemaining--;
        // Resolve relative redirects against the current URL
        currentUrl = new URL(location, validatedUrl).toString();
        continue;
      }

      // Check Content-Length if provided
      const contentLengthHeader = response.headers.get("content-length");
      if (contentLengthHeader) {
        const contentLength = parseInt(contentLengthHeader, 10);
        if (contentLength > maxBytes) {
          throw new Error(
            `Response size (${contentLength} bytes) exceeds maximum limit of ${maxBytes} bytes.`,
          );
        }
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: validatedUrl.toString(),
        text: async () => {
          const text = await response.text();
          if (text.length > maxBytes) {
            throw new Error(`Response body exceeds maximum limit of ${maxBytes} bytes.`);
          }
          return text;
        },
        json: async <T>() => {
          const text = await response.text();
          if (text.length > maxBytes) {
            throw new Error(`Response body exceeds maximum limit of ${maxBytes} bytes.`);
          }
          return JSON.parse(text) as T;
        },
      };
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
