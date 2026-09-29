import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Password Strength Checker.
 */
export const passwordStrengthTool: ToolDefinition = {
  id: "password-strength",
  name: "Password Strength Checker",
  description: "Evaluate password entropy, pattern heuristics, dictionary vulnerabilities, and estimated crack time.",
  category: "cybersecurity",
  requiresServer: false,
  sequenceNumber: "#008",
  complexity: "intermediate",
  tags: ["cybersecurity", "entropy", "strength", "audit"],
  Component: lazy(() => import("./PasswordStrengthTool")),
};

export default passwordStrengthTool;
