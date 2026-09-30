# Port Reachability Checker

## Overview
The **Port Reachability Checker** tests external TCP connectivity and reachability on authorized service ports. Designed for both network engineers and non-IT users, it provides clear, plain-language explanations of what network ports are, why they are checked, and how to interpret reachability states (Open, Closed, Filtered).

## Features
- **Plain-Language Explanations**: Accessible analogies describing network ports (apartment building doors for specialized services) and actionable guidance on verifying router port forwarding, checking firewall rules, and identifying accidental database exposures.
- **Service & Use Case Directory**: Dedicated plain-language descriptions and real-world use cases for all 16 allow-listed ports.
- **Real-Time Selected Port Preview**: Dynamic card showing service category, protocol role, plain explanation, and security notes prior to running scans.
- **Accurate Diagnostic Classifications**:
  - **Open**: Target accepted the TCP handshake; service is listening and reachable.
  - **Closed**: Target actively replied with a TCP Reset (`ECONNREFUSED`); machine is online, but no process is listening.
  - **Filtered**: Handshake timed out after 3.0s (`ETIMEDOUT` / packet drop); traffic blocked by a network firewall or ISP filter.
- **Tailored Security Recommendations**: Contextual guidance on whether an open, closed, or filtered state represents good security posture (e.g. database ports 3306/5432 should ideally be filtered/closed).

## Security Controls (Architecture Contract §6.2)
- **Port Allowlist**: Restricted exclusively to 16 diagnostic ports (`21, 22, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 3306, 5432, 8080, 8443`). Arbitrary port scanning is strictly prohibited.
- **SSRF Firewall**: Hostnames are resolved to IPs and verified against `isIpBlocked(ip)` from `core/security/safe-fetch.ts` to block RFC 1918 private subnets, loopback, or cloud instance metadata.
- **Compute Invariant**: `compute.ts` evaluates connection status, descriptions, and security guidance purely in memory with zero I/O.
