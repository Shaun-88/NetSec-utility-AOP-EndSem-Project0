import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { toolHistory, usersProfile } from "@/db/schema";
import { desc, count, ne, eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Ultra-simple verification via authorization header matching COMMANDER_PIN
  const expectedPin = process.env.COMMANDER_PIN || "7355608";
  const authHeader = req.headers.get("authorization");
  
  if (authHeader !== `Bearer ${expectedPin}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get total users count efficiently
    const [userCountResult] = await db.select({ value: count() }).from(usersProfile);
    const totalOperatives = userCountResult.value;

    // 2. Get global telemetry feed (excluding Commander and System Errors)
    const recentLogs = await db
      .select()
      .from(toolHistory)
      .where(
        and(
          ne(toolHistory.userId, "COMMANDER_HQ"),
          ne(toolHistory.userId, "SYSTEM_ERROR")
        )
      )
      .orderBy(desc(toolHistory.ranAt))
      .limit(100);

    // 3. Get Commander Logs
    const commanderLogs = await db
      .select()
      .from(toolHistory)
      .where(eq(toolHistory.userId, "COMMANDER_HQ"))
      .orderBy(desc(toolHistory.ranAt))
      .limit(20);
      
    // 3b. Get System Error Logs
    const errorLogs = await db
      .select()
      .from(toolHistory)
      .where(eq(toolHistory.userId, "SYSTEM_ERROR"))
      .orderBy(desc(toolHistory.ranAt))
      .limit(50);

    // 4. Process logs into feed & graph data
    const mapLog = (log: Record<string, unknown>) => {
      const data = log.data as Record<string, unknown>;
      const isError = !!data?.error;
      const clientInfo = (data?._clientContext as Record<string, string>) || { os: "Unknown", browser: "Unknown", device: "Desktop", ip: "Unknown", agentHash: "" };
      return {
        id: (log.id as string),
        toolId: (log.toolId as string),
        target: (log.target as string) || "N/A",
        status: isError ? "FAILED" : "SUCCESS",
        ranAt: (log.ranAt as Date),
        device: clientInfo.device || "Desktop",
        os: clientInfo.os || "Unknown",
        browser: clientInfo.browser || "Unknown",
        ip: clientInfo.ip || "Unknown",
        agentHash: clientInfo.agentHash || "",
        userId: (log.userId as string) === "COMMANDER_HQ" ? "COMMANDER_HQ" : (log.userId as string) === "SYSTEM_ERROR" ? "SYSTEM_ERROR" : (log.userId as string).substring(0, 8) + "...",
        errorMsg: data?.error,
      };
    };

    const threatFeed = recentLogs.map(mapLog);
    const commanderFeed = commanderLogs.map(mapLog);
    const errorFeed = errorLogs.map(mapLog);

    // 5. Generate telemetry graph
    const toolDistribution: Record<string, number> = {};
    recentLogs.forEach(log => {
      toolDistribution[(log.toolId as string)] = (toolDistribution[(log.toolId as string)] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      totalOperatives,
      totalRecentScans: recentLogs.length,
      threatFeed,
      commanderFeed,
      errorFeed,
      toolDistribution
    });

  } catch (error) {
    console.error("[Commander API Error]:", error);
    return NextResponse.json({ error: "Failed to fetch telemetry" }, { status: 500 });
  }
}
