import { describe, it, expect } from "vitest";
import { computeFileHashData, formatBytes } from "./compute";
import { fileHashInputSchema } from "./schema";

describe("File Hash Checker Contract Tests", () => {
  it("formats file bytes cleanly", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.00 MB");
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
      { algorithm: "SHA-256" as const, hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
      { algorithm: "MD5" as const, hash: "d41d8cd98f00b204e9800998ecf8427e" },
    ];

    const res = computeFileHashData({
      fileName: "empty.txt",
      fileSizeBytes: 0,
      fileType: "text/plain",
      hashes: mockHashes,
      expectedChecksum: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855", // uppercase match test
    });

    expect(res.verificationStatus).toBe("verified");
    expect(res.matchedAlgorithm).toBe("SHA-256");
    expect(res.hashes.find((h) => h.algorithm === "SHA-256")?.isMatch).toBe(true);
  });

  it("detects mismatch when expected checksum does not match any computed hash", () => {
    const mockHashes = [
      { algorithm: "SHA-256" as const, hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
    ];

    const res = computeFileHashData({
      fileName: "file.bin",
      fileSizeBytes: 1024,
      fileType: "application/octet-stream",
      hashes: mockHashes,
      expectedChecksum: "bad_checksum_value_123",
    });

    expect(res.verificationStatus).toBe("mismatch");
  });
});
