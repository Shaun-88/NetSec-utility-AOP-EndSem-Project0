import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Website Security Report.
 */
export const websiteSecurityReportTool: ToolDefinition = {
  id: "website-security-report",
  name: "Website Security Report",
  description:
    "Run DNS, TLS, security headers, and WHOIS checks simultaneously against a domain and get one combined letter grade.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#017",
  complexity: "advanced",
  tags: ["cybersecurity", "audit", "tls", "dns", "headers", "whois", "report"],
  Component: lazy(() => import("./WebsiteSecurityReportTool")),
};

export default websiteSecurityReportTool;
