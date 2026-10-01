import type { WebsiteSecurityReportData, SubToolResult } from "./types";
import type { RunToolOutput } from "@/core/tool-kit/runner";
import type { TlsCheckerOutputData } from "@/tools/tls-checker/types";
import type { SecurityHeadersOutputData } from "@/tools/security-headers/types";
import type { WhoisOutputData } from "@/tools/whois/types";

/**
 * Pure compute function for Website Security Report.
 * Aggregates sub-tool results into a composite letter grade.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeSecurityReportGrade(
  domain: string,
  dnsResult: PromiseSettledResult<RunToolOutput>,
  headersResult: PromiseSettledResult<RunToolOutput>,
  tlsResult: PromiseSettledResult<RunToolOutput>,
  whoisResult: PromiseSettledResult<RunToolOutput>,
): WebsiteSecurityReportData {
  let score = 100;

  // --- Helper to extract sub-tool result ---
  function toSubResult(settled: PromiseSettledResult<RunToolOutput>): SubToolResult {
    if (settled.status === "rejected") {
      return { success: false, error: String(settled.reason) };
    }
    const out = settled.value;
    if (!out.success) {
      return { success: false, error: out.error };
    }
    return { success: true, data: out.result?.data };
  }

  const dns = toSubResult(dnsResult);
  const headers = toSubResult(headersResult);
  const tls = toSubResult(tlsResult);
  const whois = toSubResult(whoisResult);

  // --- Scoring ---

  // TLS: expired or unavailable = -40; expiring soon = -15
  if (!tls.success || !tls.data) {
    score -= 40;
  } else {
    const tlsData = tls.data as TlsCheckerOutputData;
    if (tlsData.isExpired) {
      score -= 40;
    } else if (tlsData.isExpiringSoon) {
      score -= 15;
    }
  }

  // Security Headers grade penalties
  if (headers.success && headers.data) {
    const hData = headers.data as SecurityHeadersOutputData;
    switch (hData.grade) {
      case "F": score -= 30; break;
      case "D": score -= 20; break;
      case "C": score -= 10; break;
      case "B": score -= 5; break;
      default: break; // A, A+ — no penalty
    }
  } else {
    // Headers check failed entirely — treat as F
    score -= 30;
  }

  // WHOIS: domain age < 30 days = -20 (new domain = risk)
  if (whois.success && whois.data) {
    const wData = whois.data as WhoisOutputData;
    if (wData.registrationDate) {
      const regDate = new Date(wData.registrationDate);
      const ageDays = Math.floor(
        (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (ageDays < 30) {
        score -= 20;
      }
    }
  }

  // DNS lookup failed = -10
  if (!dns.success) {
    score -= 10;
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Map to letter grade
  let grade: WebsiteSecurityReportData["grade"] = "F";
  if (score >= 95) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";

  return {
    domain,
    grade,
    score,
    subResults: { dns, headers, tls, whois },
    ranAt: new Date().toISOString(),
  };
}
