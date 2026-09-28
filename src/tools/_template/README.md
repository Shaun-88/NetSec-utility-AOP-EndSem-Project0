# Template Tool Module Blueprint

This directory provides the authoritative reference implementation for every tool in **The Big Bro's NetSec Armoury**.

## Directory Structure Contract

```
src/tools/<id>/
|- index.ts         # Exports a single ToolDefinition object (default + named)
|- <Id>Tool.tsx     # The React client component for the tool UI
|- schema.ts        # Zod schema for validating tool input parameters
|- server.ts        # Implements ToolServerModule -- only required if requiresServer: true
|- compute.ts       # Pure function: (raw input/data) -> output shape (NO I/O)
|- types.ts         # Module-specific input, output, and state interfaces
|- <id>.test.ts     # Vitest unit tests verifying schema and compute logic
`- README.md        # Technical explanation and purpose of the tool
```

## Invariants to Preserve

1. **Isolation:** Never import from another `src/tools/<other-id>/` directory.
2. **Pure Compute:** All analytical computations live in `compute.ts` and must not perform network, DNS, or file operations.
3. **SSRF Hardening:** If `server.ts` performs any outbound requests to user-supplied hosts, it MUST use `src/core/security/safe-fetch.ts`. Raw `fetch()` is strictly forbidden.
4. **Tenant Security:** Any database query touching `tool_history` or `users_profile` filters by verified `user_id`.
