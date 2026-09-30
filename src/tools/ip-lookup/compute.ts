import type { RawIpIntelligenceResponse, IpLookupData } from "./types";

/**
 * Builds an OpenStreetMap embed iframe URL for given coordinates.
 */
export function getOsmEmbedUrl(latitude: number, longitude: number, delta = 0.05): string {
  const minLon = longitude - delta;
  const minLat = latitude - delta;
  const maxLon = longitude + delta;
  const maxLat = latitude + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

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
  const latitude = raw.latitude ?? 0;
  const longitude = raw.longitude ?? 0;
  const hasCoordinates = latitude !== 0 || longitude !== 0;

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
        latitude,
        longitude,
      },
      mapEmbedUrl: hasCoordinates ? getOsmEmbedUrl(latitude, longitude) : undefined,
      accuracyDisclaimer:
        "Geolocation data is as accurate as the upstream data source provides. It represents the approximate network routing area assigned by your ISP, not a promise of an exact physical street address.",
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
