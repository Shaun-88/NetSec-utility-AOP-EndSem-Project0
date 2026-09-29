# Password Strength & Entropy Auditor

## Overview
The **Password Strength Checker** audits passwords against Shannon entropy models, dictionary heuristics, and simulated brute-force cracking speeds.

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **Zero Network Transmission**: Passwords entered never leave the client's local memory sandbox.
- **Compute Invariant**: `compute.ts` calculates entropy ($E = L \times \log_2(R)$), pattern penalties, and brute-force time estimates deterministically.
