import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Password Generator.
 */
export const passwordGeneratorTool: ToolDefinition = {
  id: "password-generator",
  name: "Password Generator",
  description: "Generate cryptographically secure passwords utilizing hardware-grade crypto.getRandomValues.",
  category: "cybersecurity",
  requiresServer: false,
  sequenceNumber: "#007",
  complexity: "basic",
  tags: ["cybersecurity", "password", "crypto", "generator"],
  Component: lazy(() => import("./PasswordGeneratorTool")),
};

export default passwordGeneratorTool;
