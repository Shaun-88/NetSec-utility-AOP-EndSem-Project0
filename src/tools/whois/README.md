# WHOIS / Domain Lookup (`#016`)

**Category:** `network` | **Complexity:** `basic` | **Requires Server:** `true`

## What it does

Shows domain registration info via the RDAP protocol: registrar, registration date, expiry date, name servers, registrant country, and status flags. No API key required.

## Architecture

| File | Role |
|------|------|
| `schema.ts` | Validates and sanitizes domain input (same pattern as `dns-lookup`) |
| `compute.ts` | Pure function — parses RDAP JSON events, entities, nameservers |
| `server.ts` | Uses `safeFetch` to call `rdap.org` (SSRF-hardened) |
| `WhoisTool.tsx` | Client UI — new domain / expiry alerts, registration details grid |
| `whois.test.ts` | Unit tests for schema and compute |

## Data Source

Uses RDAP (Registration Data Access Protocol) — the modern replacement for plain-text WHOIS. Bootstrap URL: `https://rdap.org/domain/{domain}` which auto-routes to the correct IANA registry.
