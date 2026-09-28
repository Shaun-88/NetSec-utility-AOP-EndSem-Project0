import type { ToolDefinition } from "@/core/tool-kit/types";

/**
 * Client-safe registry of all active tools in the Armoury.
 * Read by the sidebar, home page, and router.
 * Tools are populated as they are implemented in Phases 4 & 5.
 */
export const tools: ToolDefinition[] = [];
