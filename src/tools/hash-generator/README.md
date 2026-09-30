# Cryptographic Hash & Digest Generator

## Overview
The **Cryptographic Hash & Digest Generator** calculates cryptographic fingerprints across MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms with optional HMAC keying. Built with an emphasis on clarity for non-IT visitors as well as cybersecurity practitioners, it explains what cryptographic hashes are, why they are generated, and provides interactive demonstrations of the "Avalanche Effect".

## Features
- **Plain-Language Explanations (Priority)**:
  - Explains hashes as fixed-length digital fingerprints of data.
  - Highlights the three fundamental properties: **Deterministic** (same input always equals same hash), **Avalanche Effect** (1 character change scrambles the entire hash), and **One-Way Only** (impossible to reverse/decrypt).
  - Concrete real-world use cases: file integrity verification, secure database password storage, digital signatures, and blockchain blocks.
- **Interactive Avalanche Effect Demo**: One-click comparison showing how adding a single dot completely transforms the SHA-256 digest.
- **HMAC Secret Keying**: Explains how adding a shared secret key creates an authenticated digital seal that validates both data integrity and author authenticity.
- **Algorithm Directory**: Detailed plain-language descriptions, bit lengths, and current security statuses (`Deprecated`, `Legacy`, `Secure (Recommended)`, `High Security`) for all 5 algorithms.

## Architecture & Security Controls
- **Type**: 100% Client-side execution (`requiresServer: false`). Input text and secret keys never leave the browser.
- **Portability**: Uses standard Web Crypto APIs (`crypto.subtle`) for SHA families and a pure portable RFC 1321 MD5 implementation.
- **Pure Invariant**: `compute.ts` evaluates message digests deterministically in memory with zero network or file I/O.
