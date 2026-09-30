# Subnet Calculator

## Overview
The **Subnet Calculator** is a pure client-side network utility designed to calculate IPv4 CIDR prefixes, subnet masks, wildcard masks, usable host IP ranges, and broadcast boundaries. Designed for non-technical visitors and students as well as network engineers, it pairs bitwise arithmetic with plain-language explanations of subnets and architecture scopes.

## Key Features (Version 2 Polish)
- **Plain-Language Explainer**: Defines what a subnet is using the neighborhood vs. house address analogy and why subnets exist.
- **Subnet Application & Capacity Guidance**: Contextual banner explaining real-world deployment targets for each prefix size (e.g. `/24` for office LANs, `/31` for router links, `/0` for default routes).
- **Direct CIDR Input Parsing**: Supports typing or pasting `192.168.1.1/24` to automatically configure both the IP address and slider prefix.
- **Edge-Case Precision**:
  - `/0` Default Internet Route (4.29B total hosts, `0.0.0.0` - `255.255.255.255`)
  - `/31` Point-to-Point Links per RFC 3021 (2 usable hosts)
  - `/32` Single Host Route (1 usable host)
- **Address Scope Explanations**: Plain-language descriptions for RFC 1918 Private, Loopback, Link-Local, Carrier-Grade NAT, and Public routable IP spaces.

## Architecture
- **Type**: Client-only (`requiresServer: false`)
- **Compute**: `compute.ts` contains 100% deterministic pure math functions with zero external I/O or network dependencies.
- **Validation**: Strict IPv4 octet and 0-32 prefix range validation via `schema.ts`.
