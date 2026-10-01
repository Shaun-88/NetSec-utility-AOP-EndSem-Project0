import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Pwned Password Checker.
 */
export const pwnedPasswordTool: ToolDefinition = {
  id: "pwned-password",
  name: "Pwned Password Checker",
  description:
    "Check if a password has appeared in known data breaches using k-anonymity — your password never leaves your browser.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#018",
  complexity: "basic",
  tags: ["cybersecurity", "password", "breach", "hibp", "privacy"],
  Component: lazy(() => import("./PwnedPasswordTool")),
};

export default pwnedPasswordTool;
