"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";

export default function CommandEntryButton() {
  const router = useRouter();
  
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check local storage for lockout on mount and interval
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem("commander_lockout_until");
      if (lockoutUntil) {
        const remaining = parseInt(lockoutUntil) - Date.now();
        if (remaining > 0) {
          setLockoutTimeLeft(Math.ceil(remaining / 1000));
        } else {
          setLockoutTimeLeft(0);
          // Optional: we don't wipe the level, so next failure escalates
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (lockoutTimeLeft > 0) return;
    
    // Play entry sound
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(50, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 1);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1);
    }

    // Tunnel transition delay
    setTimeout(() => {
      router.push("/command-center");
    }, 400);
  };

  return (
    <div className="w-full mt-16 mb-8 relative">
      {/* Container */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={lockoutTimeLeft > 0}
        className={`w-full relative overflow-hidden rounded-2xl border transition-all duration-500 group ${
          lockoutTimeLeft > 0 
            ? "border-rose-500/50 bg-rose-500/5 cursor-not-allowed" 
            : "border-amber-500/30 bg-[#0d131f] hover:border-amber-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        }`}
      >
        {/* Animated Scanlines Background */}
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] pointer-events-none transition-opacity duration-500 ${isHovered && lockoutTimeLeft === 0 ? "opacity-100" : "opacity-30"}`} />
        
        {/* Hazard Stripes for Lockout */}
        {lockoutTimeLeft > 0 && (
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #f43f5e 10px, #f43f5e 20px)"
               }} 
          />
        )}

        <div className="relative z-10 px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-xl border flex items-center justify-center transition-colors duration-500 ${
              lockoutTimeLeft > 0 
                ? "bg-rose-500/20 border-rose-500/50 text-rose-500" 
                : "bg-amber-500/10 border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-[#070a10]"
            }`}>
              {lockoutTimeLeft > 0 ? (
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            
            <div className="text-left">
              <h3 className={`text-2xl font-black tracking-widest uppercase transition-colors duration-500 ${
                lockoutTimeLeft > 0 ? "text-rose-500" : "text-amber-500 group-hover:text-amber-400"
              }`}>
                {lockoutTimeLeft > 0 ? "System Lockdown" : "Commander's Quarters"}
              </h3>
              <p className={`text-sm font-mono tracking-widest mt-1 transition-colors duration-500 ${
                lockoutTimeLeft > 0 ? "text-rose-400" : "text-slate-500 group-hover:text-amber-500/80"
              }`}>
                {lockoutTimeLeft > 0 
                  ? "Security breach detected. Access revoked." 
                  : "Restricted Sector // Master Override Required"}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 text-right">
            {lockoutTimeLeft > 0 ? (
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <span className="text-rose-400 font-mono font-bold tracking-widest text-lg">
                  LOCKED: 00:00:{lockoutTimeLeft.toString().padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold tracking-widest uppercase group-hover:bg-amber-500 group-hover:text-[#070a10] transition-colors duration-500">
                <span>Enter Sector</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
