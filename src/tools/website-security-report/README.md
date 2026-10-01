# Website Security Report (`#017`)

**Category:** `cybersecurity` | **Complexity:** `advanced` | **Requires Server:** `true`

## What it does

Runs four checks simultaneously against a single domain — DNS records, TLS certificate, HTTP security headers, and WHOIS registration age — and produces one composite letter grade (A+ → F).

## Architecture

| File | Role |
|------|------|
| `schema.ts` | Validates and sanitizes domain input (strips protocol prefix) |
| `compute.ts` | Pure function — aggregates sub-tool `PromiseSettledResult`s into a grade |
| `server.ts` | Orchestrates 4 sub-tools via `executeToolFrontDoor`; saves composite history once |
| `WebsiteSecurityReportTool.tsx` | Client UI — grade badge, 4 collapsible sub-sections |
| `types.ts` | `WebsiteSecurityReportData` and `SubToolResult` contracts |

## Critical Architecture Rule

`server.ts` **must not** import from any other tool folder. Sub-tools are invoked exclusively via `executeToolFrontDoor` from `@/core/tool-kit/runner`. This ensures zero inter-tool coupling.

## Grading Rubric

| Condition | Points Deducted |
|-----------|----------------|
| TLS expired or unavailable | -40 |
| TLS expiring soon (<30 days) | -15 |
| Security Headers grade F | -30 |
| Security Headers grade D | -20 |
| Security Headers grade C | -10 |
| Security Headers grade B | -5 |
| WHOIS domain age <30 days | -20 |
| DNS lookup failed | -10 |
