# Cryptographic Password Generator

## Overview
The **Password Generator** creates high-entropy, cryptographically secure passwords utilizing hardware-grade Web Crypto CSPRNG (`crypto.getRandomValues`).

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **Entropy Guarantee**: Guarantees inclusion of at least one character from each selected charset category before performing Fisher-Yates array shuffling.
- **Compute Invariant**: `compute.ts` evaluates password strings and Shannon entropy bits deterministically.
