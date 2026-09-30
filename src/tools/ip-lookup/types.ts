/**
 * Type contracts for the IP Lookup Tool.
 */

export interface IpLookupInput {
  target?: string;
}

export interface RawIpIntelligenceResponse {
  ip: string;
  success?: boolean;
  type?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postal?: string;
  calling_code?: string;
  capital?: string;
  borders?: string;
  flag?: {
    emoji?: string;
    unicode?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    abbr?: string;
    is_dst?: boolean;
    offset?: number;
    utc?: string;
    current_time?: string;
  };
  security?: {
    anonymous?: boolean;
    proxy?: boolean;
    vpn?: boolean;
    tor?: boolean;
    hosting?: boolean;
  };
  message?: string;
}

export interface IpLookupData {
  query: string;
  ip: string;
  ipVersion: "IPv4" | "IPv6";
  hostname?: string;
  location: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    continent: string;
    postal: string;
    flagEmoji: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    accuracyDisclaimer?: string;
    mapEmbedUrl?: string;
  };
  network: {
    asn: string;
    isp: string;
    organization: string;
    domain?: string;
  };
  timezone: {
    id: string;
    utcOffset: string;
    currentTime?: string;
  };
  security: {
    isVpnOrProxy: boolean;
    isTor: boolean;
    isHosting: boolean;
  };
}
