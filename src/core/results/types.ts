/**
 * Canonical tool result types
 * Defined once in src/core/ per Architecture Contract §2
 */

export type ToolCategory = "network" | "cybersecurity";

export interface ToolResult<TData = unknown> {
  toolId: string; // must match a ToolDefinition.id
  target?: string; // domain/URL/IP/file this result is about, if any
  ranAt: string; // ISO 8601
  data: TData; // tool-specific payload, opaque to core
}
