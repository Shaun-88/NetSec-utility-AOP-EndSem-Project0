# Version 2 — Pre-Load Experience, Tool Polish, History, AI Zone & Final Phases

Addendum to `docs/project-brief.md` and `docs/architecture.md`, not a
replacement — read those first. This assumes Phases 1-5 already exist and
work (auth, database, all 13 tools built).

**Running theme for every tool below:** this app is being used by people
without an IT background, not just students who already know what a
subnet or a hash is. So alongside whatever else is listed, **every single
tool gets a short, plain-language description of what it does and why
someone would use it** — written for a first-time visitor, not a
classmate. Put this above or beside the tool's input form, not buried in a
tooltip.

Build order: pre-load visual experience → tool polish (Network Tools, then
CyberSec Tools) → sidebar + History system → AI Zone (when you reach it,
see its own section) → debugging/testing → production/deployment. One
prompt per tool/section, review the diff, then move on — same discipline as
every phase before this.

---

## Pre-Load Visual Experience

A visual-enhancement pass on everything between opening the site and
landing on Home. **Keep the existing color theme exactly as-is** (near-black
background, terminal green primary accent, amber secondary, clean
sans-serif typography, no monospace) — this is about animation and
interactivity, not a redesign. **Take a screenshot after each visual change
and visually verify it before moving on** — don't just confirm the code
compiles.

### 0. Press-to-start gate screen (new — precedes the boot loading screen)

This exists specifically to solve a real technical constraint: browsers
block audio from auto-playing with sound until the user has interacted with
the page. Rather than a muted-by-default toggle, a deliberate "press to
start" gate both solves this cleanly and reads as an intentional design
choice.

- Same visual theme and particle-animation style as the boot screen, but at
  a calm/idle state — low particle density, slow movement, essentially a
  resting version of the boot screen's visual.
- A clear prompt, e.g. "Press Enter to begin" or a styled button.
- The click/keypress does two things: (1) starts the boot loading sequence,
  and (2) unlocks the background music to play at full volume from that
  point on — the interaction itself satisfies the browser's audio
  permission requirement, so no mute toggle is needed.
- Optional nice-to-have: begin real background initialization (session
  check, config load) silently during this screen, so the boot sequence
  that follows already has a head start by the time the user presses start.

### 1. Boot/loading screen (enhance existing)

- Add a particle animation system in the background. At low progress
  (~0%), particles are sparse and barely moving. As progress increases,
  particle count and movement speed increase proportionally. At 100%,
  trigger a "clean blast" transition — particles burst outward in a brief
  radial flash — as the screen transitions to the sign-in page.
- Background music plays here, unlocked by the press-to-start screen.
- Timing logic (carried over from the original spec, restated for
  clarity): the screen only reaches 100% once real asset loading is
  actually complete **and** at least 10 seconds have elapsed, whichever is
  longer (`Math.max(realLoadTime, 10000)`). If real loading finishes before
  10 seconds, the progress animation continues smoothly toward 100% rather
  than jumping there early and sitting still.
- Keep the existing skip-loading-screen option on this screen — don't
  remove it.

### 2. Sign-in page

- Add an animated background consistent with the existing theme
  (implementer's creative judgment on the specific effect, as long as it
  matches the established palette and mood).
- Add the standard "already have a session" flow: if a valid existing
  session is detected, show "Continue as [name]" and "Sign in with a
  different account" instead of immediately showing just the Google
  sign-in button.

### 3. Post-login transition (new)

- After successful Google sign-in, show a brief "Login successful"
  confirmation, followed by a short transition (a few seconds) during which
  the user's profile/history is loaded from Neon, before proceeding to the
  Home page.
- **Do not add a skip option to this transition** — unlike the boot loading
  screen, this one should not be skippable.

**Recommended model for this section specifically:** Gemini 3.1 Pro
(High) — it tends to produce the strongest visual output in head-to-head UI
comparisons, and pairs natively with Antigravity's browser-screenshot
verification loop, which matters a lot for a section this visual.

---

## Network Tools

### Internet Speed Test
- **Description:** plain-language explainer — what a speed test measures
  and, simply, how this site estimates it (times how fast it can send/
  receive data to/from a server — no need to get more technical than that).
