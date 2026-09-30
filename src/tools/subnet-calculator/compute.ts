import type { ValidatedSubnetInput } from "./schema";
import type { SubnetOutputData } from "./types";

/**
 * Converts a 32-bit unsigned integer to dotted-quad IPv4 string.
 */
function intToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

/**
 * Converts dotted-quad IPv4 string to 32-bit unsigned integer.
 */
function ipToInt(ip: string): number {
  return (
    ip
      .split(".")
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0) >>> 0
  );
}

/**
 * Formats a 32-bit number into formatted 8-bit dotted binary string.
 */
function intToBinaryString(num: number): string {
  const binary = (num >>> 0).toString(2).padStart(32, "0");
  return `${binary.slice(0, 8)}.${binary.slice(8, 16)}.${binary.slice(16, 24)}.${binary.slice(24, 32)}`;
}

/**
 * Determines IPv4 address class.
 */
function getIpClass(firstOctet: number): "A" | "B" | "C" | "D" | "E" {
  if (firstOctet <= 127) return "A";
  if (firstOctet <= 191) return "B";
  if (firstOctet <= 223) return "C";
  if (firstOctet <= 239) return "D";
  return "E";
}

/**
 * Categorizes IPv4 address according to standard RFC scopes.
 */
function getAddressType(
  ipInt: number,
  firstOctet: number,
  secondOctet: number,
): SubnetOutputData["addressType"] {
  // Loopback (127.0.0.0/8)
  if (firstOctet === 127) return "Loopback";

  // RFC 1918 Private
  if (firstOctet === 10) return "Private (RFC 1918)";
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31)
    return "Private (RFC 1918)";
  if (firstOctet === 192 && secondOctet === 168) return "Private (RFC 1918)";

  // Link-Local (169.254.0.0/16)
  if (firstOctet === 169 && secondOctet === 254) return "Link-Local";

  // Carrier-grade NAT (100.64.0.0/10)
  if (firstOctet === 100 && secondOctet >= 64 && secondOctet <= 127)
    return "Carrier-Grade NAT";

  // Multicast (224.0.0.0 - 239.255.255.255)
  if (firstOctet >= 224 && firstOctet <= 239) return "Multicast";

  // Reserved / Class E
  if (firstOctet >= 240) return "Reserved";

  return "Public";
}

/**
 * Generates an educational plain-language description for a given CIDR network size.
 */
export function getScopeDescription(cidr: number): string {
  if (cidr === 0) {
    return "Default Route (0.0.0.0/0): Spans all 4.29 billion IPv4 addresses across the entire global internet.";
  }
  if (cidr <= 8) {
    return "Massive Global Tier: Up to 16.7+ million hosts, traditionally used by tier-1 telecoms or cloud infrastructure.";
  }
  if (cidr <= 16) {
    return "Large Enterprise / Campus Network: Allocates between 65,534 and 16.7M hosts for multi-building corporate networks.";
  }
  if (cidr <= 20) {
    return "Medium Enterprise Network: Accommodates between 4,094 and 65,534 endpoints across large branch offices.";
  }
  if (cidr <= 23) {
    return "Regional Branch / Multi-VLAN Network: Provides between 510 and 2,046 assignable host addresses.";
  }
  if (cidr === 24) {
    return "Standard Class C / Local LAN (/24): The most popular subnet for homes and offices, supporting up to 254 active devices.";
  }
  if (cidr <= 27) {
    return "Small Team / Department Subnet: Accommodates 30 to 126 devices with minimal broadcast traffic.";
  }
  if (cidr <= 29) {
    return "Server Cluster / Micro-Subnet: Suitable for 6 to 14 servers or public IP gateway blocks.";
  }
  if (cidr === 30) {
    return "Legacy Point-to-Point Link (/30): Dedicated 2-host interconnect historically used between router interfaces.";
  }
  if (cidr === 31) {
    return "RFC 3021 Point-to-Point Link (/31): Modern router interconnection using both addresses without wasting network/broadcast IDs.";
  }
  return "Single Host Route (/32): Directly points to a single specific endpoint or container without any subnet space.";
}

