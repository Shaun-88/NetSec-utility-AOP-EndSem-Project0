# IP Lookup & Geolocation

## Overview
The **IP Lookup** tool resolves IP addresses or hostnames to geolocation data, Autonomous System Numbers (ASN), ISP infrastructure details, and proxy/VPN indicators.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **SSR-Hardening**: Resolves hostnames first and enforces `isIpBlocked(ip)` against RFC 1918, loopback, link-local, and metadata addresses before any external request is made.
- **Fetch Guard**: Outbound requests strictly use `core/security/safe-fetch.ts`.
- **Pure Compute**: `compute.ts` formats raw JSON intelligence deterministically.
