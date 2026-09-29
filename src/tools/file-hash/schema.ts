import { z } from "zod";

export const fileHashInputSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(255),
  fileSizeBytes: z.number().int().min(0).max(50_000_000), // 50MB cap
  fileType: z.string().trim().max(100).optional().default("application/octet-stream"),
  expectedChecksum: z.string().trim().max(256).optional().default(""),
  contentBase64: z.string().max(20_000_000).optional(), // optional payload for server-side verification
});

export type ValidatedFileHashInput = z.infer<typeof fileHashInputSchema>;
