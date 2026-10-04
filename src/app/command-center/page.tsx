"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert,  } from "lucide-react";
import { 
  playKeystroke, 
  playErrorBuzz, 
  playSuccessChime, 
  playAlarm, 
  playEmpBlast 
} from "@/core/audio/synth";

import CommanderDashboard from "./CommanderDashboard";

type AuthState = "locked" | "verifying" | "unlocking" | "granted" | "destructing";

export default function CommanderQuarters() {
  const router = useRouter();
  
  const [authState, setAuthState] = useState<AuthState>("locked");
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [isShaking, setIsShaking] = useState(false);

  // Focus trap / key capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (authState !== "locked") return;
      
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        setPin(prev => prev.slice(0, -1));
        playKeystroke();
      } else if (e.key === "Enter") {
        submitPin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, authState]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
      playKeystroke();
    }
  };

  const submitPin = async () => {
    if (!pin || authState !== "locked") return;
    
    setAuthState("verifying");
    
    try {
      const res = await fetch("/api/command/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      });

      if (res.ok) {
        // Success
        playSuccessChime();
        setAuthState("unlocking");
        
        // Let the cinematic transition play out
        setTimeout(() => {
          setAuthState("granted");
        }, 2500);
      } else {
        // Error
        handleFailedAttempt();
      }
    } catch {
      handleFailedAttempt();
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts - 1;
    setAttempts(newAttempts);
    
    if (newAttempts <= 0) {
      triggerSelfDestruction();
    } else {
      playErrorBuzz();
      setIsShaking(true);
      setPin("");
      setAuthState("locked");
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const triggerSelfDestruction = () => {
    setAuthState("destructing");
    playAlarm();
    
    // Calculate exponential lockout (2s, 4s, 8s, 16s...)
    const currentLevel = parseInt(localStorage.getItem("commander_lockout_level") || "0");
    const nextLevel = currentLevel + 1;
    
    // We add 4500ms to account for the time spent watching the blast animation
    // so the penalty timer only really starts ticking when you land on the Home page.
    const penaltyMs = Math.pow(2, nextLevel) * 1000; 
    const blastAnimationDelay = 4500; 
    
    localStorage.setItem("commander_lockout_level", nextLevel.toString());
    localStorage.setItem("commander_lockout_until", (Date.now() + penaltyMs + blastAnimationDelay).toString());

    // 3 seconds of alarm, then blast
    setTimeout(() => {
      playEmpBlast();
      
      // Blast flash effect handling done by CSS class
      // Wait for blast to finish, then redirect
      setTimeout(() => {
        router.push("/home");
      }, 1500);
    }, 3000);
  };

  if (authState === "granted") {
    return <CommanderDashboard pin={pin} onTerminate={() => router.push("/home")} />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#05070a] flex items-center justify-center overflow-hidden font-mono selection:bg-transparent">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#05070a_100%)]" />
        <div className="h-full w-full bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Unlocking Laser Sweep Cinematic */}
      {authState === "unlocking" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#05070a]">
          <Lock className="w-16 h-16 text-[#00e575] mb-6 animate-pulse" />
          <h2 className="text-xl font-bold text-[#00e575] tracking-[0.3em] uppercase animate-pulse-fast text-center px-4">
            Clearance Accepted: Commander
          </h2>
          <p className="text-sm text-[#00e575]/60 mt-4 tracking-widest">DECRYPTING DASHBOARD...</p>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1 bg-[#00e575] shadow-[0_0_20px_#00e575] animate-laserSweep" />
          </div>
        </div>
      )}

      {/* The Keypad Container */}
      <div className={`relative z-10 flex flex-col items-center ${isShaking ? 'animate-shake' : ''}`}>
        
        {authState === "destructing" ? (
          <div className="text-center animate-pulse-fast">
            <ShieldAlert className="w-24 h-24 text-rose-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-rose-500 tracking-widest mb-2">SECURITY BREACH</h2>
            <p className="text-rose-400">INITIATING PROTOCOL ZERO</p>
          </div>
        ) : (
          <>
            <Lock className="w-10 h-10 text-amber-500 mb-6 opacity-80" />
            
            {/* PIN Display */}
            <div className="w-64 h-16 bg-[#0a0d14] border-2 border-amber-500/30 rounded-xl mb-8 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      i < pin.length 
                        ? "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" 
                        : "bg-[#182234]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Holographic Keypad Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num.toString())}
                  className="w-16 h-16 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-500/80 text-2xl font-bold hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-400 transition-all active:scale-95 active:bg-amber-500/40 backdrop-blur-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => { setPin(""); playKeystroke(); }}
                className="w-16 h-16 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-500/80 font-bold text-xs uppercase hover:bg-rose-500/20 transition-all active:scale-95"
              >
                CLR
              </button>
              <button
                onClick={() => handleKeyPress("0")}
                className="w-16 h-16 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-500/80 text-2xl font-bold hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-400 transition-all active:scale-95 backdrop-blur-sm"
              >
                0
              </button>
              <button
                onClick={submitPin}
                disabled={authState !== "locked" || pin.length === 0}
                className="w-16 h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs uppercase hover:bg-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                ENT
              </button>
            </div>
            
            <p className="mt-8 text-xs text-amber-500/50 font-mono">
              ATTEMPTS REMAINING: <span className="text-rose-400 font-bold">{attempts}</span>
            </p>
          </>
        )}
      </div>

      {/* Destruct Flash Overlay */}
      {authState === "destructing" && (
        <div className="absolute inset-0 pointer-events-none z-50 animate-empBlast opacity-0 bg-white mix-blend-screen" />
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px) rotate(-2deg); }
          40% { transform: translateX(10px) rotate(2deg); }
          60% { transform: translateX(-10px) rotate(-2deg); }
          80% { transform: translateX(10px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.3s infinite;
        }

        @keyframes empBlast {
          0% { opacity: 0; }
          90% { opacity: 0; }
          92% { opacity: 1; transform: scale(1.1); filter: brightness(2) contrast(2) hue-rotate(90deg); }
          100% { opacity: 1; transform: scale(1.0); }
        }
        .animate-empBlast {
          animation: empBlast 3.2s forwards;
        }

        @keyframes slideDown {
          0% { transform: translateY(-20px); opacity: 0; filter: blur(10px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes laserSweep {
          0% { transform: translateY(-10vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        .animate-laserSweep {
          animation: laserSweep 2.5s linear forwards;
        }
      `}} />
    </div>
  );
}
