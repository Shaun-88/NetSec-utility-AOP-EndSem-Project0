import React from "react";
import AppShell from "@/components/AppShell";
import { auth } from "@/auth";
import { getUserToolHistory, getHistoryStats } from "@/db/queries/history";
import HistoryClientView from "./HistoryClientView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostic History | The Big Bro's NetSec Armoury",
  description: "View and filter your past 48-hour diagnostic executions and security telemetry.",
};

export default async function HistoryPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest-session";

  const [initialHistory, initialStats] = await Promise.all([
    getUserToolHistory(userId, { timeRangeHours: 48, limit: 50 }),
    getHistoryStats(userId),
  ]);

  return (
    <AppShell>
      <HistoryClientView
        initialHistory={initialHistory}
        initialStats={initialStats}
      />
    </AppShell>
  );
}
