# Internet Speed Test

## Overview
The **Internet Speed Test** measures actual internet connection download throughput, upload capacity, and round-trip latency via timed chunk transfers. Designed for both technical and non-technical users, it pairs precise measurements with practical everyday suitability guidance (gaming, 4K streaming, video calls).

## Key Features (Version 2 Polish)
- **Plain-Language Explainer**: Prominent explainer defining download, upload, and latency metrics in non-IT terms.
- **Speedometer Animation & Exact Readout**: Dynamic radial gauge animation paired with clean numeric typography.
- **Unit Toggle (Mbps / Gbps)**: Instant toggling between Megabits per second and Gigabits per second.
- **10-Second Dual Sampling**: Single-click initiation that continuously samples both download and upload for at least 10 seconds each to eliminate burst-speed distortion.
- **Throughput Timeline Graphs**: Separate visual SVG charts displaying throughput trajectories over the test duration.
- **Practical Usability Badges**: Evaluates connection fitness for competitive gaming, 1080p HD, 4K Ultra HD, and Zoom/Meet video calls.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **Measurement Engine**: Dispatches precision-timed transfers via `safeFetch` against high-capacity edge CDN nodes.
- **Compute Invariant**: `compute.ts` evaluates bit rates ($\text{Mbps} = \frac{\text{bytes} \times 8}{\text{seconds} \times 10^6}$), unit formatting, practical suitability categories, and bandwidth classification tiers with pure, deterministic mathematics.
