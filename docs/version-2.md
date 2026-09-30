# Version 2 — Tool Polish, History, AI Zone & Final Phases

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

Build order: tool polish (Network Tools, then CyberSec Tools) → sidebar +
History system → AI Zone (when you reach it, see its own section) →
debugging/testing → production/deployment. One prompt per tool, review the
diff, then move on — same discipline as every phase before this.

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
