"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Square,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: "📊",
    title: "Summarize My Scans",
    prompt: "Can you review my recent diagnostic scans from the last 48 hours and summarize my biggest security gaps or findings?",
  },
  {
    icon: "🛡️",
    title: "Security Headers Guide",
    prompt: "Why are Content-Security-Policy (CSP) and Strict-Transport-Security (HSTS) so important, and how do I configure them?",
  },
  {
    icon: "🌐",
    title: "Port Reachability",
    prompt: "How does the Port Checker tool work, and what is the difference between an open, closed, and filtered port?",
  },
  {
    icon: "🔢",
    title: "Subnetting in Plain English",
    prompt: "Can you explain what a CIDR /28 subnet means in simple terms, and how many usable host IP addresses it provides?",
  },
  {
    icon: "🔐",
    title: "Hashing vs Encryption",
    prompt: "What is the core difference between cryptographic hashing (like SHA-256) and symmetric encryption (like AES)?",
  },
];

export default function AiZoneChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages or streaming tokens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Copy message text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Stop active generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Clear conversation
  const handleClearChat = () => {
    handleStop();
    setMessages([]);
  };

  // Send message
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
        }),
      });

      if (!response.ok) {
        let errMessage = "Failed to communicate with the AI assistant.";
        try {
          const errJson = await response.json();
          if (errJson.error) errMessage = errJson.error;
        } catch {
          // Ignore json parse error
        }
        throw new Error(errMessage);
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
      if (err instanceof Error && err.name === "AbortError") {
        // Generation manually stopped
        return;
      }
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while communicating with the AI.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content: `⚠️ **Connection Notice**: ${errorMessage}`,
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Keyboard send (Enter sends, Shift+Enter new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header Card */}
      <div className="p-4 rounded-2xl bg-[#090d16] border border-[#182234] flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0 shadow-lg mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00e575]/10 border border-[#00e575]/40 flex items-center justify-center text-[#00e575] shadow-glow flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#00e575]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight">
                The Big Bro&apos;s AI Cyber Desk
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                Senior Mentor
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[#00e575]">
                <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
                Gemini Flash Active
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-sky-400">
                <Clock className="w-3 h-3" />
                48h History Connected
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d131f] hover:bg-[#121927] border border-[#182234] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Scope &amp; Safety</span>
            {showDisclaimer ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d131f] hover:bg-rose-950/30 border border-[#182234] hover:border-rose-500/30 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear current conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope, Safety & Expectations Banner */}
      {showDisclaimer && (
        <div className="mb-3 p-4 rounded-2xl bg-[#0a0f1d] border border-sky-500/30 text-xs text-slate-300 space-y-3 relative overflow-hidden transition-all shadow-md flex-shrink-0">
          <div className="flex items-center justify-between border-b border-[#182234] pb-2">
            <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              <span>Assistant Capabilities &amp; Safety Scope</span>
            </div>
            <span className="text-[10px] text-slate-400">Strict Blue-Team Policy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="p-3 rounded-xl bg-[#060a12] border border-[#182234] space-y-1.5">
              <span className="font-bold text-[#00e575] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                What You Can Expect:
              </span>
              <ul className="space-y-1 text-slate-300">
                <li>&bull; <strong className="text-white">Network Protocol Guidance:</strong> Plain-language explanations of CIDR, DNS records, latency, and TLS.</li>
                <li>&bull; <strong className="text-white">Armoury Tool Navigation:</strong> How to use all 13 tools and interpret their results.</li>
                <li>&bull; <strong className="text-white">History-Aware Audits:</strong> On-request executive summaries of your recent 48-hour scans.</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#060a12] border border-[#182234] space-y-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                What NOT to Expect (Safety Boundaries):
              </span>
              <ul className="space-y-1 text-slate-300">
                <li>&bull; <strong className="text-white">No Offensive Attack Vectors:</strong> Will strictly refuse to write exploits, malware, or brute-force tools.</li>
                <li>&bull; <strong className="text-white">Zero-Knowledge Privacy:</strong> Never paste real production passwords or private cryptographic keys.</li>
                <li>&bull; <strong className="text-white">Educational Mentorship:</strong> Provides defensive security best practices, not certified legal audits.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Stream Area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-6">
            <div className="space-y-2 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-[#00e575]/10 border border-[#00e575]/30 flex items-center justify-center mx-auto text-[#00e575] shadow-glow">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">How Can The Big Bro Help You Today?</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask any question about networking protocols, web security posture, tool recommendations, or request a summary of your recent diagnostic scans.
              </p>
            </div>

            {/* Quick Starter Chips */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="p-3.5 rounded-xl bg-[#0d131f] hover:bg-[#121927] border border-[#182234] hover:border-[#00e575]/40 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{item.icon}</span>
                    <strong className="text-white group-hover:text-[#00e575] transition-colors">
                      {item.title}
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#00e575]/10 border border-[#00e575]/40 flex items-center justify-center text-[#00e575] flex-shrink-0 mt-1 shadow-glow">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 shadow-md ${
                    isUser
                      ? "bg-[#182234] text-white border border-sky-500/30 rounded-tr-sm"
                      : "bg-[#0b101c] text-slate-200 border border-[#1a263c] rounded-tl-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-white/5 pb-1">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      {isUser ? "You (Agent)" : "The Big Bro (Mentor)"}
                    </span>
                    <span>{message.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs leading-relaxed font-sans space-y-2 overflow-x-auto">
                    {message.content ? (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="space-y-1 list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-1 list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-300">{children}</li>,
                          code: ({ children }) => (
                            <code className="px-1.5 py-0.5 rounded bg-[#131d2e] text-[#00e575] font-sans border border-[#1d2c44]">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="p-3 rounded-xl bg-[#060a12] border border-[#182234] text-emerald-400 overflow-x-auto my-2 text-[11px] font-sans leading-relaxed">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex items-center gap-1.5 py-1 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
                        <span className="text-[11px]">The Big Bro is formulating diagnostics...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Assistant Message */}
                  {!isUser && message.content && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Security Mentor Response</span>
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#00e575]" />
                            <span className="text-[#00e575]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#182234] border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Section */}
      <div className="mt-3 flex-shrink-0 space-y-2">
        {/* Quick prompt bar when conversation is active */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-slate-500 flex-shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Follow-ups:
            </span>
            <button
              onClick={() => handleSend("What specific steps should I take next?")}
              className="px-2.5 py-1 rounded-lg bg-[#0d131f] hover:bg-[#121927] border border-[#182234] text-slate-300 hover:text-white flex-shrink-0"
            >
              What steps should I take next?
            </button>
            <button
              onClick={() => handleSend("Explain how to test this with the Port Checker")}
              className="px-2.5 py-1 rounded-lg bg-[#0d131f] hover:bg-[#121927] border border-[#182234] text-slate-300 hover:text-white flex-shrink-0"
            >
              How to test with Port Checker?
            </button>
            <button
              onClick={() => handleSend("Provide an example Nginx configuration")}
              className="px-2.5 py-1 rounded-lg bg-[#0d131f] hover:bg-[#121927] border border-[#182234] text-slate-300 hover:text-white flex-shrink-0"
            >
              Example Nginx config
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative rounded-2xl bg-[#090d16] border border-[#182234] focus-within:border-[#00e575] transition-colors p-2 flex items-end gap-2 shadow-xl">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about network protocols, security headers, tool advice, or past scan summaries..."
            className="flex-1 max-h-40 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none px-2 py-1.5 font-sans leading-relaxed"
          />

          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            {isLoading ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors shadow-glow"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl font-semibold text-xs transition-all ${
                  input.trim()
                    ? "bg-[#00e575] text-[#080b11] shadow-glow hover:bg-[#00e575]/90 cursor-pointer"
                    : "bg-[#182234] text-slate-500 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Google Gemini Flash &bull; 48-Hour Scans Synchronized</span>
        </div>
      </div>
    </div>
  );
}
