# Port Reachability Checker

## Overview
The **Port Reachability Checker** tests connectivity and reachability on specified diagnostic services.

## Security Controls (Architecture Contract §6.2)
- **Port Allowlist**: Restricted exclusively to common diagnostic ports (`80, 443, 22, 21, 25, 53, 110, 143, 465, 587, 993, 995, 3306, 5432, 8080, 8443`). Arbitrary port scanning is prohibited.
- **SSRF Firewall**: Targets are resolved and cross-referenced with `isIpBlocked(ip)` from `core/security/safe-fetch.ts` to prevent targeting RFC 1918 private subnets, loopback, or cloud instance metadata.
- **Compute Invariant**: `compute.ts` evaluates connection status and security recommendations purely in memory.
