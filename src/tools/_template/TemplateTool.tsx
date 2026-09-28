"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { TemplateOutputData } from "./types";
import { Terminal, Shield, CheckCircle, AlertTriangle } from "lucide-react";

export default function TemplateTool() {
  const [target, setTarget] = useState("");
  const [sampleOption, setSampleOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<TemplateOutputData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, sampleOption }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tool Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Template Tool</h1>
            <p className="text-xs text-slate-400">
              Reference architecture module for diagnostic and analysis operations.
            </p>
          </div>
        </div>
      </div>

      {/* Tool Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Hostname / Value
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. example.com or secure-host"
              className="w-full bg-[#080b11] border border-[#182234] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sampleOption"
              checked={sampleOption}
              onChange={(e) => setSampleOption(e.target.checked)}
              className="rounded bg-[#080b11] border-[#182234] text-[#00e575] focus:ring-0"
            />
            <label htmlFor="sampleOption" className="text-xs text-slate-300">
              Enable diagnostic boost (+10 score adjustment)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
          >
            <Terminal className="w-4 h-4" />
            {loading ? "Analyzing Target..." : "Run Analysis"}
          </button>
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="border border-[#ef4444]/30 bg-[#ef4444]/10 rounded-xl p-4 flex items-center gap-3 text-sm text-[#ef4444]">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="border border-[#182234] bg-[#0d131f] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#182234] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#00e575]" />
              <h2 className="text-base font-semibold text-white">Diagnostic Results</h2>
            </div>
            <span className="text-xs text-slate-400">
              Ran at: {new Date(result.ranAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#080b11] border border-[#182234] rounded-lg p-3">
              <span className="text-xs text-slate-400">Target</span>
              <p className="text-sm font-semibold text-white">{result.target || "N/A"}</p>
            </div>
            <div className="bg-[#080b11] border border-[#182234] rounded-lg p-3">
              <span className="text-xs text-slate-400">Health Score</span>
              <p className="text-sm font-semibold text-[#00e575]">
                {result.data.computedScore} / 100
              </p>
            </div>
            <div className="bg-[#080b11] border border-[#182234] rounded-lg p-3">
              <span className="text-xs text-slate-400">Status</span>
              <p className="text-sm font-semibold text-white uppercase">
                {result.data.status}
              </p>
            </div>
          </div>

          <div className="bg-[#080b11] border border-[#182234] rounded-lg p-4 text-xs text-slate-300">
            <p>{result.data.details.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
