"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/registry/tools";
import { getToolIcon } from "./toolIconMap";
import {
  Globe,
  Shield,
  Settings,
  User,
  Sparkles,
  History,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [networkOpen, setNetworkOpen] = useState(true);
  const [cyberOpen, setCyberOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const networkTools = tools.filter((t) => t.category === "network");
  const cyberTools = tools.filter((t) => t.category === "cybersecurity");

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-[#0d131f] border border-[#182234] text-slate-300 hover:text-white"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#090d16] border-r border-[#182234] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header with Noir Fedora Silhouette */}
        <div className="h-16 px-5 border-b border-[#182234] flex items-center gap-3 flex-shrink-0">
          <Link href="/home" onClick={closeMobile} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#0d131f] border border-[#00e575]/40 flex items-center justify-center shadow-glow group-hover:border-[#00e575] transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#00e575]"
              >
                <path
                  d="M4 11C6 11 7 8 12 8C17 8 18 11 20 11C21.5 11 22 11.8 22 12.5C22 13 21 13 20 13H4C3 13 2 13 2 12.5C2 11.8 2.5 11 4 11Z"
                  fill="currentColor"
                />
                <path
                  d="M7 10C7.5 7.5 9 5 12 5C15 5 16.5 7.5 17 10H7Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
                <path
                  d="M6 15L9 21H15L18 15L12 17L6 15Z"
                  fill="currentColor"
                  fillOpacity="0.9"
                />
                <rect x="8" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#090d16" />
                <rect x="12.5" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#090d16" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight block">
                NetSec Armoury
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                Cyber Intelligence Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 text-xs font-sans">
          {/* Section 1: Network Tools */}
          <div className="space-y-1">
            <button
              onClick={() => setNetworkOpen(!networkOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#121927] font-semibold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00e575]" />
                <span className="uppercase tracking-wider">Network Tools</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#182234] text-slate-300">
                  {networkTools.length}
                </span>
                {networkOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {networkOpen && (
              <div className="pl-4 pr-1 space-y-0.5 border-l border-[#182234] ml-4 mt-1">
                {networkTools.map((t) => {
                  const href = `/tools/${t.id}`;
                  const isActive = pathname === href;
                  const ToolIcon = getToolIcon(t.id);
                  return (
                    <Link
                      key={t.id}
                      href={href}
                      onClick={closeMobile}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all ${
                        isActive
                          ? "bg-[#00e575]/10 text-[#00e575] font-semibold border-l-2 border-[#00e575]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#121927]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ToolIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {t.sequenceNumber && (
                        <span className="text-[10px] text-slate-500 font-sans flex-shrink-0 ml-2">
                          {t.sequenceNumber}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: CyberSec Tools */}
          <div className="space-y-1">
            <button
              onClick={() => setCyberOpen(!cyberOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#121927] font-semibold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00e575]" />
                <span className="uppercase tracking-wider">CyberSec Tools</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#182234] text-slate-300">
                  {cyberTools.length}
                </span>
                {cyberOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {cyberOpen && (
              <div className="pl-4 pr-1 space-y-0.5 border-l border-[#182234] ml-4 mt-1">
                {cyberTools.map((t) => {
                  const href = `/tools/${t.id}`;
                  const isActive = pathname === href;
                  const ToolIcon = getToolIcon(t.id);
                  return (
                    <Link
                      key={t.id}
                      href={href}
                      onClick={closeMobile}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all ${
                        isActive
                          ? "bg-[#00e575]/10 text-[#00e575] font-semibold border-l-2 border-[#00e575]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-[#121927]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ToolIcon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                        <span className="truncate">{t.name}</span>
                      </div>
                      {t.sequenceNumber && (
                        <span className="text-[10px] text-slate-500 font-sans flex-shrink-0 ml-2">
                          {t.sequenceNumber}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          {/* Section 3: Big Bro */}
          <div className="pt-1">
            <Link
              href="/ai-zone"
              onClick={closeMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
                pathname === "/ai-zone"
                  ? "bg-[#00e575]/10 text-[#00e575] font-semibold border-l-2 border-[#00e575]"
                  : "text-slate-400 hover:text-white hover:bg-[#121927]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00e575]" />
                <span className="uppercase tracking-wider font-bold">Big Bro</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/20 font-bold">
                AI
              </span>
            </Link>
          </div>

          {/* Section 4: History */}
          <div className="pt-0.5">
            <Link
              href="/history"
              onClick={closeMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-colors ${
                pathname === "/history"
                  ? "bg-[#00e575]/10 text-[#00e575] font-semibold border-l-2 border-[#00e575]"
                  : "text-slate-400 hover:text-white hover:bg-[#121927]"
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                <span className="uppercase tracking-wider">History</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                48h
              </span>
            </Link>
          </div>
        </div>

        {/* Fixed Bottom Navigation: Settings & Account */}
        <div className="p-3 border-t border-[#182234] bg-[#070a10] space-y-1 flex-shrink-0">
          <Link
            href="/settings"
            onClick={closeMobile}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-[#00e575]/10 text-[#00e575] font-semibold"
                : "text-slate-400 hover:text-white hover:bg-[#121927]"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>

          <Link
            href="/account"
            onClick={closeMobile}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/account"
                ? "bg-[#00e575]/10 text-[#00e575] font-semibold"
                : "text-slate-400 hover:text-white hover:bg-[#121927]"
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Account</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
