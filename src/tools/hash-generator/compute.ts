import type { ValidatedHashGeneratorInput } from "./schema";
import type { HashItem, HashGeneratorOutputData } from "./types";

/**
 * Pure JavaScript implementation of MD5 (RFC 1321) for client/server portability.
 */
function md5(str: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const utf8Bytes = new TextEncoder().encode(str);
  const words: number[] = [];
  for (let i = 0; i < utf8Bytes.length * 8; i += 8) {
    words[i >> 5] |= (utf8Bytes[i / 8] & 0xff) << (i % 32);
  }

  const bitLen = utf8Bytes.length * 8;
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

  const out = [a, b, c, d];
  let hex = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (out[i] >>> (j * 8)) & 0xff;
      hex += byte.toString(16).padStart(2, "0");
    }
  }
  return hex;
}

/**
 * Computes SHA family hash using Web Crypto API.
 */
async function computeSha(
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  data: string,
): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const cryptoObj = globalThis.crypto;

  const buffer = await cryptoObj.subtle.digest(algorithm, bytes);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Computes HMAC-SHA256 using Web Crypto API.
 */
async function computeHmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoObj = globalThis.crypto;

  const cryptoKey = await cryptoObj.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await cryptoObj.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Pure compute function for Hash Generator.
 * INVARIANT: Must be 100% pure with NO side-effects, network, or file I/O.
 */
export async function computeHashes(
  input: ValidatedHashGeneratorInput,
): Promise<HashGeneratorOutputData> {
  const { text, hmacKey = "", uppercase = false } = input;
  const isHmac = hmacKey.length > 0;

  const formatCase = (h: string) => (uppercase ? h.toUpperCase() : h.toLowerCase());

  let md5Hash = "";
  let sha1Hash = "";
  let sha256Hash = "";
  let sha384Hash = "";
  let sha512Hash = "";

  if (isHmac) {
    // If HMAC secret is active, compute HMAC-SHA256
    sha256Hash = await computeHmacSha256(hmacKey, text);
    md5Hash = "(HMAC mode active - SHA-256 computed)";
    sha1Hash = "(HMAC mode active)";
    sha384Hash = "(HMAC mode active)";
    sha512Hash = "(HMAC mode active)";
  } else {
    md5Hash = md5(text);
    sha1Hash = await computeSha("SHA-1", text);
    sha256Hash = await computeSha("SHA-256", text);
    sha384Hash = await computeSha("SHA-384", text);
    sha512Hash = await computeSha("SHA-512", text);
  }

  const hashes: HashItem[] = [
    {
      algorithm: "MD5",
      hash: formatCase(md5Hash),
      bitLength: 128,
      byteLength: 16,
      securityStatus: "Deprecated",
    },
    {
      algorithm: "SHA-1",
      hash: formatCase(sha1Hash),
      bitLength: 160,
      byteLength: 20,
      securityStatus: "Legacy",
    },
    {
      algorithm: "SHA-256",
      hash: formatCase(sha256Hash),
      bitLength: 256,
      byteLength: 32,
      securityStatus: "Secure (Recommended)",
    },
    {
      algorithm: "SHA-384",
      hash: formatCase(sha384Hash),
      bitLength: 384,
      byteLength: 48,
      securityStatus: "High Security",
    },
    {
      algorithm: "SHA-512",
      hash: formatCase(sha512Hash),
      bitLength: 512,
      byteLength: 64,
      securityStatus: "High Security",
    },
  ];

  return {
    input: text,
    isHmac,
    hashes,
    generatedAt: new Date().toISOString(),
  };
}
