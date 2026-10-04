"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Terminal, Activity, Users, Globe, ChevronRight } from "lucide-react";

interface ThreatLog {
  id: string;
  toolId: string;
  target: string;
  status: string;
  ranAt: string;
  device: string;
  os: string;
  browser: string;
  userId: string;
  agentHash?: string;
  errorMsg?: string;
}

interface DashboardProps {
  pin: string;
  onTerminate: () => void;
}

export default function CommanderDashboard({ pin, onTerminate }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [operatives, setOperatives] = useState(0);
  const [scans, setScans] = useState(0);
  const [feed, setFeed] = useState<ThreatLog[]>([]);
  const [commanderFeed, setCommanderFeed] = useState<ThreatLog[]>([]);
  const [errorFeed, setErrorFeed] = useState<ThreatLog[]>([]);
  const [activeTab, setActiveTab] = useState<"global" | "commander" | "errors">("global");
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  
  // Local session variables
  const [clientSession, setClientSession] = useState({ os: "", browser: "" });

  useEffect(() => {
    // Parse client UserAgent just for the header display
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let os = "Unknown OS";
      let browser = "Unknown Browser";
      
      if (/Windows/.test(ua)) os = "Windows";
      else if (/Mac/.test(ua)) os = "macOS";
      else if (/Linux/.test(ua)) os = "Linux";
      
      if (/Chrome/.test(ua)) browser = "Chrome";
      else if (/Safari/.test(ua)) browser = "Safari";
      else if (/Firefox/.test(ua)) browser = "Firefox";
      
      setClientSession({ os, browser });
    }

    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/command/telemetry", {
          headers: {
            "Authorization": `Bearer ${pin}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOperatives(data.totalOperatives || 0);
          setScans(data.totalRecentScans || 0);
          setFeed(data.threatFeed || []);
          setCommanderFeed(data.commanderFeed || []);
          setErrorFeed(data.errorFeed || []);
          setDistribution(data.toolDistribution || {});
        }
      } catch (e) {
        console.error("Telemetry error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
    
    // Poll every 10 seconds for live feel
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, [pin]);

  return (
    <div className="min-h-screen bg-[#030508] text-white p-6 font-mono relative overflow-hidden animate-slideDown">
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(0,229,117,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,117,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#00e575]/30 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00e575]/10 border border-[#00e575]/40 flex items-center justify-center animate-pulse-fast">
              <ShieldAlert className="w-6 h-6 text-[#00e575]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#00e575] uppercase">
                Commander Dashboard
              </h1>
              <p className="text-[10px] md:text-xs text-[#00e575]/70 tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Live Telemetry Uplink Active
              </p>
            </div>
          </div>

          {/* Commander Context Panel */}
          <div className="flex items-center gap-6 bg-[#080d16] border border-[#182234] p-3 rounded-xl shadow-lg">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Master Session Origin</p>
              <p className="text-xs text-sky-400 font-bold tracking-wider">{clientSession.os} / {clientSession.browser}</p>
            </div>
            <div className="h-8 w-px bg-[#182234] hidden sm:block" />
            <button 
              onClick={onTerminate}
              className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-[#030508] rounded-lg font-bold uppercase text-xs transition-colors shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]"
            >
              Terminate
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#080d16] border border-[#182234] flex items-center gap-4">
                <Users className="w-8 h-8 text-sky-400 opacity-70" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Operatives</p>
                  <p className="text-2xl font-bold text-sky-400">{loading ? "--" : operatives}</p>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-[#080d16] border border-[#182234] flex items-center gap-4">
                <Activity className="w-8 h-8 text-amber-400 opacity-70" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Global Scans (48H)</p>
                  <p className="text-2xl font-bold text-amber-400">{loading ? "--" : scans}</p>
                </div>
              </div>
            </div>

            {/* Threat Feed Terminal */}
            <div className="rounded-xl bg-[#05080c] border border-[#182234] overflow-hidden flex flex-col h-[500px]">
              <div className="flex border-b border-[#182234] bg-[#080d16]">
                <button 
                  onClick={() => setActiveTab("global")}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'global' ? 'text-[#00e575] border-b-2 border-[#00e575] bg-[#00e575]/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Terminal className="w-4 h-4" /> Global Threat Feed
                </button>
                <button 
                  onClick={() => setActiveTab("commander")}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'commander' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ShieldAlert className="w-4 h-4" /> Commander Logs
                </button>
                <button 
                  onClick={() => setActiveTab("errors")}
                  className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'errors' ? 'text-rose-500 border-b-2 border-rose-500 bg-rose-500/5' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Activity className="w-4 h-4" /> System Errors
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading ? (
                  <p className="text-slate-600 text-sm animate-pulse">Decrypting logs...</p>
                ) : (activeTab === "global" ? feed : activeTab === "commander" ? commanderFeed : errorFeed).length === 0 ? (
                  <p className="text-slate-600 text-sm">No telemetry detected in this sector.</p>
                ) : (
                  (activeTab === "global" ? feed : activeTab === "commander" ? commanderFeed : errorFeed).map((log) => (
                    <div key={log.id} className="text-xs flex flex-col sm:flex-row sm:items-start md:items-center gap-2 sm:gap-4 border-b border-[#182234] pb-3 last:border-0 hover:bg-[#0a101a] p-2 rounded transition-colors">
                      <span className="text-slate-500 whitespace-nowrap hidden md:inline text-[10px]">
                        {new Date(log.ranAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] whitespace-nowrap ${
                        log.status === "FAILED" ? "bg-rose-500/10 text-rose-500 border border-rose-500/30" : "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                      }`}>
                        {log.status}
                      </span>
                      <span className={`w-28 truncate ${log.userId === 'COMMANDER_HQ' ? 'text-amber-400 font-bold' : log.userId === 'SYSTEM_ERROR' ? 'text-rose-400 font-bold' : 'text-sky-400'}`} title={log.userId}>
                        {log.agentHash ? log.agentHash : log.userId}
                      </span>
                      {activeTab !== "errors" && (
                        <span className="text-amber-500/80 hidden lg:inline whitespace-nowrap text-[10px]">
                          [{log.device === "Unknown" ? "SYS" : log.device}: {log.os === "Unknown" ? "?" : log.os} / {log.browser === "Unknown" ? "?" : log.browser}]
                        </span>
                      )}
                      <span className="text-white flex-1 overflow-hidden">
                        {log.userId === 'COMMANDER_HQ' ? (
                          <>Initiated <span className="text-amber-400">{log.toolId}</span> <span className="text-slate-300">protocol</span></>
                        ) : log.userId === 'SYSTEM_ERROR' ? (
                          <span className="text-rose-400/80 font-mono text-[10px] break-all">{log.errorMsg || "Unknown Crash"}</span>
                        ) : log.toolId === 'SYSTEM_LOGIN' ? (
                          <span className="text-sky-300">Authenticated via System Gateway</span>
                        ) : (
                          <>Ran <span className="text-amber-400">{log.toolId}</span> on <span className="text-slate-300 truncate">{log.target}</span></>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Visual Telemetry Chart Alternative */}
            <div className="p-5 rounded-xl bg-[#080d16] border border-[#182234] shadow-lg">
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" /> Tool Distribution
              </h3>
              
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-slate-700 animate-spin" />
                </div>
              ) : Object.keys(distribution).length === 0 ? (
                <p className="text-slate-600 text-sm">Insufficient data for analysis.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(distribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([toolId, count]) => {
                      const max = Math.max(...Object.values(distribution));
                      const percent = Math.round((count / max) * 100);
                      return (
                        <div key={toolId} className="space-y-1">
                          <div className="flex justify-between text-[10px] uppercase tracking-wider">
                            <span className="text-sky-300 truncate pr-2">{toolId}</span>
                            <span className="text-slate-400 font-bold">{count}</span>
                          </div>
                          <div className="w-full bg-[#05080c] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-sky-500/80 shadow-[0_0_10px_rgba(14,165,233,0.5)] transition-all duration-1000 ease-out" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                  })}
                </div>
              )}
            </div>

            {/* Protocol Omega (Stub) */}
            <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-colors">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZjAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity" />
              
              <h3 className="text-rose-500 font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Protocol Omega
              </h3>
              <p className="text-[10px] text-rose-500/60 leading-relaxed mb-4">
                Initiate global purge sequence. This action permanently incinerates all user telemetry and execution logs across the entire database.
              </p>
              <button disabled className="w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold uppercase rounded hover:bg-rose-500/20 flex items-center justify-between px-3 cursor-not-allowed opacity-50">
                <span>Engage Purge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #05080c; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #182234; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00e575; }
      `}} />
    </div>
  );
}
