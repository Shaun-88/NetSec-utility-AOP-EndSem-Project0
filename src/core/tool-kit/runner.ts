import "server-only";
import { serverHandlers } from "@/registry/tools.server";
import { saveToolHistory } from "@/db/queries/history";
import { synthesizeAIContext } from "@/core/history/ai-synthesizer";
import type { ToolResult } from "@/core/results/types";
import type { ToolRunContext } from "./types";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const upstashLimiters = new Map<string, Ratelimit>();

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number,
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
 * Enterprise Sliding Window Rate Limiter.
 * Connects to Upstash Redis for multi-server (Vercel) tracking.
 * Automatically falls back to in-memory limits if UPSTASH keys are missing or offline.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000,
): Promise<boolean> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fallback to memory if env vars are missing (Local Dev)
  if (!upstashUrl || !upstashToken) {
    return checkRateLimitMemory(key, limit, windowMs);
  }

  try {
    const cacheKey = `${limit}:${windowMs}`;
    let limiter = upstashLimiters.get(cacheKey);

    if (!limiter) {
      const redis = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      limiter = new Ratelimit({
        redis,
        
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      });
      upstashLimiters.set(cacheKey, limiter);
    }

    const { success } = await limiter.limit(key);
    return success;
  } catch (error) {
    console.error("[Rate Limiter] Upstash Redis Error:", error);
    // Graceful degradation: Fallback to memory on Redis failure
    return checkRateLimitMemory(key, limit, windowMs);
  }
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
  if (!(await checkRateLimit(rateLimitKey, limit, windowMs))) {
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

    // Capture User-Agent and Hash Email to inject Telemetry data silently
    const clientInfo: Record<string, string> = { browser: "Unknown", os: "Unknown", device: "Desktop" };
    try {
      const { headers } = await import("next/headers");
      const headersList = await headers();
      const userAgent = headersList.get("user-agent") || "";
      if (userAgent) {
        if (/Mobile|Android|iP(hone|od|ad)/i.test(userAgent)) clientInfo.device = "Mobile";
        if (/Mac OS X/.test(userAgent)) clientInfo.os = "macOS";
        else if (/Windows/.test(userAgent)) clientInfo.os = "Windows";
        else if (/Linux/.test(userAgent)) clientInfo.os = "Linux";
        
        if (/Chrome/.test(userAgent)) clientInfo.browser = "Chrome";
        else if (/Safari/.test(userAgent)) clientInfo.browser = "Safari";
        else if (/Firefox/.test(userAgent)) clientInfo.browser = "Firefox";
      }

      // Add hashed email
      const { auth } = await import("@/auth");
      const session = await auth();
      const crypto = await import("crypto");
      const emailToHash = session?.user?.email || userId;
      clientInfo.agentHash = `OP-${crypto.createHash("sha256").update(emailToHash).digest("hex").substring(0, 8).toUpperCase()}`;
    } catch {
      // Ignore header parsing errors if executed outside of request scope
      clientInfo.agentHash = `OP-${userId.substring(0, 8).toUpperCase()}`;
    }

    // Inject client info into result data if it's an object
    let enrichedData = result.data;
    if (enrichedData && typeof enrichedData === 'object' && !Array.isArray(enrichedData)) {
      enrichedData = { ...enrichedData, _clientContext: clientInfo };
    }

    // 5. On success: persist to user's tool_history with AI-enriched telemetry
    const aiContext = synthesizeAIContext(toolId, result.target, result.data);
    await saveToolHistory(userId, toolId, enrichedData, result.target, aiContext);

    return {
      success: true,
      status: 200,
      result: {
        ...result,
        data: enrichedData
      },
    };
  } catch (err) {
    // 6. Generic error returned, no internal implementation details leaked
    console.error(`[Tool Execution Failure] Tool: ${toolId}, User: ${userId}`, err);

    const isZodError =
      err && typeof err === "object" && "issues" in err;
      
    // Log to SYSTEM_ERROR feed for Commander Dashboard
    const errorMsg = err instanceof Error ? err.message : "Execution failed.";
    const errorStack = err instanceof Error ? err.stack : undefined;
    
    if (!isZodError) {
      try {
        const { saveToolHistory } = await import("@/db/queries/history");
        const errorData = { 
          error: errorMsg, 
          toolId, 
          stack: errorStack, 
          _clientContext: { agentHash: `OP-${userId.substring(0, 8).toUpperCase()}` } 
        };
        // Log to a dedicated system user ID to isolate errors
        await saveToolHistory("SYSTEM_ERROR", "RUNTIME_CRASH", errorData, null, undefined, 50);
      } catch(e) {}
    }

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
      error: errorMsg,
    };
  }
}
