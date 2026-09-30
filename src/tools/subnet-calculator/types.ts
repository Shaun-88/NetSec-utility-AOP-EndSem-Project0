/**
 * Type contracts for the Subnet Calculator Tool.
 */

export interface SubnetInput {
  ip: string;
  cidr: number;
}

export interface SubnetOutputData {
  ip: string;
  cidr: number;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: "A" | "B" | "C" | "D" | "E";
  addressType: "Public" | "Private (RFC 1918)" | "Loopback" | "Link-Local" | "Carrier-Grade NAT" | "Multicast" | "Reserved";
  scopeDescription: string;
  addressTypeExplanation: string;
  binary: {
    ip: string;
    netmask: string;
    network: string;
    broadcast: string;
  };
  hex: {
    ip: string;
    netmask: string;
  };
}
