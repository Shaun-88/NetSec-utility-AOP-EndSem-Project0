# Password Strength & Entropy Auditor

## Overview
The **Password Strength & Entropy Auditor** evaluates passwords against Shannon information entropy models, dictionary heuristics, and simulated real-world brute-force cracking speeds. Designed for both everyday users and cybersecurity auditors, it demystifies technical security jargon like "entropy" and "character pool size" while providing concrete, actionable steps to turn vulnerable credentials into resilient ones.

## Features
- **Plain-Language Explanations**: Accessible description of how brute-force tools search through combinations and why dictionary words and keyboard sequences compromise security.
- **Jargon Decoded (Terminology Guide)**:
  - **Entropy (Bits)**: Plain-language explanation of randomness and unpredictability using combination lock analogies.
  - **Crack Time Estimates**: Real-world distinction between Online Web Attacks (~100 guesses/sec with rate limits), Offline GPU Rigs (~10 billion guesses/sec from leaked databases), and Supercomputers (~10 trillion guesses/sec).
- **Security Checklist**:
  - Length check (&ge; 12 characters)
  - Character set coverage (Uppercase, Lowercase, Numbers, Symbols)
  - Pattern and dictionary word detection (penalty for sequences like "123", "qwerty", or common dictionary terms).
- **Actionable Recommendations**:
  - Concrete suggestions tailored to the specific gaps identified (e.g., adding length, removing sequences, mixing character sets).
  - Direct integration shortcut to generate unbreakable passwords via the Cryptographic Password Generator.
- **Interactive Sample Testing**: Pre-configured buttons to test common passwords ("password123", "qwerty987", "Tr0ub4dor&", "K9#xP!m9$wL2@vQ7", passphrases).

## Architecture & Security Controls
- **Type**: 100% Client-side execution (`requiresServer: false`). Passwords entered never leave the browser's local memory and are never transmitted across the network or stored in databases.
- **Pure Invariant**: `compute.ts` calculates entropy ($E = L \times \log_2(R)$), pattern penalties, checklist statuses, and brute-force time estimates deterministically with zero I/O.
