"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tools } from "@/registry/tools";
import { getToolIcon } from "./toolIconMap";
import { Sparkles, Terminal } from "lucide-react";

const TOTAL_TOOLS = tools.length;
const ORBIT_SLOTS = 9;
const INITIAL_RADIUS_X = 320;
const INITIAL_RADIUS_Y = 100;

// --- NATIVE WEB AUDIO SYNTHESIZER ---
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (typeof window !== "undefined" && !audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

const playZapSound = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  // Electric zap: quick high-to-low sawtooth sweep
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02); // slight attack
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15); // sharp decay
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
};

const playHumSound = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
};

const playEventHorizonBoom = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  // Massive cinematic sub-bass drop
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 1.5);
  
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.8, audioCtx.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 2.0);
};
// ------------------------------------

export default function AiNetworkCta() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Loading States
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Animation States
  const [rotation, setRotation] = useState(0);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);
  
  // Transition States
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'imploding' | 'exploding'>('idle');
  const [radiusX, setRadiusX] = useState(INITIAL_RADIUS_X);
  const [radiusY, setRadiusY] = useState(INITIAL_RADIUS_Y);

  const [slotTools, setSlotTools] = useState<number[]>(
    Array.from({ length: ORBIT_SLOTS }, (_, i) => i % TOTAL_TOOLS)
  );
  
  const prevAnglesRef = useRef<number[]>(Array(ORBIT_SLOTS).fill(0));
  const implosionRef = useRef(false);

  // 1. Cinematic Loading Sequence
  useEffect(() => {
    let startTime = performance.now();
    const duration = 4000; // 4 seconds of cinematic loading

    const animateLoader = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      
      const easeProgress = 1 - Math.pow(1 - progress / 100, 3);
      setLoadProgress(Math.floor(easeProgress * 100));

      if (elapsed < duration) {
        requestAnimationFrame(animateLoader);
      } else {
        setTimeout(() => setIsLoaded(true), 200);
      }
    };
    requestAnimationFrame(animateLoader);
  }, []);

  // 2. Audio Sync for the 4-second CSS Zap
  useEffect(() => {
    if (!isLoaded || transitionPhase !== 'idle') return;
    
    // The CSS animation runs on a 4s loop. The visual zap hits the core at exactly 95% (3.8 seconds).
    // We delay the first audio zap by 3.8s, then loop every 4.0s to stay locked with the CSS.
    let intervalId: NodeJS.Timeout;
    const timeoutId = setTimeout(() => {
      playZapSound();
      intervalId = setInterval(playZapSound, 4000);
    }, 3800);
    
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, transitionPhase]);

  const handleToolClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCenterClick = () => {
    if (transitionPhase !== 'idle') return;
    initAudio();
    
    // Phase 1: Implosion
    setTransitionPhase('imploding');
    implosionRef.current = true;
    
    // Phase 2: Event Horizon
    setTimeout(() => {
      setTransitionPhase('exploding');
      playEventHorizonBoom();
      
      // Phase 3: Route
      setTimeout(() => {
        router.push('/ai-zone');
      }, 1500);
    }, 1000);
  };

  const handleMouseEnter = () => {
    initAudio();
  };

  // 3. Canvas Parallax Background
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = canvas.offsetWidth;
    let h = canvas.height = canvas.offsetHeight;
    
    const particles: { x: number, y: number, vx: number, vy: number, size: number, depth: number }[] = [];
    for (let i = 0; i < 90; i++) {
       const depth = Math.random(); 
       particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (0.5 + depth),
          vy: (Math.random() - 0.5) * (0.5 + depth),
          size: 0.5 + depth * 1.5,
          depth
       });
    }

    let animationId: number;
    const renderCanvas = () => {
       ctx.clearRect(0, 0, w, h);
       
       for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          
          if (implosionRef.current) {
            const dx = (w/2) - p.x;
            const dy = (h/2) - p.y;
            p.vx += dx * 0.01;
            p.vy += dy * 0.01;
          }

          p.x += p.vx;
          p.y += p.vy;

          if (!implosionRef.current) {
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
          }
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 229, 117, ${transitionPhase === 'exploding' ? 0 : 0.1 + p.depth * 0.4})`;
          ctx.shadowBlur = p.depth * 10;
          ctx.shadowColor = "#00e575";
          ctx.fill();
          ctx.shadowBlur = 0;
          
          for (let j = i + 1; j < particles.length; j++) {
             const p2 = particles[j];
             const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
             if (dist < 80) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                const opacity = (1 - dist / 80) * 0.3 * p.depth * (transitionPhase === 'exploding' ? 0 : 1);
                ctx.strokeStyle = `rgba(0, 229, 117, ${opacity})`;
                ctx.lineWidth = p.depth;
                ctx.stroke();
             }
          }
       }
       animationId = requestAnimationFrame(renderCanvas);
    };
    renderCanvas();
    
    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoaded, transitionPhase]);

  // 4. 3D Orbit & Implosion Physics
  useEffect(() => {
    if (!isLoaded || transitionPhase === 'exploding') return;
    
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min(time - lastTime, 50); 
      lastTime = time;
      
      let currentSpeed = 0.04; 
      
      if (transitionPhase === 'imploding') {
        currentSpeed = 0.6; // Extreme gravity acceleration
        setRadiusX(prev => Math.max(0, prev - delta * 0.5));
        setRadiusY(prev => Math.max(0, prev - delta * 0.2));
      } else if (hoveredTool) {
        currentSpeed = 0.005; // Bullet time
      } 
      
      setRotation((prev) => {
        const nextRot = (prev + currentSpeed * delta) % 360;
        
        // Tool Swapping Logic (only when idle)
        if (transitionPhase === 'idle') {
          setSlotTools((currentSlotTools) => {
            let updated = false;
            const newSlotTools = [...currentSlotTools];
            
            for (let i = 0; i < ORBIT_SLOTS; i++) {
              const currentAngle = (nextRot + (360 / ORBIT_SLOTS) * i) % 360;
              const prevAngle = prevAnglesRef.current[i];
              
              if (prevAngle < 270 && currentAngle >= 270) {
                 const maxIdx = Math.max(...newSlotTools);
                 newSlotTools[i] = (maxIdx + 1) % TOTAL_TOOLS;
                 updated = true;
              }
              prevAnglesRef.current[i] = currentAngle;
            }
            return updated ? newSlotTools : currentSlotTools;
          });
        }
        return nextRot;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoaded, hoveredTool, transitionPhase]);


  // ---- RENDERS ----

  if (!isLoaded) {
    return (
      <div className="relative w-full h-[450px] my-10 border border-[#182234] bg-[#040609] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center font-mono">
        <div className="relative flex items-center justify-center mb-6">
           <Terminal className="w-12 h-12 text-[#00e575] opacity-80" />
           <div className="absolute inset-0 rounded-full border-t-2 border-[#00e575] animate-spin" style={{ animationDuration: '1s' }} />
           <div className="absolute -inset-4 rounded-full border-b-2 border-[#00e575]/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        </div>
        
        <div className="text-[#00e575] text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center animate-pulse">
          Initializing Neural Network
          <br/>
          <span className="text-slate-400 text-[10px] tracking-widest mt-1 block">Rendering Magic...</span>
        </div>

        <div className="w-64 h-1.5 bg-[#182234] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00e575] shadow-[0_0_10px_#00e575]" 
            style={{ width: `${loadProgress}%` }}
          />
        </div>
        
        <div className="mt-3 text-[10px] text-slate-500 tracking-widest">
          PROGRESS: {loadProgress}%
        </div>
      </div>
    );
  }

  const toolPositions = slotTools.map((_, i) => {
     const angleDeg = (rotation + (360 / ORBIT_SLOTS) * i) % 360;
     const angleRad = (angleDeg * Math.PI) / 180;
     const x = Math.cos(angleRad) * radiusX;
     const y = Math.sin(angleRad) * radiusY;
     return { x, y, i };
  });

  return (
    <div 
      className="relative w-full h-[450px] my-10 border border-[#182234] bg-gradient-to-b from-[#070a10] via-[#090e18] to-[#070a10] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group/cta"
      onMouseEnter={handleMouseEnter}
    >
      
      <style>{`
        /* The 4-second synchronized cycle */
        @keyframes electric-zap-travel {
          0%, 85% { stroke-dashoffset: 200; opacity: 0; }
          90% { opacity: 1; }
          95% { stroke-dashoffset: 0; opacity: 1; }
          100% { opacity: 0; stroke-dashoffset: 0; }
        }
        @keyframes core-spark {
          0%, 94% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          95% { opacity: 1; transform: scale(1.5) rotate(45deg); filter: brightness(2); }
          98% { opacity: 0.8; transform: scale(1.1) rotate(20deg); }
          100% { opacity: 0; transform: scale(1) rotate(0deg); }
        }
        @keyframes glitch-text {
          0%, 94% { transform: none; opacity: 0.6; filter: none; }
          95% { transform: translate(-2px, 2px); opacity: 1; text-shadow: 2px 0px red, -2px 0px cyan; }
          97% { transform: translate(2px, -2px); opacity: 1; text-shadow: -2px 0px red, 2px 0px cyan; }
          100% { transform: none; opacity: 0.6; filter: none; }
        }
        
        /* The Event Horizon Transition */
        @keyframes event-horizon-expand {
          0% { transform: scale(1); background-color: #000; border-color: transparent; }
          100% { transform: scale(250); background-color: #000; border-color: transparent; }
        }
      `}</style>

      {/* Sync Glitch Text in Top Left */}
      <div 
        className={`absolute top-5 left-6 z-40 max-w-[200px] pointer-events-none transition-opacity duration-500 ${transitionPhase !== 'idle' ? 'opacity-0' : 'opacity-100'}`}
        style={{ animation: 'glitch-text 4s infinite' }}
      >
         <p className="text-[9px] uppercase font-bold tracking-widest text-[#00e575] leading-relaxed">
            All tools and data produced are Powering <span className="text-white">"Big Bro"</span>.
            <br/><br/>
            Click the core to visit him.
         </p>
      </div>

      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${transitionPhase === 'exploding' ? 'opacity-0' : 'opacity-60 group-hover/cta:opacity-100'}`} />
      
      {/* 4s Zapping Energy Network */}
      {transitionPhase === 'idle' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
           <defs>
             <filter id="glow">
               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
               <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
               </feMerge>
             </filter>
           </defs>
           <g transform="translate(50%, 50%)" filter="url(#glow)">
             {toolPositions.map((pos, idx) => (
               <line 
                 key={`packet-${idx}`}
                 x1={pos.x} y1={pos.y} x2={0} y2={0}
                 stroke="#00e575"
                 strokeWidth="2"
                 strokeDasharray="15 200"
                 strokeDashoffset="200"
                 className="opacity-0"
                 style={{ 
                   animation: `electric-zap-travel 4s infinite cubic-bezier(0.4, 0, 0.2, 1)`,
                 }}
               />
             ))}
           </g>
        </svg>
      )}

      {/* Cinematic Event Horizon Full Screen Overlay */}
      {transitionPhase === 'exploding' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
          <div 
            className="w-24 h-24 bg-black rounded-full" 
            style={{
               willChange: 'transform',
               animation: 'event-horizon-expand 1.5s cubic-bezier(0.8, 0, 0.2, 1) forwards'
            }}
          />
        </div>
      )}
      
      {/* 3D Orbit Container */}
      <div className={`relative w-full h-full flex items-center justify-center transition-opacity duration-300 ${transitionPhase === 'exploding' ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Orbital Slots */}
        {slotTools.map((toolIdx, i) => {
           const tool = tools[toolIdx];
           if (!tool) return null;
           const ToolIcon = getToolIcon(tool.id);
           
           const pos = toolPositions[i];
           const depth = (pos.y + INITIAL_RADIUS_Y) / (2 * INITIAL_RADIUS_Y); 
           const scaleBase = transitionPhase === 'imploding' ? (radiusX / INITIAL_RADIUS_X) : 1;
           const scale = (0.5 + depth * 0.5) * scaleBase;
           const zIndex = Math.floor(pos.y + 100);
           const opacity = (0.3 + depth * 0.7) * (transitionPhase === 'imploding' ? scaleBase : 1);
           
           return (
             <div 
               key={i} 
               className="absolute flex items-center justify-center"
               style={{
                 transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                 zIndex,
                 opacity,
               }}
             >
               <button
                 onClick={(e) => handleToolClick(e, tool.id)}
                 onMouseEnter={() => {
                    setHoveredTool(tool.id);
                    playHumSound();
                 }}
                 onMouseLeave={() => setHoveredTool(null)}
                 className="relative group/tool cursor-pointer outline-none"
               >
                 <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-lg bg-[#0d131f] ${hoveredTool === tool.id ? 'border-[#00e575] text-[#00e575] scale-125 shadow-[0_0_20px_rgba(0,229,117,0.4)] bg-[#0d131f]/90' : 'border-[#182234] text-slate-400 hover:text-slate-200'}`}>
                   <ToolIcon className="w-5 h-5" />
                 </div>
                 
                 <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-[#090d16]/95 backdrop-blur-md border border-[#00e575]/30 text-[#00e575] text-[10px] font-bold rounded-lg transition-all duration-300 pointer-events-none z-[60] shadow-[0_0_15px_rgba(0,229,117,0.1)] ${hoveredTool === tool.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                   {tool.name}
                 </div>
               </button>
             </div>
           );
        })}

      </div>

      {/* Center Big Bro Core & Event Horizon */}
      <button
        onClick={handleCenterClick}
        onMouseEnter={() => {
           setIsHoveringCenter(true);
           if (transitionPhase === 'idle') playHumSound();
        }}
        onMouseLeave={() => setIsHoveringCenter(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] flex items-center justify-center w-32 h-32 group/core outline-none cursor-pointer"
        title="Initialize Big Bro"
      >
        {/* 4s Synchronized Sparks */}
        {transitionPhase === 'idle' && (
          <>
            <div className="absolute inset-0 border-2 border-dashed border-[#00e575] rounded-full opacity-0 pointer-events-none" style={{ animation: 'core-spark 4s infinite' }} />
            <div className="absolute -inset-4 border border-[#00e575] rounded-full opacity-0 pointer-events-none" style={{ animation: 'core-spark 4s infinite 0.1s' }} />
          </>
        )}

        {/* Ambient Glows */}
        <div className={`absolute inset-0 rounded-full animate-ping transition-opacity duration-300 ${transitionPhase === 'idle' ? 'bg-[#00e575]/10 opacity-30 group-hover/core:opacity-60' : 'opacity-0'}`} />
        <div className={`absolute -inset-4 rounded-full transition-all duration-300 ${transitionPhase === 'imploding' ? 'bg-[#00e575]/40 -inset-10 animate-pulse' : transitionPhase === 'idle' ? 'bg-[#00e575]/5 group-hover/core:bg-[#00e575]/20 group-hover/core:-inset-8' : 'opacity-0'}`} />
        
        {/* Main Core Body */}
        <div 
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${transitionPhase === 'exploding' ? 'opacity-0' : 'opacity-100'}`}
          style={{
             backgroundColor: '#070a10',
             border: '1px solid',
             borderColor: transitionPhase === 'imploding' ? '#00e575' : 'rgba(0,229,117,0.3)',
             willChange: 'transform',
             transform: transitionPhase === 'imploding' ? 'scale(1.3)' : 'scale(1)',
             filter: transitionPhase === 'imploding' ? 'brightness(1.5)' : 'none'
          }}
        >
           <Sparkles className={`w-10 h-10 transition-colors duration-300 ${transitionPhase === 'exploding' ? 'opacity-0' : transitionPhase === 'imploding' ? 'text-white' : 'text-[#00e575]'}`} />
        </div>
        
        {/* Core Label */}
        <div className={`absolute -bottom-12 whitespace-nowrap text-[#00e575] text-[11px] font-bold uppercase tracking-[0.2em] font-sans flex items-center gap-2 transition-all duration-300 ${transitionPhase !== 'idle' ? 'opacity-0' : 'opacity-80 group-hover/core:opacity-100 group-hover/core:scale-105 group-hover/core:drop-shadow-[0_0_5px_#00e575]'}`}>
           <div className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-pulse" />
           Big Bro Core
        </div>
      </button>

    </div>
  );
}
