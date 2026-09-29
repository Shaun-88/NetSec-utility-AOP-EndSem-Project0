import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for File Hash Checker.
 */
export const fileHashTool: ToolDefinition = {
  id: "file-hash",
  name: "File Hash Checker",
  description: "Calculate and verify file checksum integrity hashes directly within the sandbox.",
  category: "cybersecurity",
  requiresServer: true,
  sequenceNumber: "#011",
  complexity: "intermediate",
  tags: ["cybersecurity", "file", "integrity", "checksum"],
  Component: lazy(() => import("./FileHashTool")),
};

export default fileHashTool;
