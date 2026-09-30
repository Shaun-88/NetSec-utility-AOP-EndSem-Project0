"use client";

import React, { useState, useEffect, useCallback } from "react";
import { computePasswords } from "./compute";
import { passwordGeneratorInputSchema } from "./schema";
import type { PasswordGeneratorOutputData } from "./types";
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Lock,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";

const PRESETS = [
  { label: "Standard Web (16)", length: 16, symbols: true, numbers: true, upper: true, lower: true, noAmbiguous: false },
  { label: "High Armor (24)", length: 24, symbols: true, numbers: true, upper: true, lower: true, noAmbiguous: false },
  { label: "Master Vault (32)", length: 32, symbols: true, numbers: true, upper: true, lower: true, noAmbiguous: false },
  { label: "Easy to Type (16)", length: 16, symbols: true, numbers: true, upper: true, lower: true, noAmbiguous: true },
  { label: "PIN Code (6)", length: 6, symbols: false, numbers: true, upper: false, lower: false, noAmbiguous: false },
];

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [result, setResult] = useState<PasswordGeneratorOutputData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(() => {
    const parse = passwordGeneratorInputSchema.safeParse({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeAmbiguous,
      quantity,
    });

    if (!parse.success) {
      setError(parse.error.issues[0]?.message || "Invalid configuration");
      setResult(null);
    } else {
      setError(null);
      try {
        setResult(computePasswords(parse.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate passwords.");
      }
    }
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    quantity,
  ]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const all = result.passwords.map((p) => p.password).join("\n");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Cryptographic Password Generator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Hardware CSPRNG / In-Browser
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Generate unpredictable, high-entropy passwords directly on your device using hardware-grade Web Crypto APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Plain-Language Explainer Card */}
      <div className="border border-[#182234] bg-gradient-to-br from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Why is a generated password safer than one you make up?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              When humans create passwords, our brains naturally rely on <strong className="text-white">predictable habits</strong>: pet names, family birthdays, keyboard sequences (like &quot;qwerty&quot; or &quot;123456&quot;), or simple letter swaps (like using &quot;@&quot; for &quot;a&quot;). Automated hacking tools possess dictionaries of billions of these exact patterns and crack human-invented passwords in fractions of a second.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              In contrast, a <strong className="text-[#00e575]">cryptographically generated password</strong> selects every character using mathematical randomness (hardware entropy). With no dictionary words, personal clues, or keyboard walks, cracking algorithms are forced to test billions of billions of combinations — taking centuries or millions of years.
            </p>
          </div>
        </div>

        {/* Actionable Best Practices Guide */}
        <div className="border-t border-[#182234] pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00e575]">
              <Lock className="w-4 h-4" />
              <span>Length Beats Complexity</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A 16 to 24-character password is exponentially stronger than an 8-character password with strange symbols. Increasing length multiplies the search space astronomically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f59e0b]">
              <Shield className="w-4 h-4" />
              <span>Never Reuse Passwords</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              If one service suffers a data breach, hackers immediately test that leaked password across your email, banking, and social apps (&quot;credential stuffing&quot;).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Layers className="w-4 h-4 text-[#00e575]" />
              <span>Use a Password Manager</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              You don&apos;t have to memorize random passwords! Store them in a trusted manager (Bitwarden, 1Password, Apple Keychain, Google) and only remember one master passphrase.
            </p>
          </div>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-6">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Password Length</span>
            </span>
            <span className="text-base font-bold text-[#00e575]">{length} Characters</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full accent-[#00e575] cursor-pointer"
            />
            <input
              type="number"
              min="6"
              max="64"
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 6 && val <= 64) setLength(val);
              }}
              className="w-16 bg-[#080b11] border border-[#182234] rounded-lg px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#00e575]"
            />
          </div>
        </div>

        {/* Character Set Checkboxes */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Include Character Sets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="rounded bg-[#0d131f] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span className="text-white font-medium">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="rounded bg-[#0d131f] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span className="text-white font-medium">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded bg-[#0d131f] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span className="text-white font-medium">Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="rounded bg-[#0d131f] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span className="text-white font-medium">Symbols (!@#$)</span>
            </label>
          </div>
        </div>

        {/* Options & Presets Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#182234]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Presets:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setLength(p.length);
                  setIncludeSymbols(p.symbols);
                  setIncludeNumbers(p.numbers);
                  setIncludeUppercase(p.upper);
                  setIncludeLowercase(p.lower);
                  setExcludeAmbiguous(p.noAmbiguous);
                }}
                className="px-2.5 py-1 rounded-md bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white text-xs transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                className="rounded bg-[#080b11] border-[#182234] text-[#00e575] focus:ring-0"
              />
              <span>No Ambiguous (l, 1, O, 0)</span>
            </label>

            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              className="bg-[#080b11] border border-[#182234] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#00e575]"
            >
              <option value={1}>1 Password</option>
              <option value={5}>5 Passwords</option>
              <option value={10}>10 Passwords</option>
            </select>

            <button
              onClick={() => generate()}
              className="p-2 rounded-lg bg-[#00e575] hover:bg-[#00c864] text-[#080b11] shadow-glow transition-colors"
              title="Regenerate Passwords"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444]">
            {error}
          </div>
        )}
      </div>

      {/* Generated Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              <span>Pool Size: <strong className="text-slate-200">{result.characterPoolSize} characters</strong></span>
            </span>

            {result.passwords.length > 1 && (
              <button
                onClick={handleCopyAll}
                className="text-xs text-[#00e575] hover:underline flex items-center gap-1"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? "All Copied!" : "Copy All Passwords"}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {result.passwords.map((item, idx) => {
              const tierBadgeColor =
                item.strengthTier === "Uncrackable"
                  ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/40"
                  : item.strengthTier === "Very Strong"
                  ? "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/40"
                  : item.strengthTier === "Strong"
                  ? "bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40"
                  : item.strengthTier === "Moderate"
                  ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40"
                  : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40";

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/40 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="text-base sm:text-xl font-bold text-white tracking-wide break-all select-all">
                        {item.password}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{item.length} characters</span>
                        <span>•</span>
                        <span className="text-[#00e575] font-semibold">{item.entropyBits} bits entropy</span>
                        <span>•</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${tierBadgeColor}`}>
                          {item.strengthTier}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleCopy(item.password, idx)}
                        className="px-4 py-2 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#00e575]" />
                            <span className="text-[#00e575]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Plain-Language Crack Time & Resistance Bar */}
                  <div className="pt-2 border-t border-[#182234]/70 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#00e575]" />
                      <span>Estimated offline brute-force time: <strong className="text-slate-200">{item.crackTimeEstimate}</strong></span>
                    </span>
                    <span className="hidden md:inline text-[11px] text-slate-500">
                      Zero server storage • Generated locally
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
