import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Hash Generator.
 */
export const hashGeneratorTool: ToolDefinition = {
  id: "hash-generator",
  name: "Hash Generator",
  description: "Compute cryptographic digests across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms.",
  category: "cybersecurity",
  requiresServer: false,
  sequenceNumber: "#009",
  complexity: "basic",
  tags: ["cybersecurity", "hash", "sha256", "checksum"],
  Component: lazy(() => import("./HashGeneratorTool")),
};

export default hashGeneratorTool;
