"use client";

import React, { useState } from "react";
import type { ToolResult } from "@/core/results/types";
import type { IpLookupData } from "./types";
import {
  Search,
  Globe,
  MapPin,
  Server,
  Copy,
  Check,
  Compass,
  AlertTriangle,
} from "lucide-react";

export default function IpLookupTool() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ToolResult<IpLookupData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSubmit = async (overrideTarget?: string) => {
    const queryTarget = overrideTarget !== undefined ? overrideTarget : target;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tools/ip-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: queryTarget || undefined }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Lookup failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform IP lookup.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const ipData = result?.data;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                IP Lookup &amp; Geolocation
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Network Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Resolve public IP geolocation, Autonomous System Numbers (ASN), ISP infrastructure, and proxy indicators.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              IP Address or Hostname (Optional)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 8.8.8.8 or github.com (leave blank for your IP)"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#00e575] hover:bg-[#00c864] text-[#080b11] font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-glow disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Resolving..." : "Lookup IP"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setTarget("");
                handleSubmit("");
              }}
              className="text-xs text-slate-400 hover:text-[#00e575] transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Detect My Public IP Address</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {ipData && (
        <div className="space-y-6">
          {/* Main IP Badge */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl" role="img" aria-label="Country flag">
                {ipData.location.flagEmoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {ipData.ip}
                  </h2>
                  <button
                    onClick={() => handleCopy(ipData.ip, "ip")}
                    className="p-1 rounded text-slate-400 hover:text-[#00e575]"
                    title="Copy IP"
                  >
                    {copiedKey === "ip" ? (
                      <Check className="w-4 h-4 text-[#00e575]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{ipData.ipVersion}</span>
                  <span>•</span>
                  <span>{ipData.network.isp}</span>
                  {ipData.hostname && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300">{ipData.hostname}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-[#080b11] border border-[#182234] text-xs font-semibold text-[#00e575]">
                {ipData.network.asn}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Geolocation Details */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#00e575]" />
                <span>Geographic Location</span>
              </div>

              <div className="divide-y divide-[#182234] text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">City</span>
                  <span className="text-white font-medium">{ipData.location.city}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Region / State</span>
                  <span className="text-white font-medium">{ipData.location.region}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Country</span>
                  <span className="text-white font-medium">
                    {ipData.location.country} ({ipData.location.countryCode})
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Continent</span>
                  <span className="text-white font-medium">{ipData.location.continent}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Postal Code</span>
                  <span className="text-white font-medium">{ipData.location.postal}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Coordinates</span>
                  <span className="text-slate-300">
                    {ipData.location.coordinates.latitude.toFixed(4)},{" "}
                    {ipData.location.coordinates.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Network & ASN Details */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Server className="w-4 h-4 text-[#00e575]" />
                <span>Network &amp; Organization</span>
              </div>

              <div className="divide-y divide-[#182234] text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Autonomous System</span>
                  <span className="text-white font-medium">{ipData.network.asn}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Internet Service Provider</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">
                    {ipData.network.isp}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Organization</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">
                    {ipData.network.organization}
                  </span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Timezone</span>
                  <span className="text-white font-medium">{ipData.timezone.id}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">UTC Offset</span>
                  <span className="text-white font-medium">{ipData.timezone.utcOffset}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-400">Threat / Proxy Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      ipData.security.isVpnOrProxy || ipData.security.isTor
                        ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
                        : "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                    }`}
                  >
                    {ipData.security.isTor
                      ? "Tor Node"
                      : ipData.security.isVpnOrProxy
                      ? "VPN / Proxy Detected"
                      : ipData.security.isHosting
                      ? "Datacenter / Hosting"
                      : "Clean / Residential"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
