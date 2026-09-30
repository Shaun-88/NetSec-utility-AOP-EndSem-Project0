import type {
  HeaderAuditItem,
  SecurityHeadersOutputData,
} from "./types";

/**
 * Pure compute function for Security Header Analyzer.
 * Evaluates HTTP response headers against modern industry standards and RFC best practices.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeSecurityHeaderAudit(
  targetUrl: string,
  rawHeaders: Record<string, string>,
  statusCode: number,
  finalUrl: string = targetUrl,
): SecurityHeadersOutputData {
  // Normalize header keys to lowercase for case-insensitive lookup
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    normalized[key.toLowerCase()] = value;
  }

  const auditedHeaders: HeaderAuditItem[] = [];
  let score = 0;

  // 1. Content-Security-Policy (CSP) - 25 points
  const csp = normalized["content-security-policy"];
  if (csp) {
    const hasUnsafeInline = csp.includes("'unsafe-inline'") && !csp.includes("'nonce-") && !csp.includes("'sha256-");
    const hasUnsafeEval = csp.includes("'unsafe-eval'");

    if (hasUnsafeInline) {
      auditedHeaders.push({
        header: "Content-Security-Policy",
        value: csp,
        status: "warn",
        importance: "Critical",
        description: "Restricts sources of executable scripts, stylesheets, and network requests.",
        recommendation: "CSP is active but contains 'unsafe-inline' without nonces or cryptographic hashes. Attackers can still inject inline scripts.",
        remediationExample: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{RANDOM}'; style-src 'self';",
        pointsEarned: 15,
        pointsPossible: 25,
      });
      score += 15;
    } else if (hasUnsafeEval) {
      auditedHeaders.push({
        header: "Content-Security-Policy",
        value: csp,
        status: "warn",
        importance: "Critical",
        description: "Restricts sources of executable scripts, stylesheets, and network requests.",
        recommendation: "CSP contains 'unsafe-eval', which allows dynamic code execution (eval, new Function). Consider removing it if not strictly required.",
        remediationExample: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';",
        pointsEarned: 20,
        pointsPossible: 25,
      });
      score += 20;
    } else {
      auditedHeaders.push({
        header: "Content-Security-Policy",
        value: csp,
        status: "pass",
        importance: "Critical",
        description: "Restricts sources of executable scripts, stylesheets, and network requests.",
        recommendation: "Strict Content-Security-Policy configured. Provides high-tier defense against Cross-Site Scripting (XSS) and data injection.",
        remediationExample: "Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';",
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
      description: "Restricts sources of executable scripts, stylesheets, and network requests.",
      recommendation: "Missing Content-Security-Policy. Your site is exposed to Cross-Site Scripting (XSS), clickjacking, and rogue script injection.",
      remediationExample: "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';",
      pointsEarned: 0,
      pointsPossible: 25,
    });
  }

  // 2. Strict-Transport-Security (HSTS) - 20 points
  const hsts = normalized["strict-transport-security"];
  if (hsts) {
    const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    const hasSubDomains = /includesubdomains/i.test(hsts);

    if (maxAge >= 31536000 && hasSubDomains) {
      // 1 year + includeSubDomains
      auditedHeaders.push({
        header: "Strict-Transport-Security",
        value: hsts,
        status: "pass",
        importance: "High",
        description: "Forces web browsers to communicate exclusively over encrypted HTTPS connections.",
        recommendation: "Excellent HSTS deployment. Browser connections are locked to HTTPS with a long max-age (≥ 1 year) and subdomain coverage.",
        remediationExample: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        pointsEarned: 20,
        pointsPossible: 20,
      });
      score += 20;
    } else if (maxAge >= 31536000) {
      auditedHeaders.push({
        header: "Strict-Transport-Security",
        value: hsts,
        status: "pass",
        importance: "High",
        description: "Forces web browsers to communicate exclusively over encrypted HTTPS connections.",
        recommendation: "Strong HSTS policy active (max-age ≥ 1 year). Consider adding 'includeSubDomains' to protect subdomains against SSL stripping.",
        remediationExample: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
        pointsEarned: 18,
        pointsPossible: 20,
      });
      score += 18;
    } else {
      auditedHeaders.push({
        header: "Strict-Transport-Security",
        value: hsts,
        status: "warn",
        importance: "High",
        description: "Forces web browsers to communicate exclusively over encrypted HTTPS connections.",
        recommendation: `HSTS is present, but max-age (${maxAge}s) is shorter than the recommended 1 year (31,536,000s).`,
        remediationExample: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
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
      description: "Forces web browsers to communicate exclusively over encrypted HTTPS connections.",
      recommendation: "Missing HSTS header. Users are vulnerable to Man-in-the-Middle (MITM) attacks and unencrypted HTTP downgrade attacks.",
      remediationExample: "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
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
      description: "Controls whether your website can be embedded in <frame>, <iframe>, or <embed> elements.",
      recommendation: `Frame restriction active (${xfo}). Protects your users against Clickjacking and UI redressing attacks.`,
      remediationExample: "X-Frame-Options: DENY",
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else if (csp && csp.includes("frame-ancestors")) {
    auditedHeaders.push({
      header: "X-Frame-Options",
      value: "(Modern replacement: CSP frame-ancestors directive active)",
      status: "pass",
      importance: "High",
      description: "Controls whether your website can be embedded in <frame>, <iframe>, or <embed> elements.",
      recommendation: "Modern CSP frame-ancestors directive is active, providing superior clickjacking protection per W3C standards.",
      remediationExample: "Content-Security-Policy: frame-ancestors 'none';",
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else if (xfo && xfo.toUpperCase().startsWith("ALLOW-FROM")) {
    auditedHeaders.push({
      header: "X-Frame-Options",
      value: xfo,
      status: "warn",
      importance: "High",
      description: "Controls whether your website can be embedded in <frame>, <iframe>, or <embed> elements.",
      recommendation: "'ALLOW-FROM' is obsolete and ignored by all modern browsers. Use CSP 'frame-ancestors' instead.",
      remediationExample: "Content-Security-Policy: frame-ancestors https://trusted-partner.com;",
      pointsEarned: 5,
      pointsPossible: 15,
    });
    score += 5;
  } else {
    auditedHeaders.push({
      header: "X-Frame-Options",
      status: "fail",
      importance: "High",
      description: "Controls whether your website can be embedded in <frame>, <iframe>, or <embed> elements.",
      recommendation: "Missing X-Frame-Options. Malicious sites can embed your pages inside an invisible iframe to steal clicks (Clickjacking).",
      remediationExample: "X-Frame-Options: DENY",
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
      description: "Prevents browsers from MIME-sniffing a response away from its declared Content-Type.",
      recommendation: "'nosniff' directive active. Prevents browsers from misinterpreting text or image files as executable scripts.",
      remediationExample: "X-Content-Type-Options: nosniff",
      pointsEarned: 15,
      pointsPossible: 15,
    });
    score += 15;
  } else {
    auditedHeaders.push({
      header: "X-Content-Type-Options",
      status: "fail",
      importance: "Medium",
      description: "Prevents browsers from MIME-sniffing a response away from its declared Content-Type.",
      recommendation: "Missing X-Content-Type-Options. Browsers may execute user-uploaded files as HTML or JavaScript if MIME types are ambiguous.",
      remediationExample: "X-Content-Type-Options: nosniff",
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
        description: "Controls how much URL information is sent in the 'Referer' header when navigating away from your site.",
        recommendation: `Privacy-preserving Referrer-Policy active (${refPol}). Protects user browsing history and sensitive URL parameters.`,
        remediationExample: "Referrer-Policy: strict-origin-when-cross-origin",
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
        description: "Controls how much URL information is sent in the 'Referer' header when navigating away from your site.",
        recommendation: `Policy (${refPol}) is overly permissive and may leak sensitive URL path tokens or user IDs to external websites.`,
        remediationExample: "Referrer-Policy: strict-origin-when-cross-origin",
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
      description: "Controls how much URL information is sent in the 'Referer' header when navigating away from your site.",
      recommendation: "Missing Referrer-Policy. By default, browsers may send full URLs (including private queries or tokens) to external domains.",
      remediationExample: "Referrer-Policy: strict-origin-when-cross-origin",
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
      description: "Restricts access to browser hardware APIs such as camera, microphone, accelerometer, and geolocation.",
      recommendation: "Permissions Policy configured. Hardware sensor and device API access is strictly constrained.",
      remediationExample: "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
      pointsEarned: 10,
      pointsPossible: 10,
    });
    score += 10;
  } else {
    auditedHeaders.push({
      header: "Permissions-Policy",
      status: "fail",
      importance: "Low",
      description: "Restricts access to browser hardware APIs such as camera, microphone, accelerometer, and geolocation.",
      recommendation: "Permissions-Policy not defined. Consider restricting unused device APIs (camera, microphone, geolocation) to defend against rogue iframes.",
      remediationExample: "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
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
