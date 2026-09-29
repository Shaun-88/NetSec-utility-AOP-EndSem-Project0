import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for IP Lookup.
 */
export const ipLookupTool: ToolDefinition = {
  id: "ip-lookup",
  name: "IP Lookup",
  description: "Resolve public IP address geolocation, Autonomous System Number (ASN), and ISP details.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#002",
  complexity: "basic",
  tags: ["network", "ip", "geolocation", "asn"],
  Component: lazy(() => import("./IpLookupTool")),
};

export default ipLookupTool;
