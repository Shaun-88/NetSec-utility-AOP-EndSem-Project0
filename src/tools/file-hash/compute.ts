import type { FileHashOutputData, FileHashItem, FileHashAlgorithm, SampleFileItem } from "./types";

/**
 * Converts byte count into a human-readable file size string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Sanitizes user-entered expected checksums by removing optional algorithm prefixes,
 * quotes, and surrounding whitespace.
 */
export function cleanChecksumInput(raw: string): string {
  let cleaned = raw.trim();
  // Strip quotes
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Strip common prefix formats like "SHA-256: ...", "md5: ...", "sha256 = ..."
  cleaned = cleaned.replace(/^(?:sha-?(?:256|512|384|1)|md5)\s*[:=]\s*/i, "").trim();
  // Remove internal spaces sometimes copied from formatted hex dumps
  cleaned = cleaned.replace(/\s+/g, "").toLowerCase();
  return cleaned;
}

/**
 * Pure JavaScript implementation of MD5 (RFC 1321) operating on ArrayBuffer/Uint8Array.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export function computeMd5(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRol(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const words: number[] = [];
  for (let i = 0; i < bytes.length * 8; i += 8) {
    words[i >> 5] |= (bytes[i / 8] & 0xff) << (i % 32);
  }

  const bitLen = bytes.length * 8;
  words[bitLen >> 5] |= 0x80 << (bitLen % 32);
  words[(((bitLen + 64) >>> 9) << 4) + 14] = bitLen;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = ff(a, b, c, d, words[i] || 0, 7, -680876936);
    d = ff(d, a, b, c, words[i + 1] || 0, 12, -389564586);
    c = ff(c, d, a, b, words[i + 2] || 0, 17, 606105819);
    b = ff(b, c, d, a, words[i + 3] || 0, 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4] || 0, 7, -176418897);
    d = ff(d, a, b, c, words[i + 5] || 0, 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6] || 0, 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7] || 0, 22, -45705983);
    a = ff(a, b, c, d, words[i + 8] || 0, 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9] || 0, 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10] || 0, 17, -42063);
    b = ff(b, c, d, a, words[i + 11] || 0, 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12] || 0, 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13] || 0, 12, -40341101);
    c = ff(c, d, a, b, words[i + 14] || 0, 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15] || 0, 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1] || 0, 5, -165796510);
    d = gg(d, a, b, c, words[i + 6] || 0, 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11] || 0, 14, 643717713);
    b = gg(b, c, d, a, words[i] || 0, 20, -373897302);
    a = gg(a, b, c, d, words[i + 5] || 0, 5, -701558691);
    d = gg(d, a, b, c, words[i + 10] || 0, 9, 38016083);
    c = gg(c, d, a, b, words[i + 15] || 0, 14, -660478335);
    b = gg(b, c, d, a, words[i + 4] || 0, 20, -405537848);
    a = gg(a, b, c, d, words[i + 9] || 0, 5, 568446438);
    d = gg(d, a, b, c, words[i + 14] || 0, 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3] || 0, 14, -187363961);
    b = gg(b, c, d, a, words[i + 8] || 0, 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13] || 0, 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2] || 0, 9, -51403784);
    c = gg(c, d, a, b, words[i + 7] || 0, 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12] || 0, 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5] || 0, 4, -378558);
    d = hh(d, a, b, c, words[i + 8] || 0, 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11] || 0, 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14] || 0, 23, -35309556);
    a = hh(a, b, c, d, words[i + 1] || 0, 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4] || 0, 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7] || 0, 16, -155497632);
    b = hh(b, c, d, a, words[i + 10] || 0, 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13] || 0, 4, 681279174);
    d = hh(d, a, b, c, words[i] || 0, 11, -358537222);
    c = hh(c, d, a, b, words[i + 3] || 0, 16, -722521979);
    b = hh(b, c, d, a, words[i + 6] || 0, 23, 76029189);
    a = hh(a, b, c, d, words[i + 9] || 0, 4, -640364487);
    d = hh(d, a, b, c, words[i + 12] || 0, 11, -421815835);
    c = hh(c, d, a, b, words[i + 15] || 0, 16, 530742520);
    b = hh(b, c, d, a, words[i + 2] || 0, 23, -995338651);

    a = ii(a, b, c, d, words[i] || 0, 6, -198630844);
    d = ii(d, a, b, c, words[i + 7] || 0, 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14] || 0, 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5] || 0, 21, -57434055);
    a = ii(a, b, c, d, words[i + 12] || 0, 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3] || 0, 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10] || 0, 15, -1051523);
    b = ii(b, c, d, a, words[i + 1] || 0, 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8] || 0, 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15] || 0, 10, -30611744);
    c = ii(c, d, a, b, words[i + 6] || 0, 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13] || 0, 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4] || 0, 6, -145523070);
    d = ii(d, a, b, c, words[i + 11] || 0, 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2] || 0, 15, 718787259);
    b = ii(b, c, d, a, words[i + 9] || 0, 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  function wordToHex(val: number): string {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += ((val >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return str;
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

export interface RawFileHashParams {
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  hashes: Array<{ algorithm: FileHashAlgorithm; hash: string }>;
  expectedChecksum?: string;
}

/**
 * Pure compute function for File Hash Checker.
 * Evaluates hashes and determines verification match status.
 */
export function computeFileHashData(
  params: RawFileHashParams,
): FileHashOutputData {
  const { fileName, fileSizeBytes, fileType, hashes, expectedChecksum = "" } = params;

  const cleanedExpected = cleanChecksumInput(expectedChecksum);
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

/**
 * Pre-configured interactive sample files hosted in public/sample-files/
 */
export const SAMPLE_FILES: SampleFileItem[] = [
  {
    id: "sample-doc-genuine",
    name: "sample-document.txt",
    size: 195,
    formattedSize: "195 B",
    path: "/sample-files/sample-document.txt",
    expectedSha256: "104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f",
    expectedMd5: "46e3ab3783b55f75845c2f5b8b54f976",
    description: "Official, unaltered release document. Matches the vendor-published checksum with 100% integrity.",
    isTampered: false,
  },
  {
    id: "sample-doc-tampered",
    name: "sample-document-tampered.txt",
    size: 225,
    formattedSize: "225 B",
    path: "/sample-files/sample-document-tampered.txt",
    expectedSha256: "104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f", // Deliberately tested against official release
    expectedMd5: "46e3ab3783b55f75845c2f5b8b54f976",
    description: "Tampered version with an unauthorized edit. Triggers an immediate verification failure alert.",
    isTampered: true,
  },
  {
    id: "security-manifest",
    name: "security-manifest.json",
    size: 129,
    formattedSize: "129 B",
    path: "/sample-files/security-manifest.json",
    expectedSha256: "de52bea5802d7472892ba44cb3c4090f7ae7f424f190bad5c9b4614124d1fb3d",
    expectedMd5: "591c821cafedf45306a05f6220a4ecd6",
    description: "Structured JSON configuration package. Demonstrates package manifest verification before deployment.",
    isTampered: false,
  },
];
