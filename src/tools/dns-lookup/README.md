# DNS Record Analyzer

## Overview
The **DNS Record Analyzer** inspects authoritative zone records (A, AAAA, MX, TXT, NS, CNAME, SOA) using Node's native asynchronous DNS resolver.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **Resolver**: Native Node.js `dns/promises` APIs executed server-side.
- **Resilience**: Concurrently queries record categories using `Promise.allSettled`, preventing missing record types (e.g. no MX record) from failing the overall resolution.
- **Compute**: `compute.ts` categorizes and sorts records purely in memory.
