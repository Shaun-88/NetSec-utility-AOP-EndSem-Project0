import type { FileHashOutputData, FileHashItem } from "./types";

/**
 * Converts byte count into a human-readable file size string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface RawFileHashParams {
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  hashes: Array<{ algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512"; hash: string }>;
  expectedChecksum?: string;
}

/**
 * Pure compute function for File Hash Checker.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeFileHashData(
  params: RawFileHashParams,
): FileHashOutputData {
  const { fileName, fileSizeBytes, fileType, hashes, expectedChecksum = "" } = params;

  const cleanedExpected = expectedChecksum.trim().toLowerCase();
  let verificationStatus: "verified" | "mismatch" | "none" = "none";
  let matchedAlgorithm: string | undefined;

  const enrichedHashes: FileHashItem[] = [];
  for (const h of hashes) {
    const isMatch = cleanedExpected.length > 0 && h.hash.toLowerCase() === cleanedExpected;
    if (isMatch) {
      verificationStatus = "verified";
      matchedAlgorithm = h.algorithm;
    }
    enrichedHashes.push({
      algorithm: h.algorithm,
      hash: h.hash,
      isMatch,
    });
  }

  if (cleanedExpected.length > 0 && verificationStatus !== "verified") {
    verificationStatus = "mismatch";
  }

  return {
    fileName,
    fileSizeBytes,
    formattedSize: formatBytes(fileSizeBytes),
    fileType: fileType || "application/octet-stream",
    hashes: enrichedHashes,
    expectedChecksum: cleanedExpected || undefined,
    verificationStatus,
    matchedAlgorithm,
    computedAt: new Date().toISOString(),
  };
}
