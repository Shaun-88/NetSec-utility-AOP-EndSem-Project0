import type {
  HeaderAuditItem,
  SecurityHeadersOutputData,
} from "./types";

/**
 * Pure compute function for Security Header Analyzer.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeSecurityHeaderAudit(
  targetUrl: string,
  rawHeaders: Record<string, string>,
  statusCode: number,
  finalUrl: string = targetUrl,
): SecurityHeadersOutputData {
  // Normalize header keys to lowercase
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    normalized[key.toLowerCase()] = value;
  }

  const auditedHeaders: HeaderAuditItem[] = [];
  let score = 0;

  // 1. Content-Security-Policy (CSP) - 25 points
  const csp = normalized["content-security-policy"];
  if (csp) {
    if (csp.includes("'unsafe-inline'") && !csp.includes("'nonce-") && !csp.includes("'sha256-")) {
      auditedHeaders.push({
        header: "Content-Security-Policy",
        value: csp,
        status: "warn",
        importance: "Critical",
        description: "Defines approved sources of executable scripts, stylesheets, and assets.",
        recommendation: "CSP is present but permits 'unsafe-inline' scripts without nonce or cryptographic hash protection.",
        pointsEarned: 15,
        pointsPossible: 25,
      });
      score += 15;
    } else {
      auditedHeaders.push({
        header: "Content-Security-Policy",
        value: csp,
        status: "pass",
        importance: "Critical",
        description: "Defines approved sources of executable scripts, stylesheets, and assets.",
        recommendation: "Content Security Policy is strictly configured and protecting against Cross-Site Scripting (XSS).",
        pointsEarned: 25,
        pointsPossible: 25,
      });
      score += 25;
    }
  } else {
    auditedHeaders.push({
      header: "Content-Security-Policy",
      status: "fail",
      importance: "Critical",
      description: "Mitigates XSS and data injection vulnerabilities by restricting resource origins.",
      recommendation: "Missing Content-Security-Policy. Implement CSP to restrict unauthorized script execution and framing.",
      pointsEarned: 0,
      pointsPossible: 25,
    });
  }

  // 2. Strict-Transport-Security (HSTS) - 20 points
  const hsts = normalized["strict-transport-security"];
  if (hsts) {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    if (maxAge >= 31536000) {
      // At least 1 year
      auditedHeaders.push({
        header: "Strict-Transport-Security",
        value: hsts,
        status: "pass",
        importance: "High",
        description: "Forces browsers to exclusively connect over HTTPS, preventing SSL stripping.",
        recommendation: "Strong HSTS policy active with long-duration max-age (≥ 1 year).",
        pointsEarned: 20,
        pointsPossible: 20,
      });
      score += 20;
    } else {
      auditedHeaders.push({
        header: "Strict-Transport-Security",
        value: hsts,
        status: "warn",
        importance: "High",
        description: "Forces browsers to exclusively connect over HTTPS, preventing SSL stripping.",
        recommendation: `HSTS is present, but max-age (${maxAge}s) is shorter than recommended 1 year (31,536,000s).`,
        pointsEarned: 12,
        pointsPossible: 20,
      });
      score += 12;
    }
  } else {
    auditedHeaders.push({
      header: "Strict-Transport-Security",
      status: "fail",
      importance: "High",
      description: "Forces browsers to exclusively connect over HTTPS, preventing SSL stripping.",
      recommendation: "Missing HSTS header. Deploy Strict-Transport-Security with max-age=31536000; includeSubDomains.",
      pointsEarned: 0,
      pointsPossible: 20,
    });
  }

  // 3. X-Frame-Options - 15 points
  const xfo = normalized["x-frame-options"];
  if (xfo && (xfo.toUpperCase() === "DENY" || xfo.toUpperCase() === "SAMEORIGIN")) {
    auditedHeaders.push({
      header: "X-Frame-Options",
      value: xfo,
      status: "pass",
      importance: "High",
      description: "Controls whether the website can be framed inside <frame>, <iframe>, or <embed>.",
      recommendation: `Frame restriction active (${xfo}). Defending against UI redressing/clickjacking.`,
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else if (csp && csp.includes("frame-ancestors")) {
    auditedHeaders.push({
      header: "X-Frame-Options",
      value: "(Superseded by CSP frame-ancestors directive)",
      status: "pass",
      importance: "High",
      description: "Modern frame protection provided via CSP frame-ancestors directive.",
      recommendation: "Modern CSP frame-ancestors is in effect, providing equivalent or superior clickjacking protection.",
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else {
    auditedHeaders.push({
      header: "X-Frame-Options",
      status: "fail",
      importance: "High",
      description: "Protects visitors against Clickjacking attacks by blocking unauthorized iframes.",
      recommendation: "Missing X-Frame-Options. Set to 'DENY' or 'SAMEORIGIN' (or deploy CSP frame-ancestors).",
      pointsEarned: 0,
      pointsPossible: 15,
    });
  }

  // 4. X-Content-Type-Options - 15 points
  const xcto = normalized["x-content-type-options"];
  if (xcto && xcto.toLowerCase() === "nosniff") {
    auditedHeaders.push({
      header: "X-Content-Type-Options",
      value: xcto,
      status: "pass",
      importance: "Medium",
      description: "Prevents browsers from MIME-sniffing a response away from declared Content-Type.",
      recommendation: "'nosniff' directive active. Mitigating drive-by download and content-type confusion attacks.",
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else {
    auditedHeaders.push({
      header: "X-Content-Type-Options",
      status: "fail",
      importance: "Medium",
      description: "Prevents browsers from MIME-sniffing a response away from declared Content-Type.",
      recommendation: "Missing X-Content-Type-Options. Configure with 'nosniff'.",
      pointsEarned: 0,
      pointsPossible: 15,
    });
  }

  // 5. Referrer-Policy - 15 points
  const refPol = normalized["referrer-policy"];
  if (refPol) {
    const securePolicies = [
      "strict-origin-when-cross-origin",
      "strict-origin",
      "no-referrer",
      "same-origin",
    ];
    if (securePolicies.includes(refPol.toLowerCase())) {
      auditedHeaders.push({
        header: "Referrer-Policy",
        value: refPol,
        status: "pass",
        importance: "Medium",
        description: "Controls how much referrer information is sent along with outbound requests.",
        recommendation: `Privacy-preserving Referrer-Policy active (${refPol}).`,
        pointsEarned: 15,
        pointsPossible: 15,
      });
      score += 15;
    } else {
      auditedHeaders.push({
        header: "Referrer-Policy",
        value: refPol,
        status: "warn",
        importance: "Medium",
        description: "Controls how much referrer information is sent along with outbound requests.",
        recommendation: `Policy (${refPol}) may leak URL paths or tokens across insecure channels. Consider 'strict-origin-when-cross-origin'.`,
        pointsEarned: 8,
        pointsPossible: 15,
      });
      score += 8;
    }
  } else {
    auditedHeaders.push({
      header: "Referrer-Policy",
      status: "fail",
      importance: "Medium",
      description: "Controls how much referrer information is sent along with outbound requests.",
      recommendation: "Missing Referrer-Policy. Set 'strict-origin-when-cross-origin' to protect sensitive URL parameters.",
      pointsEarned: 0,
      pointsPossible: 15,
    });
  }

  // 6. Permissions-Policy - 10 points
  const permPol = normalized["permissions-policy"] || normalized["feature-policy"];
  if (permPol) {
    auditedHeaders.push({
      header: "Permissions-Policy",
      value: permPol,
      status: "pass",
      importance: "Low",
      description: "Restricts browser device APIs such as camera, microphone, and geolocation.",
      recommendation: "Permissions Policy configured, constraining device sensor and hardware API access.",
      pointsEarned: 10,
      pointsPossible: 10,
    });
    score += 10;
  } else {
    auditedHeaders.push({
      header: "Permissions-Policy",
      status: "fail",
      importance: "Low",
      description: "Restricts browser device APIs such as camera, microphone, and geolocation.",
      recommendation: "Permissions-Policy not defined. Consider restricting unused device APIs (camera=(), microphone=(), geolocation=()).",
      pointsEarned: 0,
      pointsPossible: 10,
    });
  }

  // 7. Information Leakage Headers check
  const leakedInfoHeaders: Array<{ header: string; value: string }> = [];
  if (normalized["x-powered-by"]) {
    leakedInfoHeaders.push({
      header: "X-Powered-By",
      value: normalized["x-powered-by"],
    });
    score = Math.max(0, score - 5);
  }
  if (normalized["server"] && /\d/.test(normalized["server"])) {
    leakedInfoHeaders.push({
      header: "Server",
      value: normalized["server"],
    });
    score = Math.max(0, score - 5);
  }

  // Determine Letter Grade
  let grade: SecurityHeadersOutputData["grade"] = "F";
  if (score >= 95) grade = "A+";
  else if (score >= 85) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 55) grade = "C";
  else if (score >= 40) grade = "D";

  return {
    targetUrl,
    finalUrl,
    statusCode,
    grade,
    score,
    auditedHeaders,
    leakedInfoHeaders,
    rawHeaders,
    testedAt: new Date().toISOString(),
  };
}
