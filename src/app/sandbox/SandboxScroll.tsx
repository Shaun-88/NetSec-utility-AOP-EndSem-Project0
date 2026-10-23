"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { startAmbientScore, stopAmbientScore } from "@/utils/audio";
import {
  ChevronLeft,
  ChevronDown,
  Volume2,
  VolumeX,
  Shield,
  ShieldCheck,
  Terminal,
  Activity,
  Cpu,
  Radio,
  ExternalLink,
  CheckCircle2,
  Zap,
  Download,
} from "lucide-react";

// --- SECTOR CONFIGURATION (6 HIGH-TECH LABS) ---
interface SectorDef {
  id: number;
  code: string;
  title: string;
  clearance: string;
  badgeLevel: string;
  src: string;
  telemetry: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
    metricName: string;
    metricVal: string;
  };
  briefing: string;
  actionLabel: string;
  actionDoneLabel: string;
}

const SECTORS: SectorDef[] = [
  {
    id: 1,
    code: "SEC-01",
    title: "Network Perimeter Ingestion",
    clearance: "CLEARANCE // LEVEL 1: RECRUIT",
    badgeLevel: "RECRUIT",
    src: "/story/scene-01.mp4",
    telemetry: {
      label1: "BANDWIDTH",
      val1: "10 Gbps FIBER",
      label2: "INGEST LATENCY",
      val2: "1.2 ms",
      metricName: "PACKET_THROUGHPUT",
      metricVal: "984,200 PKT/S",
    },
    briefing:
      "All defense begins at the wire. Unfiltered internet packets storm the subterranean glass conduits. Verify link integrity to begin defensive ingestion.",
    actionLabel: "SYNCHRONIZE UPLINK",
    actionDoneLabel: "UPLINK_SYNCHRONIZED [10 Gbps]",
  },
  {
    id: 2,
    code: "SEC-02",
    title: "Global Routing & DNS Core",
    clearance: "CLEARANCE // LEVEL 2: ANALYST",
    badgeLevel: "ANALYST",
    src: "/story/scene-02.mp4",
    telemetry: {
      label1: "AUTH NAMESERVERS",
      val1: "13 ROOT CLUSTERS",
      label2: "DNSSEC VALIDATION",
      val2: "STRICT (RFC 4034)",
      metricName: "RESOLUTION_TIME",
      metricVal: "8.4 ms",
    },
    briefing:
      "Thousands of blade mainframes handle recursive DNS mapping and port connectivity. An unverified resolver exposes the entire network to cache poisoning.",
    actionLabel: "AUTHORIZE RESOLVER",
    actionDoneLabel: "ROOT_ZONE_AUTHENTICATED",
  },
  {
    id: 3,
    code: "SEC-03",
    title: "Quantum Cryptographic Vault",
    clearance: "CLEARANCE // LEVEL 3: SPECIALIST",
    badgeLevel: "SPECIALIST",
    src: "/story/scene-03.mp4",
    telemetry: {
      label1: "CIPHER SUITE",
      val1: "AES-256-GCM / SHA-512",
      label2: "ENTROPY POOL",
      val2: "256.0 BITS (MAX)",
      metricName: "HASH_COLLISION_RISK",
      metricVal: "< 10^-77",
    },
    briefing:
      "Isolated inside magnetic containment, the Hardware Security Module generates non-deterministic cryptographic keys. Align the entropy ring to lock the vault.",
    actionLabel: "ALIGN CIPHER KEY",
    actionDoneLabel: "ENTROPY_LOCKED [256-BIT]",
  },
  {
    id: 4,
    code: "SEC-04",
    title: "Threat Operations & OSINT Deck",
    clearance: "CLEARANCE // LEVEL 4: OPERATOR",
    badgeLevel: "OPERATOR",
    src: "/story/scene-04.mp4",
    telemetry: {
      label1: "GLOBAL SURVEILLANCE",
      val1: "ACTIVE (BGP / ASN)",
      label2: "BREACH SURFACES",
      val2: "24,800 MONITORED",
      metricName: "ACTIVE_ANOMALIES",
      metricVal: "0 DETECTED",
    },
    briefing:
      "Curved holographic displays map active global routing anomalies and compromised database dumps. Isolate suspicious Autonomous Systems before intrusion.",
    actionLabel: "ISOLATE BREACH VECTOR",
    actionDoneLabel: "PERIMETER_ANOMALIES_ISOLATED",
  },
  {
    id: 5,
    code: "SEC-05",
    title: "Hardened Perimeter Shield",
    clearance: "CLEARANCE // LEVEL 5: ARCHITECT",
    badgeLevel: "ARCHITECT",
    src: "/story/scene-05.mp4",
    telemetry: {
      label1: "SHIELD MATRIX",
      val1: "HEX-GRID LEVEL 5",
      label2: "HTTP DEFENSE",
      val2: "CSP / HSTS / NOSNIFF",
      metricName: "INJECTION_BLOCKED",
      metricVal: "100.0%",
    },
    briefing:
      "A proactive hexagonal energy mesh absorbs cross-site scripting and malicious clickjacking payloads, neutralizing them into harmless telemetry pulses.",
    actionLabel: "ENGAGE CSP SHIELD",
    actionDoneLabel: "DEFENSE_SHIELD_ONLINE",
  },
  {
    id: 6,
    code: "SEC-06",
    title: "The Armoury Nexus Mainframe",
    clearance: "CLEARANCE // LEVEL 6: COMMANDER",
    badgeLevel: "COMMANDER",
    src: "/story/scene-06.mp4",
    telemetry: {
      label1: "AI CORE STATUS",
      val1: "BIG BRO ONLINE",
      label2: "NEURAL LINK",
      val2: "SYNAPSE READY",
      metricName: "ARMOURY_UTILITIES",
      metricVal: "18 ARMED",
    },
    briefing:
      "The innermost quantum supercomputer. You have reached the core of The Big Bro's NetSec Armoury. Complete the neural handshake to claim full Commander clearance.",
    actionLabel: "ESTABLISH NEURAL LINK",
    actionDoneLabel: "COMMANDER_CLEARANCE_GRANTED",
  },
];

