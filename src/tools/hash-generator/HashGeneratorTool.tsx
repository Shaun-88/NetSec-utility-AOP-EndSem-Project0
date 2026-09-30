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
  HelpCircle,
  Fingerprint,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Lock,
} from "lucide-react";

const PRESET_STRINGS = [
  { label: "Default Text", value: "The Big Bro's NetSec Armoury" },
  { label: "Avalanche A", value: "The Big Bro's NetSec Armoury" },
  { label: "Avalanche B (+ dot)", value: "The Big Bro's NetSec Armoury." },
  { label: "API Payload", value: '{"action":"transfer","amount":500,"to":"alice"}' },
  { label: "Short Phrase", value: "password123" },
];

export default function HashGeneratorTool() {
  const [text, setText] = useState("The Big Bro's NetSec Armoury");
  const [hmacKey, setHmacKey] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [result, setResult] = useState<HashGeneratorOutputData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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

  const handleCopy = (hashText: string, key: string) => {
    navigator.clipboard.writeText(hashText);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const formatted = result.hashes
      .map((h) => `${h.algorithm}: ${h.hash}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const byteLength = new TextEncoder().encode(text).length;

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
                100% In-Browser Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compute real-time cryptographic digests across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 with optional HMAC keying.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Plain-Language Explainer Card (Priority per Spec) */}
      <div className="border border-[#182234] bg-gradient-to-br from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              What is a cryptographic hash &amp; why does it matter?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A <strong className="text-white">cryptographic hash</strong> is a unique, fixed-length digital <strong className="text-[#00e575]">fingerprint</strong> of data. Whether you input a single character or an entire book, a hashing algorithm processes it into a fixed string of numbers and letters (like <span className="text-white font-medium">2cf24dba...</span>).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              It has three magical properties:
              <br />
              <strong className="text-white">1. Deterministic:</strong> The exact same input will <em>always</em> produce the exact same hash, on any computer in the world, forever.
              <br />
              <strong className="text-white">2. The Avalanche Effect:</strong> Changing even a single letter, comma, or space changes the resulting hash completely beyond recognition.
              <br />
              <strong className="text-white">3. One-Way Only:</strong> You cannot &quot;reverse&quot; or decrypt a hash back into the original text.
            </p>
          </div>
        </div>

        {/* Actionable Real-World Use Cases */}
        <div className="border-t border-[#182234] pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575]">
              <FileCheck className="w-4 h-4" />
              <span>Verifying File Integrity</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When downloading software or system updates, publishers publish a SHA-256 hash. Computing the hash of your download proves the file was not corrupted or infected with malware.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
              <Lock className="w-4 h-4" />
              <span>Safe Password Storage</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Websites never store your real password. They store its cryptographic hash. If a company&apos;s database leaks, attackers only see scrambled hashes, not plain passwords.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Fingerprint className="w-4 h-4 text-[#00e575]" />
              <span>Digital Signatures &amp; Webhooks</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              HMAC hashes allow payment providers (like Stripe or PayPal) to sign webhooks with a secret key, proving the request is authentic and unaltered.
            </p>
          </div>
        </div>

        {/* Interactive Avalanche Effect Demo Toggle */}
        <div className="border-t border-[#182234] pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
            <span>Try the Avalanche Test:</span>
            <button
              type="button"
              onClick={() => setText("The Big Bro's NetSec Armoury")}
              className="px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-slate-300 hover:text-white transition-colors"
            >
              Armoury
            </button>
            <span>vs</span>
            <button
              type="button"
              onClick={() => setText("The Big Bro's NetSec Armoury.")}
              className="px-2 py-0.5 rounded bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-slate-300 hover:text-white transition-colors"
            >
              Armoury. (+ dot)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-[#00e575] hover:underline font-semibold"
          >
            {showGuide ? "Hide Technical Details" : "How do MD5, SHA-1, and SHA-256 differ?"}
          </button>
        </div>

        {showGuide && (
          <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-300 space-y-2 mt-2">
            <p>
              <strong className="text-white">MD5 (128-bit) &amp; SHA-1 (160-bit):</strong> Older algorithms created in the 1990s. Both are now mathematically broken because researchers proved computers can create two different inputs that produce the same hash (&quot;collision attack&quot;). They are only suitable for non-security checksums.
            </p>
            <p>
              <strong className="text-[#00e575]">SHA-256 (256-bit):</strong> The modern gold standard designed by NIST. It has $2^{256}$ possible combinations — vastly more than atoms in the observable universe. It is practically collision-proof.
            </p>
            <p>
              <strong className="text-[#a855f7]">SHA-384 &amp; SHA-512:</strong> High-security variants used in defense, military, and top-tier banking protocols designed to remain safe even against future quantum computing advancements.
            </p>
          </div>
        )}
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
                  key={p.label}
                  type="button"
                  onClick={() => setText(p.value)}
                  className="px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white text-[11px] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text to compute cryptographic hashes in real time..."
            className="w-full bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 resize-none font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>{text.length} characters • {byteLength} bytes UTF-8</span>
            <span>Zero network transfer • Evaluated locally</span>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#182234]">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Optional HMAC Secret Key</span>
            </label>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Leave blank for regular hash, or enter secret for HMAC-SHA256..."
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
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              <span>
                Generated <strong className="text-white">{result.hashes.length} Cryptographic Digests</strong>
                {result.isHmac && " (HMAC Mode Active)"}
              </span>
            </span>

            <button
              onClick={handleCopyAll}
              className="text-xs text-[#00e575] hover:underline flex items-center gap-1 font-semibold"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? "All Hashes Copied!" : "Copy All Hashes"}</span>
            </button>
          </div>

          <div className="space-y-3">
            {result.hashes.map((item) => (
              <div
                key={item.algorithm}
                className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/40 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {item.algorithm}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.securityStatus === "Secure (Recommended)"
                          ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/30"
                          : item.securityStatus === "High Security"
                          ? "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/30"
                          : item.securityStatus === "Legacy"
                          ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                          : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30"
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
                      className="px-3 py-1.5 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                      title={`Copy ${item.algorithm} hash`}
                    >
                      {copiedKey === item.algorithm ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00e575]" />
                          <span className="text-[#00e575]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Hash String Display */}
                <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 tracking-wide font-sans break-all select-all leading-relaxed">
                  {item.hash}
                </div>

                {/* Plain-Language Details */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
                  <span>
                    <strong className="text-slate-300">About: </strong>
                    {item.plainDescription}
                  </span>
                  <span className="text-slate-500 sm:text-right shrink-0">
                    <strong className="text-slate-400">Use: </strong>
                    {item.commonUse}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
