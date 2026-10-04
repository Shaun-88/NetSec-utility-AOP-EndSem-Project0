"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Volume2, VolumeX, ShieldAlert, Terminal } from "lucide-react";

// Scenes configuration
const SCENES = [
  { id: 1, type: "video", src: "/story/scene-01.mp4", duration: 10, title: "Purpose", text: "Every system starts somewhere. In the dark, with one wire." },
  { id: 2, type: "video", src: "/story/scene-02.mp4", duration: 8.5, title: "The Problem", text: "Most people never get to touch real security. One wrong click, and it is not practice any more." },
  { id: 3, type: "video", src: "/story/scene-03.mp4", duration: 8.5, title: "Who It Is For", text: "Students, beginners, the curious. If you can read a screen, you can learn this." },
  { id: 4, type: "video", src: "/story/scene-04.mp4", duration: 8.5, title: "The Labs", text: "Hands-on simulated labs, one skill at a time: Phishing Spotter, Crack-Time Lab, Mock Login, and Port Scan Sim." },
  { id: 5, type: "video", src: "/story/scene-05.mp4", duration: 8.5, title: "Safety Rules", text: "Nothing here touches a real system. Everything is simulated, and the gate checks every packet." },
  { id: 6, type: "video", src: "/story/scene-06.mp4", duration: 8.5, title: "Architecture", text: "Sign in, practise, and your progress is saved securely in the Armoury." },
];

