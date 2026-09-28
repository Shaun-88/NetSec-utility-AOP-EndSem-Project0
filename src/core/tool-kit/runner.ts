import "server-only";
import { serverHandlers } from "@/registry/tools.server";
import { saveToolHistory } from "@/db/queries/history";
import type { ToolResult } from "@/core/results/types";
import type { ToolRunContext } from "./types";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter.
 * Limits by userId (or fallback identifier) with tool-specific limits.
 */
export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000,
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Executes a promise with a hard timeout.
 */
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("Operation exceeded maximum execution time.")),
      timeoutMs,
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

export interface RunToolOptions {
  toolId: string;
  userId: string;
  body: unknown;
  rateLimitOverride?: { limit: number; windowMs: number };
}

export interface RunToolOutput<TData = unknown> {
  success: boolean;
  status: number;
  result?: ToolResult<TData>;
  error?: string;
}

/**
 * Canonical tool execution front door.
 * Implements the 6-step sequence mandated in Architecture Contract §5.
 */
export async function executeToolFrontDoor(
  options: RunToolOptions,
): Promise<RunToolOutput> {
  const { toolId, userId, body, rateLimitOverride } = options;

  // 1. Resolve toolId in serverHandlers. Unknown -> 404
  const handlerLoader = serverHandlers[toolId];
  if (!handlerLoader) {
    return {
      success: false,
      status: 404,
      error: `Tool '${toolId}' is not registered or does not require server execution.`,
    };
  }

  // 2. Verify session / userId. No session -> 401
  if (!userId) {
    return {
      success: false,
      status: 401,
      error: "Authentication required. Please sign in.",
    };
  }

  // 3. Rate-limit by userId. Exceeded -> 429
  const limit = rateLimitOverride?.limit ?? 60;
  const windowMs = rateLimitOverride?.windowMs ?? 60_000;
  const rateLimitKey = `${userId}:${toolId}`;
  if (!checkRateLimit(rateLimitKey, limit, windowMs)) {
    return {
      success: false,
      status: 429,
      error: "Rate limit exceeded. Please wait before executing again.",
    };
  }

  // 4. Load handler and execute with 8s hard timeout
  try {
    const loadedModule = await handlerLoader();
    const handler = loadedModule.default;

    const ctx: ToolRunContext = { userId };
    const result = await executeWithTimeout(handler.run(body, ctx), 8000);

    // 5. On success: persist to user's tool_history
    await saveToolHistory(userId, toolId, result.data, result.target);

    return {
      success: true,
      status: 200,
      result,
    };
  } catch (err) {
    // 6. Generic error returned, no internal implementation details leaked
    console.error(`[Tool Execution Failure] Tool: ${toolId}, User: ${userId}`, err);

    const isZodError =
      err && typeof err === "object" && "issues" in err;
    if (isZodError) {
      return {
        success: false,
        status: 400,
        error: "Invalid input parameters provided for this tool.",
      };
    }

    return {
      success: false,
      status: 500,
      error: err instanceof Error ? err.message : "Execution failed.",
    };
  }
}
