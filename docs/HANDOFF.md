# Handoff: Big Bro's NetSec Armoury
**Target Agent:** Claude Opus  
**Context:** This document outlines the architecture, rules, and current state of the NetSec Armoury project. 

---

## 1. Project State
**Built & Working (Production Ready):**
- **18 Modular Tools:** A fully functioning suite of network diagnostics, cryptography, and cybersecurity tools (DNS Lookups, Ping, Subnet Calculators, Breach Checkers using RapidAPI, etc.).
- **The AI Zone ("Big Bro"):** An integrated LLM mentor that reads tool outputs and helps users patch vulnerabilities.
- **Commander's Quarters:** A PIN-protected admin dashboard featuring live telemetry, rate-limit tracking, and error scanning.
- **Core Systems:** User authentication, secure database history logging, global rate-limiting (Upstash Redis), and Vercel Analytics integration. 
- **CI/CD Pipeline:** The Vercel build pipeline is 100% green (Zero ESLint/TypeScript errors, passing Vitest suite).

**Half-Done / Just Started:**
- **The Training Grounds (Sandbox):** We built the entry point (`src/components/TrainingGroundsDoor.tsx`) which lives on the home dashboard. Clicking it shows a cinematic loading screen and routes to `src/app/sandbox/page.tsx`.

**Not Started:**
- **The Interactive Sandbox Experience:** The actual content inside `src/app/sandbox/page.tsx` is completely empty (just placeholder text). This is where you will take over.

---

## 2. Architecture & Shared Systems
The app uses **Next.js 15 (App Router)**.
- **The Tool-Module Pattern:** Tools live in `src/tools/<tool-id>/`. Every tool is entirely isolated and must contain:
  - `schema.ts`: Zod validation for inputs.
  - `compute.ts`: Pure functions for logic (No I/O or network requests here).
  - `<ToolName>Tool.tsx`: The UI component.
  - `server.ts` *(Optional)*: For secure backend logic.
- **The Registries:** Tools are registered globally in `src/registry/tools.ts` (client) and `src/registry/tools.server.ts` (server). Do not hardcode tool lists elsewhere.
- **Tool Runner (`runner.ts`):** All server-side tools are executed via `executeToolFrontDoor` in `src/core/tool-kit/runner.ts`. This single file handles timeouts, Redis rate limiting, and saves the result to the history database.
- **History & Auth:** Handled globally. Tools do not need to implement their own save-to-database logic; the runner does it.

---

## 3. Strict Conventions (From AGENTS.md)
* **Isolation Rule:** A file in `src/tools/A/` must **never** import from `src/tools/B/`. Shared logic goes in `src/core/`.
* **SSRF Protection:** Any server-side request to a user-supplied URL must use the custom `safeFetch` abstraction (in `src/core/security/safe-fetch.ts`) to prevent internal network scanning.
* **Privacy by Design (K-Anonymity):** Passwords and sensitive data must be hashed client-side using WebCrypto before being sent to the server (as seen in the `pwned-password` tool).
* **Styling:** The theme is "Cyber-Military" (Watch Dogs / Asus Armoury Crate vibes). Dark mode by default, Neon Green (`#00e575`) primary, Amber secondary. Use Tailwind.
* **Zero-Latency UI:** Bind cosmetic clicks to `onMouseDown` (not `onClick`) for zero perceivable latency.

---

## 4. Known Bugs & Shortcuts
- **Vitest JSDom Canvas Warnings:** Running tests will throw a wall of `HTMLCanvasElement.prototype.getContext Not implemented` warnings in the console due to the boot screen UI. The tests still pass, but it's noisy.
- **React Hook Overrides:** In `src/app/command-center/page.tsx`, there is an `eslint-disable-next-line react-hooks/exhaustive-deps` used on the key-capture `useEffect`. It is architecturally safe, but it is technically a shortcut.
- **Favicon:** We manually placed `icon.jpg` in `src/app/`. Next.js handles it, but typically this is an `.ico` or `.png`.

---

## 5. Run, Test, & Deploy
- **Local Dev:** `npm run dev`
- **Linting & Types:** `npm run lint` and `npm run typecheck`
- **Tests:** `npm run test`
- **Build (Simulate Vercel):** `npm run build`
- **Deployment:** Pushing to `main` branch automatically triggers Vercel.

**Required Environment Variables (No values provided):**
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `COMMANDER_PIN`
- `RAPIDAPI_KEY`

---

## 6. Where We Stopped & Next Task
**Last Task Finished:** We completely sanitized the codebase of all Next.js 15 build errors, wired up Vercel Analytics, created the BRD document, and built the cinematic "Training Grounds" gateway button on the home page. The GitHub CI and Vercel builds are currently flawless.

**Your Next Task:** You will be building out the **Training Grounds (Sandbox)**. 
The user wants a "modern interactive video-based scrolled web page which is basically a scrollable BRD document of the Sandbox." The user explicitly mentioned they want you (Opus) to build this interactive scroll experience inside `src/app/sandbox/page.tsx`.

---

## 7. The First 5 Files You Should Read
To immediately understand the project, read these files first:
1. `AGENTS.md` (The absolute laws of the repository)
2. `src/core/tool-kit/runner.ts` (The central nervous system of tool execution)
3. `src/registry/tools.ts` (To understand how tools are loaded into the UI)
4. `src/app/sandbox/page.tsx` (Your immediate workspace)
5. `src/tools/breach-checker/server.ts` (The gold standard example of a secure server-side tool module)