- **Display:** a speedometer-style animation as the primary *visual*
  element (it's decorative/approximate, not the precise reading), paired
  with an **exact numeric readout** next to it. Add a **Mbps/Gbps toggle**
  so the exact number can be viewed in either unit.
- **Test behavior:** one click runs **both** download and upload, each
  sampled for **at least 10 seconds**, not a quick snapshot.
- **Graphs:** a separate line graph for download and for upload, showing
  throughput over the test duration (this was already planned — carries
  over from the original spec).
- **Result labeling:** beyond the existing Good/Medium/Bad rating, add
  practical categories the result qualifies for — e.g. "Good for gaming,"
  "Good for 1080p streaming," "Good for 4K streaming," "Good for video
  calls" — so a non-technical user knows what the number actually means
  for them, not just whether it's abstractly "good."

### IP Lookup
- **Description:** plain-language explainer of what an IP lookup shows and
  why (roughly: your public IP is like your internet "return address";
  this looks up general info tied to it).
- **Accuracy:** improve geolocation accuracy where the data source allows
  it — this depends on the underlying geo-IP service's own precision, so
  frame it as "as accurate as the data source provides," not a promise of
  exact location.
- **Map:** add a map showing the approximate location alongside the
  existing coordinates. **Recommendation: use an OpenStreetMap embed**
  (a plain iframe keyed to lat/long) rather than Google Maps — it needs no
  API key, no billing setup, and no new environment variable, which keeps
  this addition simple given how much credential setup this project
  already has. If a Google Maps look is specifically wanted instead, that
  needs its own API key and billing-enabled Google Cloud project — flag
  this back before building it that way, since it's a real extra setup
  step versus the OSM option.

### DNS Lookup
- **Description + record-type explanations:** alongside the existing
  lookup, add short plain-language explanations of what each record type
  means (A = the website's address, MX = where its email goes, TXT = a
  free-text record often used for verification, CNAME = an alias to
  another domain, etc.) — shown near each record type in the results, not
  as a separate wall of text.

### Subnet Calculator
- **Description:** plain-language explainer of what a subnet is and why
  someone would calculate one.
- **Technical accuracy:** review edge cases (`/0`, `/31`, `/32`, invalid
  input) against the existing unit tests and tighten anything found
  lacking.

### Port Checker
- **Description + port explanations:** explain what a "port" is in simple
  terms, and what each port in the existing allow-list is normally used
  for (80/443 = websites, 22 = remote server access, 25 = email, etc.).
- **Guide:** a short "what to actually do with this" note — e.g. "check
  this if you're trying to confirm your own server is reachable."
- **Technical accuracy:** double-check the allow-list checks are behaving
  correctly against real open/closed/filtered ports.

### Ping/Latency Checker
- **Description:** plain-language explainer of what latency/ping means and
  why it matters (roughly: how quickly your connection gets a response —
  lower is better, especially for gaming/calls).
- **Guide:** a short note on how to read the result (median vs. jitter, and
  what counts as "good" for different uses).
- **Technical accuracy:** review the sampling logic for consistency.

---

## CyberSec Tools

### Password Generator
- **Description:** plain-language explainer of why a generated password is
  safer than one a person makes up themselves.

### Password Strength Checker
- **Description + terms explained:** explain **entropy** in plain words
  (roughly: a measure of how hard the password is to guess — higher is
  better) and any other jargon currently shown (e.g. "crack time
  estimate").
- **Recommendations:** concrete, actionable tips shown with the result
  (already planned in the original tool spec — reinforcing it here since
  it pairs directly with explaining entropy).

### Hash Generator
- **Description + guide — priority.** This is one of the least
  intuitive tools for a non-IT visitor, so give real weight here: explain
  what a hash actually is (a fixed-length "fingerprint" of some data — the
  same input always gives the same hash, and changing even one character
  changes it completely), why someone would generate one, and a short
  example of a real use case (e.g. "used to verify a file wasn't
  tampered with").

### JWT Decoder
- **Description + guide:** explain what a JWT is in plain terms (a small
  signed package of data websites use to keep you logged in) and what the
  header/payload sections mean.
- **Technical accuracy:** verify decoding handles malformed/non-JWT input
  gracefully rather than crashing or showing a confusing error.

### File Hash Checker
- **Description + guide:** explain the real-world use case in plain terms
  — confirming a downloaded file wasn't corrupted or tampered with.
- **Sample files:** host 2-3 small sample files (e.g. under `public/`) that
  users can download, along with their known correct hash shown on the
  page. This lets a first-time visitor actually try the tool end-to-end
  (download the sample, re-upload it, see the hash match) instead of
  needing their own file to test with. A tampered/corrupted second
  version of one sample (with a hash that won't match) is worth adding
  too, so users can also see what a *mismatch* looks like.

### Security Header Analyzer
- **Description + guide:** explain what security headers are and why
  they matter in plain terms (small settings a website sends that tell
  your browser how to protect you), plus how to read the grade shown.
- **Technical accuracy:** review the current header-grading rules for
  correctness against current best-practice guidance.

### Binary ⇄ Text Converter
- **Description:** plain-language explainer of what binary is and why
  converting between it and text is a thing people do (e.g. as a learning
  tool for how computers represent text).

---

## New Tools — Breach Checker, TLS Checker, WHOIS, Composite Security Report

Four new additions beyond the original 13 tools, aimed at making the
toolkit feel like a cohesive service rather than a list of utilities. All
four follow the same tool-folder contract as every existing tool
(`docs/architecture.md` §3) — same plain-language-description requirement
as everything in this document, same visual/UI patterns as the existing
tools (reuse existing components: result cards, the letter-grade badge
style already built for Security Header Analyzer, etc.) — nothing about
these should look or feel bolted-on.

### Breach Checker (new — CyberSec Tools)
- **What it does:** checks whether an entered email appears in any known,
  already-public data breach, via the free Have I Been Pwned API (no key
  needed for the breach-search endpoint used here).
- **Description:** plain-language explainer of what a "breach" is, and the
  honest caveat that a clean result means "not found in a known breach,"
  not a guarantee of safety — some breaches are never publicly disclosed.
- **Result:** list of breaches found (name, date, what categories of data
  were exposed — never actual leaked values, HIBP doesn't return those
  anyway). Each result that involved exposed passwords links directly to
  the Password Generator, with copy like "change this password — and
  anywhere else you reused it."
- **Database/history handling — important:** this is the most sensitive
  tool in the catalog (it's about personal exposure, not a technical
  check). The existing 2-day auto-delete (already specified under History
  system) applies here with **no exception** — don't add any special
  longer retention for this tool's results, even though the temptation
  with "security" tools is often to keep more history, not less.

### TLS/SSL Certificate Checker (new — CyberSec Tools)
- **What it does:** issuer, validity dates, days-until-expiry, and
  protocol version for a domain's TLS certificate, via Node's built-in
  `tls` module — no external API needed.
- **Description:** plain-language explainer of what a TLS certificate is
  and why its expiry date matters (an expired certificate breaks HTTPS for
  visitors).
- Uses `safeFetch`/the same connection-safety principles as other
  domain-checking tools — no connecting to arbitrary internal addresses.

### WHOIS / Domain Lookup (new — Network Tools)
- **What it does:** registration date, registrar, and expiry for a domain,
  via RDAP (free, no key needed — IANA's bootstrap service or rdap.org).
- **Description:** plain-language explainer of what domain registration
  info shows and why someone would check it (e.g. "how old is this
  domain" is a common trust signal).

### Website Security Report (new — composite, lives under CyberSec Tools)

This is the flagship addition — not a new independent check, but one page
that runs DNS Lookup, Security Header Analyzer, the new TLS Checker, and
the new WHOIS tool together against a single domain, then shows one
combined report with an overall grade. This is what turns "a pile of
tools" into "a service that audits your site."

**Architecture — read carefully, this is the part that must be done
correctly:**
- This tool's `server.ts` **must not** import any other tool's folder
  directly (`src/tools/dns-lookup/**`, etc.) — that would violate the core
  "no tool imports another tool" rule in `docs/architecture.md` §1, and the
  ESLint boundary rule should catch it if attempted.
- Instead, it calls the **same shared execution function** that
  `core/tool-kit/runner.ts` already exposes and that the `/api/tools/
  [toolId]` route already uses internally — the one that looks up a tool in
  the registry and runs it. Call that shared function four times (once per
  underlying `toolId`: `dns-lookup`, `security-header`, `tls-checker`,
  `whois`), **in parallel** (`Promise.all`), not sequentially — the
  existing 8-second per-tool timeout means four sequential calls could
  otherwise take up to ~32 seconds.
- Each underlying call still runs through the full existing pipeline
  (validation, rate-limiting, its own history logging) exactly as if the
  user had run that tool individually — this is intentional, not a bug: it
  means the user's history also shows the four individual checks, and
  the composite report needs no special-case "don't log" logic anywhere in
  `core`.
- After all four return, compute one overall letter grade from their
  individual results (reuse the grading approach already built for
  Security Header Analyzer rather than inventing a second grading system),
  and save **one additional** `tool_history` entry for the composite
  report itself (`toolId: "website-security-report"`), with the four
  sub-results nested in its `data` field.
- **UI:** reuse the existing letter-grade badge component from Security
  Header Analyzer for the overall grade, and the existing result-card
  pattern for each of the four sub-sections — this page should look like a
  natural extension of the existing tools, not a new design.

### On AI Zone compatibility
No special integration work is needed for these four tools specifically.
Because they follow the same registry + `tool_history` pattern as every
other tool, they become automatically available to AI Zone's history-aware
features (tool guidance, on-request reports) once AI Zone itself is built
— same as the original 13 tools. Don't build any AI-specific code as part
of this section.

---

## Sidebar navigation — final order

```
Network Tools
CyberSec Tools
AI Zone
History
---
Settings
Account
```

This changes the two-dropdown sidebar from Version 1 back to include AI
Zone (reinstated after being dropped, then reconsidered — see below) and
adds a new **History** entry, placed **last** among the four main sections,
per direction. Settings and Account stay fixed at the bottom, unchanged
from before.

---

## History system

**Status check first:** confirm whether a History/Activity page currently
exists at all — Phase 3 only built the UI shell (sidebar, Home page), so
this page likely doesn't exist yet even though `tool_history` has been
recording data since Phase 2. Antigravity should check before assuming
it needs to "improve" something that isn't built yet.

**What it shows** (carried over from the earlier-agreed spec, now placed
in the sidebar per above):
- **List view:** tool name, target, timestamp.
- **Detail view:** clicking an entry expands the full stored result.
- **Filters/search:** by tool, by category, by date range, and a text
  search over the target field.
- **Stats:** a simple usage breakdown (e.g. runs per tool) over the
  retained window.

**Retention: 2-day auto-delete**, via a daily Vercel Cron job hitting a
protected purge route (`DELETE FROM tool_history WHERE ran_at < now() -
interval '2 days'`), verified via the `CRON_SECRET` pattern so the route
can't be triggered by an arbitrary visitor. A persistent banner on the
History page tells the user history is only kept for 2 days.

**Database confirmation:** the user has already added the Neon connection
details into the project's environment variables. Antigravity should
verify the existing `tool_history`/`users_profile` tables and connection
are actually working (e.g. a row appears after running any tool) before
building the History page on top of them.

---

## AI Zone

**Capabilities:**
1. **General Q&A** on networking/cybersecurity topics.
2. **Tool guidance** — can explain what a specific tool does and how to
   use it (this doubles nicely with the plain-language descriptions added
   to every tool above — the AI can expand on them conversationally).
3. **On-request reports** — when asked, summarizes the user's own history
   log (e.g. "what have I been checking lately," "summarize my recent
   security header results").

**On model choice and API setup — important process note:**
Don't pre-select a model or write API integration code assuming a specific
provider yet. **When this phase actually starts, Antigravity should guide
the user step-by-step through choosing an AI provider/model and setting up
the API key** (creating the account, generating the key, adding it to
`.env.local` and Vercel) — the same way earlier phases were walked through
interactively, rather than the user being handed a pre-made decision.
Antigravity should explain the trade-offs (cost, free-tier limits, setup
friction) for the realistic options (Anthropic, OpenAI, Google Gemini) and
let the user decide before writing any code that depends on the choice.

**Architecture note:** the original AI Zone contract (`/api/chat` shape,
system prompt scope, Vercel AI SDK usage) from before it was cut is still
valid and should be restored into `docs/architecture.md` as its own section
once the provider is chosen, rather than rebuilt from scratch.

---

## Final phases

1. **Debugging & testing** — the deeper verification pass deliberately
   saved until now: exercise the SSRF guard and Port Checker's allow-list
   against hostile input, confirm the History purge job and its auth check
   work as intended, confirm per-user data isolation holds across the
   full app (not just the routes tested in Phase 2), general bug fixing.
2. **Production & deployment** — final Vercel configuration check, confirm
   all environment variables are set for Production specifically (not just
   Development/Preview), a pass on the README for the GitHub showcase, and
   a final end-to-end walkthrough of the live site.
