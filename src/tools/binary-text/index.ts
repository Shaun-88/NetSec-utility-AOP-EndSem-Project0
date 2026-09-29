import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Binary ⇄ Text Converter.
 */
export const binaryTextTool: ToolDefinition = {
  id: "binary-text",
  name: "Binary ⇄ Text Converter",
  description: "Bidirectional translation between standard UTF-8 text and formatted 8-bit binary bytecode.",
  category: "cybersecurity",
  requiresServer: false,
  sequenceNumber: "#013",
  complexity: "basic",
  tags: ["cybersecurity", "binary", "ascii", "encoding"],
  Component: lazy(() => import("./BinaryTextTool")),
};

export default binaryTextTool;
