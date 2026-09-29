"use client";

import React, { useState, useEffect } from "react";
import { computeJwtDecode } from "./compute";
import { jwtDecoderInputSchema } from "./schema";
import type { JwtDecoderOutputData } from "./types";
import {
  Key,
  Clock,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

const SAMPLE_TOKENS = [
  {
    label: "Active Session Token",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMDE5MmEzYjQiLCJuYW1lIjoiQWdlbnQgQmxhY2siLCJlbWFpbCI6ImJsYWNrQGFybW91cnkubG9jYWwiLCJyb2xlIjoiU2VjT3BzIiwiYXVkIjoiaHR0cHM6Ly9hcm1vdXJ5LmxvY2FsIiwiZXhwIjoyMDgwODk2MDAwLCJpYXQiOjE3Mzg1MDYwMDB9.s1G2N3A4T5U6R7E8_dummysig",
  },
  {
    label: "Expired Token Sample",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleV8wMDEifQ.eyJzdWIiOiJ1c3JfZXhwaXJlZDEyMyIsImF1ZCI6ImFwaS1nYXRld2F5IiwiZXhwIjoxNTAwMDAwMDAwLCJpYXQiOjE0OTk5OTY0MDB9.dummysignatureforverification",
  },
];

export default function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE_TOKENS[0].token);
  const [result, setResult] = useState<JwtDecoderOutputData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const parse = jwtDecoderInputSchema.safeParse({ token });
    if (parse.success) {
      setResult(computeJwtDecode(parse.data));
    }
  }, [token]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const val = result?.validation;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                JSON Web Token (JWT) Decoder
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                Client-Side Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Decode and inspect JSON Web Token headers, claims, expiration timestamps, and payloads client-side with zero external transmission.
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>Encoded Token String</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Presets:</span>
            {SAMPLE_TOKENS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setToken(s.token)}
                className="px-2.5 py-1 rounded-md bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value.trim())}
          placeholder="Paste encoded JWT string (header.payload.signature)..."
          className="w-full bg-[#080b11] border border-[#182234] rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00e575]/50 focus:ring-1 focus:ring-[#00e575]/50 resize-none font-sans leading-relaxed break-all"
        />

        {result?.error && (
          <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{result.error}</span>
          </div>
        )}
      </div>

      {/* Decoded Results Display */}
      {result?.isValid && (
        <div className="space-y-6">
          {/* Status & Expiration Banner */}
          <div className="border border-[#182234] bg-gradient-to-r from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl border ${
                  val?.isExpired
                    ? "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]"
                    : "bg-[#00e575]/10 border-[#00e575]/40 text-[#00e575]"
                }`}
              >
                {val?.isExpired ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {val?.isExpired ? "Token Expired" : "Valid Active Token"}
                  </h2>
                  {val?.algorithm && (
                    <span className="text-xs px-2.5 py-0.5 rounded bg-[#182234] text-slate-300 font-bold">
                      {val.algorithm}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  {val?.timeRemaining && (
                    <span className={val.isExpired ? "text-[#ef4444]" : "text-[#00e575]"}>
                      {val.timeRemaining}
                    </span>
                  )}
                  {val?.expiresAt && (
                    <>
                      <span>•</span>
                      <span>Expires: {val.expiresAt}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(JSON.stringify(result.payload, null, 2), "payload_json")}
                className="px-3.5 py-2 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                {copiedKey === "payload_json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00e575]" />
                    <span className="text-[#00e575]">JSON Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Payload</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Claims Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Decoded Token Claims
              </span>
              <span className="text-xs text-slate-400">
                {result.claimsList.length} Claim Parameters
              </span>
            </div>

            <div className="divide-y divide-[#182234] text-xs">
              {result.claimsList.map((claim) => (
                <div
                  key={claim.claim}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121927]/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#182234] font-bold text-[#00e575]">
                        {claim.claim}
                      </span>
                      <span className="font-semibold text-white break-all">
                        {typeof claim.value === "object"
                          ? JSON.stringify(claim.value)
                          : String(claim.value)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{claim.description}</p>
                  </div>

                  {claim.formattedDate && (
                    <span className="text-[11px] px-2.5 py-1 rounded bg-[#080b11] border border-[#182234] text-slate-300 whitespace-nowrap self-start sm:self-center">
                      {claim.formattedDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw Header & Payload JSON Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header JSON */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>Decoded Header</span>
                <span className="text-slate-500 font-normal">Algorithm &amp; Token Type</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#080b11] border border-[#182234] text-slate-200 text-xs overflow-x-auto font-sans leading-relaxed">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Signature Info */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>Signature Hash</span>
                <span className="text-slate-500 font-normal">HMAC / RSA Verification</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                <div className="text-xs text-slate-300 break-all font-sans">
                  {result.signature || "(No signature segment)"}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-[#182234]">
                  <Info className="w-3.5 h-3.5 text-[#00e575]" />
                  <span>Signature is parsed for structural integrity. Secret keys are never requested or stored.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
