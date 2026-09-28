import React from "react";
import { signIn } from "@/auth";
import { Shield, Lock } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen cyber-grid bg-[#080b11] text-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-[#182234] bg-[#0d131f] rounded-2xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00e575]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#080b11] border border-[#00e575]/40 items-center justify-center shadow-glow mx-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-[#00e575]"
            >
              <path
                d="M4 11C6 11 7 8 12 8C17 8 18 11 20 11C21.5 11 22 11.8 22 12.5C22 13 21 13 20 13H4C3 13 2 13 2 12.5C2 11.8 2.5 11 4 11Z"
                fill="currentColor"
              />
              <path
                d="M7 10C7.5 7.5 9 5 12 5C15 5 16.5 7.5 17 10H7Z"
                fill="currentColor"
                fillOpacity="0.8"
              />
              <path
                d="M6 15L9 21H15L18 15L12 17L6 15Z"
                fill="currentColor"
                fillOpacity="0.9"
              />
              <rect x="8" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#080b11" />
              <rect x="12.5" y="13.5" width="3.5" height="1.5" rx="0.5" fill="#080b11" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            The Big Bro&apos;s NetSec Armoury
          </h1>
          <p className="text-xs text-slate-400">
            Authenticated Access to Network Diagnostics &amp; Security Tools
          </p>
        </div>

        {/* Security Badge */}
        <div className="bg-[#080b11] border border-[#182234] rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />
          <span>
            Single sign-on protected by JWT sessions and tenant-isolated data persistence.
          </span>
        </div>

        {/* Google Sign-in Form */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="space-y-4 pt-2"
        >
          <button
            type="submit"
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.36 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#182234] flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-3.5 h-3.5 text-[#00e575]" />
          <span>Strict SSRF &amp; tenant security policies enforced</span>
        </div>
      </div>
    </div>
  );
}
