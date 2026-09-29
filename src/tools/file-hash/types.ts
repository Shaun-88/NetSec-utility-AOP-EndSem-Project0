/**
 * Type contracts for the File Hash Checker Tool.
 */

export interface FileHashItem {
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512";
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
