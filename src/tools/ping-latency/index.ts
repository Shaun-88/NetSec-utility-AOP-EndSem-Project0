import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for Ping / Latency Checker.
 */
export const pingLatencyTool: ToolDefinition = {
  id: "ping-latency",
  name: "Ping / Latency Checker",
  description: "Calculate HTTP round-trip timing, jitter statistics, and server response distributions.",
  category: "network",
  requiresServer: true,
  sequenceNumber: "#006",
  complexity: "basic",
  tags: ["network", "ping", "latency", "jitter"],
  Component: lazy(() => import("./PingLatencyTool")),
};

export default pingLatencyTool;
