"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Database } from "lucide-react";

import { playSound } from "@/utils/audio";

export default function TransitionScreen({ nextRoute = "/home" }: { nextRoute?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setStep(1), 1000); // 1s: Load Profile
    const t2 = setTimeout(() => setStep(2), 2500); // 2.5s: Load History
    const t3 = setTimeout(() => setStep(3), 4000); // 4s: Flash & sound
    const t4 = setTimeout(() => setStep(4), 4800); // 4.8s: Redirect

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  useEffect(() => {
    if (step === 3) {
      playSound("flash");
    } else if (step === 4) {
      router.push(nextRoute);
    }
  }, [step, router, nextRoute]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 14;
    const columns = width / fontSize;
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(7, 10, 16, 0.1)"; // Fade trail
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00e575"; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#070a10] text-[#f1f5f9] flex flex-col items-center justify-center p-6 cyber-grid overflow-hidden transition-all duration-700 ${step >= 3 ? "scale-105 opacity-0" : "scale-100 opacity-100"}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-20" />
      <div className="absolute inset-0 noir-vignette pointer-events-none" />
      
      {/* Intense flash overlay for dramatic transition */}
      <div className={`absolute inset-0 bg-white z-[10000] pointer-events-none mix-blend-overlay transition-opacity duration-300 ${step >= 3 ? "opacity-100" : "opacity-0"}`} />
      
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-96 h-96 rounded-full blur-[100px] transition-all duration-500 ${step >= 3 ? "bg-[#00e575]/40 scale-150" : "bg-[#00e575]/5 scale-100"}`} />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex w-20 h-20 rounded-full bg-[#00e575]/10 items-center justify-center border border-[#00e575]/30 shadow-[0_0_30px_rgba(0,229,117,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-[#00e575]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Login Successful</h1>
        </div>

        <div className="space-y-4 bg-[#0d131f] border border-[#182234] p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {step >= 1 ? (
                <CheckCircle2 className="w-5 h-5 text-[#00e575]" />
              ) : (
                <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
              )}
              <span className={step >= 1 ? "text-slate-200" : "text-slate-500"}>
                Retrieving user profile
              </span>
            </div>
            {step >= 1 && <span className="text-xs text-[#00e575]">OK</span>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {step >= 2 ? (
                <CheckCircle2 className="w-5 h-5 text-[#00e575]" />
              ) : (
                <Loader2 className={`w-5 h-5 ${step >= 1 ? "text-[#00e575] animate-spin" : "text-slate-700"}`} />
              )}
              <span className={step >= 2 ? "text-slate-200" : step >= 1 ? "text-slate-300" : "text-slate-600"}>
                Syncing history log
              </span>
            </div>
            {step >= 2 && <span className="text-xs text-[#00e575]">OK</span>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${step >= 2 ? "text-[#00e575]" : "text-slate-700"}`} />
              <span className={step >= 2 ? "text-slate-200" : "text-slate-600"}>
                Establishing secure connection
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-[#121927] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00e575] transition-all duration-1000 ease-out"
            style={{ width: `${step === 0 ? 10 : step === 1 ? 40 : step === 2 ? 80 : 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
