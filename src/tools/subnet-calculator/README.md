# Subnet Calculator

## Overview
The **Subnet Calculator** is a pure client-side network utility designed to calculate IPv4 CIDR prefixes, subnet masks, wildcard masks, usable host IP ranges, and broadcast boundaries.

## Architecture
- **Type**: Client-only (`requiresServer: false`)
- **Compute**: `compute.ts` contains 100% deterministic pure math functions with zero external I/O or network dependencies.
- **Validation**: Strict IPv4 octet and 0-32 prefix range validation via `schema.ts`.
- **Special Cases Handled**:
  - `/31` point-to-point links per RFC 3021 (2 usable hosts)
  - `/32` single host loopback / route isolation (1 usable host)
  - Standard RFC 1918 private scopes vs public vs carrier-grade NAT
