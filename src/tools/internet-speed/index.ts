import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Internet Speed Test.
 */
export const internetSpeedTool: ToolDefinition = {
  id: "internet-speed",
  name: "Internet Speed Test",
  description: "Measure real-time download bandwidth, upload capacity, and network latency.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#001",
  complexity: "basic",
  tags: ["network", "speed", "bandwidth", "latency"],
  Component: lazy(() => import("./InternetSpeedTool")),
};

export default internetSpeedTool;
