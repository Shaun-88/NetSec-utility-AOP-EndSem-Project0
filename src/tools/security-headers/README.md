# HTTP Security Header Analyzer

## Overview
The **HTTP Security Header Analyzer** audits, grades, and diagnoses website HTTP response headers against modern OWASP and RFC web security standards. It calculates an authoritative security posture grade from **A+ to F** and delivers concrete, copy-ready server configuration directives to remediate vulnerabilities.

## Plain-Language Security Model
- **The Browser Guardrails**: Security headers are direct safety instructions a web server delivers to a visitor's browser. They dictate what external scripts can execute, mandate encrypted HTTPS transport, and prevent deceptive clickjacking overlays.
- **Threats Mitigated**:
  - **Cross-Site Scripting (XSS)**: Mitigated by `Content-Security-Policy`.
  - **Clickjacking / UI Redressing**: Mitigated by `X-Frame-Options` and CSP `frame-ancestors`.
  - **SSL Stripping & Downgrade Attacks**: Mitigated by `Strict-Transport-Security` (HSTS).
  - **MIME Confusion & Drive-By Downloads**: Mitigated by `X-Content-Type-Options: nosniff`.
  - **Referrer Token & Privacy Leakage**: Mitigated by `Referrer-Policy`.
  - **Device Sensor Exploits**: Mitigated by `Permissions-Policy`.
  - **Version Fingerprinting**: Penalizes `X-Powered-By` and `Server` headers leaking software versions.

## Grading Rubric
- **Grade A+ (95–100 pts)**: Hardened configuration with strict CSP, long-term HSTS (`includeSubDomains`), frame defense, MIME protection, and zero information leakage.
- **Grade A (85–94 pts)**: Strong baseline defense covering all primary browser security headers.
- **Grade B (70–84 pts)**: Good posture, but missing secondary modern headers (e.g. Permissions-Policy) or containing minor warnings.
- **Grade C (55–69 pts)**: Vulnerable posture lacking fundamental controls like CSP or HSTS.
- **Grade D (40–54 pts)**: Weak posture with only 1–2 headers present.
- **Grade F (0–39 pts)**: Defenseless against browser-side injection and clickjacking attacks.

## Security Controls (Architecture Contract §6.1)
- **SSRF Defense**: Target hostnames and URLs are strictly resolved and validated using `core/security/safe-fetch.ts` to block internal networks (RFC 1918), loopback, link-local, and cloud metadata services.
- **Compute Invariant**: `compute.ts` evaluates header rules, point allocations, and remediation suggestions as a 100% pure function with no side-effects or I/O.
