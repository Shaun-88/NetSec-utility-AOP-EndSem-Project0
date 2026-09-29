import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Security Header Analyzer.
 */
export const securityHeadersTool: ToolDefinition = {
  id: "security-headers",
  name: "Security Header Analyzer",
  description: "Audit HTTP response security posture for CSP, HSTS, X-Frame-Options, and permission policies.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#012",
  complexity: "advanced",
  tags: ["cybersecurity", "headers", "csp", "hsts", "audit"],
  Component: lazy(() => import("./SecurityHeadersTool")),
};

export default securityHeadersTool;
