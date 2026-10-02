"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Check, Shield } from "lucide-react";

interface BootScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  size: number;
  alpha: number;
  targetAlpha: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.15 + 0.05;
    this.baseVx = Math.cos(angle) * speed;
    this.baseVy = Math.sin(angle) * speed;
    this.vx = this.baseVx;
    this.vy = this.baseVy;
    this.size = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.4 + 0.1;
    this.targetAlpha = this.alpha;
  }

  update(
    width: number,
    height: number,
    speedMult: number,
    isBlast: boolean,
    centerX: number,
    centerY: number
  ) {
    if (isBlast) {
      const dx = this.x - centerX;
      const dy = this.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      this.vx += (dx / dist) * 2;
      this.vy += (dy / dist) * 2;
      this.targetAlpha = 0; 
      this.size += 0.1;
    } else {
      this.vx = this.baseVx * speedMult;
      this.vy = this.baseVy * speedMult;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (!isBlast) {
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    this.alpha += (this.targetAlpha - this.alpha) * 0.1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0.01) return;
    ctx.fillStyle = `rgba(0, 229, 117, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

import { playSound } from "@/utils/audio";

export default function BootScreen({
  onComplete,
  minDurationMs = 10000,
}: BootScreenProps) {
  const [phase, setPhase] = useState<"GATE" | "BOOTING" | "DONE">("GATE");
  const [elapsed, setElapsed] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  const fullTitle = "The Big Bro's NetSec Armoury";

  const statusLines = useMemo(
    () => [
      { text: "Establishing secure session...", showAt: 2400, doneAt: 3600 },
      { text: "Verifying system integrity...", showAt: 3800, doneAt: 5000 },
      { text: "Loading diagnostic modules...", showAt: 5200, doneAt: 6400 },
      { text: "Calibrating interface & analytics...", showAt: 6600, doneAt: 7800 },
    ],
    []
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const progressPercentRef = useRef(0);
  const isBlastRef = useRef(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const hasFinishedRef = useRef(false);
  const isFadingOutRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  // Audio setup
  const startBoot = React.useCallback(() => {
    if (phase !== "GATE") return;
    setPhase("BOOTING");
    if (audioRef.current) {
      audioRef.current.volume = 1;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [phase]);

  // Keyboard listener for Gate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "GATE" && e.key === "Enter") {
        startBoot();
      } else if (phase === "BOOTING" && e.key === "Escape") {
        if (hasFinishedRef.current) return;
        setElapsed(minDurationMs);
        progressPercentRef.current = 100;
        isBlastRef.current = true;
        isFadingOutRef.current = true;
        setIsFadingOut(true);
        setTimeout(() => {
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true;
            setPhase("DONE");
            onCompleteRef.current?.();
          }
        }, 500);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, minDurationMs, startBoot]);

  // Boot timer loop
  useEffect(() => {
    if (phase !== "BOOTING") return;

    if (!startTimeRef.current) {
      startTimeRef.current = performance.now();
    }
    const start = startTimeRef.current;

    const interval = setInterval(() => {
      if (hasFinishedRef.current) return;
      
      const now = performance.now();
      const currentElapsed = now - start;
      setElapsed(currentElapsed);

      if (currentElapsed > 400 && currentElapsed < 2400) {
        const progress = (currentElapsed - 400) / 2000;
        const charCount = Math.min(
          fullTitle.length,
          Math.floor(progress * fullTitle.length) + 1
        );
        setTypedTitle(fullTitle.slice(0, charCount));
      } else if (currentElapsed >= 2400) {
        setTypedTitle(fullTitle);
      }

      // Calculate progress percent
      progressPercentRef.current = Math.min(100, Math.floor((currentElapsed / 8000) * 100));

      if (currentElapsed >= minDurationMs - 500 && !isFadingOutRef.current) {
        isFadingOutRef.current = true;
        setIsFadingOut(true);
        isBlastRef.current = true; // Trigger blast
      }

      if (currentElapsed >= minDurationMs) {
        clearInterval(interval);
        hasFinishedRef.current = true;
        setPhase("DONE");
        onCompleteRef.current?.();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [phase, minDurationMs]);

  // Particle render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize particles once or on drastic resize
      if (particlesRef.current.length === 0) {
        const pCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
        for (let i = 0; i < pCount; i++) {
          particlesRef.current.push(new Particle(canvas.width, canvas.height));
        }
      }
    };
    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Multiplier based on progress
      const p = progressPercentRef.current;
      // In GATE phase, p is 0. Base speed multiplier 1. 
      // At 100%, speed multiplier is 10.
      const speedMult = 1 + (p / 100) * 9;
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i];
        particle.update(canvas.width, canvas.height, speedMult, isBlastRef.current, cx, cy);
        particle.draw(ctx);

        // Network connection lines
        if (!isBlastRef.current) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p2 = particlesRef.current[j];
            const dx = particle.x - p2.x;
            const dy = particle.y - p2.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 15000) {
              const opacity = 1 - Math.sqrt(distSq) / 122.47; // 122.47 = sqrt(15000)
              if (opacity > 0) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 229, 117, ${opacity * 0.4 * Math.min(particle.alpha, p2.alpha)})`;
                ctx.lineWidth = 0.8;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      if (isBlastRef.current && startTimeRef.current) {
        const elapsedBlast = performance.now() - (startTimeRef.current + minDurationMs - 500);
        if (elapsedBlast > 0) {
           const blastProgress = Math.min(1, elapsedBlast / 500);
           // Intense matrix flash
           ctx.fillStyle = `rgba(0, 229, 117, ${blastProgress * 0.8})`;
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           ctx.fillStyle = `rgba(255, 255, 255, ${blastProgress * 0.9})`;
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [minDurationMs]);

  if (phase === "DONE") return null;

  const progressPercent = progressPercentRef.current;
  const isBrighteningPulse = elapsed >= 7800 && elapsed < minDurationMs;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#070a10] text-[#f1f5f9] select-none transition-opacity duration-500 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <audio ref={audioRef} src="/boot-bgm.mp3" loop />
      
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 noir-scanline pointer-events-none opacity-30" />

      {/* Noir Corner Vignette */}
      <div className="absolute inset-0 noir-vignette pointer-events-none" />

      {phase === "GATE" && (
        <>
          {/* Hacker decorative logs */}
          <div className="absolute bottom-6 left-6 text-[10px] text-[#00e575]/40 font-mono hidden md:block">
            <p>&gt; SEC_NODE_CONNECT: pending...</p>
            <p>&gt; ESTABLISHING HANDSHAKE [TCP/443]</p>
            <p>&gt; AWAITING USER AUTHENTICATION</p>
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-6">
            <div className="relative w-20 h-20 rounded-2xl bg-[#090e18] border border-[#00e575]/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,117,0.15)] transition-all animate-pulse-glow">
              <Shield className="w-10 h-10 text-[#00e575]/80" />
            </div>
            <button 
              onMouseEnter={() => playSound("hover")}
              onClick={startBoot}
              className="px-8 py-3 border border-[#00e575]/60 text-[#00e575] font-sans font-semibold tracking-[0.2em] text-sm hover:bg-[#00e575]/10 hover:shadow-[0_0_15px_rgba(0,229,117,0.3)] transition-all animate-pulse rounded-sm"
            >
              INITIALIZE UPLINK
            </button>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Press Enter to Begin</div>
          </div>
        </>
      )}

      {phase === "BOOTING" && (
        <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center space-y-7 animate-fadeIn">
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
                <path
                  d="M4 11C6 11 7 8 12 8C17 8 18 11 20 11C21.5 11 22 11.8 22 12.5C22 13 21 13 20 13H4C3 13 2 13 2 12.5C2 11.8 2.5 11 4 11Z"
                  fill="currentColor"
                />
                <path
                  d="M7 10C7.5 7.5 9 5 12 5C15 5 16.5 7.5 17 10H7Z"
                  fill="currentColor"
                  fillOpacity="0.8"
                />
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
      )}
    </div>
  );
}
