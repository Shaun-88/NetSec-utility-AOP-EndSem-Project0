# File Hash & Checksum Verifier

## Overview
The **File Hash & Integrity Verifier** provides cryptographic integrity verification for files, packages, and software releases. It computes cryptographic digests across 5 algorithms (SHA-256, SHA-512, SHA-384, SHA-1, MD5) and performs instantaneous comparison against official vendor-published checksums.

## Plain-Language Security Model
- **Digital Wax Seal**: When software is distributed over the web, network glitches can corrupt binaries or malicious mirrors can inject malware. A cryptographic hash acts as an unforgeable digital wax seal.
- **The Avalanche Effect**: Modifying even a single character or byte in a multi-gigabyte ISO results in a completely unrecognizable checksum, providing immediate detection of tampering or corruption.
- **Privacy & Client-Side Sandbox**: Hash calculations are executed entirely inside the user's browser sandbox using hardware-accelerated Web Crypto APIs and a pure JavaScript RFC 1321 MD5 implementation. Zero file bytes are transmitted over the network.

## Pre-Configured Sample Files (`public/sample-files/`)
To allow first-time visitors to test the end-to-end verification workflow without needing their own files, 3 test files are hosted under `public/sample-files/`:
1. `sample-document.txt` (195 B) — Genuine release matching the vendor checksum perfectly (`Integrity Verified`).
2. `sample-document-tampered.txt` (225 B) — Modified edition with unauthorized payload changes. Tested against the official release checksum to demonstrate an instant `Verification Failed (Checksum Mismatch Alert)`.
3. `security-manifest.json` (129 B) — Structured JSON configuration payload demonstrating software release manifest verification.

## Algorithms & Standards
- **SHA-256** (256-bit): NIST standard for software releases, Linux ISOs, and package managers.
- **SHA-512** (512-bit): High-security standard for financial and mission-critical verification.
- **SHA-384** (384-bit): Enterprise Suite B standard.
- **SHA-1** (160-bit): Legacy standard for Git and older archives.
- **MD5** (128-bit): Fast error-checking checksum for detecting accidental corruption.
