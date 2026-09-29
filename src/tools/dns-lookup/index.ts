import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for DNS Lookup.
 */
export const dnsLookupTool: ToolDefinition = {
  id: "dns-lookup",
  name: "DNS Lookup",
  description: "Analyze authoritative DNS records including A, AAAA, MX, TXT, NS, and CNAME.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#003",
  complexity: "intermediate",
  tags: ["network", "dns", "records", "nameserver"],
  Component: lazy(() => import("./DnsLookupTool")),
};

export default dnsLookupTool;
