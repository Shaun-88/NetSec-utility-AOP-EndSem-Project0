import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Port Checker.
 */
export const portCheckerTool: ToolDefinition = {
  id: "port-checker",
  name: "Port Checker",
  description: "Verify service port connectivity and reachability with strict port allow-listing and SSRF protection.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#005",
  complexity: "intermediate",
  tags: ["network", "port", "firewall", "reachability"],
  Component: lazy(() => import("./PortCheckerTool")),
};

export default portCheckerTool;
