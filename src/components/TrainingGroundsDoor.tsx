"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Hexagon, ChevronRight } from "lucide-react";

// Custom Heavy Hacker & Laptop SVG Icon
const HackerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Background glow/monitor cast on hoodie */}
    <path d="M12 1.5C8 1.5 5.5 4 5.5 8v3h13V8c0-4-2.5-6.5-6.5-6.5z" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
    {/* Hoodie Outline */}
    <path d="M12 2C8.5 2 6 4.5 6 8v3h12V8c0-3.5-2.5-6-6-6z" strokeWidth="1.5" />
    {/* Face shadow/visor */}
    <path d="M8 11c0 2 2 3.5 4 3.5s4-1.5 4-3.5" fill="currentColor" fillOpacity="0.2" stroke="none" />
    {/* Laptop Monitor */}
    <rect x="3" y="13" width="18" height="7" rx="1.5" strokeWidth="1.5" fill="#080b11" />
    <path d="M2 20h20v1.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V20z" fill="currentColor" stroke="none" />
    {/* Code lines on screen */}
    <line x1="6" y1="15.5" x2="10" y2="15.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    <line x1="6" y1="17.5" x2="14" y2="17.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    <line x1="12" y1="15.5" x2="13" y2="15.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
  </svg>
);

export default function TrainingGroundsDoor() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleEnter = () => {
    setIsInitializing(true);
    setTimeout(() => {
      router.push("/sandbox");
    }, 2800);
  };

  return (
    <>
      <div 
        onClick={handleEnter}
        className="relative w-full group cursor-pointer"
      >
        {/* Outer Heavy Bezel (The Blast Door frame) - THICKER and DARKER */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-[#182234] to-[#05080c] rounded-2xl transform transition-all duration-300 group-hover:scale-[1.015] shadow-[0_20px_50px_-15px_rgba(0,0,0,1)] ring-1 ring-black/50" />
        
        {/* Inner Padding for Bezel (4px makes it feel incredibly heavy) */}
        <div className="relative p-[4px] rounded-2xl transform transition-transform duration-300 group-hover:scale-[1.015]">
          
          {/* Main Button Face - Deep metallic texture */}
          <div className="relative bg-[#080b11] rounded-xl overflow-hidden shadow-[inset_0_5px_30px_rgba(0,0,0,1),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
            
            {/* Caution/Simulation Tape Background (Brighter & thicker) */}
            <div className="absolute top-0 left-0 w-full h-2 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f59e0b_10px,#f59e0b_20px)] shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
            
            {/* Animated Laser Scan on Hover */}
            <div className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -rotate-45 translate-x-[-100%] group-hover:animate-laser-scan pointer-events-none" />

            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Left Side: Icon & Titles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                
                {/* Heavy Hacker Icon Box */}
                <div className="w-20 h-20 flex-shrink-0 bg-[#0d131f] rounded-xl border-y-4 border-x border-b-[#05080c] border-t-slate-700 border-x-[#0a0f18] shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_15px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group-hover:border-t-amber-500 transition-all duration-300 group-hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)]">
                  
                  {/* Grid background behind hacker */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#182234_1px,transparent_1px),linear-gradient(to_bottom,#182234_1px,transparent_1px)] bg-[size:4px_4px] opacity-20" />
                  
                  <HackerIcon className="w-12 h-12 text-slate-500 group-hover:text-amber-500 transition-colors relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 mb-1">
                    {/* Glowing LED Badge */}
                    <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3),inset_0_0_10px_rgba(245,158,11,0.2)] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_5px_#f59e0b]" />
                      Learning Sandbox
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {'// OFFLINE //'}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tighter uppercase group-hover:text-amber-100 transition-colors drop-shadow-lg">
                    Training Grounds
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md font-medium leading-relaxed">
                    Enter the simulation chamber to challenge your limits. Run active payloads safely and forge your operational skills.
                  </p>
                </div>
              </div>

              {/* Right Side: Heavy Action Button */}
              <div className="flex-shrink-0 flex items-center justify-center w-full md:w-auto mt-4 md:mt-0">
                <div className="w-full md:w-auto px-8 py-5 rounded-lg bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-t border-t-slate-600 border-x border-x-slate-800 border-b-2 border-b-black flex items-center justify-between gap-4 group-hover:border-t-amber-400 group-hover:from-amber-600/20 group-hover:to-slate-900 shadow-[0_5px_15px_rgba(0,0,0,0.8)] transition-all duration-300">
                  <span className="text-sm font-extrabold text-slate-300 group-hover:text-amber-400 tracking-[0.2em] uppercase drop-shadow-md">
                    Initialize
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Fullscreen Loading State */}
      {isInitializing && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="max-w-md w-full space-y-10 relative z-10">
            {/* Spinning Heavy Hexagon Grid */}
            <div className="flex justify-center relative">
              <Hexagon className="w-32 h-32 text-amber-500/10 animate-spin-slow absolute" strokeWidth={1} />
              <Hexagon className="w-24 h-24 text-amber-500/30 animate-spin-reverse absolute" strokeWidth={1.5} />
              <HackerIcon className="w-12 h-12 text-amber-500 animate-pulse relative z-10 mt-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            </div>

            <div className="space-y-3 text-center pt-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                Establishing Uplink
              </h2>
              <p className="text-amber-500 font-mono text-sm animate-pulse shadow-amber-500">
                Loading Interactive Sandbox Assets...
              </p>
            </div>

            {/* Tactical Loading Bar */}
            <div className="w-full h-1.5 bg-[#0a0f18] rounded-full overflow-hidden border border-[#182234] relative shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 left-0 h-full bg-amber-500 w-full animate-progress-fill shadow-[0_0_15px_#f59e0b]" style={{ transformOrigin: "left" }} />
            </div>

            <div className="font-mono text-[10px] text-slate-600 flex justify-between uppercase tracking-widest">
              <span>SYS_VR_ACTIVE</span>
              <span>ISOLATION_CONFIRMED</span>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes progressFill {
              0% { transform: scaleX(0); }
              40% { transform: scaleX(0.4); }
              60% { transform: scaleX(0.4); }
              100% { transform: scaleX(1); }
            }
            .animate-progress-fill {
              animation: progressFill 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes laserScan {
              0% { transform: translateX(-100%) rotate(-45deg); }
              100% { transform: translateX(200%) rotate(-45deg); }
            }
            .animate-laser-scan {
              animation: laserScan 2s ease-in-out infinite;
            }
            @keyframes spin-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            .animate-spin-reverse {
              animation: spin-reverse 8s linear infinite;
            }
          `}} />
        </div>
      )}
    </>
  );
}
