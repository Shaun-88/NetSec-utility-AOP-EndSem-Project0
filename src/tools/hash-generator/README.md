# Cryptographic Hash & Digest Generator

## Overview
The **Hash Generator** calculates cryptographic hashes across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms with optional HMAC keying.

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **Portability**: Uses standard Web Crypto APIs (`crypto.subtle`) for SHA families and a pure portable RFC 1321 MD5 implementation.
- **Compute Invariant**: `compute.ts` evaluates message digests deterministically in memory.
