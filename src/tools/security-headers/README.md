# HTTP Security Header Analyzer

## Overview
The **Security Header Analyzer** audits HTTP response headers for Content-Security-Policy (CSP), HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy, calculating an authoritative security posture grade (A+ to F).

## Security Controls (Architecture Contract §6.1)
- **SSRF Firewall**: Outbound queries to user-supplied targets are guarded by `core/security/safe-fetch.ts` to strictly prohibit RFC 1918 private subnets, loopback, and cloud instance metadata.
- **Compute Invariant**: `compute.ts` evaluates header policies, point deductions, and information disclosure penalties deterministically.
