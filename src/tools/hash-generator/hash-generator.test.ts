import { describe, it, expect } from "vitest";
import { computeHashes } from "./compute";
import { hashGeneratorInputSchema } from "./schema";

describe("Hash Generator Contract Tests", () => {
  it("validates input defaults cleanly", () => {
    const valid = hashGeneratorInputSchema.parse({ text: "hello" });
    expect(valid.text).toBe("hello");
    expect(valid.uppercase).toBe(false);
    expect(valid.hmacKey).toBe("");
  });

  it("purely computes known RFC MD5 and SHA-256 test vectors", async () => {
    // "hello" MD5: 5d41402abc4b2a76b9719d911017c592
    // "hello" SHA-256: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
    const res = await computeHashes({ text: "hello", hmacKey: "", uppercase: false });

    const md5Obj = res.hashes.find((h) => h.algorithm === "MD5");
    expect(md5Obj?.hash).toBe("5d41402abc4b2a76b9719d911017c592");

    const sha256Obj = res.hashes.find((h) => h.algorithm === "SHA-256");
    expect(sha256Obj?.hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("handles uppercase hex formatting toggle", async () => {
    const res = await computeHashes({ text: "test", hmacKey: "", uppercase: true });
    const md5Obj = res.hashes.find((h) => h.algorithm === "MD5");
    expect(md5Obj?.hash).toBe("098F6BCD4621D373CADE4E832627B4F6");
  });

  it("computes HMAC-SHA256 when HMAC key is provided", async () => {
    const res = await computeHashes({ text: "message", hmacKey: "secret", uppercase: false });
    expect(res.isHmac).toBe(true);
    const sha256Obj = res.hashes.find((h) => h.algorithm === "SHA-256");
    expect(sha256Obj?.hash.length).toBe(64);
  });
});
