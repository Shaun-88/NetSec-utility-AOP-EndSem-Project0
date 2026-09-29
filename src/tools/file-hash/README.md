# File Hash & Checksum Verifier

## Overview
The **File Hash Checker** evaluates cryptographic file integrity checksums (MD5, SHA-1, SHA-256, SHA-512) and verifies them against expected vendor releases.

## Architecture
- **Type**: Server-backed with client-side accelerated execution (`requiresServer: true`)
- **Privacy Assurance**: Client-side execution hashes files locally in the browser memory using the Web Crypto API, eliminating the need to upload sensitive documents over the network.
- **Compute Invariant**: `compute.ts` evaluates case-insensitive checksum comparisons and verification matching deterministically.
