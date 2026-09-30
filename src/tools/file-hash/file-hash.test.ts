import { describe, it, expect } from "vitest";
import {
  computeFileHashData,
  formatBytes,
  cleanChecksumInput,
  computeMd5,
  SAMPLE_FILES,
} from "./compute";
import { fileHashInputSchema } from "./schema";

describe("File Hash Checker Contract Tests", () => {
  it("formats file bytes cleanly", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.00 MB");
  });

  it("sanitizes user checksum input with various prefixes, whitespace, and quotes", () => {
    expect(cleanChecksumInput("  104062f9  ")).toBe("104062f9");
    expect(cleanChecksumInput('"104062f9"')).toBe("104062f9");
    expect(cleanChecksumInput("'104062f9'")).toBe("104062f9");
    expect(cleanChecksumInput("SHA-256: 104062F9")).toBe("104062f9");
    expect(cleanChecksumInput("sha256 = 104062f9")).toBe("104062f9");
    expect(cleanChecksumInput("MD5: 46e3ab37")).toBe("46e3ab37");
    expect(cleanChecksumInput("sha-512: ABC DEF")).toBe("abcdef");
  });

  it("computes accurate RFC 1321 MD5 hashes on Uint8Array buffers", () => {
    // Empty buffer test (well-known RFC 1321 test vector)
    const emptyBuf = new Uint8Array(0);
    expect(computeMd5(emptyBuf)).toBe("d41d8cd98f00b204e9800998ecf8427e");

    // Standard ASCII string "The quick brown fox jumps over the lazy dog"
    const textBytes = new TextEncoder().encode("The quick brown fox jumps over the lazy dog");
    expect(computeMd5(textBytes)).toBe("9e107d9d372bb6826bd81d3542a419d6");
  });

  it("validates input schema correctly", () => {
    const valid = fileHashInputSchema.parse({
      fileName: "setup.exe",
      fileSizeBytes: 1048576,
    });
    expect(valid.fileName).toBe("setup.exe");
    expect(valid.fileSizeBytes).toBe(1048576);
  });

  it("purely computes matching verification status when expected checksum matches", () => {
    const mockHashes = [
      { algorithm: "SHA-256" as const, hash: "104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f" },
      { algorithm: "MD5" as const, hash: "46e3ab3783b55f75845c2f5b8b54f976" },
    ];

    const res = computeFileHashData({
      fileName: "sample-document.txt",
      fileSizeBytes: 195,
      fileType: "text/plain",
      hashes: mockHashes,
      expectedChecksum: "SHA-256: 104062F9749AE522EC5C54C5716C8F9D1755739AE9867BFACBC65BECE92D336F",
    });

    expect(res.verificationStatus).toBe("verified");
    expect(res.matchedAlgorithm).toBe("SHA-256");
    expect(res.hashes.find((h) => h.algorithm === "SHA-256")?.isMatch).toBe(true);
    expect(res.hashes.find((h) => h.algorithm === "MD5")?.isMatch).toBe(false);
  });

  it("detects mismatch when expected checksum does not match any computed hash", () => {
    const mockHashes = [
      { algorithm: "SHA-256" as const, hash: "fd695f2b43645c054f3cb3a266438bb4f4f7553d522fb90d7a489b53d7cf809b" },
      { algorithm: "MD5" as const, hash: "dc692112cabc771b2828e9b1cfd1c5bf" },
    ];

    // Testing tampered file against the genuine official checksum
    const res = computeFileHashData({
      fileName: "sample-document-tampered.txt",
      fileSizeBytes: 225,
      fileType: "text/plain",
      hashes: mockHashes,
      expectedChecksum: "104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f",
    });

    expect(res.verificationStatus).toBe("mismatch");
    expect(res.matchedAlgorithm).toBeUndefined();
    expect(res.hashes.every((h) => !h.isMatch)).toBe(true);
  });

  it("leaves status as none when no expected checksum is supplied", () => {
    const mockHashes = [
      { algorithm: "SHA-256" as const, hash: "104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f" },
    ];

    const res = computeFileHashData({
      fileName: "sample-document.txt",
      fileSizeBytes: 195,
      fileType: "text/plain",
      hashes: mockHashes,
      expectedChecksum: "",
    });

    expect(res.verificationStatus).toBe("none");
    expect(res.matchedAlgorithm).toBeUndefined();
  });

  it("verifies sample files definition registry integrity", () => {
    expect(SAMPLE_FILES).toHaveLength(3);
    const genuine = SAMPLE_FILES.find((s) => s.id === "sample-doc-genuine");
    const tampered = SAMPLE_FILES.find((s) => s.id === "sample-doc-tampered");

    expect(genuine).toBeDefined();
    expect(tampered).toBeDefined();
    expect(genuine?.isTampered).toBe(false);
    expect(tampered?.isTampered).toBe(true);
    expect(genuine?.expectedSha256).toBe("104062f9749ae522ec5c54c5716c8f9d1755739ae9867bfacbc65bece92d336f");
  });
});
