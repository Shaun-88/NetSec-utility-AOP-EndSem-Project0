import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Terms of Service</h1>
            <p className="text-xs text-slate-400">The Big Bro&apos;s NetSec Armoury • Last updated: October 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">1. Authorized Diagnostic Use</h2>
            <p>
              The Big Bro&apos;s NetSec Armoury is intended for legitimate network diagnostics, educational
              auditing, and security evaluation of infrastructure you own or have explicit authorization to assess.
              Unlawful denial-of-service, abusive port-scanning, or unauthorized penetration attempts are strictly
              prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">2. Rate Limiting and Service Protection</h2>
            <p>
              To maintain service integrity and prevent abuse, automated rate limiting is enforced per authenticated
              user across all diagnostic endpoints. Deliberate attempts to circumvent SSRF protections, tamper with
              network boundaries, or flood endpoints may result in session termination.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">3. Disclaimer of Warranties</h2>
            <p>
              This suite of utilities is provided on an &quot;as is&quot; and &quot;as available&quot; basis for
              educational and diagnostic exploration. While we strive for accuracy, the service makes no guarantees
              regarding continuous uptime or complete vulnerability detection.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-white">4. Modifications</h2>
            <p>
              We reserve the right to update or modify these terms to reflect feature additions or security updates.
              Continued use of the platform constitutes agreement to the current terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
