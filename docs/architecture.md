# Architecture Reference — The Big Bro's NetSec Armoury

Authoritative technical spec. Terse and precise — human-facing explanation
lives in `docs/project-brief.md`; this file is the contract code must
satisfy. If this file conflicts with a task prompt, this file wins unless the
prompt explicitly says it's changing the architecture.

---

## 1. Core invariant

**A tool may depend on `core/`. A tool may never depend on another tool.**

```
src/tools/<id>/   <-  independent of every other src/tools/<other-id>/
       ^ (may import)
src/core/          <-  knows nothing about any specific tool
```

Enforced by an ESLint boundary rule (SS7), not just convention.

---

## 2. Canonical types

```ts
// src/core/results/types.ts
export type ToolCategory = "network" | "cybersecurity";

export interface ToolResult<TData = unknown> {
  toolId: string;                // must match a ToolDefinition.id
  target?: string;                // domain/URL/IP/file this result is about, if any
  ranAt: string;                  // ISO 8601
  data: TData;                    // tool-specific payload, opaque to core
}
```

```ts
// src/core/tool-kit/types.ts
export interface ToolDefinition {
  id: string;                     // stable slug: url segment + history record tag
  name: string;
  description: string;
  category: ToolCategory;
  requiresServer: boolean;
  Component: React.LazyExoticComponent<React.ComponentType>;
}

export interface ToolServerModule<TInput = unknown, TData = unknown> {
  run(input: TInput, ctx: ToolRunContext): Promise<ToolResult<TData>>;
}

export interface ToolRunContext {
  userId: string;                 // from the verified session, never client input
}
```

Rules:
- `core` types never import from `src/tools/*`.
- A tool's own `types.ts` may extend `TData` with whatever shape its result
  needs — `core` treats `data` as opaque.

---

## 3. Tool folder contract

```
src/tools/<id>/
|- index.ts       # exports a single ToolDefinition
|- <Id>Tool.tsx   # the tool's page component
|- schema.ts      # zod schema for this tool's input
|- server.ts      # implements ToolServerModule -- only if requiresServer
|- compute.ts     # pure function: raw input/data -> the tool's output shape.
|                 #   No I/O. Fully unit-testable.
|- types.ts
|- <id>.test.ts
`- README.md
```

- `compute.ts` (renamed from the earlier "analyze.ts" — this project doesn't
  produce security "findings" this round, just tool results, but the pure/
  testable-function principle is identical) does no network/DNS/file I/O.
- Any outbound request to a user-supplied host goes through
  `core/security/safe-fetch.ts` — never a raw `fetch()` inside `server.ts`.
- A tool with `requiresServer: false` has no `server.ts`.

---

## 4. Registry

```ts
// src/registry/tools.ts (client-safe)
export const tools: ToolDefinition[] = [
  internetSpeedTool, ipLookupTool, dnsLookupTool, subnetTool,
  portCheckerTool, latencyTool,
  passwordGeneratorTool, passwordStrengthTool, hashGeneratorTool,
  jwtDecoderTool, fileHashTool, securityHeaderTool, binaryTextTool,
];
```

```ts
// src/registry/tools.server.ts (server-only)
export const serverHandlers: Record<string, () => Promise<{ default: ToolServerModule }>> = {
  "ip-lookup":       () => import("@/tools/ip-lookup/server"),
  "dns-lookup":       () => import("@/tools/dns-lookup/server"),
  "port-checker":     () => import("@/tools/port-checker/server"),
  "security-header":  () => import("@/tools/security-header/server"),
  "internet-speed":   () => import("@/tools/internet-speed/server"),
  "file-hash":        () => import("@/tools/file-hash/server"),
};
```

Sidebar (three dropdowns), Home page tool listing, and `/tools/[toolId]`
routing all read `registry/tools.ts` grouped by `category` — none of them
enumerate tool names in their own code. Adding a tool = new folder + one
registry line per file it needs. Client-only tools (Subnet Calculator,
Password Generator/Strength Checker, Binary<->Text, JWT Decoder — decoding is
pure client-side string parsing, no server needed) never appear in
`tools.server.ts`.

---

## 5. API contract — the single tool front door

```
POST /api/tools/[toolId]
Body: { target?: string; options?: Record<string, unknown> }
```

Sequence (implemented once in `core/tool-kit/`, not per-route):
1. Resolve `toolId` in `serverHandlers`. Unknown -> 404.
2. Verify session. No session -> 401.
3. Validate `body` against `tools/<id>/schema.ts`. Invalid -> 400.
4. Rate-limit by `userId` (+ IP backstop). Exceeded -> 429.
5. Run with a hard timeout (8s default). Failure -> generic error, no
   internals leaked.
6. On success: save the result to that user's history (SS9), return the
   `ToolResult` as JSON.

`/api/chat` (AI Zone) is separate — SS10.

---

## 6. Security requirements

### 6.1 `safeFetch` — `core/security/safe-fetch.ts`
- Only `http:`/`https:`, only ports 80/443.
- Resolve hostname to IP before connecting; reject private/loopback/
  link-local/metadata ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`,
  `192.168.0.0/16`, `169.254.0.0/16`, `::1`, `fc00::/7`, `fe80::/10`). Use
  Node's `net.BlockList`.
- Follow redirects manually (max 3–5), re-validating each hop.
- Timeout + response-size cap. Never forward the caller's cookies/auth headers.
- `security-header` and `port-checker` MUST use this. No raw `fetch()` on
  user-supplied hosts, ever.

