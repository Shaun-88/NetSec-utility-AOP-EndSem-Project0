import type { RawIpIntelligenceResponse, IpLookupData } from "./types";

/**
 * Pure compute function for IP Lookup.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeIpLookupData(
  query: string,
  raw: RawIpIntelligenceResponse,
  resolvedHostname?: string,
): IpLookupData {
  const isIpv6 = (raw.ip || "").includes(":");

  return {
    query: query || raw.ip || "Local Public Interface",
    ip: raw.ip || "Unknown",
    ipVersion: isIpv6 ? "IPv6" : "IPv4",
    hostname: resolvedHostname || raw.connection?.domain,
    location: {
      city: raw.city || "Unknown",
      region: raw.region || "Unknown",
      country: raw.country || "Unknown",
      countryCode: raw.country_code || "",
      continent: raw.continent || "Unknown",
      postal: raw.postal || "N/A",
      flagEmoji: raw.flag?.emoji || "🌐",
      coordinates: {
        latitude: raw.latitude ?? 0,
        longitude: raw.longitude ?? 0,
      },
    },
    network: {
      asn: raw.connection?.asn ? `AS${raw.connection.asn}` : "N/A",
      isp: raw.connection?.isp || raw.connection?.org || "Unknown ISP",
      organization: raw.connection?.org || "N/A",
      domain: raw.connection?.domain,
    },
    timezone: {
      id: raw.timezone?.id || "UTC",
      utcOffset: raw.timezone?.utc || "+00:00",
      currentTime: raw.timezone?.current_time,
    },
    security: {
      isVpnOrProxy: Boolean(raw.security?.vpn || raw.security?.proxy || raw.security?.anonymous),
      isTor: Boolean(raw.security?.tor),
      isHosting: Boolean(raw.security?.hosting),
    },
  };
}
