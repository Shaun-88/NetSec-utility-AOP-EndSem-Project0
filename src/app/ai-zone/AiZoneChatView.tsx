"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import {
  
  Send,
  Trash2,
  Copy,
  Check,
  Square,
  ShieldAlert,
  User,
  
  TerminalSquare,
  
  
  ChevronRight,
  MessageSquare
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const PROMPT_SUGGESTIONS = [
  {
    title: "Summarize My Scans",
    prompt: "Can you review my recent diagnostic scans from the last 48 hours and summarize my biggest security gaps?",
  },
  {
    title: "Security Headers Guide",
    prompt: "Why are Content-Security-Policy (CSP) and Strict-Transport-Security (HSTS) so important, and how do I configure them?",
  },
  {
    title: "Port Reachability",
    prompt: "How does the Port Checker tool work, and what is the difference between an open, closed, and filtered port?",
  },
  {
    title: "Hashing vs Encryption",
    prompt: "What is the core difference between cryptographic hashing (like SHA-256) and symmetric encryption (like AES)?",
  },
];

// --- MASCOT COMPONENT ---
const SentinelMascot = ({ state, sizeClass = "w-14 h-14" }: { state: "idle" | "peeking" | "thinking", sizeClass?: string }) => {
  return (
    <div className={`sentinel-core ${state} ${sizeClass} flex-shrink-0`}>
      <div className="sentinel-housing">
        <div className="sentinel-lens-glare" />
        <div className="sentinel-aperture" />
        <div className="sentinel-eye" />
      </div>
    </div>
  );
};

