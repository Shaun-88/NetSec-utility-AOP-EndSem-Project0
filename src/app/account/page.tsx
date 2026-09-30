import React from "react";
import AppShell from "@/components/AppShell";
import { auth } from "@/auth";
import { getUserProfile } from "@/db/queries/users";
import { getUserToolHistory } from "@/db/queries/history";
import { Clock, Database, User, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  const userId = session?.user?.id || "guest-session";
  const userEmail = session?.user?.email || "Not specified";

  const profile = await getUserProfile(userId);
  const displayName = profile?.displayName || session?.user?.name || "Agent";
  const history = await getUserToolHistory(userId, { limit: 10 });

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Account &amp; Agent Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your agent profile, session credentials, and quick diagnostic activity.
          </p>
        </div>

        {/* Profile Card */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#080b11] border border-[#00e575]/40 flex items-center justify-center text-[#00e575] shadow-glow flex-shrink-0">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{displayName}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 font-medium">
                    Verified Agent
                  </span>
                </div>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>

            <Link
              href="/settings"
              className="px-4 py-2 rounded-xl bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors text-center"
            >
              Edit Alias in Settings
            </Link>
          </div>
        </div>

        {/* Execution History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-[#00e575]" />
              <span>Recent Diagnostic Activity</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {history.length} recent records
              </span>
              <Link
                href="/history"
                className="text-xs text-[#00e575] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Full 48h History</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#080b11] border border-[#182234] flex items-center justify-center mx-auto text-slate-500">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No tool executions yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Run any diagnostic or cybersecurity utility from the Armoury to record
                verified reports to your private log.
              </p>
              <div className="pt-2">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e575] text-[#080b11] font-semibold text-xs shadow-glow"
                >
                  Explore Tools
                </Link>
              </div>
            </div>
          ) : (
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden divide-y divide-[#182234]">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121927]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white capitalize">
                        {record.toolId.replace(/-/g, " ")}
                      </span>
                      {record.target && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#080b11] text-slate-300 font-sans border border-[#182234]">
                          {record.target}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                      <Calendar className="w-3 h-3" />
                      {new Date(record.ranAt).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/tools/${record.toolId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#00e575] hover:underline"
                  >
                    <span>View Tool</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
