"use client";

import React, { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import { tools } from "@/registry/tools";
import type { ToolHistoryRecord } from "@/db/schema";
import type { HistoryStats } from "@/db/queries/history";
import type { ToolHistoryAIContext } from "@/core/history/ai-synthesizer";
import {
  Clock,
  Search,
  RotateCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Globe,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Code2,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";

interface HistoryClientViewProps {
  initialHistory: ToolHistoryRecord[];
  initialStats: HistoryStats;
}

export default function HistoryClientView({
  initialHistory,
  initialStats,
}: HistoryClientViewProps) {
  const [history, setHistory] = useState<ToolHistoryRecord[]>(initialHistory);
  const [stats, setStats] = useState<HistoryStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Report Generation State
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportStep, setReportStep] = useState<number>(0);
  // 0: Idle, 1: Extracting telemetry, 2: AI Analyzing, 3: Compiling PDF, 4: Complete

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<"all" | "network" | "cybersecurity">("all");
  const [selectedToolId, setSelectedToolId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRangeHours, setTimeRangeHours] = useState<number>(48);

  // Expanded cards and modal states
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [jsonViewId, setJsonViewId] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch updated data from API
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedToolId !== "all") params.set("toolId", selectedToolId);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("timeRangeHours", timeRangeHours.toString());

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setStats(data.stats || initialStats);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedToolId, categoryFilter, searchQuery, timeRangeHours, initialStats]);

  // Debounced fetch when filter parameters change
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        fetchHistory();
      });
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchHistory]);

  // Handle Clear History
  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        setStats({
          totalRuns: 0,
          networkRuns: 0,
          cyberRuns: 0,
          mostUsedTool: null,
          lastRanAt: null,
          retentionHours: 48,
        });
        setShowClearModal(false);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    } finally {
      setClearing(false);
    }
  };

  // Handle Generate Report
  const handleGenerateReport = async () => {
    if (history.length === 0) return;
    setIsGeneratingReport(true);
    setReportStep(1); // Extracting telemetry...

    try {
      // Step 2: AI Analyzing
      setTimeout(() => setReportStep(2), 1500); 

      // Take only the last 20 logs to avoid overwhelming the AI prompt
      const recentLogs = history.slice(0, 20).map(r => {
        const parsedData = r.data as Record<string, unknown>;
        const isError = !!parsedData?.error;
        return {
          toolId: r.toolId,
          target: r.target,
          status: isError ? "ERROR" : "SUCCESS",
          outputData: r.data,
          ranAt: r.ranAt
        };
      });

      const res = await fetch("/api/reports/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyLogs: recentLogs }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to generate report due to a server error. Please try again.");
        setIsGeneratingReport(false);
        setReportStep(0);
        return;
      }
      
      const summaryText = data.summary;

      // Step 3: Compiling PDF
      setReportStep(3);

      // Create PDF
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // NetSec Header Block
      doc.setFillColor(0, 229, 117); // Green background
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text("THREAT INTELLIGENCE REPORT", margin, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}   |   Total Scans Analyzed: ${recentLogs.length}`, margin, 28);

      // Executive Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("EXECUTIVE SUMMARY (AI ANALYSIS)", margin, 50);

      doc.setDrawColor(0, 229, 117);
      doc.setLineWidth(0.5);
      doc.line(margin, 53, pageWidth - margin, 53);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 40);
      
      // Split text into lines to fit page width
      const splitSummary = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
      let cursorY = 62;
      
      splitSummary.forEach((line: string) => {
        if (cursorY > 270) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, margin, cursorY);
        cursorY += 6;
      });
      
      cursorY += 15;

      // Scan Log Section
      if (cursorY > 240) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("RECENT SCAN LOG", margin, cursorY);
      
      doc.setDrawColor(0, 229, 117);
      doc.line(margin, cursorY + 3, pageWidth - margin, cursorY + 3);
      
      cursorY += 12;
      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      recentLogs.slice(0, 15).forEach(log => {
        if (cursorY > 275) {
          doc.addPage();
          cursorY = 20;
        }
        const status = log.status.toUpperCase();
        const dateStr = new Date(log.ranAt).toLocaleString();
        
        doc.setFont("courier", "bold");
        doc.setTextColor(status === "ERROR" ? 220 : 0, status === "ERROR" ? 38 : 150, status === "ERROR" ? 38 : 0);
        doc.text(`[${status}]`, margin, cursorY);
        
        doc.setFont("courier", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`${log.toolId.toUpperCase()} -> ${log.target} (${dateStr})`, margin + 22, cursorY);
        cursorY += 8;
      });

      // Save PDF
      setReportStep(4); // Complete
      setTimeout(() => {
        doc.save("Threat-Intelligence-Report.pdf");
        setIsGeneratingReport(false);
        setReportStep(0);
      }, 1000);

    } catch (err) {
      console.error("Report generation failed:", err);
      setIsGeneratingReport(false);
      setReportStep(0);
    }
  };

  // Handle Copy JSON
  const handleCopyJson = (record: ToolHistoryRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record.data, null, 2));
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Helper: map toolId to definition
  const toolMap = useMemo(() => {
    const map = new Map<string, (typeof tools)[number]>();
    for (const t of tools) {
      map.set(t.id, t);
    }
    return map;
  }, []);

  // Format relative timestamp
  const formatTimeAgo = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center text-[#00e575] shadow-glow">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Diagnostic Execution History
              </h1>
              <p className="text-xs text-slate-400">
                Audited diagnostic scans, cryptographic digests, and telemetry logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchHistory()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d131f] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Refresh history feed"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#00e575]" : ""}`} />
            <span>Refresh</span>
          </button>

          {history.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-xs font-semibold text-[#00e575] transition-colors disabled:opacity-50"
              >
                {isGeneratingReport ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>Download Report</span>
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d131f] hover:bg-rose-950/30 border border-[#182234] hover:border-rose-500/40 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 48-Hour Ephemeral Retention Banner */}
      <div className="p-4 rounded-2xl bg-[#080d16] border border-sky-500/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 mt-0.5">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                48-Hour Ephemeral Retention Policy
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                Auto-Purge Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              To guarantee zero-knowledge privacy and data minimization, diagnostic records are automatically pruned after <strong>48 hours (2 days)</strong>. Background telemetry is enriched with AI context for instant analysis in the AI Zone.
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 sm:self-center bg-[#0d131f] px-3 py-1.5 rounded-xl border border-[#182234]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] text-slate-300">
            AI Digest Ready
          </span>
        </div>
      </div>

      {/* 4 Telemetry Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Runs */}
        <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">48h Scan Volume</span>
            <Activity className="w-4 h-4 text-[#00e575]" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {stats.totalRuns}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Retained diagnostic records
          </span>
        </div>

        {/* Card 2: Category Ratio */}
        <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tool Breakdown</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white flex items-center gap-1.5">
            <span className="text-[#00e575]">{stats.networkRuns}</span>
            <span className="text-slate-600 text-lg">/</span>
            <span className="text-sky-400">{stats.cyberRuns}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Network vs CyberSec scans
          </span>
        </div>

        {/* Card 3: Top Tool */}
        <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Most Active Tool</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-white truncate capitalize mt-1">
            {stats.mostUsedTool ? stats.mostUsedTool.replace(/-/g, " ") : "No activity"}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Highest execution frequency
          </span>
        </div>

        {/* Card 4: Retention Window */}
        <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Retention Window</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            48 Hours
          </div>
          <span className="text-[11px] text-slate-500 block">
            Automated daily cron purge
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0d131f] border border-[#182234] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Target Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search target domain, IP, CIDR, hash, or tool..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tool Dropdown Selector */}
          <div className="w-full md:w-64">
            <select
              value={selectedToolId}
              onChange={(e) => setSelectedToolId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 focus:outline-none focus:border-[#00e575] transition-colors capitalize"
            >
              <option value="all">All 13 Tools</option>
              <optgroup label="Network Tools">
                {tools
                  .filter((t) => t.category === "network")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.sequenceNumber} {t.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Cybersecurity Tools">
                {tools
                  .filter((t) => t.category === "cybersecurity")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.sequenceNumber} {t.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Filter Pills: Category & Time Range */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#182234]/70">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === "all"
                  ? "bg-[#00e575] text-[#080b11]"
                  : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setCategoryFilter("network")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === "network"
                  ? "bg-[#00e575] text-[#080b11]"
                  : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Network Tools</span>
            </button>
            <button
              onClick={() => setCategoryFilter("cybersecurity")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === "cybersecurity"
                  ? "bg-[#00e575] text-[#080b11]"
                  : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>CyberSec Tools</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Range:</span>
            {[
              { label: "1h", hours: 1 },
              { label: "12h", hours: 12 },
              { label: "24h", hours: 24 },
              { label: "48h (Full)", hours: 48 },
            ].map((r) => (
              <button
                key={r.hours}
                onClick={() => setTimeRangeHours(r.hours)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  timeRangeHours === r.hours
                    ? "bg-[#182234] text-[#00e575] font-semibold border border-[#00e575]/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Stream List */}
      <div className="space-y-3">
        {loading && history.length === 0 ? (
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-12 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-[#00e575] animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading diagnostic telemetry...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#080b11] border border-[#182234] flex items-center justify-center mx-auto text-slate-500">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Diagnostic Executions Recorded</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No scans match your current filter settings in the 48-hour ephemeral retention window. Run any diagnostic from the Armoury to record verified reports.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Link
                href="/tools/port-checker"
                className="px-3.5 py-2 rounded-xl bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Port Checker
              </Link>
              <Link
                href="/tools/security-headers"
                className="px-3.5 py-2 rounded-xl bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Security Headers
              </Link>
              <Link
                href="/tools/internet-speed"
                className="px-3.5 py-2 rounded-xl bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Speed Test
              </Link>
              <Link
                href="/tools/ip-lookup"
                className="px-3.5 py-2 rounded-xl bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                IP Lookup
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {history.map((record) => {
              const def = toolMap.get(record.toolId);
              const toolName = def?.name || record.toolId.replace(/-/g, " ");
              const isExpanded = expandedId === record.id;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const recordData = (record.data || {}) as Record<string, any>;
              const aiContext = recordData.aiContext as ToolHistoryAIContext | undefined;
              const isNetwork = def?.category === "network";

              // Risk badge styling
              const risk = aiContext?.riskLevel || "informational";
              let riskBadge = (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  Info
                </span>
              );
              if (risk === "high") {
                riskBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    High Risk
                  </span>
                );
              } else if (risk === "medium") {
                riskBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Warning
                  </span>
                );
              } else if (risk === "none") {
                riskBadge = (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Secure / Pass
                  </span>
                );
              }

              return (
                <div
                  key={record.id}
                  className="rounded-2xl bg-[#0d131f] border border-[#182234] hover:border-slate-700 transition-all overflow-hidden"
                >
                  {/* Card Main Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                          isNetwork
                            ? "bg-[#00e575]/10 border-[#00e575]/30 text-[#00e575]"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                        }`}
                      >
                        {isNetwork ? <Globe className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight">
                            {toolName}
                          </span>
                          {def?.sequenceNumber && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#080b11] text-slate-400 border border-[#182234]">
                              {def.sequenceNumber}
                            </span>
                          )}
                          {riskBadge}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {record.target ? (
                            <span className="text-slate-200 font-medium">
                              Target: <span className="text-[#00e575]">{record.target}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No external target</span>
                          )}
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-slate-400">
                            {formatTimeAgo(record.ranAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className="text-[11px] text-slate-500 hidden md:inline">
                        {new Date(record.ranAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <button
                        className="p-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-400 hover:text-white"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Detail Drawer */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#182234] bg-[#090d16]/70 space-y-4">
                      {/* AI Context Synthesis Card */}
                      {aiContext && (
                        <div className="p-3.5 rounded-xl bg-[#0d131f] border border-amber-500/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              AI Intelligence Summary
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {aiContext.summary}
                          </p>

                          {aiContext.keyFindings && aiContext.keyFindings.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                Key Findings:
                              </span>
                              <ul className="space-y-1">
                                {aiContext.keyFindings.map((finding, idx) => (
                                  <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiContext.recommendedActions && aiContext.recommendedActions.length > 0 && (
                            <div className="pt-1">
                              <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                                Recommended Actions:
                              </span>
                              <ul className="space-y-1">
                                {aiContext.recommendedActions.map((action, idx) => (
                                  <li key={idx} className="text-xs text-amber-200/90 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Raw JSON View (if active) */}
                      {jsonViewId === record.id ? (
                        <div className="p-3 rounded-xl bg-[#05080e] border border-[#182234] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400">
                              Diagnostic Payload JSON
                            </span>
                            <button
                              onClick={() => setJsonViewId(null)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Close
                            </button>
                          </div>
                          <pre className="p-3 rounded-lg bg-[#080b11] border border-[#182234] text-[11px] text-emerald-400 overflow-x-auto leading-relaxed max-h-60 font-sans">
                            {JSON.stringify(record.data, null, 2)}
                          </pre>
                        </div>
                      ) : null}

                      {/* Card Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#182234]">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Recorded: {new Date(record.ranAt).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle JSON Viewer */}
                          <button
                            onClick={() =>
                              setJsonViewId(jsonViewId === record.id ? null : record.id)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                          >
                            <Code2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>{jsonViewId === record.id ? "Hide JSON" : "View JSON"}</span>
                          </button>

                          {/* Copy JSON */}
                          <button
                            onClick={() => handleCopyJson(record)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-xs font-medium text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedId === record.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00e575]" />
                                <span className="text-[#00e575]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Re-run Tool Link */}
                          <Link
                            href={`/tools/${record.toolId}${record.target ? `?target=${encodeURIComponent(record.target)}` : ""}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00e575]/10 hover:bg-[#00e575]/20 border border-[#00e575]/30 text-xs font-semibold text-[#00e575] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Re-run in Tool</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0d131f] border border-rose-500/40 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Clear Diagnostic History?</h3>
                <p className="text-xs text-slate-400">Irreversible action</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all diagnostic records from your 48-hour history? This will permanently erase your scan history and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-[#080b11] border border-[#182234] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                {clearing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <span>Yes, Delete All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {isGeneratingReport && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#070a10] border border-[#00e575]/40 p-8 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,229,117,0.15)] relative overflow-hidden">
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e575]/5 to-transparent h-[200%] animate-scan" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              {reportStep === 4 ? (
                <CheckCircle2 className="w-16 h-16 text-[#00e575] animate-bounce" />
              ) : (
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#00e575]/20 border-t-[#00e575] animate-spin" />
                  <FileText className="w-6 h-6 text-[#00e575] animate-pulse" />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                  Intelligence Report
                </h3>
                <p className="text-xs font-mono text-[#00e575]">
                  {reportStep === 1 && "> Extracting telemetry logs..."}
                  {reportStep === 2 && "> Big Bro analyzing threat landscape..."}
                  {reportStep === 3 && "> Compiling encrypted PDF dossier..."}
                  {reportStep === 4 && "> Download complete."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-[#182234] rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-[#00e575] transition-all duration-500 ease-out" 
                  style={{ width: `${(reportStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
