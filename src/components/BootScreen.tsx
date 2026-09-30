"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Check, Shield } from "lucide-react";

interface BootScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export default function BootScreen({
  onComplete,
  minDurationMs = 10000,
}: BootScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const fullTitle = "The Big Bro's NetSec Armoury";

  // Timeline events based on minimum 10 seconds (10,000ms)
  const statusLines = useMemo(
    () => [
      { text: "Establishing secure session...", showAt: 3000, doneAt: 4200 },
      { text: "Verifying system integrity...", showAt: 4400, doneAt: 5500 },
      { text: "Loading diagnostic modules...", showAt: 5700, doneAt: 6900 },
      { text: "Calibrating interface & analytics...", showAt: 7100, doneAt: 8400 },
    ],
    [],
  );

  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const hasFinishedRef = React.useRef(false);
  const isFadingOutRef = React.useRef(false);

  useEffect(() => {
    const startTime = performance.now();

    const finishSequence = () => {
      if (hasFinishedRef.current) return;
      hasFinishedRef.current = true;
      setIsDone(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    };

    const interval = setInterval(() => {
      const now = performance.now();
      const currentElapsed = now - startTime;
      setElapsed(currentElapsed);

      // Beat 1: Letter-by-letter typing of title (between 400ms and 2800ms)
      if (currentElapsed > 400 && currentElapsed < 2800) {
        const progress = (currentElapsed - 400) / 2400;
        const charCount = Math.min(
          fullTitle.length,
          Math.floor(progress * fullTitle.length) + 1,
        );
        setTypedTitle(fullTitle.slice(0, charCount));
      } else if (currentElapsed >= 2800) {
        setTypedTitle(fullTitle);
      }

      // Beat 3: Hand-off transition at minDurationMs - 700ms
      if (currentElapsed >= minDurationMs - 700 && !isFadingOutRef.current) {
        isFadingOutRef.current = true;
        setIsFadingOut(true);
      }

      if (currentElapsed >= minDurationMs) {
        clearInterval(interval);
        finishSequence();
      }
    }, 30);

    // Escape key shortcut to bypass for rapid developer testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (hasFinishedRef.current) return;
        clearInterval(interval);
        isFadingOutRef.current = true;
        setIsFadingOut(true);
        setTimeout(() => {
          finishSequence();
        }, 300);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [minDurationMs]);

  if (isDone) return null;

  const progressPercent = Math.min(100, (elapsed / minDurationMs) * 100);
  const isBrighteningPulse = elapsed >= 8600 && elapsed < minDurationMs;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070a10] text-[#f1f5f9] select-none transition-opacity duration-700 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 noir-scanline pointer-events-none opacity-30" />

      {/* Noir Corner Vignette */}
      <div className="absolute inset-0 noir-vignette pointer-events-none" />

      {/* Centerpiece Container */}
      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center space-y-7">
        {/* Beat 1: Noir Hat-Guy Detective Silhouette Logo */}
        <div
          className={`relative transition-all duration-1000 ${
            elapsed < 400
              ? "opacity-20 scale-95"
              : elapsed < 8600
              ? "opacity-100 scale-100"
              : isBrighteningPulse
              ? "animate-pulse-glow"
              : "opacity-100"
          }`}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -inset-4 rounded-full bg-[#00e575] blur-2xl transition-opacity duration-1000 ${
              elapsed > 800 ? (isBrighteningPulse ? "opacity-50" : "opacity-20") : "opacity-0"
            }`}
          />

          <div className="relative w-20 h-20 rounded-2xl bg-[#090e18] border border-[#00e575]/40 flex items-center justify-center shadow-glow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`w-12 h-12 text-[#00e575] transition-all duration-700 ${
                isBrighteningPulse ? "text-[#33ff8f]" : "text-[#00e575]"
              }`}
            >
              {/* Fedora crown & brim */}
              <path
                d="M4 11C6 11 7 8 12 8C17 8 18 11 20 11C21.5 11 22 11.8 22 12.5C22 13 21 13 20 13H4C3 13 2 13 2 12.5C2 11.8 2.5 11 4 11Z"
                fill="currentColor"
              />
              <path
                d="M7 10C7.5 7.5 9 5 12 5C15 5 16.5 7.5 17 10H7Z"
                fill="currentColor"
                fillOpacity="0.8"
              />
              {/* Trenchcoat collar & dark shades */}
              <path
                d="M6 15L9 21H15L18 15L12 17L6 15Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
              <rect x="8" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#090e18" />
              <rect x="12.5" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#090e18" />
            </svg>
          </div>
        </div>

        {/* Beat 1: Letter-by-Letter Modern Sans Title */}
        <div className="h-10 flex items-center justify-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {typedTitle}
            {elapsed < 2800 && (
              <span className="inline-block w-1.5 h-5 ml-1 bg-[#00e575] animate-pulse align-middle" />
            )}
          </h1>
        </div>

        {/* Beat 2: Status Lines */}
        <div className="w-full space-y-2.5 min-h-[140px] flex flex-col justify-center text-left text-xs font-sans">
          {statusLines.map((line, idx) => {
            const isVisible = elapsed >= line.showAt;
            const isFinished = elapsed >= line.doneAt;

            if (!isVisible) return null;

            return (
              <div
                key={idx}
                className="flex items-center justify-between text-slate-300 transition-opacity duration-300 animate-fadeIn"
              >
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <span className="w-4 h-4 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center border border-[#00e575]/50 flex-shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                    </span>
                  )}
                  <span className={isFinished ? "text-slate-300" : "text-white"}>
                    {line.text}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-sans">
                  {isFinished ? "READY" : "..."}
                </span>
              </div>
            );
          })}
        </div>

        {/* Beat 2 & 3: Horizontal Progress Bar tied to real load timer */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-[#121927] rounded-full overflow-hidden border border-[#182234]">
            <div
              className={`h-full bg-gradient-to-r from-[#00e575]/80 to-[#00e575] rounded-full transition-all duration-75 ${
                isBrighteningPulse ? "shadow-[0_0_15px_#00e575]" : ""
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#00e575]" />
              <span>Initial boot sequence</span>
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* Skip Notice */}
        <div className="pt-2 text-[10px] text-slate-600">
          <span>Press </span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#121927] border border-[#182234] text-slate-400">
            Esc
          </kbd>
          <span> to skip</span>
        </div>
      </div>
    </div>
  );
}
