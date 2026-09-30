import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredHistory } from "@/db/queries/history";

/**
 * 48-Hour Automated Purge Cron Endpoint: /api/cron/purge-history
 * 
 * Scheduled daily via Vercel Cron.
 * SECURITY: Protected by CRON_SECRET authorization header to prevent unauthorized access.
 */
async function handlePurge(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production with CRON_SECRET configured, require exact Bearer match
  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing CRON_SECRET." },
        { status: 401 },
      );
    }
  } else if (process.env.NODE_ENV === "production") {
    // If running in production without CRON_SECRET configured, fail closed
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET is required in production." },
      { status: 500 },
    );
  }

  // Purge records older than 48 hours
  const deletedCount = await purgeExpiredHistory(48);

  return NextResponse.json({
    status: "success",
    purgedCount: deletedCount,
    retentionWindowHours: 48,
    purgedAt: new Date().toISOString(),
  });
}

export async function GET(req: NextRequest) {
  return handlePurge(req);
}

export async function POST(req: NextRequest) {
  return handlePurge(req);
}
