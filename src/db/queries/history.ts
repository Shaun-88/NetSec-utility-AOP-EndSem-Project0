import "server-only";
import { db } from "../index";
import { toolHistory, type ToolHistoryRecord } from "../schema";
import { eq, desc } from "drizzle-orm";

/**
 * Saves a tool execution record into tool_history for the authenticated user.
 */
export async function saveToolHistory(
  userId: string,
  toolId: string,
  data: unknown,
  target?: string,
): Promise<ToolHistoryRecord | null> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return null;
  }
  try {
    const inserted = await db
      .insert(toolHistory)
      .values({
        userId,
        toolId,
        target: target || null,
        data: data as Record<string, unknown>,
      })
      .returning();

    return inserted[0] || null;
  } catch (err) {
    console.error(`[DB Error] saveToolHistory failed for user ${userId} and tool ${toolId}:`, err);
    return null;
  }
}

/**
 * Retrieves the tool execution history for a given user.
 * INVARIANT: Must strictly filter by userId to guarantee tenant isolation.
 */
export async function getUserToolHistory(
  userId: string,
  limit: number = 50,
): Promise<ToolHistoryRecord[]> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return [];
  }
  try {
    const rows = await db
      .select()
      .from(toolHistory)
      .where(eq(toolHistory.userId, userId))
      .orderBy(desc(toolHistory.ranAt))
      .limit(limit);

    return rows;
  } catch (err) {
    console.error(`[DB Error] getUserToolHistory failed for user ${userId}:`, err);
    return [];
  }
}