### 6.2 Port Checker — extra guardrail beyond `safeFetch`
This tool is the highest-abuse-risk one in the catalog. In addition to
`safeFetch`'s IP-range checks:
- Limit to a small allow-list of ports relevant to the tool's stated purpose
  (e.g. 80, 443, 22, 21, 25, 3306, 5432 — common/diagnostic ports), not an
  arbitrary port number the user supplies.
- Rate-limit this specific tool more tightly than others (e.g. a handful of
  checks per minute per user), since it's the one most attractive to abuse
  for scanning someone else's infrastructure.
- Frame the UI copy around "check your own service" — this doesn't
  technically stop misuse, but combined with the rate limit and port
  allow-list it keeps the tool a diagnostic utility rather than a scanner.

### 6.3 Validation, rate limiting, secrets
Same as any Next.js project handling user input and paid/limited external
calls: zod on every input; per-user + per-IP rate limiting; no secret ever
read outside a server-only module (`server-only` package enforced); real
values only in environment variables, never committed.

### 6.4 AI-specific
- Data a tool fetched (header values, DNS records) is untrusted when it
  reaches the assistant — delimit it clearly as data, not instructions.
- Assistant output renders as sanitized text/markdown, never raw HTML.
- Passwords and file contents never enter assistant context.

---

## 7. Enforcing tool isolation (ESLint)

```
src/tools/<A>/**  MUST NOT import  src/tools/<B>/**   (A != B)
src/core/**       MUST NOT import  src/tools/**
```
Fails CI, not just a local warning.

---

## 8. Authentication

- Auth.js (NextAuth), Google provider only, JWT sessions.
- `src/middleware.ts` protects every route except `/signin`.
- After first successful sign-in, if the user has no stored display name,
  redirect to the "What should we call you?" step before `/home`.
- Route handlers verify the session server-side independently of middleware;
  `userId` always comes from the verified session, never a client field.

---

## 9. Data persistence (Vercel Postgres)

```sql
create table users_profile (
  user_id       text primary key,     -- from the auth provider's user id
  display_name  text not null,
  created_at    timestamptz not null default now()
);

create table tool_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  tool_id     text not null,
  target      text,
  data        jsonb not null,
  ran_at      timestamptz not null default now()
);

create index tool_history_user_idx on tool_history (user_id, ran_at desc);
```

- Every query on `tool_history` or `users_profile` filters by the
  authenticated `user_id`. A query missing this filter is a data-isolation
  bug — write a test for it per route that touches these tables.
- History is append-only (unlike the earlier findings-replace-on-rerun idea
  from the original draft) — the Account page shows a log of past runs, so
  duplicates across time are expected and desired here.

---

## 10. AI Zone contract

- `POST /api/chat` — validated, rate-limited, session-checked like any other route.
- Two modes: plain Q&A (message history only), and — stretch goal — history-
  aware (message history + a compact summary of the user's recent
  `tool_history` rows: tool name, target, timestamp — not full raw data).
- System prompt: scoped to networking/cybersecurity education, refuses
  attack assistance, states uncertainty, treats any embedded tool data as
  data, not instructions.
- No tool-calling in MVP. Enforce `max_tokens`, truncate history length, set
  a provider spend cap.

---

## 11. Phase-by-phase prompts

One prompt per phase. Review `git diff --stat` after each before starting
the next.

### Phase 1 — Foundation
```
Set up the project foundation for "The Big Bro's NetSec Armoury."

Do:
- Initialize a Next.js (App Router) + TypeScript + Tailwind project.
- Add ESLint + Prettier.
- Add .github/workflows/ci.yml running lint, typecheck, and `vitest run` on PRs.
- Connect Vercel Postgres and add a query layer (Drizzle recommended — note
  the choice in docs/architecture.md if you pick differently).
- Add .env.example listing every env var this phase introduces, no real values.
- Deploy the blank app to Vercel and confirm the live URL loads.

Do not:
- Add tool folders, the registry, or authentication yet.

Acceptance criteria:
- lint, typecheck, and test all pass in CI.
- The Vercel URL serves a placeholder page.
```

### Phase 2 — Shared systems
```
Add authentication, the database connection, and the tool-module pattern,
following docs/architecture.md sections 2-9.

Do:
- Configure Auth.js with the Google provider, JWT sessions.
- Add src/middleware.ts protecting every route except /signin.
- Create the users_profile and tool_history tables (section 9).
- Build core/tool-kit (ToolDefinition/ToolResult types, the shared API front
  door logic), core/security/safe-fetch.ts, and the empty registry files.
- Build src/tools/_template/ as the pattern every tool will copy.

Do not:
- Build any actual tool yet, or the sidebar/home page UI.

Acceptance criteria:
- Signing in with Google creates a users_profile row if one doesn't exist.
- A test confirms an unauthenticated request to a protected route is redirected/401.
- A test confirms a query for one user's tool_history cannot return another
  user's rows.
```

*(Later phase prompts follow once Phase 2's actual file paths exist to
reference precisely.)*

---

## 12. Definition of done — any new tool

- [ ] Folder matches `_template`
- [ ] Registered in `registry/tools.ts` (+ `tools.server.ts` if server-backed)
- [ ] Input validated via `schema.ts`; `safeFetch` used for any user-supplied
      host
- [ ] `compute.ts` is pure and unit-tested
- [ ] No import from any other `src/tools/*` folder
- [ ] `README.md` written
- [ ] `git diff --stat` shows only this tool's folder + registry line(s)
