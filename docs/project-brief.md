# Project Brief — The Big Bro's NetSec Armoury

Read this file first, in full, before implementing anything. Companion files:

- `docs/architecture.md` — the exact technical contract (types, folder rules,
  API behavior, security requirements, DB schema). Read before writing code.
- `AGENTS.md` (repo root) — short standing rules applied to every task.

This file explains what we're building and why it's shaped this way. The
others explain how to build it correctly.

---

## 1. What this is

**The Big Bro's NetSec Armoury** is a vibe-coding project: a complete,
deployed product, built with an AI coding agent (you), showcased on GitHub,
and live on Vercel. It's a single website bundling a set of networking and
cybersecurity utility tools behind one sign-in, with a dedicated AI assistant
for the same topics.

**Fixed constraints, not up for revisiting:**
- Fully web-based, deployed on **Vercel**.
- **GitHub** repo as the public showcase.
- No academic defense/viva — this is a portfolio product, judged on working
  well and looking good, not on being defensible to an examiner.

**Branding:** name is "The Big Bro's NetSec Armoury." Logo concept: a
noir-style silhouette of a cyber hat guy (fedora, trenchcoat-detective vibe,
rendered as a clean accent-color silhouette against the dark theme).

**Repository:**
- Local folder: `C:\Users\Shaun Dsilva\Documents\AOP-End-Sem`
- GitHub: https://github.com/Shaun-88/NetSec-utility-AOP-EndSem-Project0

---

## 2. The single most important design principle

**Every tool is an independent module. All of them are still deeply
interconnected through one shared spine.**

Each tool has its own UI, validation, and logic, and never reaches into
another tool's code. But every tool reports through the same result shape,
into the same per-user history, so adding or removing a tool is a small,
contained change — never a rewrite of shared parts. Full mechanics in
`docs/architecture.md` §2–4.

When a design choice is unclear, this principle is the tie-breaker.

---

## 3. What the user experiences

1. Opens the site → **loading screen**, minimum 20 seconds even if content is
   ready sooner (a deliberate branded moment, not a technical necessity —
   lean into the terminal-boot aesthetic here, see §7).
2. **Welcome + login page** → sign in with Google.
3. First-time only: **"What should we call you?"** prompt → this name is
   stored against their account and used across the app (greetings, header).
4. Lands on the **Home page**:
   - Persistent sidebar: three dropdown sections — **Network Tools**,
     **CyberSec Tools**, **AI Zone** — plus **Settings** and **Account** fixed
     at the bottom.
   - Fixed **search bar** at the top (searches across all tools by name).
   - Main area: rotating fun facts/trivia about networking, the internet, and
     cybersecurity, plus a browsable listing of all tools (so the home page
     works as a second way to reach tools, not just the sidebar).
5. Runs any tool → gets an immediate result → result is saved to that user's
   history/reports, viewable later from their account.
6. Opens **AI Zone** for general networking/cybersecurity Q&A, and — if time
   allows — to ask it to analyze their own history log.

---

## 4. Tool catalog

### Network Tools
- **Internet Speed Test** — download/upload estimate via timed transfer.
  *(Renamed from "WiFi Speed Test" — a website can only measure the internet
  connection it's running on, not the local WiFi radio link. Same tool,
  honest name.)*
- **IP Lookup** — public IP, approximate location, ISP
- **DNS Lookup** — DNS records (A, MX, TXT, etc.)
- **Subnet Calculator** — CIDR/subnet math, entirely client-side
- **Port Checker** — checks reachability of a specific port on **a domain the
  user provides as their own/a diagnostic target**, framed as a connectivity
  diagnostic. *(Not an open scanner of arbitrary third-party hosts — see
  `docs/architecture.md` §6 for why, and the guardrail this needs.)*
- **Ping/Latency Checker** — HTTP round-trip timing (median, best/worst,
  jitter) — not literal ICMP ping, which browsers can't send

### CyberSec Tools
- **Password Generator** — client-side, `crypto.getRandomValues`
- **Password Strength Checker** — client-side rating + crack-time estimate
- **Hash Generator** — MD5/SHA-1/SHA-256/etc. of user-entered text
- **JWT Decoder** — decodes header/payload of a pasted JWT (no signature
  verification needed for MVP — just readable decoding)
