import type { DnsRecordItem, DnsRecordType, DnsLookupData } from "./types";

export interface RawDnsCollection {
  a?: Array<{ address: string; ttl?: number }>;
  aaaa?: Array<{ address: string; ttl?: number }>;
  mx?: Array<{ exchange: string; priority: number }>;
  txt?: Array<string[]>;
  ns?: string[];
  cname?: string[];
  soa?: {
    nsname: string;
    hostmaster: string;
    serial: number;
    refresh: number;
    retry: number;
    expire: number;
    minttl: number;
  };
}

/**
 * Pure compute function for DNS Lookup.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeDnsLookupData(
  domain: string,
  raw: RawDnsCollection,
): DnsLookupData {
  const allRecords: DnsRecordItem[] = [];
  const recordsByType: Partial<Record<DnsRecordType, DnsRecordItem[]>> = {};

  // 1. Process A records (IPv4)
  if (raw.a && raw.a.length > 0) {
    const list: DnsRecordItem[] = raw.a.map((rec) => ({
      type: "A",
      value: rec.address,
      ttl: rec.ttl,
    }));
    recordsByType["A"] = list;
    allRecords.push(...list);
  }

  // 2. Process AAAA records (IPv6)
  if (raw.aaaa && raw.aaaa.length > 0) {
    const list: DnsRecordItem[] = raw.aaaa.map((rec) => ({
      type: "AAAA",
      value: rec.address,
      ttl: rec.ttl,
    }));
    recordsByType["AAAA"] = list;
    allRecords.push(...list);
  }

  // 3. Process MX records (Mail Exchange)
  if (raw.mx && raw.mx.length > 0) {
    const list: DnsRecordItem[] = raw.mx
      .sort((a, b) => a.priority - b.priority)
      .map((rec) => ({
        type: "MX",
        value: rec.exchange,
        priority: rec.priority,
        exchange: rec.exchange,
      }));
    recordsByType["MX"] = list;
    allRecords.push(...list);
  }

  // 4. Process TXT records
  if (raw.txt && raw.txt.length > 0) {
    const list: DnsRecordItem[] = raw.txt.map((chunks) => ({
      type: "TXT",
      value: chunks.join(" "),
    }));
    recordsByType["TXT"] = list;
    allRecords.push(...list);
  }

  // 5. Process NS records (Nameservers)
  if (raw.ns && raw.ns.length > 0) {
    const list: DnsRecordItem[] = raw.ns.map((ns) => ({
      type: "NS",
      value: ns,
    }));
    recordsByType["NS"] = list;
    allRecords.push(...list);
  }

  // 6. Process CNAME records
  if (raw.cname && raw.cname.length > 0) {
    const list: DnsRecordItem[] = raw.cname.map((alias) => ({
      type: "CNAME",
      value: alias,
    }));
    recordsByType["CNAME"] = list;
    allRecords.push(...list);
  }

  // 7. Process SOA record
  if (raw.soa) {
    const item: DnsRecordItem = {
      type: "SOA",
      value: `${raw.soa.nsname} (admin: ${raw.soa.hostmaster})`,
      hostmaster: raw.soa.hostmaster,
      serial: raw.soa.serial,
      raw: raw.soa,
    };
    recordsByType["SOA"] = [item];
    allRecords.push(item);
  }

  const availableTypes = Object.keys(recordsByType) as DnsRecordType[];

  return {
    domain,
    queriedAt: new Date().toISOString(),
    totalRecordsFound: allRecords.length,
    recordsByType,
    allRecords,
    availableTypes,
  };
}
