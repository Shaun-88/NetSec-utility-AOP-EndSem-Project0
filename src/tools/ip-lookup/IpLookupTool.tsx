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
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Info,
} from "lucide-react";

const EXAMPLE_TARGETS = [
  { label: "Cloudflare DNS", value: "1.1.1.1" },
  { label: "Google DNS", value: "8.8.8.8" },
  { label: "GitHub", value: "github.com" },
  { label: "Quad9 DNS", value: "9.9.9.9" },
];

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
  const lat = ipData?.location?.coordinates?.latitude ?? 0;
  const lon = ipData?.location?.coordinates?.longitude ?? 0;
  const hasCoordinates = lat !== 0 || lon !== 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Plain-Language Explainer (Non-IT Friendly) */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                IP Lookup &amp; Geolocation
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Network Intelligence
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>What is an IP address?</strong> Your public IP address functions like your device&apos;s digital <em>&quot;return address&quot;</em> on the internet. Every website or online service you connect to reads this address so it knows where to return data. An IP lookup queries official routing registries to reveal general information tied to that address — including approximate geographical location, internet service provider (ISP), Autonomous System Number (ASN), and proxy/VPN indicators.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-400/90 font-sans">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                <strong>Accuracy Note:</strong> Geolocation shows the approximate city or regional network hub assigned by the ISP, not an exact physical house or street address.
              </span>
            </div>
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
                placeholder="e.g. 8.8.8.8, 1.1.1.1, or github.com (leave blank for your IP)"
                className="flex-1 bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 font-sans"
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

          {/* Quick Preset Buttons & Self-Detect */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Quick Examples:</span>
              {EXAMPLE_TARGETS.map((ex) => (
                <button
                  key={ex.value}
                  type="button"
                  onClick={() => {
                    setTarget(ex.value);
                    handleSubmit(ex.value);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#080b11] hover:bg-[#121927] border border-[#182234] text-[11px] text-slate-300 hover:text-white transition-colors font-sans"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setTarget("");
                handleSubmit("");
              }}
              className="text-xs text-slate-400 hover:text-[#00e575] transition-colors flex items-center gap-1.5 font-sans"
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
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-sans">
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

              <div className="divide-y divide-[#182234] text-xs font-sans">
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
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-400">Coordinates</span>
                  <span className="text-slate-300">
                    {ipData.location.coordinates.latitude.toFixed(4)},{" "}
                    {ipData.location.coordinates.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Network & Security Details */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Server className="w-4 h-4 text-[#00e575]" />
                <span>Network &amp; Organization</span>
              </div>

              <div className="divide-y divide-[#182234] text-xs font-sans">
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
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      ipData.security.isVpnOrProxy || ipData.security.isTor
                        ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30"
                        : "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                    }`}
                  >
                    {ipData.security.isTor ? (
                      <>
                        <ShieldAlert className="w-3 h-3" />
                        <span>Tor Node</span>
                      </>
                    ) : ipData.security.isVpnOrProxy ? (
                      <>
                        <ShieldAlert className="w-3 h-3" />
                        <span>VPN / Proxy Detected</span>
                      </>
                    ) : ipData.security.isHosting ? (
                      <>
                        <Server className="w-3 h-3" />
                        <span>Datacenter / Hosting</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Clean / Residential</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive OpenStreetMap Embed */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#00e575]" />
                <span>Approximate Geolocation Map (OpenStreetMap)</span>
              </div>

              {hasCoordinates && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00e575] hover:underline flex items-center gap-1 font-sans"
                >
                  <span>View Larger Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {hasCoordinates && ipData.location.mapEmbedUrl ? (
              <div className="w-full h-80 rounded-xl overflow-hidden border border-[#182234] relative bg-[#080b11]">
                <iframe
                  title="OpenStreetMap Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={ipData.location.mapEmbedUrl}
                  className="w-full h-full opacity-90 contrast-110"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-44 rounded-xl border border-dashed border-[#182234] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <MapPin className="w-6 h-6 text-slate-600" />
                <span className="text-xs font-sans">
                  Precise map coordinates unavailable for this regional network IP.
                </span>
              </div>
            )}

            {/* Accuracy Notice */}
            <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] flex items-start gap-3 text-xs text-slate-400 font-sans">
              <Info className="w-4 h-4 text-[#00e575] flex-shrink-0 mt-0.5" />
              <span>
                {ipData.location.accuracyDisclaimer ||
                  "Geolocation accuracy is as accurate as the upstream data source provides. It indicates the approximate city/regional routing assigned by the ISP, not the exact physical address of a user."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
