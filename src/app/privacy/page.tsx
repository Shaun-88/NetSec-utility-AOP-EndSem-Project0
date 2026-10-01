import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#070a10] text-[#f1f5f9] p-6 sm:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-[#00e575] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="flex items-center gap-3 border-b border-[#182234] pb-6">
          <div className="p-3 rounded-xl bg-[#080b11] border border-[#00e575]/40 text-[#00e575]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400">The Big Bro&apos;s NetSec Armoury • Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Information We Collect</h2>
            <p>
              When you authenticate with our platform using Google OAuth, we receive basic identity profile
              data (your name, email address, and account identifier) exclusively for authentication and session
              management. We do not access contacts, emails, or personal Google files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Tool Diagnostic Telemetry</h2>
            <p>
              Diagnostic queries you submit (such as domain names, IP addresses, or hashes) are processed to deliver
              real-time analytical results. We enforce strict tenant data isolation, ensuring no user can access or
              view diagnostic queries run by another account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. Strict 48-Hour Retention Policy</h2>
            <p>
              All stored tool diagnostic histories are governed by an automated 48-hour purge policy. Historical
              records older than two days are automatically and permanently deleted from our database.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Third-Party Services</h2>
            <p>
              We do not sell, rent, or monetize your personal data. Password queries utilize client-side
              zero-knowledge k-anonymity hashing where full passwords never leave your browser.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">5. Contact</h2>
            <p>
              For privacy inquiries regarding this educational cybersecurity portfolio project, reach out via the
              associated GitHub repository issue tracker.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
