/**
 * Type contracts for the File Hash Checker Tool.
 */

export type FileHashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export interface FileHashItem {
  algorithm: FileHashAlgorithm;
  hash: string;
  isMatch?: boolean;
}

export interface FileHashInput {
  fileName: string;
  fileSizeBytes: number;
  fileType?: string;
  expectedChecksum?: string;
}

export interface FileHashOutputData {
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  fileType: string;
  hashes: FileHashItem[];
  expectedChecksum?: string;
  verificationStatus: "verified" | "mismatch" | "none";
  matchedAlgorithm?: string;
  computedAt: string;
}

export interface SampleFileItem {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  path: string;
  expectedSha256: string;
  expectedMd5: string;
  description: string;
  isTampered?: boolean;
}
