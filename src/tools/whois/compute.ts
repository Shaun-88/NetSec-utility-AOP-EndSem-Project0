import type { WhoisOutputData } from "./types";

/**
 * RDAP vcardArray component — each item is [type, params, valueType, value].
 * Using a specific tuple type for strict typing.
 */
type VcardComponent = [string, Record<string, unknown>, string, unknown];

/**
 * Minimal RDAP entity shape (registrar / registrant).
 */
export interface RdapEntity {
  roles?: string[];
  vcardArray?: [string, VcardComponent[]];
}

/**
 * Minimal RDAP event shape.
 */
export interface RdapEvent {
  eventAction: string;
  eventDate: string;
}

/**
 * Minimal RDAP nameserver shape.
 */
export interface RdapNameserver {
  ldhName?: string;
}

/**
 * Raw RDAP domain response shape (partial — only fields we parse).
 */
export interface RawRdapResponse {
  ldhName?: string;
  status?: string[];
  events?: RdapEvent[];
  nameservers?: RdapNameserver[];
  entities?: RdapEntity[];
}

/**
 * Attempts to extract the registrant country from vcardArray.
 * The 'adr' property in vCard format contains: PO Box, extended, street, city, region, postal code, country.
 */
function extractRegistrantCountry(entities: RdapEntity[]): string | null {
  for (const entity of entities) {
    if (!entity.roles?.includes("registrant")) continue;
    const vcardProps = entity.vcardArray?.[1];
    if (!vcardProps) continue;
    for (const component of vcardProps) {
      if (component[0] === "adr") {
        // component[3] is the value — structured address array
        const value = component[3];
        if (Array.isArray(value) && value.length >= 7) {
          const country = value[6];
          if (typeof country === "string" && country.trim()) {
            return country.trim();
          }
        }
      }
    }
  }
  return null;
}

/**
 * Extracts the registrar name from RDAP entities.
 */
function extractRegistrar(entities: RdapEntity[]): string {
  for (const entity of entities) {
    if (!entity.roles?.includes("registrar")) continue;
    const vcardProps = entity.vcardArray?.[1];
    if (!vcardProps) continue;
    for (const component of vcardProps) {
      if (component[0] === "fn" && typeof component[3] === "string") {
        return component[3];
      }
    }
  }
  return "Unknown";
}

/**
 * Pure compute function for WHOIS / Domain Lookup.
 * Parses RDAP JSON response into typed WhoisOutputData.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeWhoisData(
  domain: string,
  rdap: RawRdapResponse,
): WhoisOutputData {
  // Parse events
  let registrationDate: string | null = null;
  let expiryDate: string | null = null;
  let updatedDate: string | null = null;

  for (const event of rdap.events ?? []) {
    switch (event.eventAction) {
      case "registration":
        registrationDate = event.eventDate;
        break;
      case "expiration":
        expiryDate = event.eventDate;
        break;
      case "last changed":
        updatedDate = event.eventDate;
        break;
    }
  }

  // Parse nameservers
  const nameServers = (rdap.nameservers ?? [])
    .map((ns) => ns.ldhName?.toLowerCase() ?? "")
    .filter(Boolean);

  // Parse status flags
  const status = rdap.status ?? [];

  // Parse registrar and registrant country
  const entities = rdap.entities ?? [];
  const registrar = extractRegistrar(entities);
  const registrantCountry = extractRegistrantCountry(entities);

  return {
    domain: rdap.ldhName?.toLowerCase() ?? domain,
    registrar,
    registrationDate,
    expiryDate,
    updatedDate,
    nameServers,
    status,
    registrantCountry,
    checkedAt: new Date().toISOString(),
  };
}
