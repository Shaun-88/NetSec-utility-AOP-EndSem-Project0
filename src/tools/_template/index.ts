import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for the Reference Template Tool.
 */
export const templateTool: ToolDefinition = {
  id: "template",
  name: "Template Tool",
  description: "Reference module demonstrating the architectural pattern for all tools.",
  category: "network",
  requiresServer: true,
  Component: lazy(() => import("./TemplateTool")),
};

export default templateTool;
