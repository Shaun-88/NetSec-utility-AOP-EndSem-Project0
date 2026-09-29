"use client";

import React, { useState, useEffect } from "react";
import { computeHashes } from "./compute";
import { hashGeneratorInputSchema } from "./schema";
import type { HashGeneratorOutputData } from "./types";
import {
  Hash,
  Copy,
  Check,
  Key,
} from "lucide-react";

const PRESET_STRINGS = ["The Big Bro's NetSec Armoury", "admin", "password123", "secret_payload"];

export default function HashGeneratorTool() {
  const [text, setText] = useState("The Big Bro's NetSec Armoury");
  const [hmacKey, setHmacKey] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [result, setResult] = useState<HashGeneratorOutputData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const parse = hashGeneratorInputSchema.safeParse({ text, hmacKey, uppercase });
    if (parse.success) {
      computeHashes(parse.data).then((res) => {
        if (active) setResult(res);
      });
    }
    return () => {
      active = false;
    };
  }, [text, hmacKey, uppercase]);

  const handleCopy = (hash: string, key: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Cryptographic Hash &amp; Digest Generator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Client-Side Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compute real-time cryptographic digests across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 with optional HMAC keying.
            </p>
          </div>
        </div>
      </div>

      {/* Input Controls */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>Input String</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">Presets:</span>
              {PRESET_STRINGS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setText(p)}
                  className="px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white text-[11px] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text to compute cryptographic hash..."
            className="w-full bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Optional HMAC Secret Key</span>
            </label>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Leave blank for standard digests..."
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 font-sans"
            />
          </div>

          <div className="flex items-center justify-end gap-3 self-end pb-1">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded bg-[#080b11] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span>Uppercase Hex Output (A–F)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generated Hashes List */}
      {result && (
        <div className="space-y-4">
          {result.hashes.map((item) => (
            <div
              key={item.algorithm}
              className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/40 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wider">
                    {item.algorithm}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.securityStatus === "Secure (Recommended)"
                        ? "bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30"
                        : item.securityStatus === "High Security"
                        ? "bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30"
                        : item.securityStatus === "Legacy"
                        ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30"
                        : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"
                    }`}
                  >
                    {item.securityStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">
                    {item.bitLength} bits ({item.byteLength} bytes)
                  </span>

                  <button
                    onClick={() => handleCopy(item.hash, item.algorithm)}
                    className="p-1.5 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-slate-400 hover:text-[#00e575] transition-colors"
                    title={`Copy ${item.algorithm} hash`}
                  >
                    {copiedKey === item.algorithm ? (
                      <Check className="w-3.5 h-3.5 text-[#00e575]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 tracking-wide font-sans break-all select-all leading-relaxed">
                {item.hash}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
