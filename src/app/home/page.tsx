"use client";

import React, { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import AiNetworkCta from "@/components/AiNetworkCta";
import { tools } from "@/registry/tools";
import Link from "next/link";
import {
  Globe,
  Shield,
  Layers,
  Activity,
  Lightbulb,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from "lucide-react";

const triviaFacts = [
  {
    topic: "Internet History",
    fact: "The first message ever sent on ARPANET in 1969 was intended to be 'LOGIN', but the system crashed after transmitting just 'LO'.",
  },
  {
    topic: "Cryptography",
    fact: "SHA-256 produces 2^256 possible outputs — a number vastly larger than the estimated atoms in the observable universe.",
  },
  {
    topic: "Domain Name System",
    fact: "Before DNS was invented in 1983, every single host on ARPANET downloaded a master HOSTS.TXT file maintained manually by Stanford.",
  },
  {
    topic: "Web Security",
    fact: "Port 443 was officially designated for HTTPS in 1994 by Jon Postel after Netscape pioneered the Secure Sockets Layer (SSL).",
  },
  {
    topic: "Cybersecurity Lore",
    fact: "The first recorded computer 'bug' was a literal moth trapped in Relay #70 of the Harvard Mark II system in 1947.",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "network" | "cybersecurity">("all");
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [userName, setUserName] = useState<string>("Agent");

  useEffect(() => {
    // Fetch user profile name
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.displayName) setUserName(data.displayName);
      })
      .catch(() => {});
  }, []);

  const handleNextTrivia = () => {
    setTriviaIndex((prev) => (prev + 1) % triviaFacts.length);
  };

  const handlePrevTrivia = () => {
    setTriviaIndex((prev) => (prev - 1 + triviaFacts.length) % triviaFacts.length);
  };

  const filteredTools =
    selectedCategory === "all"
      ? tools
      : tools.filter((t) => t.category === selectedCategory);

  const networkCount = tools.filter((t) => t.category === "network").length;
  const cyberCount = tools.filter((t) => t.category === "cybersecurity").length;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#182234] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00e575] font-semibold uppercase tracking-wider mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>ARMOURY COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-[#00e575]">{userName}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              All 13 modular diagnostics and cryptographic utilities are primed and ready.
            </p>
          </div>
        </div>

        {/* Rotating Trivia Card */}
        <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] flex-shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00e575]">
                    NetSec Intelligence Fact
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {triviaFacts[triviaIndex].topic}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans max-w-2xl">
                  &ldquo;{triviaFacts[triviaIndex].fact}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handlePrevTrivia}
                className="p-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-400 hover:text-white hover:border-[#00e575]/40 transition-colors"
                title="Previous Fact"
                aria-label="Previous trivia fact"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextTrivia}
                className="p-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-400 hover:text-white hover:border-[#00e575]/40 transition-colors"
                title="Next Fact"
                aria-label="Next trivia fact"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards (Reference Image Layout) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-400">Total Tools</span>
              <div className="p-2 rounded-lg bg-[#00e575]/10 text-[#00e575]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">{tools.length}</div>
            <p className="text-[11px] text-slate-400">Fully registered</p>
          </div>

          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-400">Network Tools</span>
              <div className="p-2 rounded-lg bg-[#00e575]/10 text-[#00e575]">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">{networkCount}</div>
            <p className="text-[11px] text-slate-400">Diagnostics &amp; speed</p>
          </div>

          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-400">CyberSec Tools</span>
              <div className="p-2 rounded-lg bg-[#00e575]/10 text-[#00e575]">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">{cyberCount}</div>
            <p className="text-[11px] text-slate-400">Security &amp; crypto</p>
          </div>

          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-400">Security Sandbox</span>
              <div className="p-2 rounded-lg bg-[#00e575]/10 text-[#00e575]">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#00e575]">Active</div>
            <p className="text-[11px] text-slate-400">SSRF firewall live</p>
          </div>
        </div>

        <AiNetworkCta />

        {/* Tool Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#182234] pb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              All Available Tools
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredTools.length} of {tools.length} total utilities
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0d131f] p-1 rounded-xl border border-[#182234]">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#00e575] text-[#080b11] font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Tools ({tools.length})
            </button>
            <button
              onClick={() => setSelectedCategory("network")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === "network"
                  ? "bg-[#00e575] text-[#080b11] font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Network ({networkCount})
            </button>
            <button
              onClick={() => setSelectedCategory("cybersecurity")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === "cybersecurity"
                  ? "bg-[#00e575] text-[#080b11] font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CyberSec ({cyberCount})
            </button>
          </div>
        </div>

        {/* Tools Grid (Matching Reference Screenshot Design) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((t) => {
            const isBasic = t.complexity === "basic";
            const isIntermediate = t.complexity === "intermediate";
            const badgeBg = isBasic
              ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/30"
              : isIntermediate
              ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
              : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30";

            return (
              <div
                key={t.id}
                id={t.id}
                className="border border-[#182234] bg-[#0d131f] hover:border-[#00e575]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl group"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#080b11] border border-[#182234] flex items-center justify-center group-hover:border-[#00e575]/40 text-[#00e575] transition-colors">
                        {t.category === "network" ? (
                          <Globe className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-[#00e575] transition-colors line-clamp-1">
                          {t.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {t.sequenceNumber}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}
                    >
                      {t.complexity || "basic"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {t.description}
                  </p>

                  {/* Tags */}
                  {t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] text-slate-400 lowercase font-sans"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-5 mt-auto">
                  <Link
                    href={`/tools/${t.id}`}
                    className="w-full py-2.5 px-4 bg-[#080b11] hover:bg-[#00e575] text-[#00e575] hover:text-[#080b11] border border-[#00e575]/30 hover:border-transparent font-semibold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-glow"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
