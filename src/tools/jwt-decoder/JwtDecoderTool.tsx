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
  BookOpen,
  Compass,
  Search,
  ChevronDown,
  ChevronUp,
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
  const [activeGuideTab, setActiveGuideTab] = useState<"what-is-it" | "how-to-use" | "how-to-read">("what-is-it");
  const [isGuideOpen, setIsGuideOpen] = useState(true);

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

      {/* Comprehensive Plain-Language Explainer & Interactive Guide */}
      <div className="border border-[#182234] bg-gradient-to-br from-[#0d131f] via-[#090e18] to-[#0d131f] rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Complete JWT Guide &amp; Walkthrough
              </h2>
              <p className="text-xs text-slate-400">
                Learn what a JWT is, how to use this tool, and how to interpret every section of the decoded result.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#080b11] border border-[#182234] hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span>{isGuideOpen ? "Collapse Guide" : "Expand Guide"}</span>
            {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isGuideOpen && (
          <div className="space-y-4 pt-1">
            {/* Guide Tabs */}
            <div className="flex items-center gap-2 border-b border-[#182234] pb-3 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveGuideTab("what-is-it")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeGuideTab === "what-is-it"
                    ? "bg-[#00e575] text-[#080b11] shadow-glow"
                    : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>1. What Exactly is a JWT?</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab("how-to-use")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeGuideTab === "how-to-use"
                    ? "bg-[#00e575] text-[#080b11] shadow-glow"
                    : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>2. What Do I Do With This Tool?</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab("how-to-read")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeGuideTab === "how-to-read"
                    ? "bg-[#00e575] text-[#080b11] shadow-glow"
                    : "bg-[#080b11] text-slate-400 hover:text-white border border-[#182234]"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>3. How to Understand the Results</span>
              </button>
            </div>

            {/* Tab 1 Content: What Exactly is a JWT? */}
            {activeGuideTab === "what-is-it" && (
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                  <p>
                    A <strong className="text-white">JSON Web Token (JWT)</strong> is like a <strong className="text-[#00e575]">digital security badge or concert wristband</strong> for websites and mobile applications. In older systems, the server had to store your session in a central database and query it every time you clicked a button. With JWTs, after you log in, the server mints a signed badge for your browser. On every request, your browser presents this badge. Because the badge has a cryptographic seal, any server can verify who you are without looking at a database!
                  </p>
                  <div className="flex items-center gap-2 text-amber-400 font-semibold pt-1">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Critical Rule: Encoding is NOT encryption. Anyone who sees a token can decode it. Never store passwords, PINs, or credit cards in a JWT!
                    </span>
                  </div>
                </div>

                {/* The 3 Segments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#f43f5e]/30 space-y-1.5">
                    <span className="text-xs font-bold text-[#f43f5e] block">1. Header (The Envelope)</span>
                    <p className="text-[11px] text-slate-400">
                      Tells the server which cryptographic algorithm was used to sign the badge (e.g. HS256, RS256) and the token format.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#a855f7]/30 space-y-1.5">
                    <span className="text-xs font-bold text-[#a855f7] block">2. Payload (The ID Badge)</span>
                    <p className="text-[11px] text-slate-400">
                      Contains the identity data and claims: your user ID (<span className="text-slate-300">sub</span>), your name, your permissions (<span className="text-slate-300">role</span>), and expiration (<span className="text-slate-300">exp</span>).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#38bdf8]/30 space-y-1.5">
                    <span className="text-xs font-bold text-[#38bdf8] block">3. Signature (The Wax Seal)</span>
                    <p className="text-[11px] text-slate-400">
                      A cryptographic seal created with the server&apos;s private key. If an attacker modifies even a single character in the payload, the seal breaks and access is denied.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2 Content: What Do I Do With This Tool? */}
            {activeGuideTab === "how-to-use" && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00e575] text-[#080b11] font-bold text-[11px] flex items-center justify-center">1</span>
                      <strong className="text-white">Find Your Token</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      In Chrome/Firefox, press <strong className="text-slate-300">F12</strong> &rarr; <strong className="text-slate-300">Network</strong> tab &rarr; click an API request &rarr; copy the <strong className="text-slate-300">Authorization: Bearer &lt;token&gt;</strong> header. Or check Application &rarr; LocalStorage.
                    </p>
                    <p className="text-[11px] text-[#00e575]">
                      Tip: You can also click the quick presets above to test instantly!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00e575] text-[#080b11] font-bold text-[11px] flex items-center justify-center">2</span>
                      <strong className="text-white">Paste Into Decoder</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paste the token into the box below. You don&apos;t have to manually remove &quot;Bearer&quot; or quotes — the Armoury automatically cleans and formats it for you.
                    </p>
                    <p className="text-[11px] text-sky-400">
                      Privacy: 100% client-side decoding in your browser. Nothing is sent to our servers.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#00e575] text-[#080b11] font-bold text-[11px] flex items-center justify-center">3</span>
                      <strong className="text-white">Diagnose &amp; Inspect</strong>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Use the results to diagnose <strong className="text-slate-300">401 Unauthorized</strong> or <strong className="text-slate-300">403 Forbidden</strong> bugs, check session expiration times, or verify user roles and tenant scopes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3 Content: How to Understand the Results */}
            {activeGuideTab === "how-to-read" && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-4 rounded-xl bg-[#080b11] border border-[#182234] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[#00e575] font-bold block uppercase tracking-wider text-[11px]">
                        Understanding the Status Banner
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-slate-400">
                        <li>
                          <strong className="text-[#00e575]">Valid Active Token:</strong> The token&apos;s expiration date (<span className="text-slate-300">exp</span>) is in the future. The countdown tells you how much session time remains.
                        </li>
                        <li>
                          <strong className="text-[#ef4444]">Token Expired:</strong> The token&apos;s validity window has passed. If your requests fail with 401 errors, an expired token is the primary culprit.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[#38bdf8] font-bold block uppercase tracking-wider text-[11px]">
                        Understanding Key Claims (RFC 7519)
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        <li><strong className="text-white">sub (Subject):</strong> The unique User ID or account key.</li>
                        <li><strong className="text-white">exp (Expiration):</strong> Timestamp when the token expires.</li>
                        <li><strong className="text-white">iat (Issued At):</strong> Timestamp when the user logged in.</li>
                        <li><strong className="text-white">iss (Issuer):</strong> The auth server (Auth0, Google, Okta, etc.).</li>
                        <li><strong className="text-white">aud (Audience):</strong> Which API service is allowed to consume this token.</li>
                        <li><strong className="text-white">role / scope:</strong> Permissions granted to this session.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
