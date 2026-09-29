"use client";

import React, { useState, useEffect } from "react";
import { computeBinaryText } from "./compute";
import { binaryTextInputSchema } from "./schema";
import type { BinaryTextOutputData, ConversionMode, BinaryDelimiter } from "./types";
import {
  Binary,
  ArrowRightLeft,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function BinaryTextTool() {
  const [input, setInput] = useState("Security Armoury");
  const [mode, setMode] = useState<ConversionMode>("text-to-binary");
  const [delimiter, setDelimiter] = useState<BinaryDelimiter>("space");
  const [result, setResult] = useState<BinaryTextOutputData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parse = binaryTextInputSchema.safeParse({ input, mode, delimiter });
    if (parse.success) {
      setResult(computeBinaryText(parse.data));
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Binary ⇄ Text Translator
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                UTF-8 Bytecode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bidirectional conversion between UTF-8 text and formatted 8-bit binary bytecode with hex cross-reference.
            </p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSwapMode}
            className="px-4 py-2 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-bold text-white flex items-center gap-2 transition-colors shadow-glow"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#00e575]" />
            <span>
              {mode === "text-to-binary" ? "Mode: Text ➔ Binary" : "Mode: Binary ➔ Text"}
            </span>
          </button>
        </div>

        {mode === "text-to-binary" && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Delimiter:</span>
            {(["space", "none", "comma", "hyphen"] as BinaryDelimiter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDelimiter(d)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${
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

      {/* Input / Output Dual View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>{mode === "text-to-binary" ? "Source Text" : "Binary Input Stream"}</span>
            <button
              onClick={() => setInput("")}
              className="text-slate-500 hover:text-white text-[11px] capitalize"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "text-to-binary"
                ? "Type or paste text..."
                : "Paste 8-bit binary stream (e.g. 01001000 01101001)..."
            }
            className="w-full flex-1 bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 resize-none font-sans leading-relaxed"
          />

          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>{input.length} characters</span>
          </div>
        </div>

        {/* Output Panel */}
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span>{mode === "text-to-binary" ? "Binary Bytecode" : "Decoded Text"}</span>
            {result?.output && (
              <button
                onClick={handleCopy}
                className="text-xs text-[#00e575] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Output"}</span>
              </button>
            )}
          </div>

          <div className="w-full flex-1 bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-slate-200 overflow-y-auto min-h-[160px] font-sans leading-relaxed break-all select-all">
            {result?.output || (
              <span className="text-slate-600">Output will appear here...</span>
            )}
          </div>

          {result?.error && (
            <div className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {result && (
            <div className="text-[11px] text-slate-500 flex justify-between flex-wrap gap-2">
              <span>
                {result.byteCount} Bytes • {result.bitCount} Bits
              </span>
              {result.hexEquivalent && (
                <span className="text-slate-400">
                  Hex: <strong className="text-white">{result.hexEquivalent}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