/**
 * Returns a human-friendly explanation for an IPv4 address scope type.
 */
export function getAddressTypeExplanation(type: SubnetOutputData["addressType"]): string {
  switch (type) {
    case "Private (RFC 1918)":
      return "Internal private address reserved for local networks. Cannot be routed directly on the public internet.";
    case "Loopback":
      return "Local host loopback address (127.0.0.0/8). Traffic never leaves your computer.";
    case "Link-Local":
      return "Automatic private IP (169.254.0.0/16). Self-assigned when no DHCP server is available.";
    case "Carrier-Grade NAT":
      return "Shared ISP address block (100.64.0.0/10) used by internet providers to conserve public IPv4 addresses.";
    case "Multicast":
      return "One-to-many streaming address (224.0.0.0/4). Used for IPTV and video broadcasts.";
    case "Reserved":
      return "Class E reserved address space (240.0.0.0/4) reserved for experimental or future use.";
    default:
      return "Public internet routable IP address accessible across the global web.";
  }
}

/**
 * Helper to safely extract IP and CIDR from strings like '192.168.1.1/24'.
 */
export function parseCidrString(input: string): { ip: string; cidr?: number } {
  const parts = input.trim().split("/");
  const ip = parts[0].trim();
  if (parts.length > 1) {
    const parsedCidr = parseInt(parts[1].trim(), 10);
    if (!isNaN(parsedCidr) && parsedCidr >= 0 && parsedCidr <= 32) {
      return { ip, cidr: parsedCidr };
    }
  }
  return { ip };
}

/**
 * Pure compute function for Subnet Calculator.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeSubnet(input: ValidatedSubnetInput): SubnetOutputData {
  const { ip, cidr } = input;
  const ipInt = ipToInt(ip);
  const octets = ip.split(".").map((n) => parseInt(n, 10));

  // Compute 32-bit mask: prefix ones followed by (32 - cidr) zeroes
  const netmaskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardInt = ~netmaskInt >>> 0;

  const networkInt = (ipInt & netmaskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalHosts = cidr === 0 ? 4294967296 : Math.pow(2, 32 - cidr);

  let usableHosts: number;
  let firstUsableInt: number;
  let lastUsableInt: number;

  if (cidr === 32) {
    usableHosts = 1;
    firstUsableInt = networkInt;
    lastUsableInt = networkInt;
  } else if (cidr === 31) {
    // RFC 3021: 31-bit prefixes for point-to-point links
    usableHosts = 2;
    firstUsableInt = networkInt;
    lastUsableInt = broadcastInt;
  } else if (cidr === 0) {
    usableHosts = 4294967294; // Total - 2
    firstUsableInt = 1; // 0.0.0.1
    lastUsableInt = 4294967294; // 255.255.255.254
  } else {
    usableHosts = Math.max(0, totalHosts - 2);
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
  }

  const addressType = getAddressType(ipInt, octets[0], octets[1]);

  return {
    ip,
    cidr,
    netmask: intToIp(netmaskInt),
    wildcardMask: intToIp(wildcardInt),
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstUsableIp: intToIp(firstUsableInt),
    lastUsableIp: intToIp(lastUsableInt),
    totalHosts,
    usableHosts,
    ipClass: getIpClass(octets[0]),
    addressType,
    scopeDescription: getScopeDescription(cidr),
    addressTypeExplanation: getAddressTypeExplanation(addressType),
    binary: {
      ip: intToBinaryString(ipInt),
      netmask: intToBinaryString(netmaskInt),
      network: intToBinaryString(networkInt),
      broadcast: intToBinaryString(broadcastInt),
    },
    hex: {
      ip: "0x" + ipInt.toString(16).padStart(8, "0").toUpperCase(),
      netmask: "0x" + netmaskInt.toString(16).padStart(8, "0").toUpperCase(),
    },
  };
}
