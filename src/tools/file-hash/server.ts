import "server-only";
import crypto from "node:crypto";
import type { ToolServerModule, ToolRunContext } from "@/core/tool-kit/types";
import type { ToolResult } from "@/core/results/types";
import { fileHashInputSchema, type ValidatedFileHashInput } from "./schema";
import { computeFileHashData, type RawFileHashParams } from "./compute";
import type { FileHashOutputData } from "./types";

const serverModule: ToolServerModule<ValidatedFileHashInput, FileHashOutputData> = {
  async run(
    rawInput: unknown,
    _ctx: ToolRunContext,
  ): Promise<ToolResult<FileHashOutputData>> {
    void _ctx;
    // 1. Validate file metadata schema
    const validated = fileHashInputSchema.parse(rawInput);
    const { fileName, fileSizeBytes, fileType, expectedChecksum, contentBase64 } = validated;

    const hashes: RawFileHashParams["hashes"] = [];

    if (contentBase64) {
      // Decode content and hash directly on server
      const buffer = Buffer.from(contentBase64, "base64");
      hashes.push(
        { algorithm: "MD5", hash: crypto.createHash("md5").update(buffer).digest("hex") },
        { algorithm: "SHA-1", hash: crypto.createHash("sha1").update(buffer).digest("hex") },
        { algorithm: "SHA-256", hash: crypto.createHash("sha256").update(buffer).digest("hex") },
        { algorithm: "SHA-512", hash: crypto.createHash("sha512").update(buffer).digest("hex") },
      );
    }

    // 2. Delegate to pure compute function
    const data = computeFileHashData({
      fileName,
      fileSizeBytes,
      fileType: fileType || "application/octet-stream",
      hashes,
      expectedChecksum,
    });

    // 3. Return ToolResult
    return {
      toolId: "file-hash",
      target: fileName,
      ranAt: new Date().toISOString(),
      data,
    };
  },
};

export default serverModule;
