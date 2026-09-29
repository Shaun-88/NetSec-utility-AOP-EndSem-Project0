import { lazy } from "react";
import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Tool Definition for JWT Decoder.
 */
export const jwtDecoderTool: ToolDefinition = {
  id: "jwt-decoder",
  name: "JWT Decoder",
  description: "Decode and inspect JSON Web Token headers, claims, expiration timestamps, and payloads client-side.",
  category: "cybersecurity",
  requiresServer: false,
  sequenceNumber: "#010",
  complexity: "intermediate",
  tags: ["cybersecurity", "jwt", "token", "auth"],
  Component: lazy(() => import("./JwtDecoderTool")),
};

export default jwtDecoderTool;
