import "server-only";
import { db } from "../index";
import { toolHistory, type ToolHistoryRecord } from "../schema";
import { eq, desc, and, gte, inArray, sql, lt } from "drizzle-orm";
import type { ToolHistoryAIContext } from "@/core/history/ai-synthesizer";

export const NETWORK_TOOL_IDS = [
  "internet-speed",
  "ip-lookup",
  "dns-lookup",
  "subnet-calculator",
  "port-checker",
  "ping-latency",
] as const;

export const CYBER_TOOL_IDS = [
  "password-generator",
  "password-strength",
  "hash-generator",
  "jwt-decoder",
  "file-hash",
  "security-headers",
  "binary-text",
] as const;

export interface GetHistoryFilterOptions {
  toolId?: string;
  category?: "network" | "cybersecurity" | "all";
  search?: string;
  timeRangeHours?: number; // 1, 12, 24, 48 (clamped to max 48)
  limit?: number;
  offset?: number;
}

export interface HistoryStats {
  totalRuns: number;
  networkRuns: number;
  cyberRuns: number;
  mostUsedTool: string | null;
  lastRanAt: string | null;
  retentionHours: number;
}

/**
 * Saves a tool execution record into tool_history for the authenticated user.
 * Automatically wraps and enriches the data payload with AI context metadata.
 */
export async function saveToolHistory(
  userId: string,
  toolId: string,
  data: unknown,
  target?: string | null,
  aiContext?: ToolHistoryAIContext,
): Promise<ToolHistoryRecord | null> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const rawData = (typeof data === "object" && data !== null) ? data : { result: data };
    const enrichedData = {
      ...rawData,
      ...(aiContext ? { aiContext } : {}),
    };

    const inserted = await db
      .insert(toolHistory)
      .values({
        userId,
        toolId,
        target: target || null,
        data: enrichedData as Record<string, unknown>,
      })
      .returning();

    return inserted[0] || null;
  } catch (err) {
    console.error(`[DB Error] saveToolHistory failed for user ${userId} and tool ${toolId}:`, err);
    return null;
  }
}

/**
 * Retrieves the tool execution history for a given user with multi-faceted filtering.
 * INVARIANT 1: Must strictly filter by userId to guarantee tenant isolation.
 * INVARIANT 2: Enforces 48-hour ephemeral data retention window at query time.
 */
export async function getUserToolHistory(
  userId: string,
  options: GetHistoryFilterOptions = {},
): Promise<ToolHistoryRecord[]> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return [];
  }
  try {
    const {
      toolId,
      category,
      search,
      timeRangeHours = 48,
      limit = 50,
      offset = 0,
    } = options;

    // Hard ceiling: history is never returned past 48 hours
    const clampedHours = Math.min(Math.max(timeRangeHours, 1), 48);

    const conditions = [
      eq(toolHistory.userId, userId),
      gte(toolHistory.ranAt, sql`NOW() - (${clampedHours} || ' HOURS')::interval`),
    ];

    if (toolId && toolId !== "all") {
      conditions.push(eq(toolHistory.toolId, toolId));
    }

    if (category === "network") {
      conditions.push(inArray(toolHistory.toolId, [...NETWORK_TOOL_IDS]));
    } else if (category === "cybersecurity") {
      conditions.push(inArray(toolHistory.toolId, [...CYBER_TOOL_IDS]));
    }

    if (search && search.trim()) {
      const pattern = `%${search.trim()}%`;
      conditions.push(
        sql`(${toolHistory.target} ILIKE ${pattern} OR ${toolHistory.toolId} ILIKE ${pattern})`,
      );
    }

    const rows = await db
      .select()
      .from(toolHistory)
      .where(and(...conditions))
      .orderBy(desc(toolHistory.ranAt))
      .limit(Math.min(limit, 200))
      .offset(offset);

    return rows;
  } catch (err) {
    console.error(`[DB Error] getUserToolHistory failed for user ${userId}:`, err);
    return [];
  }
}

/**
 * Computes high-level usage statistics for a user within the 48-hour retention window.
 */
export async function getHistoryStats(userId: string): Promise<HistoryStats> {
  const defaultStats: HistoryStats = {
    totalRuns: 0,
    networkRuns: 0,
    cyberRuns: 0,
    mostUsedTool: null,
    lastRanAt: null,
    retentionHours: 48,
  };

  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return defaultStats;
  }

  try {
    const rows = await getUserToolHistory(userId, { timeRangeHours: 48, limit: 200 });

    if (rows.length === 0) {
      return defaultStats;
    }

    const toolFrequency: Record<string, number> = {};
    let networkCount = 0;
    let cyberCount = 0;

    for (const row of rows) {
      toolFrequency[row.toolId] = (toolFrequency[row.toolId] || 0) + 1;
      if (NETWORK_TOOL_IDS.includes(row.toolId as unknown as typeof NETWORK_TOOL_IDS[number])) {
        networkCount++;
      } else if (CYBER_TOOL_IDS.includes(row.toolId as unknown as typeof CYBER_TOOL_IDS[number])) {
        cyberCount++;
      }
    }

    let topTool: string | null = null;
    let topCount = 0;
    for (const [tool, count] of Object.entries(toolFrequency)) {
      if (count > topCount) {
        topCount = count;
        topTool = tool;
      }
    }

    return {
      totalRuns: rows.length,
      networkRuns: networkCount,
      cyberRuns: cyberCount,
      mostUsedTool: topTool,
      lastRanAt: rows[0]?.ranAt?.toISOString() || null,
      retentionHours: 48,
    };
  } catch (err) {
    console.error(`[DB Error] getHistoryStats failed for user ${userId}:`, err);
    return defaultStats;
  }
}

/**
 * Purges records older than the specified retention window (default: 48 hours).
 * Triggered by scheduled cron jobs.
 */
export async function purgeExpiredHistory(hours: number = 48): Promise<number> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return 0;
  }
  try {
    const result = await db
      .delete(toolHistory)
      .where(lt(toolHistory.ranAt, sql`NOW() - (${hours} || ' HOURS')::interval`))
      .returning({ id: toolHistory.id });

    return result.length;
  } catch (err) {
    console.error(`[DB Error] purgeExpiredHistory failed:`, err);
    return 0;
  }
}

/**
 * Completely clears all history entries for a specific user upon explicit request.
 * Enforces strict user tenant boundary.
 */
export async function clearUserHistory(userId: string): Promise<number> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return 0;
  }
  try {
    const result = await db
      .delete(toolHistory)
      .where(eq(toolHistory.userId, userId))
      .returning({ id: toolHistory.id });

    return result.length;
  } catch (err) {
    console.error(`[DB Error] clearUserHistory failed for user ${userId}:`, err);
    return 0;
  }
}
