"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ShieldAlert, RadioTower, Fingerprint, Globe, Code2, ExternalLink, UploadCloud, XCircle, Server, ShieldCheck } from "lucide-react";

export default function CommandDeckFooter() {
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [isOperatorClosing, setIsOperatorClosing] = useState(false);
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false);

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState("Report a Bug");
  const [feedbackPayload, setFeedbackPayload] = useState("");
  const [feedbackImage, setFeedbackImage] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "transmitting" | "success" | "error">("idle");
  const [transmitProgress, setTransmitProgress] = useState(0);
  const [transmitMsg, setTransmitMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const glitchAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    glitchAudioRef.current = new Audio("/sounds/glitch.mp3");
    glitchAudioRef.current.volume = 0.2;
  }, []);

  const playGlitchSound = () => {
    if (glitchAudioRef.current) {
      glitchAudioRef.current.currentTime = 0;
      glitchAudioRef.current.play().catch(() => {});
    }
  };

  // Glitch effect timer
  useEffect(() => {
    if (!isOperatorOpen) return;
    const interval = setInterval(() => {
      const els = document.querySelectorAll(".hologram-card");
      els.forEach(el => {
        el.classList.add("glitch-anim");
        setTimeout(() => el.classList.remove("glitch-anim"), 200);
      });
      playGlitchSound();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOperatorOpen]);

  // Modal Handlers
  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();

  const openOperator = () => setIsOperatorOpen(true);
  const closeOperator = () => {
    setIsOperatorClosing(true);
    setTimeout(() => {
      setIsOperatorClosing(false);
      setIsOperatorOpen(false);
    }, 400); 
  };

  const openFeedback = () => setIsFeedbackOpen(true);
  const closeFeedback = () => {
    setIsFeedbackClosing(true);
    setTimeout(() => {
      setIsFeedbackClosing(false);
      setIsFeedbackOpen(false);
      setSubmitStatus("idle");
      setFeedbackPayload("");
      setFeedbackImage(null);
      setTransmitProgress(0);
    }, 400);
  };

  // Image upload handlers
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFeedbackImage(e.dataTransfer.files[0]);
    }
  };

  // Form Submit with 5s Cinematic Delay
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackPayload.trim()) return;

    setSubmitStatus("transmitting");
    setTransmitProgress(0);

    const formData = new FormData();
    formData.append("type", feedbackType);
    formData.append("message", feedbackPayload);
    if (feedbackImage) {
      formData.append("image", feedbackImage);
    }

    // Fire API call but don't await it immediately
    const apiPromise = fetch("/api/feedback", {
      method: "POST",
      body: formData,
    }).catch(() => ({ ok: false }));

    // Simulate 5 seconds cinematic sequence
    const duration = 5000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setTransmitProgress(progress);

      if (progress < 30) setTransmitMsg("> Encrypting payload with RSA-4096...");
      else if (progress < 60) setTransmitMsg("> Establishing secure handshake to HQ...");
      else if (progress < 90) setTransmitMsg("> Routing via encrypted proxies...");
      else setTransmitMsg("> Finalizing transmission...");

      if (elapsed >= duration) {
        clearInterval(timer);
      }
    }, interval);

    // Wait for the full 5 seconds (simulated) + ensure API finished
    await new Promise(resolve => setTimeout(resolve, duration));
    const res = await apiPromise;

    if (!(res as Response).ok) {
      setSubmitStatus("error");
    } else {
      setSubmitStatus("success");
      // Auto close after 5 seconds of success
      setTimeout(() => {
        closeFeedback();
      }, 5000);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .radar-bg {
          background: conic-gradient(from 90deg at 50% 50%, rgba(0, 229, 117, 0) 0%, rgba(0, 229, 117, 0) 70%, rgba(0, 229, 117, 0.15) 100%);
          animation: radar-sweep 4s linear infinite;
        }
        @keyframes stream-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .stream-border-wrap::before {
          content: "";
          position: absolute;
          inset: -2px;
          background: conic-gradient(from 0deg, transparent 70%, #00e575 100%);
          animation: stream-border 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 0;
        }
        .stream-border-wrap:hover::before {
          opacity: 1;
        }
        .glitch-anim {
          animation: glitch-skew 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          filter: drop-shadow(0 0 10px rgba(0,229,117,0.8)) hue-rotate(90deg);
        }
        @keyframes glitch-skew {
          0% { transform: skew(0deg, 0deg); }
          20% { transform: skew(-10deg, 0deg) translateX(-5px); }
          40% { transform: skew(10deg, 0deg) translateX(5px); }
          60% { transform: skew(-5deg, 0deg); }
          80% { transform: skew(5deg, 0deg); }
          100% { transform: skew(0deg, 0deg); }
        }
        @keyframes hologram-up {
          0% { transform: translateY(100px) scale(0.9); opacity: 0; filter: blur(10px); }
          50% { transform: translateY(-10px) scale(1.02); filter: blur(2px); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes hologram-down {
          0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
          100% { transform: translateY(100px) scale(0.9); opacity: 0; filter: blur(10px); }
        }
        .animate-hologram-up { animation: hologram-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-hologram-down { animation: hologram-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .scanline-projector {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          background: #00e575;
          box-shadow: 0 0 20px 5px rgba(0,229,117,0.4);
          animation: scan-pulse 2s infinite;
        }
        @keyframes scan-pulse {
          0%, 100% { opacity: 0.3; width: 60%; }
          50% { opacity: 1; width: 100%; }
        }
        @keyframes shoot-packet {
          0% { left: 0%; opacity: 1; transform: scale(1); }
          90% { left: 95%; opacity: 1; transform: scale(1.2); }
          100% { left: 100%; opacity: 0; transform: scale(2); }
        }
        .data-packet {
          position: absolute;
          width: 8px;
          height: 2px;
          background: #00e575;
          box-shadow: 0 0 8px 2px #00e575;
          animation: shoot-packet 1s linear infinite;
        }
        .packet-1 { animation-delay: 0s; }
        .packet-2 { animation-delay: 0.3s; }
        .packet-3 { animation-delay: 0.7s; }
      `}} />

      {/* Command Deck Footer UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 mb-8 border-t border-[#182234] pt-8">
        
        {/* Card 1: Operator ID */}
        <button 
          onClick={openOperator}
          className="stream-border-wrap relative group bg-[#0d131f] rounded-2xl p-0.5 text-left outline-none overflow-hidden hover:shadow-[0_0_30px_rgba(0,229,117,0.15)] transition-all"
        >
          <div className="absolute top-4 right-4 z-20 text-[9px] uppercase tracking-widest text-[#00e575] font-bold border border-[#00e575]/30 px-2 py-1 rounded bg-[#0d131f]/80 backdrop-blur-sm group-hover:border-[#00e575] transition-colors">
            [ DEV CONTACT INFORMATION ]
          </div>
          <div className="relative z-10 bg-[#0d131f] rounded-[15px] p-6 h-full flex items-center justify-between border border-[#182234] group-hover:border-transparent transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] group-hover:scale-110 group-hover:animate-pulse transition-all duration-300">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#00e575] group-hover:skew-x-[-5deg] transition-all">
                  Operator Clearance
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lead Architect &amp; Security Team
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* Card 2: Secure Uplink */}
        <button 
          onClick={openFeedback}
          className="relative group border border-[#182234] bg-[#0d131f] hover:border-[#00e575]/40 rounded-2xl p-6 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,117,0.15)] text-left outline-none overflow-hidden"
        >
          <div className="absolute top-4 right-4 z-20 text-[9px] uppercase tracking-widest text-[#00e575] font-bold border border-[#00e575]/30 px-2 py-1 rounded bg-[#0d131f]/80 backdrop-blur-sm group-hover:border-[#00e575] transition-colors">
            [ FEEDBACK ]
          </div>
          <div className="absolute inset-0 radar-bg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
          <div className="absolute inset-0 border-[0.5px] border-[#00e575]/10 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="absolute inset-0 border-[0.5px] border-[#00e575]/10 rounded-full scale-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#080b11] border border-[#182234] text-slate-300 group-hover:border-[#00e575]/30 group-hover:bg-[#00e575]/10 group-hover:text-[#00e575] group-hover:scale-110 transition-all duration-300">
              <RadioTower className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white group-hover:text-[#00e575] transition-colors">
                Transmit to HQ
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Establish Secure Uplink for Feedback
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* --- MODALS --- */}

      {/* Operator ID Modal */}
      {(isOperatorOpen || isOperatorClosing) && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer transition-opacity duration-400 ${isOperatorClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={closeOperator}
        >
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#00e575]/10 to-transparent pointer-events-none" />
          
          <div 
            onClick={handleModalClick}
            className={`relative w-full max-w-4xl flex flex-col md:flex-row gap-6 cursor-default ${isOperatorClosing ? 'animate-hologram-down' : 'animate-hologram-up'}`}
          >
            <div className="scanline-projector" />

            {/* Operator 1: Shaun */}
            <div className="hologram-card flex-1 bg-[#070a10]/90 backdrop-blur-xl border border-[#00e575]/40 rounded-2xl shadow-[0_0_30px_rgba(0,229,117,0.15)] overflow-hidden relative">
              <div className="h-24 bg-[#0d131f]/50 border-b border-[#182234] relative overflow-hidden flex items-end px-6 pb-4">
                 <div className="absolute inset-0 noir-scanline opacity-40 pointer-events-none" />
                 <span className="text-[9px] uppercase tracking-widest text-[#00e575] font-bold">Clearance Level: Omega</span>
              </div>
              <div className="absolute top-12 left-6 w-20 h-20 rounded-xl border-2 border-[#00e575]/50 bg-[#0d131f] shadow-lg flex items-center justify-center overflow-hidden">
                 <Image src="/images/shaun.jpg" alt="Shaun Avatar" width={80} height={80} className="object-cover opacity-90 mix-blend-screen" />
              </div>
              <div className="pt-12 pb-6 px-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Shaun S Dsilva</h2>
                  <p className="text-xs text-[#00e575] font-mono mt-0.5">&gt; Lead Architect</p>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed h-10">
                    Architecting secure, highly-optimized intelligence systems and commanding the Big Bro neural net.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-2">shaun2008dsilva@gmail.com</p>
                </div>
                <div className="space-y-3">
                  <a href="https://github.com/Shaun-88" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/50 hover:bg-[#00e575]/10 transition-colors group">
                    <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                      <Code2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </a>
                  <a href="https://www.linkedin.com/in/shaun-dsilva-41295331a" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/50 hover:bg-[#00e575]/10 transition-colors group">
                    <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                      <Globe className="w-4 h-4" />
                      <span className="text-xs font-semibold">LinkedIn Network</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Operator 2: Aditya */}
            <div className="hologram-card flex-1 bg-[#070a10]/90 backdrop-blur-xl border border-[#00e575]/40 rounded-2xl shadow-[0_0_30px_rgba(0,229,117,0.15)] overflow-hidden relative">
              <div className="h-24 bg-[#0d131f]/50 border-b border-[#182234] relative overflow-hidden flex items-end px-6 pb-4">
                 <div className="absolute inset-0 noir-scanline opacity-40 pointer-events-none" />
                 <span className="text-[9px] uppercase tracking-widest text-[#00e575] font-bold">Clearance Level: Alpha</span>
              </div>
              <div className="absolute top-12 left-6 w-20 h-20 rounded-xl border-2 border-[#00e575]/50 bg-[#0d131f] shadow-lg flex items-center justify-center overflow-hidden">
                 <Image src="/images/aditya.jpg" alt="Aditya Avatar" width={80} height={80} className="object-cover opacity-90 mix-blend-screen" />
              </div>
              <div className="pt-12 pb-6 px-6 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Aditya Singh</h2>
                  <p className="text-xs text-[#00e575] font-mono mt-0.5">&gt; Debugger, Tester &amp; Security</p>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed h-10">
                    Ensuring system integrity, threat mitigation, and rigorous quality assurance protocols.
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-2">aadityaishaansingh@gmail.com</p>
                </div>
                <div className="space-y-3">
                  <a href="https://github.com/AdityaishaanSingh" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/50 hover:bg-[#00e575]/10 transition-colors group">
                    <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                      <Code2 className="w-4 h-4" />
                      <span className="text-xs font-semibold">GitHub Profile</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </a>
                  <a href="https://www.linkedin.com/in/aditya-ishaan-singh-19b19530a" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-[#0d131f] border border-[#182234] hover:border-[#00e575]/50 hover:bg-[#00e575]/10 transition-colors group">
                    <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                      <Globe className="w-4 h-4" />
                      <span className="text-xs font-semibold">LinkedIn Network</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00e575]" />
                  </a>
                </div>
              </div>
            </div>

            <button 
              onClick={closeOperator}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors"
            >
              [ TERMINATE UPLINK ]
            </button>
          </div>
        </div>
      )}

      {/* Feedback / Uplink Modal */}
      {(isFeedbackOpen || isFeedbackClosing) && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer transition-opacity duration-400 ${isFeedbackClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={closeFeedback}
        >
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#00e575]/10 to-transparent pointer-events-none" />
          
          <div 
            onClick={handleModalClick}
            className={`relative w-full max-w-lg bg-[#070a10] border border-[#182234] rounded-2xl shadow-[0_0_40px_rgba(0,229,117,0.2)] overflow-hidden cursor-default ${isFeedbackClosing ? 'animate-hologram-down' : 'animate-hologram-up'}`}
          >
            <div className="scanline-projector" />
            <div className="p-6 space-y-6 relative min-h-[400px]">
              <div className="absolute inset-0 noir-scanline opacity-20 pointer-events-none" />
              
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] animate-pulse">
                  <RadioTower className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Encrypted Transmission</h2>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Establish a secure connection to HQ.
                  </p>
                </div>
              </div>

              {submitStatus === "transmitting" ? (
                <div className="relative z-10 py-16 flex flex-col items-center justify-center space-y-8 animate-fadeIn">
                  {/* Cinematic Transmission Visual */}
                  <div className="flex items-center justify-between w-full max-w-xs px-4 relative">
                     {/* Tower (Left) */}
                     <div className="flex flex-col items-center text-[#00e575]">
                        <RadioTower className="w-8 h-8 animate-pulse" />
                        <span className="text-[9px] mt-2 font-mono font-bold tracking-widest uppercase">Node</span>
                     </div>
                     
                     {/* Laser Line */}
                     <div className="absolute left-16 right-16 top-4 h-[1px] bg-[#00e575]/30 shadow-[0_0_10px_rgba(0,229,117,0.5)] overflow-hidden">
                        <div className="data-packet packet-1" />
                        <div className="data-packet packet-2" />
                        <div className="data-packet packet-3" />
                     </div>

                     {/* Server/HQ (Right) */}
                     <div className="flex flex-col items-center text-slate-500">
                        <Server className="w-8 h-8" />
                        <span className="text-[9px] mt-2 font-mono font-bold tracking-widest uppercase">HQ</span>
                     </div>
                  </div>

                  {/* Readout */}
                  <div className="text-center space-y-2">
                     <div className="text-3xl font-black text-[#00e575] font-mono tracking-tighter">
                       {transmitProgress}%
                     </div>
                     <p className="text-[10px] text-slate-400 font-mono tracking-widest">{transmitMsg}</p>
                  </div>
                </div>
              ) : submitStatus === "success" ? (
                <div className="relative z-10 py-16 flex flex-col items-center justify-center space-y-6 animate-fadeIn">
                  {/* Cinematic Success Visual */}
                  <div className="flex items-center justify-between w-full max-w-xs px-4 relative">
                     <div className="flex flex-col items-center text-[#00e575]/50">
                        <RadioTower className="w-8 h-8" />
                     </div>
                     
                     {/* Solid Laser Line */}
                     <div className="absolute left-16 right-16 top-4 h-[2px] bg-[#00e575] shadow-[0_0_15px_rgba(0,229,117,1)]" />

                     {/* HQ Lit Up */}
                     <div className="flex flex-col items-center text-[#00e575]">
                        <Server className="w-8 h-8 drop-shadow-[0_0_15px_rgba(0,229,117,0.8)]" />
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3 mt-4">
                    <ShieldCheck className="w-12 h-12 text-[#00e575]" />
                    <p className="text-[#00e575] font-bold tracking-widest uppercase text-xs text-center leading-relaxed">
                      TRANSMISSION SUCCESSFUL.<br/>
                      PAYLOAD FULLY ENCRYPTED.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="relative z-10 space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#00e575] uppercase tracking-wider">Transmission Type</label>
                    <select 
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      className="w-full bg-[#0d131f] border border-[#182234] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#00e575]/50 transition-colors appearance-none"
                    >
                      <option>Report a Bug</option>
                      <option>Feedback of the tools</option>
                      <option>Feedback of the website</option>
                      <option>Feedback of BigBro</option>
                      <option>Suggestions</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#00e575] uppercase tracking-wider">Message Payload</label>
                    <textarea 
                      required
                      value={feedbackPayload}
                      onChange={(e) => setFeedbackPayload(e.target.value)}
                      rows={4}
                      className="w-full bg-[#0d131f] border border-[#182234] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#00e575]/50 transition-colors resize-none placeholder-slate-600"
                      placeholder="Describe your request or issue..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#00e575] uppercase tracking-wider">Attach Intel (Optional Image)</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="w-full border-2 border-dashed border-[#182234] hover:border-[#00e575]/50 bg-[#0d131f] rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className={`w-6 h-6 ${feedbackImage ? 'text-[#00e575]' : 'text-slate-500'}`} />
                      <p className="text-xs text-slate-400 text-center">
                        {feedbackImage ? (
                          <span className="text-[#00e575] font-semibold">{feedbackImage.name}</span>
                        ) : (
                          <>Drag &amp; drop an image here, or <span className="text-[#00e575]">click to browse</span></>
                        )}
                      </p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFeedbackImage(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {submitStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/30">
                      <XCircle className="w-4 h-4" />
                      <span>Transmission failed. Ensure Discord Webhook is configured.</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#00e575] hover:bg-[#00c565] hover:shadow-[0_0_20px_rgba(0,229,117,0.4)] text-[#070a10] font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Send Transmission
                  </button>
                </form>
              )}
            </div>

            <button 
              onClick={closeFeedback}
              className="absolute top-4 right-4 text-slate-500 hover:text-white font-bold tracking-widest text-xs uppercase transition-colors z-20"
            >
              [ TERMINATE UPLINK ]
            </button>
          </div>
        </div>
      )}
    </>
  );
}
