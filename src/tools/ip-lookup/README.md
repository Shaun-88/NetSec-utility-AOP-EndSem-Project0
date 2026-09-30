# IP Lookup & Geolocation

## Overview
The **IP Lookup** tool resolves IP addresses or hostnames to geographic location data, Autonomous System Numbers (ASN), ISP infrastructure details, and proxy/VPN indicators. Designed for both technical and non-technical visitors, it includes a plain-language explanation of internet return addresses and an interactive map.

## Key Features (Version 2 Polish)
- **Plain-Language Explainer**: Explains what public IP addresses are (digital "return addresses") and why someone looks them up.
- **Accuracy Disclaimer**: Explicitly informs visitors that geolocation reflects approximate ISP routing and network distribution hubs rather than precise street addresses.
- **OpenStreetMap Embed**: Interactive, credential-free map integration displaying an approximate pinpoint marker keyed to resolved latitude and longitude coordinates.
- **Network & Threat Intelligence**: Details ISP, ASN, organization, timezone, and security indicators (residential, VPN/proxy, Tor node, datacenter hosting).

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **SSR-Hardening**: Resolves hostnames first and enforces `isIpBlocked(ip)` against RFC 1918, loopback, link-local, and metadata addresses before any external request is made.
- **Fetch Guard**: Outbound requests strictly use `core/security/safe-fetch.ts`.
- **Pure Compute**: `compute.ts` formats raw JSON intelligence deterministically and generates OpenStreetMap bounding box embed parameters without side effects.