export default function AiZoneChatView() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [mode, setMode] = useState<"recruit" | "operator">("recruit");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    handleStop();
    setMessages([]);
  };

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, initialAssistantMessage]);
    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode, 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with the AI assistant.");
      }

      if (!response.body) {
        throw new Error("No response stream received from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholderId
              ? { ...msg, content: accumulatedText }
              : msg,
          ),
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? { ...msg, content: "⚠️ System offline or connection interrupted." }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\[ACTION:[a-zA-Z0-9-]+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[ACTION:([a-zA-Z0-9-]+)\]/);
      if (match) {
        const toolId = match[1];
        return (
          <div key={index} className="my-4 p-4 border border-[#00e575]/40 bg-[#0d131f] rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(0,229,117,0.1)] group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00e575]/10 text-[#00e575]">
                <TerminalSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#00e575] uppercase tracking-widest">Execute Routine</p>
                <p className="text-sm font-semibold text-white mt-0.5 capitalize">{toolId.replace(/-/g, ' ')}</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/tools/${toolId}`)}
              className="px-4 py-2 bg-[#00e575] hover:bg-[#00c565] text-[#070a10] text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-2"
            >
              Launch Tool <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        );
      }

      return (
        <div key={index} className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#080b11] prose-pre:border prose-pre:border-[#182234] prose-pre:rounded-xl">
          <ReactMarkdown
            components={{
              a: ({ ...props }) => <a {...props} className="text-[#00e575] hover:underline" />,
              code: ({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) => {
                if (inline) {
                  return (
                    <code className="bg-[#121927] text-[#00e575] px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                }
                return <code className={className} {...props}>{children}</code>;
              }
            }}
          >
            {part}
          </ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-[#070a10] border border-[#182234] rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* --- CUSTOM CSS FOR SENTINEL MASCOT --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .sentinel-core {
          position: relative;
          border-radius: 50%;
          background: #070a10;
          border: 2px solid #182234;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 200px;
          transition: all 0.4s ease;
        }
        .sentinel-housing {
          width: 75%;
          height: 75%;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #1a2436, #070a10);
          border: 1px solid #2a364a;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .sentinel-lens-glare {
          position: absolute;
          top: -20%;
          left: -20%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .sentinel-aperture {
          position: absolute;
          inset: 15%;
          border-radius: 50%;
          border: 2px dashed #00e575;
          opacity: 0.3;
          transition: all 0.3s ease;
        }
        .sentinel-eye {
          width: 25%;
          height: 25%;
          border-radius: 50%;
          background: #00e575;
          box-shadow: 0 0 10px 2px rgba(0,229,117,0.4);
          transition: all 0.3s ease;
        }

        /* States */
        .sentinel-core.peeking .sentinel-housing {
          transform: rotateX(-40deg) translateY(3px);
        }
        .sentinel-core.peeking .sentinel-eye {
          transform: scale(0.8);
          box-shadow: 0 0 15px 4px rgba(0,229,117,0.6);
        }
        .sentinel-core.thinking .sentinel-aperture {
          border-color: #f59e0b;
          animation: spin 3s linear infinite;
          opacity: 0.8;
        }
        .sentinel-core.thinking .sentinel-eye {
          background: #f59e0b;
          box-shadow: 0 0 20px 5px rgba(245,158,11,0.8);
          transform: scale(0.9);
          animation: pulse-eye 1s infinite alternate;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse-eye { 100% { transform: scale(1.1); box-shadow: 0 0 30px 8px rgba(245,158,11,1); } }
        
        .typewriter-glow {
          text-shadow: 0 0 10px rgba(0,229,117,0.5);
        }
      `}} />

      {/* HEADER: Clean Room Design with Mascot and Toggle */}
      <div className="flex-none p-4 md:p-6 border-b border-[#182234] bg-[#0d131f] flex items-center justify-between z-20">
        
        <div className="flex items-center gap-5">
          {/* Top Corner Sentinel Mascot */}
          <SentinelMascot 
            state={isLoading ? 'thinking' : isInputFocused ? 'peeking' : 'idle'} 
            sizeClass="w-12 h-12 md:w-14 md:h-14" 
          />
          
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              BIG BRO <span className="text-[#00e575]">NEURAL NET</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">
              Status: <span className={isLoading ? "text-[#f59e0b]" : isInputFocused ? "text-[#00e575]" : "text-slate-400"}>
                {isLoading ? 'Processing Data...' : isInputFocused ? 'Observing Input...' : 'Online & Ready'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Toggle Switch */}
          <div className="hidden md:flex items-center bg-[#070a10] border border-[#182234] p-1 rounded-xl">
            <button 
              onClick={() => setMode("recruit")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === "recruit" ? "bg-[#00e575] text-[#070a10] shadow-[0_0_10px_rgba(0,229,117,0.3)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              Recruit
            </button>
            <button 
              onClick={() => setMode("operator")}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === "operator" ? "bg-[#f59e0b] text-[#070a10] shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "text-slate-500 hover:text-slate-300"}`}
            >
              Operator
            </button>
          </div>

          {/* Safety Protocol Button */}
          <button 
            onClick={() => setIsSafetyModalOpen(true)}
            className="p-2.5 rounded-xl border border-[#00e575]/30 bg-[#00e575]/10 text-[#00e575] hover:bg-[#00e575] hover:text-[#070a10] transition-colors shadow-[0_0_15px_rgba(0,229,117,0.1)] relative group"
            title="Safety Protocol"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative scrollbar-thin scrollbar-thumb-[#182234]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto animate-fadeIn mt-[-20px]">
            {/* Massive Idle Mascot in Center */}
            <SentinelMascot state="idle" sizeClass="w-32 h-32 mb-8 opacity-40 shadow-[0_0_50px_rgba(0,229,117,0.1)]" />
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter text-center uppercase typewriter-glow">
              BIG BRO IS WATCHING &amp; PROTECTING YOU.
            </h2>
            <p className="text-sm text-slate-400 mb-10 text-center font-mono">
              Secure Intelligence Uplink Initialized. Select your mode or input a command.
            </p>

            {/* Prompt Instructions */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion.prompt)}
                  className="text-left p-4 rounded-xl border border-[#182234] bg-[#0d131f] hover:border-[#00e575]/40 hover:bg-[#00e575]/5 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-[#00e575] transition-colors" />
                    <h3 className="font-bold text-sm text-slate-300 group-hover:text-[#00e575] transition-colors">
                      {suggestion.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-400 transition-colors">
                    {suggestion.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, index) => {
            // Check if this is the very latest message in the array and if it belongs to assistant
            const isLatestAssistantMessage = index === messages.length - 1 && m.role === "assistant";
            // The mascot in the chat should be "thinking" if it's the latest message and still loading
            const chatMascotState = (isLatestAssistantMessage && isLoading) ? "thinking" : "idle";

            return (
              <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                
                {/* Assistant Chat Bubble Avatar - The Sentinel! */}
                {m.role === "assistant" && (
                  <SentinelMascot state={chatMascotState} sizeClass="w-10 h-10 shadow-lg" />
                )}

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl p-5 ${
                    m.role === "user"
                      ? "bg-[#00e575]/10 text-white border border-[#00e575]/20 rounded-tr-none"
                      : "bg-[#0d131f] text-slate-200 border border-[#182234] rounded-tl-none shadow-lg"
                  }`}
                >
                  {/* Content */}
                  <div className="mb-2">
                    {m.role === "assistant" && m.content === "" && isLoading ? (
                      <div className="flex items-center gap-2 text-[#f59e0b]">
                        <span className="animate-pulse font-mono text-xs uppercase tracking-widest">Decrypting response stream...</span>
                      </div>
                    ) : (
                      renderMessageContent(m.content)
                    )}
                  </div>

                  {/* Footer (Timestamp & Copy) */}
                  <div className={`flex items-center justify-between mt-3 pt-3 border-t ${m.role === "user" ? "border-[#00e575]/20" : "border-[#182234]"}`}>
                    <span className={`text-[10px] font-mono ${m.role === "user" ? "text-[#00e575]" : "text-slate-500"}`}>
                      {m.timestamp}
                    </span>
                    {m.role === "assistant" && m.content && (
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="text-slate-500 hover:text-white transition-colors"
                        title="Copy Output"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-[#00e575]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {m.role === "user" && (
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#182234] border-2 border-[#2a364a] flex items-center justify-center text-slate-400 mt-1 shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="flex-none p-4 md:p-6 border-t border-[#182234] bg-[#0d131f] relative z-20">
        <div className="max-w-4xl mx-auto relative flex items-end gap-3">
          
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0 || isLoading}
            className="p-3.5 rounded-xl bg-[#080b11] border border-[#182234] text-slate-500 hover:text-red-400 hover:border-red-400/30 transition-all disabled:opacity-50"
            title="Purge Memory"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={mode === "recruit" ? "Ask Big Bro anything..." : "Awaiting command..."}
              className="w-full bg-[#080b11] border border-[#182234] rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-[#00e575]/50 transition-colors resize-none overflow-y-auto max-h-[180px] min-h-[52px]"
              rows={1}
            />
          </div>

          {isLoading ? (
            <button
              onClick={handleStop}
              className="absolute right-[68px] bottom-3.5 p-1 rounded-md bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : null}

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3.5 rounded-xl bg-[#00e575] hover:bg-[#00c565] text-[#070a10] font-bold shadow-[0_0_15px_rgba(0,229,117,0.3)] transition-all disabled:opacity-50 disabled:shadow-none disabled:bg-[#182234] disabled:text-slate-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- SAFETY PROTOCOL MODAL --- */}
      {isSafetyModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer animate-fadeIn"
          onClick={() => setIsSafetyModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#070a10]/95 backdrop-blur-xl border border-[#00e575]/40 rounded-2xl shadow-[0_0_40px_rgba(0,229,117,0.15)] overflow-hidden cursor-default animate-scaleIn"
          >
            <div className="h-16 bg-[#00e575]/10 border-b border-[#00e575]/30 relative flex items-center px-6">
               <div className="absolute inset-0 noir-scanline opacity-50 pointer-events-none" />
               <ShieldAlert className="w-5 h-5 text-[#00e575] mr-3" />
               <h2 className="text-lg font-bold text-white tracking-widest uppercase">Safety Protocol</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-[#0d131f] border border-[#182234]">
                <h3 className="text-[#00e575] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Green Clearance (Authorized)
                </h3>
                <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5 marker:text-[#00e575]">
                  <li>Analyze network configurations and explain cryptographic concepts.</li>
                  <li>Provide context and summaries for your diagnostic scan history.</li>
                  <li>Guide you directly to specific security tools via Action Cards.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Square className="w-4 h-4 fill-current" /> Red Restrictions (Denied)
                </h3>
                <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5 marker:text-red-400">
                  <li>Store, remember, or log plaintext passwords.</li>
                  <li>Execute actual denial-of-service (DDoS) requests or malicious payloads.</li>
                  <li>Directly hack or penetrate external servers without authorization.</li>
                </ul>
              </div>

              <button 
                onClick={() => setIsSafetyModalOpen(false)}
                className="w-full py-3 bg-[#00e575] text-[#070a10] font-bold uppercase tracking-widest rounded-xl hover:bg-[#00c565] transition-colors"
              >
                Acknowledge &amp; Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
