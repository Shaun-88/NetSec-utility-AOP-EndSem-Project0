# Internet Speed Test

## Overview
The **Internet Speed Test** measures actual internet connection download throughput, upload capacity, and round-trip latency via timed chunk transfers.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **Measurement Engine**: Dispatches precision-timed transfers via `safeFetch` against high-capacity edge CDN nodes.
- **Compute Invariant**: `compute.ts` evaluates bit rates ($\text{Mbps} = \frac{\text{bytes} \times 8}{\text{seconds} \times 10^6}$) and bandwidth classification tiers with pure, deterministic mathematics.
