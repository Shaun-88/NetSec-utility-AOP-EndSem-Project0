import React from "react";
import {
  Shield,
  Terminal,
  Activity,
  CheckCircle2,
  Database,
  Lock,
  Cpu,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen cyber-grid flex flex-col bg-[#080b11] text-[#f1f5f9]">
      {/* Header */}
      <header className="border-b border-[#182234] bg-[#0d131f]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cyber Hat Guy / Detective Silhouette SVG */}
            <div className="w-10 h-10 rounded-lg bg-[#080b11] border border-[#00e575]/40 flex items-center justify-center shadow-glow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-[#00e575]"
              >
                {/* Fedora hat crown & brim */}
                <path
                  d="M4 11C6 11 7 8 12 8C17 8 18 11 20 11C21.5 11 22 11.8 22 12.5C22 13 21 13 20 13H4C3 13 2 13 2 12.5C2 11.8 2.5 11 4 11Z"
                  fill="currentColor"
                />
                <path
                  d="M7 10C7.5 7.5 9 5 12 5C15 5 16.5 7.5 17 10H7Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                {/* Noir trenchcoat collar & sunglasses */}
                <path
                  d="M6 15L9 21H15L18 15L12 17L6 15Z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
                <rect x="8" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#080b11" />
                <rect x="12.5" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#080b11" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  The Big Bro&apos;s NetSec Armoury
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 font-medium">
                  v0.1.0 Foundation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Next-Gen Network Diagnostics &amp; Cybersecurity Intelligence Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#080b11] border border-[#182234] px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
              <span>Phase 1 Deployed</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Section */}
        <div className="rounded-xl border border-[#182234] bg-gradient-to-b from-[#0d131f] to-[#080b11] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-md bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              <Terminal className="w-3.5 h-3.5" />
              <span>SYSTEM INITIALIZED — FOUNDATION VERIFIED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Unified Armoury for Network &amp; Security Engineering
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every tool operates as an independent module bound to a shared analytical
              spine. Engineered with strict isolation boundaries, SSRF safeguards,
              and authenticated historical auditing.
            </p>
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-[#182234] bg-[#0d131f] p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-medium tracking-wider">
                Planned Tools
              </span>
              <Layers className="w-4 h-4 text-[#00e575]" />
            </div>
            <div className="text-2xl font-bold text-white">13 Modules</div>
            <p className="text-xs text-slate-400">6 Network · 7 CyberSec</p>
          </div>

          <div className="rounded-lg border border-[#182234] bg-[#0d131f] p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-medium tracking-wider">
                Persistence Layer
              </span>
              <Database className="w-4 h-4 text-[#00e575]" />
            </div>
            <div className="text-2xl font-bold text-white">Drizzle + Postgres</div>
            <p className="text-xs text-slate-400">Users Profile &amp; Tool History</p>
          </div>

          <div className="rounded-lg border border-[#182234] bg-[#0d131f] p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-medium tracking-wider">
                Security Sandbox
              </span>
              <Lock className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div className="text-2xl font-bold text-white">SSRF Guard Ready</div>
            <p className="text-xs text-slate-400">Private IP blocklist &amp; net filtering</p>
          </div>

          <div className="rounded-lg border border-[#182234] bg-[#0d131f] p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-medium tracking-wider">
                Pipeline
              </span>
              <Activity className="w-4 h-4 text-[#00e575]" />
            </div>
            <div className="text-2xl font-bold text-white">CI Active</div>
            <p className="text-xs text-slate-400">Lint, Typecheck, Vitest</p>
          </div>
        </div>

        {/* Phase Checklist & Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 1 Completed */}
          <div className="rounded-xl border border-[#182234] bg-[#0d131f] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00e575]" />
              <h2 className="text-lg font-bold text-white">
                Phase 1: Foundation Completed
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              The underlying runtime, type definitions, styling design tokens, and
              verification pipelines are live.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                Next.js 15 (App Router) + TypeScript Strict Mode
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                Tailwind CSS Cyber Palette + Sans-Serif Typographic System
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                ESLint Boundary Rule enforcing tool isolation &amp; core integrity
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                Drizzle ORM schema for users_profile and tool_history tables
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                GitHub Actions CI pipeline for automated testing and type validation
              </li>
            </ul>
          </div>

          {/* Up Next: Phase 2 */}
          <div className="rounded-xl border border-[#182234] bg-[#0d131f] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-lg font-bold text-white">
                Up Next: Phase 2 (Shared Systems)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Connecting persistent authentication, SSRF-safe request dispatching, and
              the modular tool-runner pattern.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                Auth.js / NextAuth Google Provider Integration
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                Protected Route Middleware (/signin public, others authenticated)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                `core/security/safe-fetch.ts` SSRF and IP Blocklist Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                Standard Tool Template (`src/tools/_template/`)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                Single Tool Front-Door API (`POST /api/tools/[toolId]`)
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182234] bg-[#0d131f] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00e575]" />
            <span>The Big Bro&apos;s NetSec Armoury</span>
          </div>
          <p>© 2026 The Big Bro&apos;s NetSec Armoury · Crafted for Security Practitioners</p>
        </div>
      </footer>
    </div>
  );
}
