# DNS Record Analyzer

## Overview
The **DNS Record Analyzer** inspects authoritative zone records (A, AAAA, MX, TXT, NS, CNAME, SOA) using Node's native asynchronous DNS resolver. Designed for non-technical visitors as well as sysadmins, it demystifies domain records with plain-language explainers and in-line contextual definitions.

## Key Features (Version 2 Polish)
- **Plain-Language Explainer**: Explains what DNS is (the internet's phonebook) and why domains require numerical IP translation.
- **In-Line Record Explanations**: Every record row and filter tab features direct, plain-language definitions (e.g. `A` = website primary address, `MX` = email routing server, `TXT` = ownership & anti-spoofing).
- **Interactive Type Filtering**: Filter between all records or specific record categories with dedicated context banners.
- **Robust Input Sanitization**: Automatically strips protocols (`http://`, `https://`), trailing slashes, and URL paths.

## Architecture
- **Type**: Server-backed (`requiresServer: true`)
- **Resolver**: Native Node.js `dns/promises` APIs executed server-side.
- **Resilience**: Concurrently queries record categories using `Promise.allSettled`, preventing missing record types (e.g. no MX record) from failing the overall resolution.
- **Compute**: `compute.ts` categorizes, sorts, and enriches records with metadata purely in memory with zero side-effects.
