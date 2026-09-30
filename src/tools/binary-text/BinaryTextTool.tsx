"use client";

import React, { useState, useEffect } from "react";
import { computeBinaryText } from "./compute";
import { binaryTextInputSchema } from "./schema";
import type { BinaryTextOutputData, ConversionMode, BinaryDelimiter } from "./types";
import { logClientToolRunDebounced } from "@/core/history/client-logger";
import {
  Binary,
  ArrowRightLeft,
  Copy,
  Check,
  AlertTriangle,
  Cpu,
  Layers,
  Lightbulb,
  FileCode,
  RotateCcw,
} from "lucide-react";

interface SamplePreset {
  label: string;
  value: string;
  mode: ConversionMode;
}

const PRESET_SAMPLES: SamplePreset[] = [
  { label: "Hello World!", value: "Hello World!", mode: "text-to-binary" },
  { label: "NetSec Armoury", value: "NetSec Armoury", mode: "text-to-binary" },
  { label: "SOS", value: "SOS", mode: "text-to-binary" },
  { label: "Binary 'Cyber'", value: "01000011 01111001 01100010 01100101 01110010", mode: "binary-to-text" },
];

export default function BinaryTextTool() {
  const [input, setInput] = useState("NetSec Armoury");
  const [mode, setMode] = useState<ConversionMode>("text-to-binary");
  const [delimiter, setDelimiter] = useState<BinaryDelimiter>("space");
  const [result, setResult] = useState<BinaryTextOutputData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parse = binaryTextInputSchema.safeParse({ input, mode, delimiter });
    if (parse.success) {
      const out = computeBinaryText(parse.data);
      setResult(out);
      if (input.trim().length > 0) {
        logClientToolRunDebounced(
          "binary-text",
          mode === "text-to-binary" ? "Text to Binary" : "Binary to Text",
          {
            mode,
            delimiter,
            inputLength: input.length,
            outputLength: out.output.length,
          },
        );
      }
    }
  }, [input, mode, delimiter]);

  const handleSwapMode = () => {
    if (result && result.output && result.isValid) {
      const nextMode: ConversionMode =
        mode === "text-to-binary" ? "binary-to-text" : "text-to-binary";
      setInput(result.output);
      setMode(nextMode);
    } else {
      setMode(mode === "text-to-binary" ? "binary-to-text" : "text-to-binary");
    }
  };

  const handleCopy = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLoadSample = (sample: SamplePreset) => {
    setMode(sample.mode);
    setInput(sample.value);
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Plain-Language Explainer Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Binary ⇄ Text Translator
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                  UTF-8 Bytecode
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Instant Local
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Convert between human-readable text and computer binary bytecode (0s and 1s) with byte-by-byte inspection and hexadecimal cross-referencing.
              </p>
            </div>
          </div>
        </div>

        {/* Educational Explainer Callouts */}
        <div className="mt-5 pt-5 border-t border-[#182234]/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#00e575]" />
              The Language of Silicon
            </span>
            <p className="text-slate-400 leading-relaxed">
              Computers do not store letters or words. Microchips only understand electrical switches that are either ON (<strong className="text-white">1</strong>) or OFF (<strong className="text-white">0</strong>).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#f59e0b]" />
              Bits and Bytes
            </span>
            <p className="text-slate-400 leading-relaxed">
              A single 0 or 1 is a <strong className="text-white">bit</strong>. Computers group 8 bits together into a <strong className="text-white">byte</strong> (e.g., <span className="text-slate-300">01000001</span> represents letter &apos;A&apos; in ASCII/UTF-8).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-sky-400" />
              Why Convert?
            </span>
            <p className="text-slate-400 leading-relaxed">
              Used by cybersecurity analysts and network engineers to inspect raw packet data, debug encoding bugs, and understand how machines process information.
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Mode Bar */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSwapMode}
            className="px-4 py-2.5 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-glow"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#00e575]" />
            <span>
              {mode === "text-to-binary" ? "Current Mode: Text ➔ Binary" : "Current Mode: Binary ➔ Text"}
            </span>
          </button>
        </div>

        {mode === "text-to-binary" && (
          <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
            <span className="text-slate-400 font-semibold">Byte Delimiter:</span>
            {(["space", "none", "comma", "hyphen"] as BinaryDelimiter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDelimiter(d)}
                className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                  delimiter === d
                    ? "bg-[#00e575] text-[#080b11] font-bold"
                    : "bg-[#080b11] border border-[#182234] text-slate-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Sample Presets */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 px-1">
        <span className="font-semibold text-slate-300">Quick Samples:</span>
        {PRESET_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            onClick={() => handleLoadSample(sample)}
            className="px-2.5 py-1 rounded-lg bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>

      {/* Input / Output Dual View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>{mode === "text-to-binary" ? "Source Text" : "Binary Input Stream"}</span>
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-white text-xs capitalize flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>

          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "text-to-binary"
                ? "Type or paste text to convert into binary..."
                : "Paste 8-bit binary stream (e.g. 01001000 01101001)..."
            }
            className="w-full flex-1 bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 resize-none font-sans leading-relaxed"
          />

          <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1">
            <span>{input.length} characters</span>
            <span className="text-slate-600">Local processing only</span>
          </div>
        </div>

        {/* Output Panel */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>{mode === "text-to-binary" ? "Binary Bytecode Output" : "Decoded Text Output"}</span>
            {result?.output && (
              <button
                onClick={handleCopy}
                className="text-xs text-[#00e575] hover:underline flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Output"}</span>
              </button>
            )}
          </div>

          <div className="w-full flex-1 bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-slate-200 overflow-y-auto min-h-[160px] font-sans leading-relaxed break-all select-all">
            {result?.output || (
              <span className="text-slate-600">Converted output will appear here...</span>
            )}
          </div>

          {result?.error && (
            <div className="p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{result.error}</span>
            </div>
          )}

          {result && (
            <div className="text-[11px] text-slate-400 flex justify-between flex-wrap gap-2 pt-1 border-t border-[#182234]/60">
              <span className="font-semibold text-white">
                {result.byteCount} Bytes • {result.bitCount} Bits
              </span>
              {result.hexEquivalent && (
                <span className="text-slate-400">
                  Hex: <strong className="text-slate-200 font-sans">{result.hexEquivalent}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Educational Character Bytecode Breakdown Inspector */}
      {result && result.charBreakdown && result.charBreakdown.length > 0 && (
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#00e575]" />
                Character-by-Character Byte Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing how each character maps to its ASCII code, hexadecimal value, and 8-bit electrical pattern.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              Showing first {result.charBreakdown.length} characters
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {result.charBreakdown.map((item, idx) => (
              <div
                key={`${item.char}-${idx}`}
                className="p-3 rounded-xl bg-[#080b11] border border-[#182234] text-center space-y-1 hover:border-[#00e575]/40 transition-colors"
              >
                <div className="text-base font-bold text-[#00e575] truncate" title={item.char}>
                  {item.char}
                </div>
                <div className="text-[10px] text-slate-400">
                  ASCII: <span className="text-white font-semibold">{item.asciiCode}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Hex: <span className="text-amber-400 font-semibold">{item.hex}</span>
                </div>
                <div className="p-1 rounded bg-[#0d131f] border border-[#182234] text-[10px] text-slate-300 font-sans tracking-tight break-all">
                  {item.binary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
