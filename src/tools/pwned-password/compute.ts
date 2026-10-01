import type { PwnedPasswordOutputData } from "./types";

/**
 * Pure compute function for Pwned Password Checker.
 * Parses the HIBP range API plain-text response and matches against the full SHA-1 hash.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 *
 * @param responseText - Plain text body from https://api.pwnedpasswords.com/range/{prefix}
 * @param fullHash     - Full 40-character SHA-1 hash (case-insensitive)
 * @param prefix       - The 5-character prefix used in the request
 */
export function parsePwnedPasswordResponse(
  responseText: string,
  fullHash: string,
  prefix: string,
): PwnedPasswordOutputData {
  const upperFullHash = fullHash.toUpperCase();
  const upperPrefix = prefix.toUpperCase();

  // Each line: "HASH_SUFFIX:COUNT"
  const lines = responseText.split("\n");
  let pwnedCount = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const suffix = line.slice(0, colonIdx).toUpperCase();
    const countStr = line.slice(colonIdx + 1).trim();
    const reconstructed = upperPrefix + suffix;

    if (reconstructed === upperFullHash) {
      pwnedCount = parseInt(countStr, 10) || 0;
      break;
    }
  }

  return {
    isPwned: pwnedCount > 0,
    pwnedCount,
    prefix: prefix.toLowerCase(),
    checkedAt: new Date().toISOString(),
  };
}
