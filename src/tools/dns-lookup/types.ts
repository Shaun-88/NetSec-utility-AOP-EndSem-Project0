/**
 * Type contracts for the DNS Lookup Tool.
 */

export type DnsRecordType = "A" | "AAAA" | "MX" | "TXT" | "NS" | "CNAME" | "SOA";

export interface DnsRecordItem {
  type: DnsRecordType;
  value: string;
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
