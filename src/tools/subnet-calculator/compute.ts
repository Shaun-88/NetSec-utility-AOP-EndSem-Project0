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
  } else {
    usableHosts = Math.max(0, totalHosts - 2);
    firstUsableInt = (networkInt + 1) >>> 0;
    lastUsableInt = (broadcastInt - 1) >>> 0;
  }

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
    addressType: getAddressType(ipInt, octets[0], octets[1]),
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
