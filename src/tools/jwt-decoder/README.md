# JSON Web Token (JWT) Decoder

## Overview
The **JSON Web Token (JWT) Decoder** parses and inspects JSON Web Token headers, claims, expiration timestamps, and payloads client-side in a zero-network sandbox. Built for both non-IT visitors and web developers, it explains how web authentication tokens function, translates technical claims into clear English, and handles malformed input gracefully without crashing.

## Features
- **Plain-Language Explanations**:
  - Explains JWTs using the "digital ID badge / security wristband" analogy for seamless web authentication.
  - Clarifies that standard JWTs are **encoded, not encrypted** — reminding users that sensitive credentials or credit cards must never be stored inside token payloads.
- **The 3 Parts Decoded**:
  - **Header (The Envelope)**: Displays the signing algorithm (e.g. HS256, RS256) and token type.
  - **Payload (The ID Badge)**: Maps standard RFC 7519 claims (`sub`, `iss`, `aud`, `exp`, `iat`, `nbf`, `jti`, `name`, `email`, `role`) with human-readable descriptions and UTC timestamp formatting.
  - **Signature (The Wax Seal)**: Cryptographic signature segment ensuring tamper resistance.
- **Robust Error Handling (Zero Crashes)**:
  - Gracefully handles missing dots, invalid base64 characters, non-JSON strings, non-object JSON payloads, and malformed headers.
  - Automatically strips leading `Bearer ` prefixes and wrapping quotes.
- **Interactive Presets**: Pre-configured buttons to test Active Session tokens, Expired tokens, and Bearer-prefixed tokens.

## Architecture & Security Controls
- **Type**: 100% Client-side execution (`requiresServer: false`). Sensitive authentication tokens never leave the browser and are never transmitted over the network or saved in server logs.
- **Pure Invariant**: `compute.ts` evaluates base64url decoding, claim mappings, relative expiration calculations, and structural validation purely in memory with zero I/O.
