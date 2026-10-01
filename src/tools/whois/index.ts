import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for WHOIS / Domain Lookup.
 */
export const whoisTool: ToolDefinition = {
  id: "whois",
  name: "WHOIS / Domain Lookup",
  description: "Query domain registration data via RDAP: registrar, registration date, expiry, name servers, and status flags.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#016",
  complexity: "basic",
  tags: ["network", "whois", "rdap", "domain", "registration"],
  Component: lazy(() => import("./WhoisTool")),
};

export default whoisTool;
