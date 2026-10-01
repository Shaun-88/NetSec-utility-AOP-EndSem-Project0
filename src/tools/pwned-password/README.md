# Pwned Password Checker (`#018`)

**Category:** `cybersecurity` | **Complexity:** `basic` | **Requires Server:** `true`

## What it does

Checks if a password has appeared in any known data breach using the [Have I Been Pwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords) and a **k-anonymity** model that ensures your actual password is never transmitted.

## Privacy Architecture (k-anonymity)

```
User types password
    │
    ▼ (browser only)
SHA-1 hash computed with WebCrypto API
    │
    ├─ First 5 chars (prefix) → sent to server → HIBP API → hash range returned
    │
    └─ Full hash → compared locally on the server against returned range
```

1. **Browser**: Computes SHA-1 of the password using `crypto.subtle.digest` (WebCrypto).
2. **Client → Server**: Sends only `{ prefix: first5CharsOfHash, fullHash: fullSha1Hash }`.
3. **Server → HIBP**: Calls `https://api.pwnedpasswords.com/range/{prefix}` — only 5 chars sent.
4. **Server**: Scans the returned hash suffix list for a match; extracts the count.
5. **Client receives**: `{ isPwned, pwnedCount }` — no password data ever transmitted.

## Architecture

| File | Role |
|------|------|
| `schema.ts` | Validates `prefix` (5 hex chars) and `fullHash` (40 hex chars) |
| `compute.ts` | Pure function — parses HIBP plain-text range response, finds match |
| `server.ts` | Calls HIBP range API with safeFetch; no API key required |
| `PwnedPasswordTool.tsx` | Client UI — hashes password locally, shows pwned count, links to strength checker |
| `pwned-password.test.ts` | Unit tests for schema and compute |

## Environment

No API key required. The HIBP Pwned Passwords range API is free and unauthenticated.

## Data Sources

- [Have I Been Pwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords)
