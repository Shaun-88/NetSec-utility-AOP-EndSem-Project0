# AGENTS.md — The Big Bro's NetSec Armoury

Apply these to every task in this repo. Full technical detail lives in
`docs/architecture.md`; the narrative version is `docs/project-brief.md`.
Read both before implementing anything non-trivial — these are the rules to
keep in mind at all times, even in small edits.

## Scope of a task
- Work on exactly what the current prompt asks for. "Add tool X" touches
  only `src/tools/x/` and the registry files
  (`src/registry/tools.ts`, `src/registry/tools.server.ts`).
- Never modify another tool's folder, `core/`, or shared components as a
  side effect. If a change genuinely requires touching shared code, say so
  explicitly and explain why, rather than doing it silently.

## Architecture invariants (do not violate)
- A file under `src/tools/<A>/` must never import from `src/tools/<B>/`
  (A != B). Shared logic belongs in `src/core/`.
- `src/core/**` must never import from `src/tools/**`.
- Every tool folder matches `src/tools/_template/`: `index.ts`,
  `<Id>Tool.tsx`, `schema.ts`, `compute.ts`, `types.ts`, tests, `README.md`,
  and `server.ts` only if the tool needs a backend.
- `compute.ts` is a pure function (raw input/data -> tool output). No
  network, DNS, or file I/O inside it.
- `ToolResult`/`ToolDefinition` shapes are defined once in `src/core/`. Do
  not redefine or fork them per tool.

## Security — non-negotiable
- Any server-side request to a user-supplied URL or hostname goes through
  `core/security/safe-fetch.ts`. Never call `fetch()` directly on
  user-supplied input.
- The Port Checker additionally uses a port allow-list and a tighter,
  tool-specific rate limit — see `docs/architecture.md` section 6.2.
- No secret, API key, or credential is ever read in a client component or
  anything under `src/tools/*` UI code. Server-only key access uses the
  `server-only` package.
- Every tool input is validated with its `schema.ts` (zod) before use.
- Every database query touching `tool_history` or `users_profile` filters
  by the authenticated `user_id`. Never trust a client-supplied user id.
- Do not commit real secret values, ever — only add names to `.env.example`.

## When adding a new tool
1. Copy `src/tools/_template/` to `src/tools/<id>/`.
2. Implement `schema.ts`, `compute.ts`, `server.ts` (if needed), the UI,
   tests, and `README.md`.
3. Add one entry to `src/registry/tools.ts` and, if server-backed, one to
   `src/registry/tools.server.ts`.
4. Do not touch the sidebar, Home page, or Account page code — they read
   from the registry automatically.
5. Before finishing, check that the diff only includes the new folder and
   the registry line(s).

## Testing
- New pure logic (`compute.ts`, `safe-fetch.ts`) needs unit tests with
  mocked/fixture data — no real network calls in tests.
- New API routes need a test for: valid input, invalid input, and
  unauthenticated access.
- Anything touching `tool_history` or `users_profile` needs a test proving
  one user cannot read or affect another user's rows.

## Style (see docs/project-brief.md section 7 for the full direction)
- Dark theme by default (near-black background, terminal green primary
  accent, amber secondary accent), with a light-mode toggle.
- Clean modern sans-serif typography everywhere — no monospace, including
  tool output.
- Keep glow/scanline texture subtle and confined to accents, not full-screen.

## General style
- TypeScript strict mode. No `any` without a comment explaining why.
- Prefer explicit, boring code over clever abstractions — this needs to stay
  readable and maintainable by one person.
