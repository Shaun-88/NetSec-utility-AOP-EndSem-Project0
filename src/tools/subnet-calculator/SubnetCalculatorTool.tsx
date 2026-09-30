"use client";

import React, { useState, useEffect } from "react";
import { computeSubnet, parseCidrString } from "./compute";
import { subnetInputSchema } from "./schema";
import type { SubnetOutputData } from "./types";
import { logClientToolRunDebounced } from "@/core/history/client-logger";
import {
  Network,
  Binary,
  Copy,
  Check,
  Radio,
  Info,
  Shield,
  Layers,
} from "lucide-react";

const COMMON_PRESETS = [
  { label: "/24 (Standard LAN)", cidr: 24, ip: "192.168.1.0" },
  { label: "/16 (Corporate)", cidr: 16, ip: "172.16.0.0" },
  { label: "/28 (Small Office)", cidr: 28, ip: "192.168.10.0" },
  { label: "/30 (Legacy P2P)", cidr: 30, ip: "10.0.0.0" },
  { label: "/31 (RFC 3021 Router P2P)", cidr: 31, ip: "10.0.0.0" },
  { label: "/32 (Single Host)", cidr: 32, ip: "192.168.1.50" },
  { label: "/0 (Default Route)", cidr: 0, ip: "0.0.0.0" },
];

