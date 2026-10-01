import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for TLS/SSL Certificate Checker.
 */
export const tlsCheckerTool: ToolDefinition = {
  id: "tls-checker",
  name: "TLS/SSL Certificate Checker",
  description: "Inspect a domain's TLS certificate: issuer, expiry, days remaining, and protocol version.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#015",
  complexity: "intermediate",
  tags: ["cybersecurity", "tls", "ssl", "certificate", "https"],
  Component: lazy(() => import("./TlsCheckerTool")),
};

export default tlsCheckerTool;
