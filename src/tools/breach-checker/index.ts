import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Breach Checker.
 */
export const breachCheckerTool: ToolDefinition = {
  id: "breach-checker",
  name: "Breach Checker",
  description: "Check if an email address has appeared in known data breaches via the Have I Been Pwned API.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#014",
  complexity: "intermediate",
  tags: ["cybersecurity", "breach", "hibp", "email", "privacy"],
  Component: lazy(() => import("./BreachCheckerTool")),
};

export default breachCheckerTool;