export default function SubnetCalculatorTool() {
  const [ip, setIp] = useState("192.168.1.1");
  const [cidr, setCidr] = useState(24);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [result, setResult] = useState<SubnetOutputData | null>(null);

  // Recalculate whenever IP or CIDR changes
  useEffect(() => {
    const parse = subnetInputSchema.safeParse({ ip, cidr });
    if (!parse.success) {
      setError(parse.error.issues[0]?.message || "Invalid input");
      setResult(null);
    } else {
      setError(null);
      const computed = computeSubnet(parse.data);
      setResult(computed);
      logClientToolRunDebounced("subnet-calculator", `${ip}/${cidr}`, computed);
    }
  }, [ip, cidr]);

  const handleIpChange = (val: string) => {
    const parsed = parseCidrString(val);
    setIp(parsed.ip);
    if (parsed.cidr !== undefined) {
      setCidr(parsed.cidr);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Plain-Language Explainer (Non-IT Friendly) */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Subnet Calculator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Network Architecture
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>What is a Subnet?</strong> A subnet (short for <em>subnetwork</em>) is a logical slice of an IP network. Think of an IP address as a street name and house number: the subnet mask tells routers which part of the address represents your neighborhood (the network) and which part identifies your specific device (the host). Network engineers divide networks into subnets to improve security, reduce traffic congestion, and allocate IP addresses efficiently.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-sans">
              <Info className="w-3.5 h-3.5 text-[#00e575] flex-shrink-0" />
              <span>
                <strong>CIDR Prefix (/0 to /32):</strong> The slash number represents how many bits are locked for the network. Higher numbers mean smaller subnets with fewer devices; lower numbers mean larger networks with more hosts.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              IPv4 Address (or CIDR string)
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => handleIpChange(e.target.value)}
              placeholder="e.g. 192.168.1.1 or paste 10.0.0.1/28"
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
            />
            <span className="text-[10px] text-slate-500 block font-sans">
              Tip: You can paste a CIDR string like <code>192.168.1.50/26</code> to set both address and prefix automatically.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>CIDR Prefix</span>
              <span className="text-[#00e575] font-bold font-sans">/{cidr}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="32"
                value={cidr}
                onChange={(e) => setCidr(parseInt(e.target.value, 10))}
                className="w-full accent-[#00e575] cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="32"
                value={cidr}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 0 && val <= 32) setCidr(val);
                }}
                className="w-14 bg-[#080b11] border border-[#182234] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#00e575] font-sans"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Common Architecture Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setIp(p.ip);
                  setCidr(p.cidr);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs text-slate-300 hover:text-white transition-colors font-sans"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] font-sans">
            {error}
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Practical Subnet Scope Banner */}
          <div className="p-4 rounded-2xl bg-[#0d131f] border border-[#00e575]/30 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Subnet Application &amp; Capacity
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 font-sans">
                  /{result.cidr} Prefix
                </span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {result.scopeDescription}
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Network Address
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-sans">
                  {result.networkAddress}
                </span>
                <button
                  onClick={() => handleCopy(result.networkAddress, "net")}
                  className="text-slate-400 hover:text-[#00e575]"
                  title="Copy Network Address"
                >
                  {copiedKey === "net" ? (
                    <Check className="w-3.5 h-3.5 text-[#00e575]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block font-sans">Subnet route identifier</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Subnet Mask
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-sans">
                  {result.netmask}
                </span>
                <button
                  onClick={() => handleCopy(result.netmask, "mask")}
                  className="text-slate-400 hover:text-[#00e575]"
                  title="Copy Subnet Mask"
                >
                  {copiedKey === "mask" ? (
                    <Check className="w-3.5 h-3.5 text-[#00e575]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block font-sans">Wildcard: {result.wildcardMask}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Broadcast Address
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-sans">
                  {result.broadcastAddress}
                </span>
                <button
                  onClick={() => handleCopy(result.broadcastAddress, "bcast")}
                  className="text-slate-400 hover:text-[#00e575]"
                  title="Copy Broadcast Address"
                >
                  {copiedKey === "bcast" ? (
                    <Check className="w-3.5 h-3.5 text-[#00e575]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block font-sans">All-hosts message broadcast</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Usable Hosts
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#00e575] font-sans">
                  {result.usableHosts.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-sans">
                  / {result.totalHosts.toLocaleString()} total
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block font-sans">
                {result.cidr === 32
                  ? "Single host route (/32)"
                  : result.cidr === 31
                  ? "RFC 3021 Router P2P"
                  : result.cidr === 0
                  ? "Global Internet (/0)"
                  : "Allocatable client device IPs"}
              </span>
            </div>
          </div>

          {/* Detailed Range & Scope Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Host Range &amp; Address Classification
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182234] text-slate-300 font-sans">
                  Class {result.ipClass}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30 font-sans">
                  {result.addressType}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#182234] text-xs font-sans">
              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">First Usable Host</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{result.firstUsableIp}</span>
                  <button
                    onClick={() => handleCopy(result.firstUsableIp, "first")}
                    className="text-slate-500 hover:text-white"
                  >
                    {copiedKey === "first" ? (
                      <Check className="w-3.5 h-3.5 text-[#00e575]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">Last Usable Host</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{result.lastUsableIp}</span>
                  <button
                    onClick={() => handleCopy(result.lastUsableIp, "last")}
                    className="text-slate-500 hover:text-white"
                  >
                    {copiedKey === "last" ? (
                      <Check className="w-3.5 h-3.5 text-[#00e575]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-[#00e575]" />
                  <span className="text-slate-400">Address Scope</span>
                </div>
                <span className="text-slate-300 text-right max-w-md">
                  {result.addressTypeExplanation}
                </span>
              </div>

              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">Hex Representation</span>
                <span className="text-slate-300 font-sans">
                  IP: {result.hex.ip} | Netmask: {result.hex.netmask}
                </span>
              </div>
            </div>
          </div>

          {/* Binary Topology Breakdown */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#00e575]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Binary Bit Representation (32-Bit Map)
              </span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>IP Address Binary:</span>
                  <span>{result.ip}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all font-sans">
                  {result.binary.ip}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Subnet Mask Binary ({result.cidr} network bits / {32 - result.cidr} host bits):</span>
                  <span>{result.netmask}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all font-sans">
                  {result.binary.netmask}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Network Boundary Binary:</span>
                  <span>{result.networkAddress}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all font-sans">
                  {result.binary.network}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
