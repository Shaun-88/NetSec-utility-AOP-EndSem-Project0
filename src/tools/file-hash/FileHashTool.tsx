"use client";

import React, { useState, useRef } from "react";
import { computeFileHashData, computeMd5, formatBytes, SAMPLE_FILES } from "./compute";
import type { FileHashOutputData, SampleFileItem, FileHashAlgorithm } from "./types";
import {
  FileCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  ShieldCheck,
  FileText,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface AlgorithmMeta {
  bitLength: string;
  securityTier: string;
  tierColor: string;
  useCase: string;
}

const ALGORITHM_DETAILS: Record<FileHashAlgorithm, AlgorithmMeta> = {
  "SHA-256": {
    bitLength: "256-bit",
    securityTier: "Industry Standard",
    tierColor: "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/30",
    useCase: "Recommended by NIST for software distribution, Linux ISOs, and crypto signatures.",
  },
  "SHA-512": {
    bitLength: "512-bit",
    securityTier: "High Security",
    tierColor: "text-[#00e575] bg-[#00e575]/10 border-[#00e575]/30",
    useCase: "Maximum collision resistance for military, financial, and mission-critical verification.",
  },
  "SHA-384": {
    bitLength: "384-bit",
    securityTier: "Enterprise Standard",
    tierColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    useCase: "Commonly used in government Suite B cryptography and TLS certificates.",
  },
  "SHA-1": {
    bitLength: "160-bit",
    securityTier: "Legacy (Deprecated)",
    tierColor: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30",
    useCase: "Retained for backward compatibility with Git repositories and older archive verification.",
  },
  MD5: {
    bitLength: "128-bit",
    securityTier: "Legacy Checksum",
    tierColor: "text-slate-400 bg-slate-800/40 border-slate-700/40",
    useCase: "Fast error checking for accidental file corruption. Cryptographically broken against deliberate collisions.",
  },
};

export default function FileHashTool() {
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [expectedChecksum, setExpectedChecksum] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<FileHashOutputData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (selectedFile: globalThis.File, expected: string = expectedChecksum) => {
    setFile(selectedFile);
    setCalculating(true);

    try {
      const buffer = await selectedFile.arrayBuffer();

      // Compute SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto API
      const [sha1Buf, sha256Buf, sha384Buf, sha512Buf] = await Promise.all([
        crypto.subtle.digest("SHA-1", buffer),
        crypto.subtle.digest("SHA-256", buffer),
        crypto.subtle.digest("SHA-384", buffer),
        crypto.subtle.digest("SHA-512", buffer),
      ]);

      const toHex = (buf: ArrayBuffer) =>
        Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

      // Compute genuine RFC 1321 MD5 hash purely in JavaScript
      const md5Str = computeMd5(buffer);

      const hashes: Array<{ algorithm: FileHashAlgorithm; hash: string }> = [
        { algorithm: "SHA-256", hash: toHex(sha256Buf) },
        { algorithm: "SHA-512", hash: toHex(sha512Buf) },
        { algorithm: "SHA-384", hash: toHex(sha384Buf) },
        { algorithm: "SHA-1", hash: toHex(sha1Buf) },
        { algorithm: "MD5", hash: md5Str },
      ];

      const computed = computeFileHashData({
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        fileType: selectedFile.type,
        hashes,
        expectedChecksum: expected,
      });

      setResult(computed);
    } catch (err) {
      console.error("Failed to calculate hashes", err);
    } finally {
      setCalculating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setActiveSampleId(null);
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setActiveSampleId(null);
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleExpectedChecksumChange = (val: string) => {
    setExpectedChecksum(val);
    if (result && file) {
      const updated = computeFileHashData({
        fileName: result.fileName,
        fileSizeBytes: result.fileSizeBytes,
        fileType: result.fileType,
        hashes: result.hashes.map((h) => ({ algorithm: h.algorithm, hash: h.hash })),
        expectedChecksum: val,
      });
      setResult(updated);
    }
  };

  const handleCopy = (hash: string, key: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleLoadSample = async (sample: SampleFileItem) => {
    setActiveSampleId(sample.id);
    setCalculating(true);
    try {
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const testFile = new File([blob], sample.name, { type: blob.type || "text/plain" });
      setExpectedChecksum(sample.expectedSha256);
      await processFile(testFile, sample.expectedSha256);
    } catch (err) {
      console.error("Failed to load sample file", err);
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExpectedChecksum("");
    setResult(null);
    setActiveSampleId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Plain-Language Explainer Header */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e575]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575] shadow-glow flex-shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  File Hash &amp; Integrity Verifier
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575]/10 text-[#00e575] border border-[#00e575]/30">
                  Client Sandbox
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Zero Network Transfer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Verify that downloaded installers, ISOs, and files have not been corrupted in transit or tampered with by malware.
              </p>
            </div>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="self-start md:self-center flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080b11] border border-[#182234] hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Verifier
            </button>
          )}
        </div>

        {/* Plain Language Educational Callout */}
        <div className="mt-5 pt-5 border-t border-[#182234]/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              The Digital Wax Seal
            </span>
            <p className="text-slate-400 leading-relaxed">
              Software vendors publish a checksum next to downloads. If even a single byte was altered by an attacker or connection glitch, the checksum changes entirely.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              Mathematical Certainty
            </span>
            <p className="text-slate-400 leading-relaxed">
              Matching hashes prove beyond doubt that your downloaded file is byte-for-byte identical to the original copy published by the official software author.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080b11]/70 border border-[#182234] space-y-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              100% Private &amp; Local
            </span>
            <p className="text-slate-400 leading-relaxed">
              Your files never leave your computer. Hashes are computed in real time right in your browser using hardware-accelerated Web Crypto APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sample Files Section */}
      <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00e575]" />
              Try With Sample Files (No Download Required)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Test how checksum verification works immediately. Test a genuine file to see a verified match, or test a tampered file to see how modifications trigger instant warnings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SAMPLE_FILES.map((sample) => {
            const isSelected = activeSampleId === sample.id;
            return (
              <div
                key={sample.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isSelected
                    ? "bg-[#080b11] border-[#00e575] shadow-glow"
                    : "bg-[#080b11]/80 border-[#182234] hover:border-slate-700"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate" title={sample.name}>
                      {sample.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        sample.isTampered
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-[#00e575]/10 text-[#00e575] border-[#00e575]/30"
                      }`}
                    >
                      {sample.isTampered ? "Tampered File" : "Genuine Release"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Expected SHA-256 Checksum:
                    </span>
                    <span className="text-[11px] text-slate-300 font-sans break-all select-all block leading-tight">
                      {sample.expectedSha256.slice(0, 20)}...
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#182234] flex items-center gap-2">
                  <button
                    onClick={() => handleLoadSample(sample)}
                    disabled={calculating}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#00e575] text-[#080b11]"
                        : "bg-[#182234] hover:bg-[#202d44] text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isSelected ? "Currently Loaded" : "Test This File"}
                  </button>

                  <a
                    href={sample.path}
                    download={sample.name}
                    className="p-1.5 rounded-lg bg-[#182234] hover:bg-[#202d44] text-slate-300 hover:text-white transition-colors"
                    title={`Download ${sample.name} to disk`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 group ${
          isDragOver
            ? "border-[#00e575] bg-[#00e575]/10"
            : "border-[#182234] hover:border-[#00e575]/50 bg-[#0d131f] hover:bg-[#121927]/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="p-4 rounded-2xl bg-[#080b11] border border-[#182234] text-slate-400 group-hover:text-[#00e575] transition-colors shadow-glow">
          <Upload className="w-7 h-7" />
        </div>

        <div>
          <span className="text-sm font-bold text-white block">
            {calculating
              ? "Calculating cryptographic hashes..."
              : file
              ? file.name
              : "Click to select a file or drag and drop here"}
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            {file
              ? `${formatBytes(file.size)} • Click or drop another file to replace`
              : "Supports all formats (ISO, ZIP, EXE, DMG, PDF, images, source code). No size limit for local processing."}
          </span>
        </div>
      </div>

      {/* Expected Checksum Input */}
      {file && (
        <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Compare Against Official Vendor Checksum (Optional)
            </label>
            <span className="text-[11px] text-slate-500">
              Prefixes like &quot;SHA-256:&quot; and quotes are automatically sanitized
            </span>
          </div>

          <input
            type="text"
            value={expectedChecksum}
            onChange={(e) => handleExpectedChecksumChange(e.target.value)}
            placeholder="Paste expected SHA-256, SHA-512, SHA-384, or MD5 hash from vendor website..."
            className="w-full bg-[#080b11] border border-[#182234] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e575]/60 font-sans"
          />
        </div>
      )}

      {/* Results & Verification Display */}
      {result && (
        <div className="space-y-6">
          {/* Verification Status Banner */}
          {result.verificationStatus === "verified" ? (
            <div className="p-6 rounded-2xl border bg-[#00e575]/10 border-[#00e575]/40 text-[#00e575] flex items-start gap-4">
              <CheckCircle2 className="w-7 h-7 flex-shrink-0 mt-0.5 text-[#00e575]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Integrity Verified — Genuine Match!
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00e575] text-[#080b11] font-bold">
                    {result.matchedAlgorithm}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The computed file hash matches your provided checksum with 100% mathematical precision. This file is authentic, unaltered, and safe from download corruption.
                </p>
              </div>
            </div>
          ) : result.verificationStatus === "mismatch" ? (
            <div className="p-6 rounded-2xl border bg-[#ef4444]/10 border-[#ef4444]/40 text-[#ef4444] flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 flex-shrink-0 mt-0.5 text-[#ef4444]" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Verification Failed — Checksum Mismatch Alert!
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white font-bold">
                    Warning
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  None of the computed hashes matched the expected checksum. The file may have suffered transmission corruption, or could have been modified/tampered with. Do not install or execute this file if downloaded from an untrusted mirror.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-[#182234] bg-[#0d131f] text-slate-400 flex items-center gap-3">
              <Info className="w-5 h-5 flex-shrink-0 text-slate-400" />
              <p className="text-xs">
                Hashes computed successfully. Paste an official vendor checksum into the field above to verify integrity, or copy any hash below.
              </p>
            </div>
          )}

          {/* Hashes List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Computed Cryptographic Hashes ({result.fileName})
              </h3>
              <span className="text-xs text-slate-400">
                {result.formattedSize}
              </span>
            </div>

            {result.hashes.map((item) => {
              const meta = ALGORITHM_DETAILS[item.algorithm];
              return (
                <div
                  key={item.algorithm}
                  className={`p-5 rounded-2xl bg-[#0d131f] border transition-colors space-y-3 ${
                    item.isMatch
                      ? "border-[#00e575] bg-[#00e575]/5"
                      : "border-[#182234]"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-white tracking-wide">
                        {item.algorithm}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#080b11] border border-[#182234] text-slate-400">
                        {meta.bitLength}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${meta.tierColor}`}>
                        {meta.securityTier}
                      </span>
                      {item.isMatch && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#00e575] text-[#080b11] flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          MATCHES EXPECTED
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(item.hash, item.algorithm)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080b11] border border-[#182234] hover:border-[#00e575]/50 text-slate-300 hover:text-[#00e575] text-xs transition-colors"
                      title={`Copy ${item.algorithm} hash`}
                    >
                      {copiedKey === item.algorithm ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00e575]" />
                          <span className="text-[#00e575] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {meta.useCase}
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] text-xs text-slate-200 tracking-wide font-sans break-all select-all leading-relaxed">
                    {item.hash}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plain-Language Step-by-Step Practical Guide */}
          <div className="border border-[#182234] bg-[#0d131f] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              How to Verify Software Downloads in Real Life
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <span className="text-[#00e575] font-bold">1. Find Checksum</span>
                <p className="text-slate-400 leading-relaxed">
                  On the download page or GitHub release, find the string labeled SHA256, SHA512, or MD5 checksum.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <span className="text-[#00e575] font-bold">2. Drop File</span>
                <p className="text-slate-400 leading-relaxed">
                  Drag the downloaded installer or file into the dropzone above. No data leaves your machine.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <span className="text-[#00e575] font-bold">3. Paste Expected</span>
                <p className="text-slate-400 leading-relaxed">
                  Paste the checksum into the comparison box. Any algorithm prefixes or quotes are sanitized.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] space-y-1">
                <span className="text-[#00e575] font-bold">4. Read Verdict</span>
                <p className="text-slate-400 leading-relaxed">
                  A green &quot;Verified&quot; banner guarantees 100% authenticity. A red banner warns against opening the file.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
