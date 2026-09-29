/**
 * Type contracts for the Hash Generator Tool.
 */

export interface HashItem {
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
  hash: string;
  bitLength: number;
  byteLength: number;
  securityStatus: "Deprecated" | "Legacy" | "Secure (Recommended)" | "High Security";
}

export interface HashGeneratorInput {
  text: string;
  hmacKey?: string;
  uppercase?: boolean;
}

export interface HashGeneratorOutputData {
  input: string;
  isHmac: boolean;
  hashes: HashItem[];
  generatedAt: string;
}