- **File Hash Checker** — hash of an uploaded file, for integrity checking
- **Security Header Analyzer** — grades a website's HTTP security headers
  *(this absorbs what was separately listed as "HTTP Header Checker" under
  Network Tools — same tool, one home, under CyberSec)*
- **Binary ⇄ Text Converter** — both directions, client-side

*(Dropped: an "accounts by email" lookup tool — this functions as an
OSINT/deanonymization tool and isn't something to ship. If an email-related
security tool is wanted later, a breach-check — "has this email appeared in
a known data breach" via the Have I Been Pwned API — is the legitimate
equivalent and can be added as a future tool.)*

### AI Zone
- General Q&A on networking/cybersecurity topics.
- Stretch goal (if time allows): the assistant can read the signed-in user's
  own tool-history log and answer questions about it ("what have I checked
  recently," "explain this result").

---

## 5. The shared spine

```
Individual Tool
      ↓ runs, returns a standard Result
Result { toolId, target, ranAt, data }
      ↓ saved to
Per-user History/Reports (in the database)
      ↓ readable from
Account page  ·  AI Zone (stretch goal, for context-aware answers)
```

Every tool returns the same shape (exact type in `docs/architecture.md` §2),
so new tools plug into the same history log and account view automatically.

---

## 6. Application flow & pages

```
Site opened → Loading screen (min. 20s) → Welcome + Google Sign-In →
"What should we call you?" (first time only) → Home →
Network Tools / CyberSec Tools / AI Zone / Settings / Account
```

Pages: `/signin` (public), `/welcome` (name prompt, first login only),
`/home`, `/tools/<toolId>` (one per tool, generated from the registry),
`/ai-zone`, `/account` (history/reports), `/settings`. Every page except
`/signin` is protected — signed-out visitors are redirected there.

---

## 7. Style direction

- **Palette:** near-black background (not pure black), terminal green as
  primary accent, amber as secondary accent (used for warnings/caution
  states so the two colors carry meaning), a distinct red for
  errors/high-severity results.
- **Typography:** clean modern sans-serif throughout — no monospace, even
  for tool output (data tables, hashes, decoded JWTs render in the same sans
  font as everything else).
- **Texture:** subtle — soft glow on the accent color for hover/active
  states and the logo; restrained scanline/CRT touches on accents, not the
  whole screen.
- **Dark by default, with a light-mode toggle.** Light mode is a genuine
  daytime reskin (off-white background, deeper/less-neon accent tones) —
  it doesn't try to preserve the full terminal mood, that's dark mode's job.
- **The loading screen is the one place to lean hardest into the terminal
  aesthetic** — e.g., a boot-sequence-style animation — since its minimum
  duration is a deliberate branded moment rather than a technical wait.

---

## 8. Tech stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · zod ·
Auth.js/NextAuth (Google provider, JWT sessions) · **Vercel Postgres** ·
Vitest + Playwright · Vercel AI SDK for AI Zone · GitHub Actions for CI ·
deployed on Vercel.

---

## 9. Security, non-negotiably

- Any server-side fetch of a user-supplied host (Port Checker, Security
  Header Analyzer) goes through the shared SSRF guard — never a raw fetch.
- No API keys or secrets in client code, ever.
- Every tool input validated with zod before use.
- Every database query on history/reports filters by the authenticated user.
- Passwords are never stored, logged, or sent to the AI assistant.
- Full detail: `docs/architecture.md` §6.

---

## 10. Current status & phase order

Nothing implemented yet. Work proceeds phase by phase, one prompt per phase,
each reviewed before the next starts:

1. **Foundation** — repo scaffold, Next.js + Tailwind + CI, blank page
   deployed to Vercel.
2. **Shared systems** — Google auth, Vercel Postgres connection, the
   tool-module pattern (registry + shared API front door + result/history
   types) that every later tool will follow.
3. **Login + Home + sidebar** — welcome/name-prompt flow, loading screen,
   the three dropdown sections, top search bar, fun-facts area.
4. **Network Tools.**
5. **CyberSec Tools.**
6. **AI Zone** (if time allows).
7. **Testing, debugging, polish.**

---

## 11. How to operate on this project

- Read `docs/architecture.md` before implementing anything beyond a trivial
  fix.
- Apply `AGENTS.md` to everything, every time.
- Treat §2 above (independent modules, deeply interconnected through one
  shared spine) as the tie-breaker whenever a design choice is unclear.
- Work one phase at a time. Confirm scope before changing anything outside
  what the current phase asks for.
