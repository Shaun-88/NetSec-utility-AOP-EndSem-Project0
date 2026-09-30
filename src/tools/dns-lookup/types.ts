/**
 * Type contracts for the DNS Lookup Tool.
 */

export type DnsRecordType = "A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME" | "SOA";

export interface DnsTypeInfo {
  name: string;
  shortDesc: string;
  fullDesc: string;
}

export const DNS_RECORD_METADATA: Record<DnsRecordType, DnsTypeInfo> = {
  A: {
    name: "IPv4 Address",
    shortDesc: "The website's primary internet address",
    fullDesc: "Points your domain name to the physical IPv4 server hosting the website so browsers can load pages.",
  },
  AAAA: {
    name: "IPv6 Address",
    shortDesc: "The website's modern 128-bit address",
    fullDesc: "Directs visitors using modern IPv6 internet connections to the website's destination server.",
  },
  MX: {
    name: "Mail Exchange",
    shortDesc: "Where emails sent to this domain are delivered",
    fullDesc: "Specifies the mail servers responsible for accepting incoming email messages on behalf of your domain.",
  },
  TXT: {
    name: "Text & Verification",
    shortDesc: "Free-text record used for ownership & anti-spoofing",
    fullDesc: "Stores human and machine-readable text used for domain verification, SPF, DKIM, and DMARC anti-phishing protection.",
  },
  NS: {
    name: "Name Server",
    shortDesc: "The authoritative servers storing this domain's records",
    fullDesc: "Identifies which authoritative DNS servers hold and announce the official DNS zone records for this domain.",
  },
  CNAME: {
    name: "Domain Alias",
    shortDesc: "An alias forwarding one name to another",
    fullDesc: "Maps an alias name or subdomain (e.g. www) directly to another canonical domain name without a direct IP.",
  },
  SOA: {
    name: "Start of Authority",
    shortDesc: "Administrative zone management parameters",
    fullDesc: "Contains core administrative data including the primary nameserver, administrator email, serial number, and cache timers.",
  },
};

export interface DnsRecordItem {
  type: DnsRecordType;
  value: string;
  typeLabel?: string;
  typeExplanation?: string;
  ttl?: number;
  priority?: number;
  exchange?: string;
  hostmaster?: string;
  serial?: number;
  raw?: unknown;
}

export interface DnsLookupData {
  domain: string;
  queriedAt: string;
  totalRecordsFound: number;
  recordsByType: Partial<Record<DnsRecordType, DnsRecordItem[]>>;
  allRecords: DnsRecordItem[];
  availableTypes: DnsRecordType[];
}