export default function SandboxScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Text Refs (for RAF updates to avoid React render stutter)
  const sceneTitleRef = useRef<HTMLHeadingElement>(null);
  const lorePanelRef = useRef<HTMLDivElement>(null);
  const loreTitleRef = useRef<HTMLHeadingElement>(null);
  const loreTextRef = useRef<HTMLParagraphElement>(null);
  const glitchOverlayRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [activeScene, setActiveScene] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const ambientOscillator = useRef<OscillatorNode | null>(null);
  const ambientGain = useRef<GainNode | null>(null);
  const LABS_LIVE = false; // The single toggle setting

  // Setup Web Audio API on first click
  const initAudio = () => {
    if (audioContext) {
      if (isMuted) {
        audioContext.resume();
        if (ambientGain.current) ambientGain.current.gain.setTargetAtTime(0.05, audioContext.currentTime, 0.5);
      } else {
        if (ambientGain.current) ambientGain.current.gain.setTargetAtTime(0, audioContext.currentTime, 0.5);
      }
      setIsMuted(!isMuted);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Low atmospheric hum
    osc.type = "sine";
    osc.frequency.setValueAtTime(45, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1);
    
    osc.start();
    
    ambientOscillator.current = osc;
    ambientGain.current = gain;
    setAudioContext(ctx);
    setIsMuted(false);
  };

  // Cinematic SFX synth
  const playSfx = (type: "impact" | "glitch" | "chime") => {
    if (isMuted || !audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;

    if (type === "impact") {
      // Deep sub-bass cinematic drop
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 1);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    } else if (type === "glitch") {
      // Sharp digital static burst
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1500, now);
      osc.frequency.setValueAtTime(200, now + 0.05);
      osc.frequency.setValueAtTime(3000, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const triggerGlitch = () => {
    if (!glitchOverlayRef.current) return;
    playSfx("glitch");
    
    // Randomize glitch colors/transforms slightly
    const isRed = Math.random() > 0.5;
    glitchOverlayRef.current.style.opacity = "1";
    glitchOverlayRef.current.style.mixBlendMode = "exclusion";
    glitchOverlayRef.current.style.backgroundColor = isRed ? "rgba(255,0,0,0.3)" : "rgba(0,255,255,0.3)";
    glitchOverlayRef.current.style.transform = `translateX(${Math.random() > 0.5 ? '10px' : '-10px'})`;
    
    setTimeout(() => {
      if (glitchOverlayRef.current) {
        glitchOverlayRef.current.style.opacity = "0";
        glitchOverlayRef.current.style.transform = "translateX(0)";
      }
    }, 150);
  };

  useEffect(() => {
    // Mouse Parallax Effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoWrapperRef.current) return;
      // Drift the video layer slightly opposite to the mouse (-20px to 20px)
      const x = ((e.clientX / window.innerWidth) - 0.5) * -40;
      const y = ((e.clientY / window.innerHeight) - 0.5) * -40;
      // Use scale(1.05) so the edges don't show when shifted
      videoWrapperRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.05)`;
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let ticking = false;
    let lastScene = 0;
    let lastPhase = "";

    const TOTAL_STAGES = 8; // 6 videos + 2 code scenes

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          
          const scrollTop = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          const globalProgress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
          
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${globalProgress * 100}%`;
          }

          const currentStep = globalProgress * TOTAL_STAGES;
          const sceneIndex = Math.min(Math.floor(currentStep), TOTAL_STAGES - 1);
          const localProgress = currentStep - sceneIndex;

          // Sound & Phase Logic
          let currentPhase = `scene-${sceneIndex}`;
          if (sceneIndex < 6) {
            currentPhase = localProgress < 0.65 ? `scene-${sceneIndex}-video` : `scene-${sceneIndex}-lore`;
          }

          if (currentPhase !== lastPhase) {
            if (currentPhase.includes("-lore")) playSfx("impact");
            if (currentPhase.includes("-video") && sceneIndex > 0 && lastPhase !== "") triggerGlitch();
            if (sceneIndex === TOTAL_STAGES - 1 && lastScene !== sceneIndex) playSfx("chime");
            lastPhase = currentPhase;
          }

          if (sceneIndex !== lastScene) {
            setActiveScene(sceneIndex);
            lastScene = sceneIndex;
          }

          // Visual Render Logic for the 6 Video Scenes
          if (sceneIndex < 6) {
            const isVideoPhase = localProgress < 0.65;
            const scrubProgress = isVideoPhase ? localProgress / 0.65 : 1.0;
            const loreProgress = isVideoPhase ? 0 : (localProgress - 0.65) / 0.35;

            // 1. Scrub the active video
            const video = videoRefs.current[sceneIndex];
            if (video && video.duration) {
              const targetTime = scrubProgress * (video.duration - 0.1);
              if (Math.abs(video.currentTime - targetTime) > 0.05) {
                video.currentTime = targetTime;
              }
            }

            // 2. Control Blur & Brightness on the video wrapper
            if (videoWrapperRef.current) {
              const blur = isVideoPhase ? 0 : loreProgress * 15;
              const brightness = isVideoPhase ? 1 : 1 - (loreProgress * 0.4);
              videoWrapperRef.current.style.filter = `blur(${blur}px) brightness(${brightness})`;
            }

            // 3. Control the floating Title (Side of screen)
            if (sceneTitleRef.current) {
              sceneTitleRef.current.innerText = `0${sceneIndex + 1} // ${SCENES[sceneIndex].title}`;
              sceneTitleRef.current.style.opacity = isVideoPhase ? "1" : Math.max(1 - (loreProgress * 5), 0).toString();
              sceneTitleRef.current.style.transform = `translateX(${isVideoPhase ? 0 : -50}px)`;
            }

            // 4. Control the Lore Typing Effect (Bottom Panel)
            if (lorePanelRef.current && loreTitleRef.current && loreTextRef.current) {
              const sceneData = SCENES[sceneIndex];
              if (isVideoPhase) {
                lorePanelRef.current.style.opacity = "0";
                lorePanelRef.current.style.transform = "translateY(50px)";
                loreTextRef.current.innerText = "";
              } else {
                const ease = Math.min(loreProgress * 4, 1); // 0 to 1 quickly
                lorePanelRef.current.style.opacity = ease.toString();
                lorePanelRef.current.style.transform = `translateY(${(1 - ease) * 50}px)`;

                const charsToShow = Math.floor(loreProgress * sceneData.text.length);
                const showCursor = loreProgress < 0.98;
                loreTextRef.current.innerText = sceneData.text.slice(0, charsToShow) + (showCursor ? "█" : "");
                loreTitleRef.current.innerText = sceneData.title;
              }
            }
          } else {
            // Hide cinematic elements when in code scenes
            if (sceneTitleRef.current) sceneTitleRef.current.style.opacity = "0";
            if (loreTitleRef.current) loreTitleRef.current.style.opacity = "0";
            if (loreTextRef.current) loreTextRef.current.style.opacity = "0";
            if (videoWrapperRef.current) videoWrapperRef.current.style.filter = "blur(0px) brightness(0.2)";
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContext, isMuted]);

  return (
    <div ref={containerRef} className="relative w-full bg-black font-sans" style={{ height: "3000vh" }}>
      
      {/* Pinned Stage */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex flex-col justify-between">
        
        {/* TOP CINEMATIC LETTERBOX */}
        <div className="relative z-50 h-20 sm:h-28 w-full bg-black flex items-center justify-between px-6 sm:px-12 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
          <Link href="/home" className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm tracking-widest uppercase">Abort Simulation</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <button 
              onMouseDown={initAudio} 
              className="text-slate-400 hover:text-[#00e575] transition-colors flex items-center gap-2"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest">
                {isMuted ? "Enable Audio" : "Audio Active"}
              </span>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00e575] animate-pulse" />}
            </button>
            <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
              className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-white"
            >
              Skip to End
            </button>
          </div>
        </div>

        {/* CENTER CINEMATIC FRAME */}
        <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center bg-[#05080c]">
          
          {/* Glitch Overlay */}
          <div ref={glitchOverlayRef} className="absolute inset-0 z-40 opacity-0 pointer-events-none transition-opacity duration-75" />

          {/* Scanlines Overlay */}
          <div className="absolute inset-0 z-30 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_51%)] bg-[length:100%_4px] opacity-40" />
          
          {/* Dynamic Video Wrapper with mouse parallax & dynamic blur */}
          <div 
            ref={videoWrapperRef} 
            className="absolute inset-0 w-full h-full will-change-transform transition-[filter] duration-75 ease-linear"
            style={{ transform: "scale(1.05)" }}
          >
            {SCENES.map((scene, index) => (
              <video
                key={scene.id}
                ref={(el) => { videoRefs.current[index] = el; }}
                src={scene.src}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${activeScene === index ? "opacity-100" : "opacity-0"}`}
                muted
                playsInline
                preload="auto"
              />
            ))}
          </div>

          {/* SCENES 1-6 UI OVERLAYS */}
          <div className={`absolute inset-0 z-20 pointer-events-none ${activeScene < 6 ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
            
            {/* The Active Title (Floating Left) */}
            <h2 
              ref={sceneTitleRef}
              className="absolute left-8 sm:left-16 top-1/3 -translate-y-1/2 text-4xl sm:text-7xl font-black font-display text-transparent bg-clip-text bg-gradient-to-br from-white/90 to-white/10 tracking-widest uppercase transition-all duration-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              01 // PURPOSE
            </h2>

            {/* The Lore Typography Drop (Bottom Panel) */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center px-6 sm:px-12 pb-6 sm:pb-12 pointer-events-none">
              <div 
                ref={lorePanelRef}
                className="max-w-4xl w-full flex flex-col items-start gap-4 bg-black/70 p-8 sm:p-10 rounded-2xl border border-[#00e575]/20 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] will-change-transform"
                style={{ opacity: 0, transform: "translateY(50px)" }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <Terminal className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 ref={loreTitleRef} className="text-amber-500 font-black uppercase tracking-[0.3em] text-sm font-display">
                    Title
                  </h3>
                </div>
                <p ref={loreTextRef} className="text-white text-xl sm:text-2xl font-medium leading-relaxed font-display tracking-wide text-shadow-sm text-left">
                  Text
                </p>
              </div>
            </div>
          </div>

          {/* SCENE 7: Scope Code Scene */}
          <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-700 ${activeScene === 6 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="max-w-4xl w-full p-12 bg-black/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e575]/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <ShieldAlert className="w-10 h-10 text-[#00e575]" />
                  <h2 className="text-4xl font-black text-white tracking-widest uppercase font-display">Simulated Environment</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <h3 className="text-[#00e575] font-black uppercase tracking-widest text-sm border-b border-[#00e575]/30 pb-3">Active Protocol</h3>
                    <ul className="space-y-4 text-slate-300 text-sm font-mono">
                      <li className="flex items-center gap-3"><span className="text-[#00e575]">{'>'}</span> Safe client-side execution</li>
                      <li className="flex items-center gap-3"><span className="text-[#00e575]">{'>'}</span> Zero external connections</li>
                      <li className="flex items-center gap-3"><span className="text-[#00e575]">{'>'}</span> Dummy credential testing</li>
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-amber-500 font-black uppercase tracking-widest text-sm border-b border-amber-500/30 pb-3">Restricted Action</h3>
                    <ul className="space-y-4 text-slate-300 text-sm font-mono">
                      <li className="flex items-center gap-3"><span className="text-amber-500">!</span> No live target scanning</li>
                      <li className="flex items-center gap-3"><span className="text-amber-500">!</span> No real-world exploits</li>
                      <li className="flex items-center gap-3"><span className="text-amber-500">!</span> Monitored telemetry</li>
                    </ul>
                  </div>
                </div>
            </div>
          </div>

          {/* SCENE 8: Gateway Button */}
          <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-1000 ${activeScene === 7 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="text-center space-y-16">
              <h2 className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-300 to-slate-800 tracking-tighter uppercase font-display drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                Training Grounds
              </h2>
              
              {LABS_LIVE ? (
                <Link href="/sandbox/labs" className="inline-flex items-center justify-center px-16 py-8 rounded-xl bg-gradient-to-b from-[#00e575] to-[#00b35a] text-black font-black uppercase tracking-[0.4em] text-lg hover:scale-105 transition-all shadow-[0_0_60px_rgba(0,229,117,0.4)] hover:shadow-[0_0_100px_rgba(0,229,117,0.6)]">
                  Enter Labs
                </Link>
              ) : (
                <div className="inline-flex flex-col items-center gap-6">
                  <button disabled className="px-16 py-8 rounded-xl bg-slate-900 border border-slate-700/50 text-slate-600 font-black uppercase tracking-[0.4em] text-lg shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] cursor-not-allowed">
                    Labs Offline
                  </button>
                  <span className="text-amber-500 text-sm font-black tracking-[0.3em] uppercase animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                    Deployment Pending
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM CINEMATIC LETTERBOX */}
        <div className="relative z-50 h-20 sm:h-28 w-full bg-black flex items-center px-6 sm:px-12 shadow-[0_-20px_40px_rgba(0,0,0,0.9)]">
          
          {/* Progress Track */}
          <div className="w-full flex items-center gap-6">
            <span className="text-slate-600 font-black text-[10px] tracking-widest font-mono">00%</span>
            <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
              <div 
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-transparent via-[#00e575] to-white shadow-[0_0_15px_#00e575] will-change-[width]"
                style={{ width: "0%" }}
              />
            </div>
            <span className="text-slate-600 font-black text-[10px] tracking-widest font-mono">100%</span>
          </div>

          {/* Scene Dots */}
          <div className="absolute right-12 flex gap-3">
            {[0,1,2,3,4,5,6,7].map((i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeScene === i ? "bg-[#00e575] scale-150 shadow-[0_0_10px_#00e575]" : "bg-slate-800"}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
