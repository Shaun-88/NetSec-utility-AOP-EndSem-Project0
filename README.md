# The Big Bro's NetSec Armoury

> A modern, modular networking diagnostic and cybersecurity utility toolkit with an integrated AI intelligence hub, built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Drizzle ORM.

---

## 1. Overview

**The Big Bro's NetSec Armoury** is a web-based networking and cybersecurity platform designed to bundle essential diagnostics, cryptographic helpers, security analyzers, and AI guidance into a cohesive, production-grade workspace.

### Core Principle
> **Every tool is an independent module. All of them are deeply interconnected through one shared spine.**

Each tool possesses its own isolated UI, input validation schemas, and execution logic. Standardized results feed directly into a unified analytical spine, enabling historical auditing and contextual AI analysis without cross-module coupling.

---

## 2. Tool Catalog (18 Production Tools)

### 🌐 Network Diagnostics
1. **Internet Speed Test** — Real-time latency, download, and upload bandwidth measurement.
2. **IP Lookup** — Detailed public IP resolution, geolocation data, ASN, and ISP lookup.
3. **DNS Lookup** — Authoritative DNS record analysis (A, AAAA, MX, TXT, CNAME, NS, SOA).
4. **Subnet Calculator** — CIDR math, network and broadcast addresses, usable host ranges.
5. **Port Checker** — Target connectivity diagnostics with strict port allow-listing and SSRF protection.
6. **Ping / Latency Checker** — HTTP round-trip timing, jitter calculation, and statistical latency analysis.
7. **WHOIS / Domain Lookup** — Direct RDAP domain registration, expiry tracking, registrar, and nameserver audit.

### 🛡️ Cybersecurity Utilities
1. **Password Generator** — Cryptographically secure generator utilizing `crypto.getRandomValues`.
2. **Password Strength Checker** — Entropy scoring, pattern detection, and estimated crack time.
3. **Pwned Password Checker** — Zero-knowledge k-anonymity check against 900M+ leaked passwords via HIBP range API.
4. **Data Breach Checker** — Multi-source compromised account detection via XposedOrNot and HIBP v3.
5. **TLS/SSL Certificate Checker** — Direct socket inspection for issuer authority, expiry countdown, and cipher protocol.
6. **Website Security Report (Composite)** — Parallel orchestration of DNS, Security Headers, TLS, and WHOIS into a unified letter-grade audit.
7. **Security Header Analyzer** — Comprehensive HTTP security header assessment (CSP, HSTS, X-Frame-Options, Permissions-Policy).
8. **Hash Generator** — Multi-algorithm text hashing (MD5, SHA-1, SHA-256, SHA-384, SHA-512).
9. **File Hash Checker** — Direct file checksum verification across multiple digest algorithms.
10. **JWT Decoder** — Client-side header, payload, and claim inspection without remote transmission.
11. **Binary ⇄ Text Converter** — Bidirectional string and binary stream translation.

### 🧠 AI Intelligence Hub (AI Zone)
- Domain-specific cybersecurity and network engineering reasoning assistant powered by Google Gemini.
- Explains diagnostic findings, guides remediation, and provides telemetry-aware summaries over your personal audit history.

---

## 3. Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Validation:** [Zod](https://zod.dev/)
- **Database & ORM:** [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [Auth.js](https://authjs.dev/) (NextAuth v5 / Google OAuth with JWT sessions)
- **Testing:** [Vitest](https://vitest.dev/) + React Testing Library + JSDOM
- **CI/CD:** GitHub Actions + Vercel Deployment

---

## 4. Architecture & Security Invariants

- **Tool Isolation:** Tools under `src/tools/<id>/` never import from other tools.
- **Pure Compute:** All analytical computations (`compute.ts`) are pure, side-effect-free functions with 100% test coverage.
- **SSRF Hardening:** All outbound requests to user-supplied targets must route through `core/security/safe-fetch.ts` with IPv4/IPv6 private address blocklists.
- **Tenant Isolation:** All database records (`tool_history` and `users_profile`) are filtered strictly by authenticated `user_id`.

---

## 5. Getting Started

### Prerequisites
- Node.js `>= 20.0.0`
- npm `>= 10.0.0`

### Installation
```bash
# Clone the repository
git clone https://github.com/Shaun-88/NetSec-utility-AOP-EndSem-Project0.git
cd NetSec-utility-AOP-EndSem-Project0

# Install dependencies
npm install
```

### Environment Configuration
```bash
cp .env.example .env.local
```
Fill in your Postgres connection strings and OAuth credentials in `.env.local`.

### Development & Verification
```bash
# Start development server
npm run dev

# Run unit tests
npm run test

# Run ESLint boundary checks
npm run lint

# Run TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## 6. Project Roadmap
 
- [x] **Phase 1 — Foundation:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, ESLint architectural boundaries, Vitest test suite, Drizzle ORM.
- [x] **Phase 2 — Shared Systems:** Auth.js Google OAuth, route protection middleware, `safe-fetch.ts` SSRF guard engine, and unified tool runner.
- [x] **Phase 3 — UI Shell & Pre-Load Visuals:** Terminal bootloader, particle blast transitions, interactive gate audio unlock, and session memory.
- [x] **Phase 4 — Network Diagnostics:** Complete suite of 7 network tools (Speed Test, IP, DNS, Subnet, Port Checker, Ping, WHOIS).
- [x] **Phase 5 — Cybersecurity Utilities:** Complete suite of 11 cybersecurity tools (Passwords, Hashes, JWT, Headers, TLS, Breaches, Security Report).
- [x] **Phase 6 — AI Intelligence Zone:** Cybersecurity reasoning hub with telemetry history context powered by Google Gemini.
- [x] **Phase 7 — History & Audit Retention:** Per-user audit history with automated 48-hour purge cron.
- [x] **Phase 8 — Production & Deployment:** Production bundle optimization, clean typecheck, automated CI verification, and Vercel deployment.

---

## 7. License
MIT License. Crafted for security researchers, network engineers, and students.
