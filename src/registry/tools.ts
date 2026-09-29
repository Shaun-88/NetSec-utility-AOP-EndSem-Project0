import React, { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Helper to generate lazy placeholder components for tools pending Phases 4 & 5.
 * Uses React.createElement to avoid JSX in a .ts file.
 */
const createPlaceholder = (
  name: string,
  description: string,
  category: "network" | "cybersecurity",
  phase: string,
) =>
  lazy(async () => {
    const mod = await import("@/components/PlaceholderTool");
    const toolId = name.toLowerCase().replace(/\s+/g, "-");
    return {
      default: () =>
        React.createElement(mod.default, { toolId, name, description, category, phase }),
    };
  });

/**
 * Authoritative registry of all tools in The Big Bro's NetSec Armoury.
 * Read by the sidebar, home dashboard, search bar, and tool router.
 */
export const tools: ToolDefinition[] = [
  // --- Network Tools (Phase 4) ---
  {
    id: "internet-speed",
    name: "Internet Speed Test",
    description: "Measure real-time download bandwidth, upload capacity, and network latency.",
    category: "network",
    requiresServer: true,
    sequenceNumber: "#001",
    complexity: "basic",
    tags: ["network", "speed", "bandwidth", "latency"],
    Component: createPlaceholder("Internet Speed Test", "Measure bandwidth and latency.", "network", "Phase 4"),
  },
  {
    id: "ip-lookup",
    name: "IP Lookup",
    description: "Resolve public IP address geolocation, Autonomous System Number (ASN), and ISP details.",
    category: "network",
    requiresServer: true,
    sequenceNumber: "#002",
    complexity: "basic",
    tags: ["network", "ip", "geolocation", "asn"],
    Component: createPlaceholder("IP Lookup", "Resolve public IP geolocation and ISP.", "network", "Phase 4"),
  },
  {
    id: "dns-lookup",
    name: "DNS Lookup",
    description: "Analyze authoritative DNS records including A, AAAA, MX, TXT, NS, and CNAME.",
    category: "network",
    requiresServer: true,
    sequenceNumber: "#003",
    complexity: "intermediate",
    tags: ["network", "dns", "records", "nameserver"],
    Component: createPlaceholder("DNS Lookup", "Inspect DNS zone records.", "network", "Phase 4"),
  },
  {
    id: "subnet-calculator",
    name: "Subnet Calculator",
    description: "Calculate CIDR prefixes, subnet masks, usable host ranges, and broadcast boundaries.",
    category: "network",
    requiresServer: false,
    sequenceNumber: "#004",
    complexity: "basic",
    tags: ["network", "subnet", "cidr", "ip-range"],
    Component: createPlaceholder("Subnet Calculator", "Calculate CIDR math and host ranges.", "network", "Phase 4"),
  },
  {
    id: "port-checker",
    name: "Port Checker",
    description: "Verify service port connectivity and reachability with strict port allow-listing and SSRF protection.",
    category: "network",
    requiresServer: true,
    sequenceNumber: "#005",
    complexity: "intermediate",
    tags: ["network", "port", "firewall", "reachability"],
    Component: createPlaceholder("Port Checker", "Verify diagnostic service ports.", "network", "Phase 4"),
  },
  {
    id: "ping-latency",
    name: "Ping / Latency Checker",
    description: "Calculate HTTP round-trip timing, jitter statistics, and server response distributions.",
    category: "network",
    requiresServer: true,
    sequenceNumber: "#006",
    complexity: "basic",
    tags: ["network", "ping", "latency", "jitter"],
    Component: createPlaceholder("Ping / Latency Checker", "Round-trip HTTP response timing.", "network", "Phase 4"),
  },

  // --- Cybersecurity Tools (Phase 5) ---
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate cryptographically secure passwords utilizing hardware-grade crypto.getRandomValues.",
    category: "cybersecurity",
    requiresServer: false,
    sequenceNumber: "#007",
    complexity: "basic",
    tags: ["cybersecurity", "password", "crypto", "generator"],
    Component: createPlaceholder("Password Generator", "Cryptographically secure password generation.", "cybersecurity", "Phase 5"),
  },
  {
    id: "password-strength",
    name: "Password Strength Checker",
    description: "Evaluate password entropy, pattern heuristics, dictionary vulnerabilities, and estimated crack time.",
    category: "cybersecurity",
    requiresServer: false,
    sequenceNumber: "#008",
    complexity: "intermediate",
    tags: ["cybersecurity", "entropy", "strength", "audit"],
    Component: createPlaceholder("Password Strength Checker", "Evaluate entropy and crack time.", "cybersecurity", "Phase 5"),
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    description: "Compute cryptographic digests across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms.",
    category: "cybersecurity",
    requiresServer: false,
    sequenceNumber: "#009",
    complexity: "basic",
    tags: ["cybersecurity", "hash", "sha256", "checksum"],
    Component: createPlaceholder("Hash Generator", "Compute cryptographic text hashes.", "cybersecurity", "Phase 5"),
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Token headers, claims, expiration timestamps, and payloads client-side.",
    category: "cybersecurity",
    requiresServer: false,
    sequenceNumber: "#010",
    complexity: "intermediate",
    tags: ["cybersecurity", "jwt", "token", "auth"],
    Component: createPlaceholder("JWT Decoder", "Inspect JWT claims and header data.", "cybersecurity", "Phase 5"),
  },
  {
    id: "file-hash",
    name: "File Hash Checker",
    description: "Calculate and verify file checksum integrity hashes directly within the sandbox.",
    category: "cybersecurity",
    requiresServer: true,
    sequenceNumber: "#011",
    complexity: "intermediate",
    tags: ["cybersecurity", "file", "integrity", "checksum"],
    Component: createPlaceholder("File Hash Checker", "Verify file integrity hashes.", "cybersecurity", "Phase 5"),
  },
  {
    id: "security-headers",
    name: "Security Header Analyzer",
    description: "Audit HTTP response security posture for CSP, HSTS, X-Frame-Options, and permission policies.",
    category: "cybersecurity",
    requiresServer: true,
    sequenceNumber: "#012",
    complexity: "advanced",
    tags: ["cybersecurity", "headers", "csp", "hsts", "audit"],
    Component: createPlaceholder("Security Header Analyzer", "Audit HTTP security headers.", "cybersecurity", "Phase 5"),
  },
  {
    id: "binary-text",
    name: "Binary ⇄ Text Converter",
    description: "Bidirectional translation between standard UTF-8 text and formatted 8-bit binary bytecode.",
    category: "cybersecurity",
    requiresServer: false,
    sequenceNumber: "#013",
    complexity: "basic",
    tags: ["cybersecurity", "binary", "ascii", "encoding"],
    Component: createPlaceholder("Binary ⇄ Text Converter", "Bidirectional binary and text converter.", "cybersecurity", "Phase 5"),
  },
];
