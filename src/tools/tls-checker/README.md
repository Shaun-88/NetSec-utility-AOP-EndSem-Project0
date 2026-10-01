# TLS/SSL Certificate Checker (`#015`)

**Category:** `cybersecurity` | **Complexity:** `intermediate` | **Requires Server:** `true`

## What it does

Checks a domain's TLS certificate: issuer, subject, validity period, days until expiry, protocol version (TLS 1.2 vs 1.3), and whether it's expired or expiring soon.

## Architecture

| File | Role |
|------|------|
| `schema.ts` | Validates and sanitizes domain input (same pattern as `dns-lookup`) |
| `compute.ts` | Pure function — computes expiry, `isExpired`, `isExpiringSoon` flags |
| `server.ts` | Uses `node:tls` directly; `isIpBlocked` used for SSRF protection |
| `TlsCheckerTool.tsx` | Client UI — cert details card, days-remaining badge (green/amber/red) |
| `tls-checker.test.ts` | Unit tests for schema and compute |

## Security Note

This tool uses `node:tls` directly (not `safeFetch`) because raw certificate access is needed via `getPeerCertificate()`. SSRF protection is still enforced via `isIpBlocked` on the resolved IP before the TLS connection is attempted.
