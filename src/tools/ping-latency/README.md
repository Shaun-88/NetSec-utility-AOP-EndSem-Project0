# Ping & Latency Checker

## Overview
The **Ping & Latency Checker** computes real-world network round-trip response timing (RTT), jitter metrics, and packet loss statistics across diagnostic HTTP probes. Designed for everyday users as well as network engineers, it provides accessible explanations of what latency means, why jitter matters, and how connection timing impacts real-time activities like gaming and video conferencing.

## Features
- **Plain-Language Explanations**: Accessible freeway vs. speed limit analogy distinguishing bandwidth from reaction latency.
- **Reading the Results Guide**: Actionable breakdowns of Median vs. Average, RFC 3550 Jitter consistency, and Packet Loss thresholds.
- **Collapsible Benchmark Guide**: Clear latency thresholds from Elite (&lt; 30 ms) to High Delay (&gt; 150 ms).
- **Activity Readiness Assessment**: Real-world evaluation across 4 primary usage categories:
  - Competitive Online Gaming
  - Video Meetings (Zoom / Teams)
  - Voice Calls & Discord
  - Web Browsing & Cloud Apps
- **Interactive SVG Timeline Chart**: Visualizes probe latency in milliseconds over time with a median reference baseline and gradient fill.
- **Probe Breakdown Table**: Displays sequence numbers, HTTP response codes, and proportionate latency bars.

## Architecture & Security Controls
- **Type**: Server-backed (`requiresServer: true`)
- **SSRF Hardening**: Prior to dispatching probes, the target hostname is resolved and verified against SSRF blocklists via `isIpBlocked(ip)` from `core/security/safe-fetch.ts`. Private IP subnets, loopbacks, and cloud metadata addresses are strictly blocked.
- **Safe Probing**: Sequential HTTP HEAD probes are executed through `safeFetch` with 100ms inter-probe spacing and cache-control headers to prevent burst throttling or false 304 cache hits.
- **Pure Invariant**: `compute.ts` deterministically evaluates all statistics, median values, RFC 3550 jitter, and activity readiness purely in memory with zero I/O.
