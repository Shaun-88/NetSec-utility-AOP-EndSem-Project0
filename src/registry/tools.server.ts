import "server-only";
import type { ToolServerModule } from "@/core/tool-kit/types";

/**
 * Server-only tool dispatch registry.
 * Maps toolId to dynamic imports of server modules.
 * Only tools requiring server-side execution are registered here.
 */
export const serverHandlers: Record<
  string,
  () => Promise<{ default: ToolServerModule }>
> = {
  template: () => import("@/tools/_template/server"),
};
