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
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Tag,
  Calendar,
  Lock,
} from "lucide-react";

const SAMPLE_TOKENS = [
  {
    label: "Active Session Token",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMDE5MmEzYjQiLCJuYW1lIjoiQWdlbnQgQmxhY2siLCJlbWFpbCI6ImJsYWNrQGFybW91cnkubG9jYWwiLCJyb2xlIjoiU2VjT3BzIiwiYXVkIjoiaHR0cHM6Ly9hcm1vdXJ5LmxvY2FsIiwiZXhwIjoyMDgwODk2MDAwLCJpYXQiOjE3Mzg1MDYwMDB9.s1G2N3A4T5U6R7E8_dummysig",
  },
  {
    label: "Bearer Prefix Token",
    token:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODg5MiIsIm5hbWUiOiJTYW1wbGUgRGV2ZWxvcGVyIiwiZW1haWwiOiJkZXZAY29tcGFueS5jb20iLCJyb2xlIjoiRW5naW5lZXIiLCJleHAiOjIxMDAwMDAwMDAsImlhdCI6MTczODUwNjAwMH0.dummysig_bearer_test",
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
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const parse = jwtDecoderInputSchema.safeParse({ token });
    if (parse.success) {
      setResult(computeJwtDecode(parse.data));
    }
  }, [token]);

  const handleCopy = (textToCopy: string, key: string) => {
    navigator.clipboard.writeText(textToCopy);
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
                100% In-Browser Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Decode and inspect JSON Web Token headers, claims, expiration timestamps, and payloads with zero server transmission.
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
              What is a JWT &amp; how does it keep you logged in?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A <strong className="text-white">JSON Web Token (JWT)</strong> is like a digital ID badge or security wristband. When you log into an application, instead of asking for your password every time you click a link, the server gives your browser a compact, signed token. Your browser presents this token on each request to prove who you are.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-0.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Security Reminder:</strong> JWTs are <em>encoded</em>, not <em>encrypted</em>! Anyone who sees your token can read the data inside. Websites must never place passwords or payment cards inside a JWT payload.
              </span>
            </div>
          </div>
        </div>

        {/* The 3 Segments Breakdown */}
        <div className="border-t border-[#182234] pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#f43f5e]/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#f43f5e]">1. Header (The Envelope)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f43f5e]/10 text-[#f43f5e] font-semibold">Red</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Specifies the cryptographic algorithm (e.g. HS256, RS256) used to sign the badge and the token type.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#a855f7]/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#a855f7]">2. Payload (The ID Badge)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#a855f7]/10 text-[#a855f7] font-semibold">Purple</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Contains the user data (&quot;claims&quot;): your user ID (<code className="text-slate-300">sub</code>), your name, your permissions (<code className="text-slate-300">role</code>), and expiration (<code className="text-slate-300">exp</code>).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#38bdf8]/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#38bdf8]">3. Signature (The Wax Seal)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#38bdf8]/10 text-[#38bdf8] font-semibold">Blue</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A cryptographic seal created by the server. If an attacker modifies even one character in the payload, the seal breaks and access is denied.
            </p>
          </div>
        </div>

        {/* Collapsible Details */}
        <div className="border-t border-[#182234] pt-2">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-[#00e575] hover:underline font-semibold"
          >
            {showGuide ? "Hide Claim Explanations" : "What do claims like 'sub', 'exp', and 'iat' mean? (View glossary)"}
          </button>

          {showGuide && (
            <div className="mt-3 p-4 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-300 space-y-2">
              <p><strong className="text-white">sub (Subject):</strong> The unique user ID or account number the token belongs to.</p>
              <p><strong className="text-white">exp (Expiration Time):</strong> The exact second after which the server will reject this token and require re-logging in.</p>
              <p><strong className="text-white">iat (Issued At):</strong> The timestamp when this login session was first created.</p>
              <p><strong className="text-white">iss (Issuer):</strong> The authentication server or identity provider (e.g. Auth0, Google, Okta) that created the token.</p>
              <p><strong className="text-white">aud (Audience):</strong> Which specific API or backend website is allowed to accept this badge.</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <span>Encoded Token String</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-normal">Presets:</span>
            {SAMPLE_TOKENS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setToken(s.token)}
                className="px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/40 text-slate-300 hover:text-white text-xs transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste encoded JWT string (header.payload.signature) or Bearer header..."
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
                className={`p-3.5 rounded-2xl border ${
                  val?.isExpired
                    ? "bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444]"
                    : "bg-[#00e575]/10 border-[#00e575]/40 text-[#00e575]"
                }`}
              >
                {val?.isExpired ? <Clock className="w-7 h-7" /> : <CheckCircle2 className="w-7 h-7" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {val?.isExpired ? "Token Expired" : "Valid Active Token"}
                  </h2>
                  {val?.algorithm && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#182234] text-slate-200 font-bold border border-slate-700">
                      {val.algorithm}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                  {val?.timeRemaining && (
                    <span className={`font-semibold ${val.isExpired ? "text-[#ef4444]" : "text-[#00e575]"}`}>
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
                className="px-4 py-2 rounded-xl bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copiedKey === "payload_json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00e575]" />
                    <span className="text-[#00e575]">JSON Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Payload JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Decoded Claims Table */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#182234] bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#00e575]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Decoded Token Claims ({result.claimsList.length} Parameters)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Payload attributes formatted for human inspection
              </span>
            </div>

            <div className="divide-y divide-[#182234] text-xs">
              {result.claimsList.map((claim) => (
                <div
                  key={claim.claim}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#121927]/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-[#182234] font-bold text-[#00e575]">
                        {claim.claim}
                      </span>
                      <span className="font-semibold text-white break-all">
                        {typeof claim.value === "object"
                          ? JSON.stringify(claim.value)
                          : String(claim.value)}
                      </span>
                      {claim.isStandardClaim && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          RFC 7519
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{claim.description}</p>
                  </div>

                  {claim.formattedDate && (
                    <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded bg-[#080b11] border border-[#182234] text-slate-300 whitespace-nowrap self-start sm:self-center">
                      <Calendar className="w-3 h-3 text-[#00e575]" />
                      <span>{claim.formattedDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Raw Header & Signature JSON Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header JSON */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#f43f5e]" />
                  <span>Decoded Header</span>
                </div>
                <span className="text-slate-500 font-normal">Algorithm &amp; Type</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#080b11] border border-[#182234] text-slate-200 text-xs overflow-x-auto font-sans leading-relaxed">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>

            {/* Signature Info */}
            <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#38bdf8]" />
                  <span>Signature Segment</span>
                </div>
                <span className="text-slate-500 font-normal">Cryptographic Seal</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                <div className="text-xs text-slate-300 break-all font-sans">
                  {result.signature || "(No signature segment)"}
                </div>
                <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-2 border-t border-[#182234]">
                  <ShieldCheck className="w-4 h-4 text-[#00e575] flex-shrink-0 mt-0.5" />
                  <span>
                    The signature is verified by the issuing server using its private key or secret. It ensures the payload was not altered in transit.
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
