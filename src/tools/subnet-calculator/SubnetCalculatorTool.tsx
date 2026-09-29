"use client";

import React, { useState, useEffect } from "react";
import { computeSubnet } from "./compute";
import { subnetInputSchema } from "./schema";
import type { SubnetOutputData } from "./types";
import {
  Network,
  Binary,
  Copy,
  Check,
  Radio,
} from "lucide-react";

const COMMON_PRESETS = [
  { label: "/24 (Standard LAN)", cidr: 24, ip: "192.168.1.0" },
  { label: "/16 (Corporate)", cidr: 16, ip: "172.16.0.0" },
  { label: "/28 (Small Office)", cidr: 28, ip: "192.168.10.0" },
  { label: "/30 (Point-to-Point)", cidr: 30, ip: "10.0.0.0" },
  { label: "/8 (Global Network)", cidr: 8, ip: "10.0.0.0" },
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
      setResult(computeSubnet(parse.data));
    }
  }, [ip, cidr]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Subnet Calculator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Client-Side Pure Logic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calculate CIDR notation, subnet masks, usable host boundaries, and binary network topology.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              IPv4 Address
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value.trim())}
              placeholder="e.g. 192.168.1.1"
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>CIDR Prefix</span>
              <span className="text-[#00e575]">/{cidr}</span>
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
                className="w-14 bg-[#080b11] border border-[#182234] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#00e575]"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Architecture Presets:
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
                className="px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444]">
            {error}
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Network Address
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">
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
              <span className="text-[10px] text-slate-500">Route identifier</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Subnet Mask
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">
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
              <span className="text-[10px] text-slate-500">Wildcard: {result.wildcardMask}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Broadcast Address
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">
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
              <span className="text-[10px] text-slate-500">Subnet broadcast channel</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234] space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Usable Hosts
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#00e575]">
                  {result.usableHosts.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">
                  / {result.totalHosts.toLocaleString()} total
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {result.cidr === 32
                  ? "Single host route (/32)"
                  : result.cidr === 31
                  ? "Point-to-point link (RFC 3021)"
                  : "Allocatable client IPs"}
              </span>
            </div>
          </div>

          {/* Detailed Range & Scope Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Host Range &amp; Classification
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182234] text-slate-300">
                  Class {result.ipClass}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                  {result.addressType}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#182234] text-xs">
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

              <div className="p-4 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-400">Hex Representation</span>
                <span className="text-slate-300">
                  IP: {result.hex.ip} | Mask: {result.hex.netmask}
                </span>
              </div>
            </div>
          </div>

          {/* Binary Topology Breakdown */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-[#00e575]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Binary Bit Representation
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>IP Address Binary:</span>
                  <span>{result.ip}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all">
                  {result.binary.ip}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Subnet Mask Binary ({result.cidr} network bits / {32 - result.cidr} host bits):</span>
                  <span>{result.netmask}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all">
                  {result.binary.netmask}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Network Boundary Binary:</span>
                  <span>{result.networkAddress}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#080b11] border border-[#182234] text-slate-200 tracking-widest text-[11px] break-all">
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
