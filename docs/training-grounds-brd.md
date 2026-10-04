# Training Grounds — Business Requirements Document

## 1. Purpose

The Training Grounds is a simulated, interactive cybersecurity practice environment embedded within Big Bro's NetSec Armoury. It exists because reading about security is not the same as doing it. The Training Grounds lets users make mistakes, break things, and learn — without ever touching a real system.

## 2. The Problem

Most cybersecurity education is passive: slides, textbooks, and videos. When students finally encounter real threats, they have no muscle memory. Practising on live systems is dangerous and often illegal. There is no safe middle ground for beginners to build hands-on instincts.

## 3. Who It Is For

- Students learning cybersecurity fundamentals
- Developers who want to understand common attack vectors
- Anyone curious about how digital threats actually work

No prior experience required. If you can use the Armoury's tools, you can use the Training Grounds.

## 4. The Labs

Each lab is a self-contained, simulated exercise. Nothing connects to real servers or real data.

| Lab | What You Do | What You Learn |
|-----|-------------|----------------|
| **Phishing Spotter** | Examine simulated emails and URLs, flag the fakes | How to identify social engineering, spoofed domains, and deceptive formatting |
| **Crack-Time Lab** | Enter passwords and watch a simulated brute-force attack run against them in real time | Why password length and complexity matter more than special characters |
| **Mock Login** | Interact with a deliberately vulnerable login form and discover its weaknesses | Common authentication flaws: SQL injection patterns, weak session handling, missing rate limits |
| **Port Scan Sim** | Run a simulated port scan against a virtual server and interpret the results | How open ports expose services, and how firewalls reduce attack surface |

## 5. Safety Rules

- **Everything is simulated.** No lab sends traffic to any real server, domain, or network.
- **No real credentials.** Labs use generated dummy data. Users never enter their own passwords or personal information.
- **Sandboxed execution.** All lab logic runs client-side in the browser. There is no server-side attack simulation.
- **Guarded entry.** Every input is validated before processing, following the same Zod validation pattern used across the Armoury.

## 6. Architecture

- **Authentication:** Uses the same Google sign-in as the main Armoury. No separate accounts needed.
- **Progress tracking:** Lab completion status is saved per user in the existing database, extending the `tool_history` pattern.
- **Tech stack:** Same as the Armoury — Next.js 15, TypeScript, Tailwind CSS, deployed on Vercel.
- **Isolation:** The Training Grounds is a subpage (`/sandbox`), not a separate application. It shares authentication but does not import from or modify any tool module.

## 7. Scope and Limits

**What it does:**
- Four interactive labs covering phishing, passwords, authentication flaws, and network reconnaissance.
- Progress saved per user.
- Fully simulated — safe to use anywhere, on any network.

**What it does not do:**
- It does not teach offensive hacking or provide real exploit tools.
- It does not connect to external systems or scan real infrastructure.
- It is not a certification platform — there are no grades or formal assessments.

**What comes next:**
- Additional labs based on user feedback (XSS simulation, header analysis challenges).
- A challenge mode with timed exercises.
- Leaderboards for competitive practice.
