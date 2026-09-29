# JSON Web Token (JWT) Decoder

## Overview
The **JWT Decoder** parses and inspects JSON Web Token headers, claims, expiration timestamps, and payloads client-side in a zero-network sandbox.

## Architecture
- **Type**: Client-side execution (`requiresServer: false`)
- **Privacy Assurance**: Sensitive auth tokens and claim payloads are parsed strictly within the user's browser runtime and are never transmitted over the network.
- **Compute Invariant**: `compute.ts` evaluates base64url decoding, claim mappings, and expiration epochs deterministically.