export default function SandboxScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const glitchOverlayRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Dynamic RAF Text & Metric Refs
  const sectorTitleRef = useRef<HTMLHeadingElement>(null);
  const sectorClearanceRef = useRef<HTMLSpanElement>(null);
  const briefingPanelRef = useRef<HTMLDivElement>(null);
  const briefingTextRef = useRef<HTMLParagraphElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  // Telemetry metric refs
  const telLabel1Ref = useRef<HTMLSpanElement>(null);
  const telVal1Ref = useRef<HTMLSpanElement>(null);
  const telLabel2Ref = useRef<HTMLSpanElement>(null);
  const telVal2Ref = useRef<HTMLSpanElement>(null);
  const telMetricNameRef = useRef<HTMLSpanElement>(null);
  const telMetricValRef = useRef<HTMLSpanElement>(null);

  // State
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [clearedSectors, setClearedSectors] = useState<Record<number, boolean>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);
  const scrollIdleTimer = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef(0);

  // Total stages: 6 videos (0..5), 1 ID Card stage (6), 1 Labs Range stage (7)
  const TOTAL_STAGES = 8;
  const LABS_LIVE = true; // Deployment flag active

  // --- NATIVE WEB AUDIO & AMBIENT SYNTHESIZER ---
  const getAudioContext = useCallback(() => {
    if (audioCtx) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      setAudioCtx(ctx);
      return ctx;
    }
    return null;
  }, [audioCtx]);

  const initAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    if (!isMuted) {
      // User is muting background score
      stopAmbientScore();
      setIsMuted(true);
      try {
        sessionStorage.setItem("netsec_bgm_user_muted", "true");
      } catch {}
    } else {
      // User is enabling background score
      startAmbientScore();
      setIsMuted(false);
      try {
        sessionStorage.setItem("netsec_bgm_user_muted", "false");
      } catch {}
    }
    // Tactile click feedback always responds to the user toggle
    playSfx("click");
  };

  useEffect(() => {
    return () => {
      stopAmbientScore();
    };
  }, []);

  const playSfx = useCallback((type: "impact" | "glitch" | "click" | "levelUp") => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === "impact") {
      // Sub-bass cinematic thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.5);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "glitch") {
      // White noise digital static
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.12);
    } else if (type === "click") {
      // High-precision mechanical toggle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === "levelUp") {
      // Chime progression
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    }
  }, [getAudioContext]);

  const triggerGlitch = useCallback(() => {
    if (!glitchOverlayRef.current) return;
    playSfx("glitch");
    const overlay = glitchOverlayRef.current;
    overlay.style.opacity = "1";
    overlay.style.transform = `translateX(${Math.random() > 0.5 ? "8px" : "-8px"})`;
    setTimeout(() => {
      overlay.style.opacity = "0";
      overlay.style.transform = "translateX(0)";
    }, 120);
  }, [playSfx]);

  // Handle Checkpoint Action Click
  const handleCheckpointAction = (sectorId: number) => {
    playSfx("levelUp");
    triggerGlitch();
    setClearedSectors((prev) => ({ ...prev, [sectorId]: true }));
  };

  // Dynamic Clearance & Rank Calculation
  const clearedCount = Object.values(clearedSectors).filter(Boolean).length;

  const getClearanceRank = (count: number) => {
    switch (count) {
      case 6:
        return {
          level: "LEVEL 6",
          title: "COMBAT DEFENSE COMMANDER",
          shortTitle: "COMMANDER",
          status: "ALL 6 SECTORS SECURED",
          handshake: "SYNCHRONIZED [MAX ENTROPY]",
        };
      case 5:
        return {
          level: "LEVEL 5",
          title: "PERIMETER ARCHITECT",
          shortTitle: "ARCHITECT",
          status: "5/6 SECTORS AUTHORIZED",
          handshake: "NEAR FULL CLEARANCE",
        };
      case 4:
        return {
          level: "LEVEL 4",
          title: "THREAT OPERATOR",
          shortTitle: "OPERATOR",
          status: "4/6 SECTORS AUTHORIZED",
          handshake: "TACTICAL PROVISIONAL",
        };
      case 3:
        return {
          level: "LEVEL 3",
          title: "CRYPTOGRAPHIC SPECIALIST",
          shortTitle: "SPECIALIST",
          status: "3/6 SECTORS AUTHORIZED",
          handshake: "VAULT SYNCHRONIZED",
        };
      case 2:
        return {
          level: "LEVEL 2",
          title: "ROUTING ANALYST",
          shortTitle: "ANALYST",
          status: "2/6 SECTORS AUTHORIZED",
          handshake: "DNS ROOT VERIFIED",
        };
      case 1:
        return {
          level: "LEVEL 1",
          title: "PERIMETER CADET",
          shortTitle: "CADET",
          status: "1/6 SECTOR AUTHORIZED",
          handshake: "WIRE SYNC ONLY",
        };
      default:
        return {
          level: "LEVEL 0",
          title: "UNAUTHORIZED RECRUIT",
          shortTitle: "RECRUIT",
          status: "0/6 SECTORS AUTHORIZED",
          handshake: "UNSYNCHRONIZED",
        };
    }
  };

  const currentRank = getClearanceRank(clearedCount);

  // Download Holographic Operator Badge (PNG via Canvas)
  const downloadOperatorBadge = () => {
    playSfx("click");
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Cyber Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 480);
    bgGrad.addColorStop(0, "#070a10");
    bgGrad.addColorStop(1, "#0d131f");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 480);

    // Outer Neon Border
    ctx.strokeStyle = "#00e575";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 440);

    // Inner Accent Border
    ctx.strokeStyle = "rgba(0, 229, 117, 0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 740, 420);

    // Header Text
    ctx.fillStyle = "#00e575";
    ctx.font = "bold 16px monospace";
    ctx.fillText("[THE BIG BRO'S NETSEC ARMOURY // OPERATOR DOSSIER]", 50, 70);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "12px monospace";
    ctx.fillText("SECURITY PROTOCOL // CERTIFIED DEFENSIVE OPERATOR", 50, 95);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(50, 115);
    ctx.lineTo(750, 115);
    ctx.stroke();

    // Clearance Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(`OPERATOR CLEARANCE: ${currentRank.level}`, 50, 170);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`RANK: ${currentRank.title}`, 50, 205);

    // Details Grid
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "14px monospace";
    ctx.fillText("CALLSIGN: AGENT-01", 50, 260);
    ctx.fillText(`SECTORS VERIFIED: ${clearedCount}/6 AUTHORIZED`, 50, 290);
    ctx.fillText(`STATUS: ${currentRank.status}`, 50, 320);
    ctx.fillText(`ISSUED: ${new Date().toISOString().split("T")[0]}`, 50, 350);

    // Holographic Cyber Seal
    ctx.strokeStyle = "#00e575";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(650, 260, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 229, 117, 0.08)";
    ctx.fill();

    ctx.fillStyle = "#00e575";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("NETSEC", 650, 250);
    ctx.fillText("ARMOURY", 650, 270);
    ctx.font = "10px monospace";
    ctx.fillText("VERIFIED", 650, 290);

    // Download trigger
    const link = document.createElement("a");
    link.download = `NetSec-Operator-Badge-${currentRank.shortTitle}-${clearedCount}-of-6.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // --- MOUSE PARALLAX EFFECT ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoWrapperRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * -20;
      const y = (e.clientY / window.innerHeight - 0.5) * -20;
      videoWrapperRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- RAF SCROLL ENGINE ---
  useEffect(() => {
    let ticking = false;
    let lastSector = 0;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;

          const scrollTop = window.scrollY;
          const maxScroll = document.body.scrollHeight - window.innerHeight;
          const globalProgress = Math.min(Math.max(scrollTop / (maxScroll || 1), 0), 1);

          // Update Top Progress Bar
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${globalProgress * 100}%`;
          }

          // Reset and track scroll idle for "Keep Scrolling" HUD alert
          setShowScrollPrompt(false);
          if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
          scrollIdleTimer.current = setTimeout(() => {
            setShowScrollPrompt(true);
          }, 1800);

          // Calculate current stage
          const currentStep = globalProgress * TOTAL_STAGES;
          const sectorIndex = Math.min(Math.floor(currentStep), TOTAL_STAGES - 1);
          const localProgress = currentStep - sectorIndex; // 0.0 to 1.0 within sector

          if (sectorIndex !== lastSector) {
            setActiveSectorIndex(sectorIndex);
            if (sectorIndex < 6 && lastSector < 6) {
              triggerGlitch();
              playSfx("impact");
            }
            lastSector = sectorIndex;
          }

          // Visual updates for Sector Scenes 0 to 5
          if (sectorIndex < 6) {
            const sectorData = SECTORS[sectorIndex];
            const isCheckpointZone = localProgress > 0.55;
            const scrubFactor = Math.min(localProgress / 0.55, 1.0);

            // 1. Set target scrub time for continuous physics damping
            const video = videoRefs.current[sectorIndex];
            if (video && video.duration) {
              targetTimeRef.current = scrubFactor * (video.duration - 0.1);
            }

            // 2. Sector Header Text (Top left of viewport)
            if (sectorTitleRef.current) {
              sectorTitleRef.current.innerText = `${sectorData.code} // ${sectorData.title}`;
            }
            if (sectorClearanceRef.current) {
              sectorClearanceRef.current.innerText = sectorData.clearance;
            }

            // 3. Telemetry values (Right Rail)
            if (telLabel1Ref.current) telLabel1Ref.current.innerText = sectorData.telemetry.label1;
            if (telVal1Ref.current) telVal1Ref.current.innerText = sectorData.telemetry.val1;
            if (telLabel2Ref.current) telLabel2Ref.current.innerText = sectorData.telemetry.label2;
            if (telVal2Ref.current) telVal2Ref.current.innerText = sectorData.telemetry.val2;
            if (telMetricNameRef.current) telMetricNameRef.current.innerText = sectorData.telemetry.metricName;
            if (telMetricValRef.current) telMetricValRef.current.innerText = sectorData.telemetry.metricVal;

            // 4. Briefing & Checkpoint Panel (Bottom of viewport)
            if (briefingPanelRef.current && briefingTextRef.current && actionButtonRef.current) {
              if (isCheckpointZone) {
                const ease = Math.min((localProgress - 0.55) / 0.25, 1.0);
                briefingPanelRef.current.style.opacity = ease.toString();
                briefingPanelRef.current.style.transform = `translateY(${(1 - ease) * 30}px)`;

                const charCount = Math.floor(ease * sectorData.briefing.length);
                briefingTextRef.current.innerText = sectorData.briefing.slice(0, charCount);
              } else {
                briefingPanelRef.current.style.opacity = "0";
                briefingPanelRef.current.style.transform = "translateY(30px)";
                briefingTextRef.current.innerText = "";
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    };
  }, [TOTAL_STAGES, triggerGlitch, playSfx]);

  // --- CONTINUOUS SMOOTH LERP PHYSICS FOR VIDEO SCRUBBING ---
  useEffect(() => {
    let animId: number;
    const smoothVideoLoop = () => {
      if (activeSectorIndex < 6) {
        const video = videoRefs.current[activeSectorIndex];
        if (video && video.duration && !video.seeking) {
          const diff = targetTimeRef.current - video.currentTime;
          if (Math.abs(diff) > 0.02) {
            // Smooth exponential damping (weighted flywheel inertia)
            video.currentTime += diff * 0.22;
          }
        }
      }
      animId = requestAnimationFrame(smoothVideoLoop);
    };
    animId = requestAnimationFrame(smoothVideoLoop);
    return () => cancelAnimationFrame(animId);
  }, [activeSectorIndex]);

  // Jump to specific sector
  const scrollToSector = (idx: number) => {
    if (!containerRef.current) return;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const targetScroll = (idx / TOTAL_STAGES) * maxScroll + 50;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const activeSector = SECTORS[Math.min(activeSectorIndex, 5)];
  const isSectorCleared = clearedSectors[activeSector.id] || false;

  return (
    <div ref={containerRef} className="relative w-full bg-[#05070a] font-sans" style={{ height: "3200vh" }}>
      {/* Pinned Command Console Stage */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#05070a] flex flex-col justify-between select-none">
        {/* ========================================================= */}
        {/* TOP COMMAND DECK HEADER                                   */}
        {/* ========================================================= */}
        <header className="relative z-50 h-16 w-full px-6 sm:px-10 flex items-center justify-between border-b border-[#182234] bg-[#070a10]/80 backdrop-blur-xl">
          {/* Back & Sector Breadcrumb */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/home"
              className="group flex items-center gap-2 text-slate-400 hover:text-[#00e575] transition-colors text-xs font-mono font-bold"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>[NETSEC_HQ]</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
              <span className="text-white font-display font-black text-xs tracking-widest uppercase">
                {"Training Grounds // Tactical Simulator"}
              </span>
            </div>
          </div>

          {/* Right Controls: Audio & Direct Bypass */}
          <div className="flex items-center gap-4">
            {/* Audio Toggle */}
            <button
              onClick={initAudio}
              title={!isMuted ? "Mute Background Music (Tactile click sounds remain active)" : "Enable Background Music"}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                !isMuted
                  ? "border-[#00e575]/40 bg-[#00e575]/10 text-[#00e575] shadow-[0_0_15px_rgba(0,229,117,0.2)]"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
            >
              {!isMuted ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{!isMuted ? "BGM: ACTIVE" : "BGM: MUTED"}</span>
            </button>

            {/* Direct Bypass Button */}
            <Link
              href="/sandbox/labs"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-105"
            >
              <span>BYPASS TO LABS</span>
              <span className="text-amber-500">➔</span>
            </Link>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN HUD: LEFT RAIL + CENTER VIEWPORT + RIGHT TELEMETRY   */}
        {/* ========================================================= */}
        <div className="relative flex-1 w-full flex items-center justify-between px-4 sm:px-8 py-3 gap-6 overflow-hidden">
          {/* ------------------------------------------------------- */}
          {/* LEFT RAIL: CLEARANCE NODE STEPPER                       */}
          {/* ------------------------------------------------------- */}
          <aside className="hidden lg:flex flex-col justify-center h-full w-56 z-40 space-y-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase px-2 mb-1 flex items-center gap-2">
              <Radio className="w-3 h-3 text-[#00e575] animate-pulse" />
              <span>DEFENSE NODES</span>
            </div>

            <div className="relative flex flex-col space-y-2">
              {/* Vertical connector line */}
              <div className="absolute left-4 top-3 bottom-3 w-px bg-slate-800 pointer-events-none" />

              {SECTORS.map((sec, idx) => {
                const isActive = activeSectorIndex === idx;
                const isCleared = clearedSectors[sec.id];
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSector(idx)}
                    className={`group relative flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-all ${
                      isActive
                        ? "bg-[#00e575]/10 border border-[#00e575]/30 text-white"
                        : "hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {/* Node circle */}
                    <div
                      className={`relative z-10 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isCleared
                          ? "bg-[#00e575] text-black shadow-[0_0_10px_#00e575]"
                          : isActive
                            ? "bg-black border-2 border-[#00e575] shadow-[0_0_10px_#00e575]"
                            : "bg-slate-900 border border-slate-700"
                      }`}
                    >
                      {isCleared ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-slate-300" />
                      )}
                    </div>

                    {/* Node Info */}
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-bold tracking-wider leading-none">
                        {sec.code}
                      </span>
                      <span className="text-[11px] font-medium font-sans truncate w-36">
                        {sec.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ------------------------------------------------------- */}
          {/* CENTER STAGE: THE FLOATING TACTICAL VIEWPORT            */}
          {/* ------------------------------------------------------- */}
          <main className="relative flex-1 h-[82vh] max-w-6xl mx-auto rounded-2xl border border-[#182234] bg-black/80 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
            {/* Chromatic Glitch Transition Layer */}
            <div
              ref={glitchOverlayRef}
              className="absolute inset-0 z-40 pointer-events-none opacity-0 bg-[#00e575]/20 mix-blend-exclusion transition-opacity duration-75"
            />

            {/* Video Canvas Stage with 3D Mouse Parallax */}
            <div
              ref={videoWrapperRef}
              className="relative w-full h-full will-change-transform transition-transform duration-100 ease-out"
            >
              {SECTORS.map((sec, index) => {
                const isNearActive = Math.abs(activeSectorIndex - index) <= 1;
                return (
                  <video
                    key={sec.id}
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={sec.src}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      activeSectorIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    muted
                    playsInline
                    preload={isNearActive ? "auto" : "metadata"}
                  />
                );
              })}
            </div>

            {/* Corner Tactical Cyber Brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00e575]/50 pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00e575]/50 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00e575]/50 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00e575]/50 pointer-events-none" />

            {/* Sector Title & Clearance Badge Overlay (Top Left of Viewport) */}
            <div
              className={`absolute top-6 left-6 z-30 transition-opacity duration-500 pointer-events-none ${
                activeSectorIndex < 6 ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-pulse" />
                <span
                  ref={sectorClearanceRef}
                  className="font-mono text-xs font-bold tracking-widest text-[#00e575] uppercase"
                >
                  {activeSector.clearance}
                </span>
              </div>
              <h2
                ref={sectorTitleRef}
                className="text-2xl sm:text-3xl font-black font-display text-white tracking-wider uppercase drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
              >
                {activeSector.code} {"//"} {activeSector.title}
              </h2>
            </div>

            {/* Tactical Checkpoint Card (Bottom of Viewport) */}
            <div
              className={`absolute bottom-6 left-6 right-6 z-30 flex justify-center pointer-events-none transition-opacity duration-500 ${
                activeSectorIndex < 6 ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                ref={briefingPanelRef}
                className="w-full max-w-2xl bg-[#070a10]/90 border border-[#00e575]/30 rounded-xl p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto transition-transform duration-300"
                style={{ opacity: 0, transform: "translateY(30px)" }}
              >
                <div className="space-y-1.5 text-left flex-1">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>OPERATOR DIRECTIVE</span>
                  </div>
                  <p
                    ref={briefingTextRef}
                    className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed font-sans"
                  >
                    {activeSector.briefing}
                  </p>
                </div>

                {/* Tactile Action Button */}
                <button
                  ref={actionButtonRef}
                  onClick={() => handleCheckpointAction(activeSector.id)}
                  disabled={isSectorCleared}
                  className={`px-5 py-3 rounded-lg font-mono text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-2 shadow-lg ${
                    isSectorCleared
                      ? "bg-[#00e575]/20 border border-[#00e575]/50 text-[#00e575] shadow-[0_0_20px_rgba(0,229,117,0.3)] cursor-default"
                      : "bg-[#00e575] hover:bg-[#00c966] text-black hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,229,117,0.4)]"
                  }`}
                >
                  {isSectorCleared ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{activeSector.actionDoneLabel}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 animate-bounce" />
                      <span>{activeSector.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STAGE 7: DIGITAL OPERATOR ID CARD (COMMANDER CLIMAX) */}
            <div
              className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 backdrop-blur-2xl transition-opacity duration-700 ${
                activeSectorIndex === 6 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="w-full max-w-md bg-gradient-to-b from-[#0d131f] to-[#070a10] border-2 border-[#00e575]/50 rounded-2xl p-8 shadow-[0_0_80px_rgba(0,229,117,0.25)] relative overflow-hidden text-center space-y-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e575]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <span className="font-mono text-[10px] tracking-widest text-[#00e575] font-bold">
                    {"[NETSEC_ARMOURY // DOSSIER]"}
                  </span>
                  <ShieldCheck className="w-6 h-6 text-[#00e575]" />
                </div>

                <div className="space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#00e575]/10 border border-[#00e575] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,229,117,0.3)]">
                    <Shield className="w-8 h-8 text-[#00e575]" />
                  </div>
                  <h3 className="text-xl font-black font-display text-white tracking-widest uppercase">
                    DEFENSIVE OPERATOR
                  </h3>
                  <p className="font-mono text-xs text-amber-400 font-bold tracking-widest">
                    CLEARANCE: {currentRank.level} {currentRank.shortTitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[11px] text-left bg-black/40 p-4 rounded-lg border border-white/5">
                  <div>
                    <span className="text-slate-500 block text-[9px]">CALLSIGN</span>
                    <span className="text-white font-bold">AGENT-01</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">SECURITY SECTORS</span>
                    <span className="text-[#00e575] font-bold">{clearedCount}/6 AUTHORIZED</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">COMBAT STATUS</span>
                    <span className={`font-bold ${clearedCount === 6 ? "text-emerald-400" : "text-amber-400"}`}>
                      {currentRank.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">NEURAL HANDSHAKE</span>
                    <span className={`font-bold ${clearedCount === 6 ? "text-emerald-400" : "text-amber-400"}`}>
                      {currentRank.handshake}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {clearedCount < 6 && (
                    <button
                      onClick={() => {
                        const firstUncleared = SECTORS.findIndex((s) => !clearedSectors[s.id]);
                        scrollToSector(firstUncleared !== -1 ? firstUncleared : 0);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>REVISE UNVERIFIED SECTORS ({6 - clearedCount} REMAINING)</span>
                    </button>
                  )}

                  <button
                    onClick={downloadOperatorBadge}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-[#00e575]/40 text-[#00e575] font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,229,117,0.15)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>EXPORT OPERATOR BADGE (PNG)</span>
                  </button>

                  <button
                    onClick={() => scrollToSector(7)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00e575] to-[#00b35a] text-black font-mono font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(0,229,117,0.4)]"
                  >
                    PROCEED TO LIVE LABS ➔
                  </button>
                </div>
              </div>
            </div>

            {/* STAGE 8: LIVE TRAINING GROUNDS RANGE */}
            <div
              className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-2xl transition-opacity duration-700 ${
                activeSectorIndex === 7 ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] font-mono text-xs font-bold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>DEFENSE RANGE READY</span>
                  </div>
                  <h2 className="text-4xl sm:text-6xl font-black text-white font-display uppercase tracking-widest">
                    Training Grounds Labs
                  </h2>
                  <p className="text-slate-400 text-sm max-w-xl mx-auto">
                    Simulated safe sandboxes for real-world defensive practice. Test exploits, inspect packets, and
                    harden headers without real-world liability.
                  </p>
                </div>

                {LABS_LIVE ? (
                  <Link
                    href="/sandbox/labs"
                    className="inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-[#00e575] hover:bg-[#00c966] text-black font-mono font-black text-sm uppercase tracking-widest shadow-[0_0_50px_rgba(0,229,117,0.4)] hover:scale-105 transition-all"
                  >
                    <span>ENTER SIMULATED LABS</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      disabled
                      className="px-10 py-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-mono font-black text-sm uppercase tracking-widest cursor-not-allowed shadow-inner"
                    >
                      {"LABS OFFLINE // DEPLOYMENT PENDING"}
                    </button>
                    <span className="text-amber-500 text-xs font-mono font-bold tracking-widest uppercase animate-pulse">
                      Simulated Environment Under Final Calibration
                    </span>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* ------------------------------------------------------- */}
          {/* RIGHT RAIL: DYNAMIC TELEMETRY HUD                       */}
          {/* ------------------------------------------------------- */}
          <aside className="hidden xl:flex flex-col justify-center h-full w-56 z-40 space-y-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase px-2 mb-1 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-[#00e575]" />
              <span>LIVE TELEMETRY</span>
            </div>

            {/* Telemetry Card 1 */}
            <div className="bg-[#070a10]/80 border border-[#182234] rounded-xl p-3.5 space-y-1">
              <span
                ref={telLabel1Ref}
                className="font-mono text-[9px] font-bold text-slate-500 tracking-wider block"
              >
                {activeSector.telemetry.label1}
              </span>
              <span
                ref={telVal1Ref}
                className="font-mono text-xs font-black text-[#00e575] tracking-wide block truncate"
              >
                {activeSector.telemetry.val1}
              </span>
            </div>

            {/* Telemetry Card 2 */}
            <div className="bg-[#070a10]/80 border border-[#182234] rounded-xl p-3.5 space-y-1">
              <span
                ref={telLabel2Ref}
                className="font-mono text-[9px] font-bold text-slate-500 tracking-wider block"
              >
                {activeSector.telemetry.label2}
              </span>
              <span
                ref={telVal2Ref}
                className="font-mono text-xs font-black text-amber-400 tracking-wide block truncate"
              >
                {activeSector.telemetry.val2}
              </span>
            </div>

            {/* Telemetry Card 3 (Metric Gauge) */}
            <div className="bg-[#070a10]/80 border border-[#182234] rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span
                  ref={telMetricNameRef}
                  className="font-mono text-[9px] font-bold text-slate-500 tracking-wider block"
                >
                  {activeSector.telemetry.metricName}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
              </div>
              <span
                ref={telMetricValRef}
                className="font-mono text-sm font-black text-white tracking-widest block"
              >
                {activeSector.telemetry.metricVal}
              </span>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-[#00e575] animate-pulse" />
              </div>
            </div>
          </aside>
        </div>

        {/* ========================================================= */}
        {/* TACTICAL TRAJECTORY ALERT ("KEEP SCROLLING")              */}
        {/* ========================================================= */}
        <div
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 hidden sm:block ${
            showScrollPrompt && activeSectorIndex < 7
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-95"
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#070a10]/95 border border-[#00e575]/40 backdrop-blur-xl shadow-[0_0_35px_rgba(0,229,117,0.3)]">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
            <span className="font-mono text-[11px] font-black tracking-[0.2em] text-[#00e575] uppercase">
              {isSectorCleared
                ? "SECTOR AUTHORIZED // SCROLL TO ADVANCE"
                : "DIRECTIVE ACTIVE // SCROLL TO PENETRATE DEEPER"}
            </span>
            <div className="flex flex-col items-center -space-y-1 text-[#00e575] animate-bounce">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM HUD PROGRESS TRACKER                               */}
        {/* ========================================================= */}
        <footer className="relative z-50 h-14 w-full px-6 sm:px-10 flex items-center justify-between border-t border-[#182234] bg-[#070a10]/90 backdrop-blur-xl">
          <div className="w-full flex items-center gap-6">
            <span className="text-slate-500 font-mono text-[10px] font-bold tracking-widest">
              SEC_PROGRESS
            </span>
            <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-[#00e575]/50 via-[#00e575] to-white shadow-[0_0_12px_#00e575] will-change-[width]"
                style={{ width: "0%" }}
              />
            </div>
            <span className="text-slate-400 font-mono text-[10px] font-bold tracking-widest">
              SECTOR 0{Math.min(activeSectorIndex + 1, 6)} / 06
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
