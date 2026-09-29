# Ping & Latency Checker

## Overview
The **Ping & Latency Checker** computes real-world HTTP round-trip timing, jitter metrics, and packet loss statistics across diagnostic probes.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **SSRF Hardening**: Prior to sending probes, the target hostname is resolved and verified against SSRF blocklists via `isIpBlocked(ip)`.
- **Safe Probing**: Probes are dispatched through `safeFetch` using HTTP HEAD requests.
- **Compute**: `compute.ts` calculates minimum, maximum, average, median, jitter (RFC 3550 IPPM formulation), and packet loss percentage deterministically.
