/**
 * Type contracts for the WHOIS / Domain Lookup Tool.
 * Uses RDAP (Registration Data Access Protocol) — no API key required.
 */

export interface WhoisOutputData {
  domain: string;
  registrar: string;
  registrationDate: string | null;
  expiryDate: string | null;
  updatedDate: string | null;
  nameServers: string[];
  status: string[];
  registrantCountry: string | null;
  checkedAt: string;
}
