import type React from "react";
import type { ToolCategory, ToolResult } from "../results/types";

/**
 * Metadata and client component definition for a tool.
 * Read by the sidebar, home page, and router.
 */
export interface ToolDefinition {
  id: string; // stable slug: url segment + history record tag
  name: string;
  description: string;
  category: ToolCategory;
  requiresServer: boolean;
  Component: React.LazyExoticComponent<React.ComponentType>;
}

/**
 * Execution context provided to tool server modules.
 * userId is verified by session and never supplied by the client.
 */
export interface ToolRunContext {
  userId: string;
}

/**
 * Server module contract implemented by tools that have requiresServer: true.
 */
export interface ToolServerModule<TInput = unknown, TData = unknown> {
  run(input: TInput, ctx: ToolRunContext): Promise<ToolResult<TData>>;
}
