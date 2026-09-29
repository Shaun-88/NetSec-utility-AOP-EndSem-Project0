# Binary ⇄ Text Translator

## Overview
The **Binary ⇄ Text Translator** provides bidirectional conversion between standard UTF-8 text and formatted 8-bit binary bytecode.

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **UTF-8 Support**: Uses native `TextEncoder` and `TextDecoder` to support the full Unicode spectrum (including multi-byte characters and emoji).
- **Compute Invariant**: `compute.ts` executes string transformations, delimiter formatting, and parity/modulo byte chunk validation purely in memory.
