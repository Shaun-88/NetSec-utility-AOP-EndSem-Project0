# Cryptographic Password Generator

## Overview
The **Cryptographic Password Generator** generates high-entropy, mathematically unpredictable passwords directly inside the user's browser utilizing hardware-grade Web Crypto CSPRNG (`crypto.getRandomValues`). Built for everyday users as well as security practitioners, it provides accessible explanations of why generated passwords are vastly superior to human-invented passwords, paired with practical password hygiene guidance.

## Features
- **Plain-Language Explanations**: Clear explanation of human cognitive patterns (birthdays, pets, dictionary words, keyboard walks) versus true mathematical entropy, and why automated cracking tools exploit human habits.
- **Actionable Best Practices Guide**:
  - Length beats complexity (16–24 characters exponentially expand the search space).
  - Never reuse passwords across sites (mitigating credential stuffing).
  - Using trusted password managers for secure storage.
- **Strength Tiers & Crack Time Estimates**:
  - Classifies passwords into clear tiers: Uncrackable (&ge; 100 bits), Very Strong (80–99 bits), Strong (60–79 bits), Moderate (40–59 bits), Weak (&lt; 40 bits).
  - Estimates real-world offline brute-force attack durations against modern GPU cracking clusters.
- **Presets & Customization**:
  - Quick presets: Standard Web (16), High Armor (24), Master Vault (32), Easy to Type (No Ambiguous), PIN Code (6).
  - Options to exclude visually ambiguous characters (`l, 1, I, 0, O, o, s, S, 5, 2, Z`).
  - Batch generation (1, 5, 10 passwords) with single-click "Copy All".

## Architecture & Security Controls
- **Type**: Pure client-side execution (`requiresServer: false`). Passwords never leave the browser and are never transmitted over the network or saved in server logs.
- **CSPRNG Hardware Entropy**: Uses `crypto.getRandomValues` for unbiased cryptographic randomness.
- **Fisher-Yates Shuffle**: Guarantees inclusion of at least one character from each selected charset category before performing uniform array shuffling.
- **Pure Invariant**: `compute.ts` evaluates password strings, Shannon entropy bits, strength tiers, and crack time estimates purely in memory with zero I/O.
