import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserToolHistory,
  getHistoryStats,
  clearUserHistory,
  type GetHistoryFilterOptions,
} from "@/db/queries/history";

/**
 * GET /api/history
 * Fetches filtered tool history and summary statistics for the authenticated user.
 * Strictly bounded by the 48-hour ephemeral retention window and tenant user_id.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required to view history." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const toolId = searchParams.get("toolId") || undefined;
  const categoryParam = searchParams.get("category");
  const category =
    categoryParam === "network" || categoryParam === "cybersecurity"
      ? categoryParam
      : undefined;
  const search = searchParams.get("search") || undefined;
  const timeRangeHoursParam = searchParams.get("timeRangeHours");
  const timeRangeHours = timeRangeHoursParam ? parseInt(timeRangeHoursParam, 10) : 48;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 50;
  const offsetParam = searchParams.get("offset");
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

  const filterOptions: GetHistoryFilterOptions = {
    toolId,
    category,
    search,
    timeRangeHours,
    limit,
    offset,
  };

  const [history, stats] = await Promise.all([
    getUserToolHistory(userId, filterOptions),
    getHistoryStats(userId),
  ]);

  return NextResponse.json({
    history,
    stats,
  });
}

/**
 * DELETE /api/history
 * Clears all history logs for the authenticated user upon explicit request.
 */
export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required to clear history." },
      { status: 401 },
    );
  }

  const deletedCount = await clearUserHistory(userId);

  return NextResponse.json({
    success: true,
    deletedCount,
  });
}
