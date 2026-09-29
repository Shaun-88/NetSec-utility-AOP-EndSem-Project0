import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Subnet Calculator.
 */
export const subnetCalculatorTool: ToolDefinition = {
  id: "subnet-calculator",
  name: "Subnet Calculator",
  description: "Calculate CIDR prefixes, subnet masks, usable host ranges, and broadcast boundaries.",
  category: "network",
  requiresServer: false,
  sequenceNumber: "#004",
  complexity: "basic",
  tags: ["network", "subnet", "cidr", "ip-range"],
  Component: lazy(() => import("./SubnetCalculatorTool")),
};

export default subnetCalculatorTool;
