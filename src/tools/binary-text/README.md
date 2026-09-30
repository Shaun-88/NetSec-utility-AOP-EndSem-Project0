# Binary ⇄ Text Translator

## Overview
The **Binary ⇄ Text Translator** provides bidirectional, real-time conversion between human-readable UTF-8 text and raw 8-bit computer binary bytecode. It includes interactive byte-by-byte character inspection, hexadecimal cross-referencing, and robust error detection.

## Plain-Language Educational Model
- **The Language of Silicon**: At the microchip level, computers cannot store letters, words, or pictures. Microprocessors only understand electrical states: ON (`1`) or OFF (`0`).
- **Bits and Bytes**: A single 0 or 1 is a **bit**. Eight bits make a **byte** (e.g. `01000001` = letter `A`). Standard encoding tables (ASCII and UTF-8) ensure all machines translate those 8 electrical signals into the exact same character.
- **Why Convert?**:
  - Educational learning of computer architecture and binary representation.
  - Low-level network packet debugging and inspecting raw byte dumps.
  - Understanding character encodings and multi-byte UTF-8 data storage.

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **UTF-8 Support**: Powered by native browser `TextEncoder` and `TextDecoder` for full Unicode and ASCII compatibility.
- **Character Inspector**: Generates a per-character breakdown mapping glyphs to their decimal ASCII code, hexadecimal value (`0x..`), and 8-bit binary pattern.
- **Diagnostics**: Detects non-binary digits and incomplete byte streams (non-multiples of 8 bits) with clear diagnostic explanations.
- **Compute Invariant**: `compute.ts` operates purely in memory with no external I/O or network dependencies.
